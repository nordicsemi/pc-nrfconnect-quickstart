/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    createSerialPort,
    logger,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { type AppThunk, type RootState } from '../../../app/store';
import {
    type DeviceWithSerialnumber,
    reset,
} from '../../../features/device/deviceLib';
import { selectedDeviceIsConnected } from '../../../features/device/deviceSlice';
import { setResponse } from './verifySlice';

const decoder = new TextDecoder();

export default (
        device: DeviceWithSerialnumber,
        vComIndex: number,
    ): AppThunk<RootState, Promise<() => void>> =>
    async (dispatch, getState) => {
        if (!selectedDeviceIsConnected(getState())) {
            throw new Error('No development kit connected.');
        }

        const path = device.serialPorts?.[vComIndex].comName;

        if (!path) {
            throw new Error('Failed to find a valid serialport');
        }

        let sp: Awaited<ReturnType<typeof createSerialPort>>;

        try {
            sp = await createSerialPort(
                {
                    path,
                    baudRate: 115200,
                },
                { overwrite: true, settingsLocked: true },
            );
        } catch (e) {
            logger.error(e);
            throw new Error('Failed to communicate with the device');
        }

        const unregister = sp.onData(data =>
            dispatch(setResponse(decoder.decode(data))),
        );

        const cleanup = () => {
            unregister();
            sp.close();
        };

        try {
            await reset(device);
        } catch (e) {
            logger.error(e);
            cleanup();
            throw new Error('Failed to reset the device');
        }

        return cleanup;
    };
