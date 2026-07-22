/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    createSerialPort,
    logger,
    shellParser,
    xTerminalShellParserWrapper,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { Terminal } from '@xterm/headless';

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
                            finish(() => {
                                logger.error(
                                    'Could not parse device serial number.',
                                );
                                reject(
                                    new Error('Failed to obtain device info.'),
                                );
                            });
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
                        finish(() => {
                            logger.error('Timed out reading device info.');
                            reject(new Error('Failed to obtain device info.'));
                        }),
                    timeoutMs,
                );

                serialPort
                    .write('mflt get_device_info\r\n')
                    .catch(e => finish(() => reject(e)));
            })
            .catch(e => {
                logger.error(e);
                reject(new Error('Failed to obtain device info.'));
            });
    });

export const setDeviceProjectKey = async (
    device: DeviceWithSerialnumber,
    vComIndex: number,
    projectKey: string,
): Promise<void> => {
    const path = device.serialPorts?.[vComIndex]?.comName;
    if (!path) {
        throw new Error('Failed to find a valid serialport');
    }

    const serialPort = await createSerialPort(
        { path, baudRate: 115200 },
        { overwrite: true, settingsLocked: true },
    );
    const parser = await shellParser(
        serialPort,
        xTerminalShellParserWrapper(
            new Terminal({ allowProposedApi: true, cols: 999 }),
        ),
        {
            logRegex:
                /[[][0-9]{2,}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <([^<^>]+)> ([^:]+): .*(\r\n|\r|\n)$/,
            errorRegex: /ERROR/,
            timeout: 1000,
            columnWidth: 80,
        },
    );

    try {
        await new Promise<string>((resolve, reject) => {
            parser.enqueueRequest(
                `settings write string memfault/project_key ${projectKey}`,
                {
                    onSuccess: resolve,
                    onError: reject,
                    onTimeout: () => reject(new Error('timeout')),
                },
            );
        });
    } catch (e) {
        logger.error(e);
        throw e;
    } finally {
        parser.unregister();
        serialPort.close();
    }
};
