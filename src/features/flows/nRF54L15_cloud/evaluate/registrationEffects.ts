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

const VCOM_INDEX = 1;
const HARDWARE_VERSION_FALLBACK = 'nrf54l15dk';

export const registerDevice =
    (): AppThunk<RootState, Promise<void>> => async (dispatch, getState) => {
        dispatch(setRegistration({ status: 'pending' }));
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

            const accessToken = await dispatch(getValidAccessToken());

            // 1. project key
            const projectKey = await fetchProjectKey(
                accessToken,
                selectedOrgSlug,
                selectedProjectSlug,
            );

            // 2. write the key to the device
            await setDeviceProjectKey(device, VCOM_INDEX, projectKey);

            // 3. online registration
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

            // 4. upload symbol file
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
            logger.error(describeError(e));
            dispatch(
                setRegistration({ status: 'error', message: describeError(e) }),
            );
        }
    };
