/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';

import { type AppThunk, type RootState } from '../../../../app/store';
import { type DeviceWithSerialnumber } from '../../../device/deviceLib';
import { getSelectedDeviceUnsafely } from '../../../device/deviceSlice';
import {
    setDeviceInfo,
    setDeviceInfoError,
    setDeviceInfoFetching,
} from './cloudEvaluateSlice';
import { type DeviceInfo, readDeviceInfo } from './device';

const VCOM_INDEX = 1;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

const delay = (ms: number) =>
    new Promise<void>(resolve => {
        setTimeout(resolve, ms);
    });

const attemptRead = async (
    device: DeviceWithSerialnumber,
    attempt: number,
): Promise<DeviceInfo> => {
    try {
        return await readDeviceInfo(device, VCOM_INDEX);
    } catch (e) {
        logger.error(
            `mflt get_device_info attempt ${attempt}/${MAX_ATTEMPTS} failed: ${describeError(
                e,
            )}`,
        );
        if (attempt >= MAX_ATTEMPTS) {
            throw e;
        }
        await delay(RETRY_DELAY_MS);
        return attemptRead(device, attempt + 1);
    }
};

export const fetchDeviceInfo =
    (): AppThunk<RootState, Promise<void>> => async (dispatch, getState) => {
        const device = getSelectedDeviceUnsafely(getState());
        dispatch(setDeviceInfoFetching());

        try {
            dispatch(setDeviceInfo(await attemptRead(device, 1)));
        } catch (e) {
            dispatch(setDeviceInfoError(describeError(e)));
        }
    };
