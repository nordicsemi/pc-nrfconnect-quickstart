/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getModule } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil';
import path from 'path';
import semver from 'semver';

import { type AppThunk } from '../../../app/store';
import sendATCommands from '../../../common/sendATCommands';
import { runNextProgrammingAction } from '../../../common/steps/Program/actionVariants/actionList';
import {
    addNote,
    setError,
    setProgrammingProgress,
    showConfirmDialog,
    skipProgrammingAction,
} from '../../../common/steps/Program/programSlice';
import { getFirmwareFolder } from '../../device/deviceGuides';
import { type DeviceWithSerialnumber } from '../../device/deviceLib';

const MINIMUM_VERSION_TO_UPDATE = '1.4.0';

export const program93ModemFirmware =
    (file: string, vComIndex: number) =>
    (device: DeviceWithSerialnumber): AppThunk<Promise<void>> =>
    async dispatch => {
        try {
            const port = device.serialPorts?.[vComIndex]?.comName;
            if (!port)
                throw new Error(
                    'Failed to program nRF93 modem firmware: invalid serial port',
                );

            const box = await getModule('93-series');
            const args: string[] = [
                '--serial-port',
                port,
                '--firmware',
                path.join(getFirmwareFolder(), file),
            ];

            await box.spawnNrfutilSubcommand(
                'modem-firmware-upgrade',
                args,
                ({ totalProgressPercentage: progress }) =>
                    dispatch(setProgrammingProgress(progress * 0.9 + 10)),
                undefined,
                undefined,
            );

            dispatch(runNextProgrammingAction(device));
        } catch (e) {
            dispatch(
                setError({
                    icon: 'mdi-flash-alert-outline',
                    text: 'Failed to program the modem firmware',
                }),
            );
            throw e;
        }
    };

export const onCancel = (): AppThunk => dispatch => {
    dispatch(skipProgrammingAction());
};

export const checkModemFirmwareVersion =
    (version: string, vComIndex: number, mode: 'SHELL' | 'LINE') =>
    (device: DeviceWithSerialnumber): AppThunk =>
    dispatch => {
        const port = device.serialPorts?.[vComIndex].comName;
        if (!port) {
            dispatch(
                setError({
                    icon: 'mdi-flash-alert-outline',
                    text: 'Failed to communicate with the device',
                }),
            );
            return;
        }

        dispatch(setProgrammingProgress(10));

        const runAfterDelay = async () => {
            const res = await sendATCommands(
                [
                    {
                        command: 'AT+CGMR',
                        responseRegex: '.*(\\d+\\.\\d+\\.\\d+).*',
                    },
                ],
                port,
                mode,
            ).catch(() => undefined);

            if (res?.length === 1 && res[0]) {
                if (semver.compare(res[0], version) >= 0) {
                    dispatch(skipProgrammingAction());
                    dispatch(
                        addNote({
                            title: 'Correct Firmware Version',
                            content: `Device is up-to-date with the modem firmware version ${res[0]}`,
                        }),
                    );
                    dispatch(runNextProgrammingAction(device));
                } else if (
                    semver.compare(res[0], MINIMUM_VERSION_TO_UPDATE) <= 0
                )
                    dispatch(
                        setError({
                            icon: 'mdi-flash-alert-outline',
                            text: `The modem firmware is older than v${MINIMUM_VERSION_TO_UPDATE} and cannot be updated.`,
                        }),
                    );
                else
                    dispatch(
                        showConfirmDialog(
                            `Downgrading is not possible after programming the modem firmware. Do you want to continue?`,
                        ),
                    );
            } else {
                dispatch(
                    setError({
                        icon: 'mdi-flash-alert-outline',
                        text: 'Failed to communicate with the device',
                    }),
                );
            }
        };

        setTimeout(() => runAfterDelay(), 3000);
    };
