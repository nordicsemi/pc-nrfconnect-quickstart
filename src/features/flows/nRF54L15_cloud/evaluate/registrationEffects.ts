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

import { type AppThunk, type RootState } from '../../../../app/store';
import { getSelectedDeviceUnsafely } from '../../../device/deviceSlice';
import { fetchProjectKey, postRegisterDevice } from './api';
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
            const { accessToken, selectedOrgSlug, selectedProjectSlug } =
                getMemfault(state);
            const deviceInfo = getDeviceInfo(state);
            const device = getSelectedDeviceUnsafely(state);

            // Protective checks (the component already gates, but just in case).
            if (!accessToken || !selectedOrgSlug || !selectedProjectSlug) {
                throw new Error('Missing authentication data');
            }
            if (deviceInfo.status !== 'success' || !deviceInfo.serialNumber) {
                throw new Error('Missing device serial number');
            }

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

            dispatch(setRegistration({ status: 'success', key: projectKey }));
        } catch (e) {
            logger.error(describeError(e));
            dispatch(
                setRegistration({ status: 'error', message: describeError(e) }),
            );
        }
    };
