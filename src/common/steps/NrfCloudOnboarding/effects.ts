/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSerialPort } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { inMain as auth } from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/auth';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';
import fs from 'fs';
import path from 'path';

import { type AppThunk, type RootState } from '../../../app/store';
import { getFirmwareFolder } from '../../../features/device/deviceGuides';
import {
    findElfFile,
    getChoice,
    getSelectedDeviceUnsafely,
} from '../../../features/device/deviceSlice';
import {
    fetchMemfaultToken,
    fetchOrganizations,
    fetchProjects,
    finalizeSymbolFile,
    HttpError,
    provisionMyNordicAccount,
    requestSymbolUploadUrl,
    uploadSymbolBinary,
} from '../../../features/flows/nRF54L15_cloud/evaluate/api';
import { reportEvaluateError } from '../../../features/flows/nRF54L15_cloud/evaluate/reportError';
import runVerification from '../../sendATCommands';
import { fetchBatteryPercent, fetchProvisioning, onboardDevice } from './api';
import {
    getAccount,
    getOnboarding,
    setAccessToken,
    setAccountError,
    setAccountLoading,
    setAccountSuccess,
    setAttestationToken,
    setAttestationTokenError,
    setBatteryPercent,
    setOnboarding,
    setProjects,
    setProvisioning,
    setProvisioningError,
    setSelectedOrgSlug,
} from './onboardingSlice';

const STEP_NAME = 'nRF Cloud Onboarding';

const getSerialPortPath = (state: RootState, vComIndex: number) =>
    getSelectedDeviceUnsafely(state).serialPorts?.[vComIndex]?.comName ?? '';

// The device reboots without answering, so the command is written without
// waiting for a shell response.
const rebootOverShell = async (serialPortPath: string) => {
    const serialPort = await createSerialPort(
        { path: serialPortPath, baudRate: 115200 },
        { overwrite: true, settingsLocked: true },
    );
    try {
        await serialPort.write('kernel reboot\r\n');
    } finally {
        await serialPort.close();
    }
};

const withToken =
    <T>(
        cachedToken: (state: RootState) => string | undefined,
        refreshToken: () => AppThunk<Promise<string>>,
        request: (token: string) => Promise<T>,
    ): AppThunk<Promise<T>> =>
    async (dispatch, getState) => {
        const token =
            cachedToken(getState()) ?? (await dispatch(refreshToken()));
        try {
            return await request(token);
        } catch (e) {
            if (e instanceof HttpError && e.status === 401) {
                return request(await dispatch(refreshToken()));
            }
            throw e;
        }
    };

const refreshAccessToken = (): AppThunk<Promise<string>> => async dispatch => {
    const idTokenRes = await auth.getIdToken();
    if (!idTokenRes.status) {
        throw new Error(idTokenRes.error);
    }
    const { accessToken } = await fetchMemfaultToken(idTokenRes.data);
    dispatch(setAccessToken(accessToken));
    return accessToken;
};

const withAccessToken = <T>(request: (accessToken: string) => Promise<T>) =>
    withToken(
        state => getAccount(state).accessToken,
        refreshAccessToken,
        request,
    );

export const loadAccount = (): AppThunk<Promise<void>> => async dispatch => {
    dispatch(setAccountLoading());
    try {
        const idTokenRes = await auth.getIdToken();
        if (!idTokenRes.status) {
            throw new Error(idTokenRes.error);
        }
        await provisionMyNordicAccount(idTokenRes.data);

        const organizations = await dispatch(
            withAccessToken(fetchOrganizations),
        );
        if (organizations.length === 0) {
            throw new Error('No organizations found for this account');
        }
        const projects = await dispatch(
            withAccessToken(t => fetchProjects(t, organizations[0].slug)),
        );
        dispatch(setAccountSuccess({ organizations, projects }));
    } catch (e) {
        reportEvaluateError(STEP_NAME, e, 'load-account');
        dispatch(setAccountError(describeError(e)));
    }
};

export const selectOrganization =
    (orgSlug: string): AppThunk<Promise<void>> =>
    async dispatch => {
        dispatch(setSelectedOrgSlug(orgSlug));
        try {
            const projects = await dispatch(
                withAccessToken(t => fetchProjects(t, orgSlug)),
            );
            dispatch(setProjects(projects));
        } catch (e) {
            reportEvaluateError(STEP_NAME, e, 'select-organization');
            dispatch(setAccountError(describeError(e)));
        }
    };

export const readAttestationToken =
    (vComIndex: number): AppThunk<Promise<string>> =>
    async (dispatch, getState) => {
        try {
            const [attestationToken] = await runVerification(
                [
                    {
                        command: 'AT%ATTESTTOKEN',
                        responseRegex: '%ATTESTTOKEN: "(.*)"',
                    },
                ],
                getSerialPortPath(getState(), vComIndex),
                'SHELL',
            );
            dispatch(setAttestationToken(attestationToken));
            return attestationToken;
        } catch (e) {
            dispatch(
                setAttestationTokenError(
                    'Failed to get the attestation token.',
                ),
            );
            throw e;
        }
    };

const uploadSymbols =
    (orgSlug: string, projectSlug: string): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        const elfFile = findElfFile(getChoice(getState()));
        if (!elfFile) {
            throw new Error('No ELF file is configured for this firmware.');
        }
        const bytes = await fs.promises.readFile(
            path.join(getFirmwareFolder(), elfFile),
        );
        const { uploadUrl, uploadToken } = await dispatch(
            withAccessToken(t =>
                requestSymbolUploadUrl(t, orgSlug, projectSlug),
            ),
        );
        await uploadSymbolBinary(uploadUrl, bytes);
        await dispatch(
            withAccessToken(t =>
                finalizeSymbolFile(t, orgSlug, projectSlug, uploadToken),
            ),
        );
    };

export const onboard =
    (vComIndex: number): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        let phase = 'read-token';
        dispatch(setOnboarding({ status: 'loading', stage: 'read-token' }));
        try {
            const state = getState();
            const { selectedOrgSlug, selectedProjectSlug } = getAccount(state);
            const serialPortPath = getSerialPortPath(state, vComIndex);
            if (!selectedOrgSlug || !selectedProjectSlug) {
                throw new Error('Select an organization and a project.');
            }

            const attestationToken = await dispatch(
                readAttestationToken(vComIndex),
            );

            phase = 'upload-symbols';
            dispatch(
                setOnboarding({ status: 'loading', stage: 'upload-symbols' }),
            );
            await dispatch(uploadSymbols(selectedOrgSlug, selectedProjectSlug));

            phase = 'onboard';
            dispatch(setOnboarding({ status: 'loading', stage: 'onboard' }));
            const deviceId = await dispatch(
                withAccessToken(t =>
                    onboardDevice(
                        t,
                        selectedOrgSlug,
                        selectedProjectSlug,
                        attestationToken,
                    ),
                ),
            );

            phase = 'reboot-device';
            dispatch(
                setOnboarding({ status: 'loading', stage: 'reboot-device' }),
            );
            await rebootOverShell(serialPortPath);

            dispatch(setOnboarding({ status: 'success', deviceId }));
        } catch (e) {
            reportEvaluateError(STEP_NAME, e, phase);
            dispatch(
                setOnboarding({ status: 'error', message: describeError(e) }),
            );
        }
    };

export const refreshProvisioning =
    (): AppThunk<Promise<void>> => async (dispatch, getState) => {
        const { selectedOrgSlug, selectedProjectSlug } = getAccount(getState());
        const { deviceId } = getOnboarding(getState());
        if (!selectedOrgSlug || !selectedProjectSlug || !deviceId) return;
        try {
            const provisioning = await dispatch(
                withAccessToken(t =>
                    fetchProvisioning(
                        t,
                        selectedOrgSlug,
                        selectedProjectSlug,
                        deviceId,
                    ),
                ),
            );
            dispatch(setProvisioning(provisioning));
        } catch (e) {
            dispatch(setProvisioningError(describeError(e)));
        }
    };

export const refreshBatteryPercent =
    (): AppThunk<Promise<void>> => async (dispatch, getState) => {
        const { selectedOrgSlug, selectedProjectSlug } = getAccount(getState());
        const { deviceId } = getOnboarding(getState());
        if (!selectedOrgSlug || !selectedProjectSlug || !deviceId) return;
        try {
            const batteryPercent = await dispatch(
                withAccessToken(t =>
                    fetchBatteryPercent(
                        t,
                        selectedOrgSlug,
                        selectedProjectSlug,
                        deviceId,
                    ),
                ),
            );
            if (batteryPercent !== undefined) {
                dispatch(setBatteryPercent(batteryPercent));
            }
        } catch {
            // Battery data is optional; the next poll retries.
        }
    };
