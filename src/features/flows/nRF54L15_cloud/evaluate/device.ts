/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    createSerialPort,
    logger,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { cleanShellOutput } from '../../../../common/cleanShellOutput';
import { type DeviceWithSerialnumber } from '../../../device/deviceLib';

export interface DeviceInfo {
    serialNumber: string;
    swType?: string;
    swVersion?: string;
    hwVersion?: string;
}

const decoder = new TextDecoder();

const SN_REGEX = /S\/N:\s*([0-9A-Fa-f]+)\r?\n/;
const SW_TYPE_REGEX = /SW type:\s*(\S+)\r?\n/;
const SW_VERSION_REGEX = /SW version:\s*(\S+)\r?\n/;
const HW_VERSION_REGEX = /HW version:\s*(\S+)\r?\n/;

export const readDeviceInfo = (
    device: DeviceWithSerialnumber,
    vComIndex: number,
    timeoutMs = 3000,
): Promise<DeviceInfo> =>
    new Promise<DeviceInfo>((resolve, reject) => {
        const path = device.serialPorts?.[vComIndex]?.comName;
        if (!path) {
            reject(new Error('Failed to find a valid serialport'));
            return;
        }

        createSerialPort(
            { path, baudRate: 115200 },
            { overwrite: true, settingsLocked: true },
        )
            .then(serialPort => {
                let buffer = '';
                let done = false;
                let timeout: NodeJS.Timeout;

                const finish = (action: () => void) => {
                    if (done) return;
                    done = true;
                    clearTimeout(timeout);
                    unregister();
                    serialPort.close();
                    action();
                };

                const unregister = serialPort.onData(data => {
                    buffer += decoder.decode(data);
                    const cleaned = cleanShellOutput(buffer);

                    if (HW_VERSION_REGEX.test(cleaned)) {
                        const serialNumber = SN_REGEX.exec(cleaned)?.[1];
                        if (!serialNumber) {
                            finish(() =>
                                reject(
                                    new Error(
                                        'Could not parse device serial number',
                                    ),
                                ),
                            );
                            return;
                        }
                        finish(() =>
                            resolve({
                                serialNumber,
                                swType: SW_TYPE_REGEX.exec(cleaned)?.[1],
                                swVersion: SW_VERSION_REGEX.exec(cleaned)?.[1],
                                hwVersion: HW_VERSION_REGEX.exec(cleaned)?.[1],
                            }),
                        );
                    }
                });

                timeout = setTimeout(
                    () =>
                        finish(() =>
                            reject(new Error('Timed out reading device info')),
                        ),
                    timeoutMs,
                );

                serialPort
                    .write('mflt get_device_info\r\n')
                    .catch(e => finish(() => reject(e)));
            })
            .catch(e => {
                logger.error(e);
                reject(new Error('Failed to communicate with the device'));
            });
    });
