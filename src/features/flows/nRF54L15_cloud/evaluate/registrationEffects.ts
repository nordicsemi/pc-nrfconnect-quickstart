/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    getPersistedNickname,
    logger,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';
import fs from 'fs';
import path from 'path';

import { type AppThunk, type RootState } from '../../../../app/store';
import { getFirmwareFolder } from '../../../device/deviceGuides';
import {
    getChoice,
    getSelectedDeviceUnsafely,
} from '../../../device/deviceSlice';
import {
    fetchProjectKey,
    finalizeSymbolFile,
    postRegisterDevice,
    requestSymbolUploadUrl,
    uploadSymbolBinary,
} from './api';
import { getValidAccessToken } from './authEffects';
import {
    getDeviceInfo,
    getMemfault,
    setRegistration,
} from './cloudEvaluateSlice';
import { setDeviceProjectKey } from './device';
import { reportEvaluateError } from './reportError';

const HARDWARE_VERSION_FALLBACK = 'nrf54l15dk';

export const registerDevice =
    (vComIndex: number): AppThunk<RootState, Promise<void>> =>
    async (dispatch, getState) => {
        dispatch(setRegistration({ status: 'loading' }));
        let phase = 'validate';
        try {
            const state = getState();
            const { selectedOrgSlug, selectedProjectSlug } = getMemfault(state);
            const deviceInfo = getDeviceInfo(state);
            const device = getSelectedDeviceUnsafely(state);

            if (!selectedOrgSlug || !selectedProjectSlug) {
                throw new Error('Missing authentication data');
            }
            if (deviceInfo.status !== 'success' || !deviceInfo.serialNumber) {
                throw new Error('Missing device serial number');
            }

            phase = 'get-access-token';
            const accessToken = await dispatch(getValidAccessToken());

            phase = 'get-project-key';
            const projectKey = await fetchProjectKey(
                accessToken,
                selectedOrgSlug,
                selectedProjectSlug,
            );

            phase = 'set-project-key';
            await setDeviceProjectKey(device, vComIndex, projectKey);

            phase = 'register';
            await postRegisterDevice(
                accessToken,
                selectedOrgSlug,
                selectedProjectSlug,
                {
                    deviceSerial: deviceInfo.serialNumber,
                    hardwareVersion:
                        deviceInfo.hwVersion ?? HARDWARE_VERSION_FALLBACK,
                    nickname:
                        getPersistedNickname(device.serialNumber) || undefined,
                },
            );

            phase = 'upload-symbols';
            const choice = getChoice(state);
            const firmware =
                choice?.type === 'jlink-batch'
                    ? choice.programmingOptions.firmwareList.find(
                          f => f.elfFile,
                      )
                    : undefined;
            if (firmware?.elfFile) {
                const elfPath = path.join(
                    getFirmwareFolder(),
                    firmware.elfFile,
                );
                const bytes = await fs.promises.readFile(elfPath);
                const { uploadUrl, uploadToken } = await requestSymbolUploadUrl(
                    accessToken,
                    selectedOrgSlug,
                    selectedProjectSlug,
                );
                await uploadSymbolBinary(uploadUrl, bytes);
                await finalizeSymbolFile(
                    accessToken,
                    selectedOrgSlug,
                    selectedProjectSlug,
                    uploadToken,
                    {
                        version: deviceInfo.swVersion,
                        softwareType: deviceInfo.swType,
                    },
                );
            } else {
                logger.warn('No ELF configured for symbol upload; skipping.');
            }

            dispatch(setRegistration({ status: 'success', key: projectKey }));
        } catch (e) {
            reportEvaluateError('Device registration', e, phase);
            dispatch(
                setRegistration({ status: 'error', message: describeError(e) }),
            );
        }
    };
