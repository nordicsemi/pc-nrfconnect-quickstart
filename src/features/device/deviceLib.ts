/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';
import {
    type DeviceTraits,
    type NrfutilDevice,
    NrfutilDeviceLib,
} from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/device';

const requiredTraits: DeviceTraits = {
    jlink: true,
    modem: true,
    nordicUsb: true,
};

export type DeviceWithSerialnumber = NrfutilDevice & {
    serialNumber: string;
};

const hasSerialNumber = (
    device: NrfutilDevice,
): device is DeviceWithSerialnumber =>
    'serialNumber' in device && device.serialNumber !== undefined;

export const startWatchingDevices = async (
    onDeviceArrived: (device: DeviceWithSerialnumber) => void,
    onDeviceLeft: (deviceId: number) => void,
) => {
    const stopHotplugEvents = await NrfutilDeviceLib.list(
        requiredTraits,
        initialDevices =>
            initialDevices.filter(hasSerialNumber).forEach(onDeviceArrived),
        logger.debug,
        {
            onDeviceArrived: device =>
                hasSerialNumber(device) && onDeviceArrived(device),
            onDeviceLeft,
        },
    );

    return () => {
        if (stopHotplugEvents.isRunning()) {
            stopHotplugEvents.stop();
        }
    };
};
export const reset = (device: DeviceWithSerialnumber) =>
    NrfutilDeviceLib.reset(device, 'Application', 'RESET_SYSTEM');
