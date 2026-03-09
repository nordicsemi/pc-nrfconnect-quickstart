/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { NrfutilDeviceLib } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/device';
import path from 'path';

import { alwaysProgramMwfNoATCheck } from '../../../../app/devOptions';
import { type AppThunk, type RootState } from '../../../../app/store';
import { getFirmwareFolder } from '../../../../features/device/deviceGuides';
import {
    type DeviceWithSerialnumber,
    reset,
} from '../../../../features/device/deviceLib';
import { type ActionListEntry } from '../../../../features/device/deviceSlice';
import sendATCommands from '../../../sendATCommands';
import type { ProgrammingConfig } from '../programEffects';
import { setError, setProgrammingProgress } from '../programSlice';

export default (
        actionList: ActionListEntry[],
    ): AppThunk<RootState, ProgrammingConfig> =>
    dispatch => {
        const actionLabels: ProgrammingConfig['actions'] = [];

        const addActionEntry = (item: ProgrammingConfig['actions'][number]) =>
            actionLabels.push(item) - 1;

        const actions = actionList.map(action => {
            switch (action.type) {
                case 'program-modem-firmware': {
                    const { file, core, link, coreLabel } = action.firmware;
                    const index = addActionEntry({
                        title: `${coreLabel || core} core`,
                        link,
                    });

                    return async (device: DeviceWithSerialnumber) => {
                        const serialportPath =
                            device.serialPorts?.[action.vComIndex]?.comName;

                        if (!serialportPath) {
                            const errorMessage = `COM port not found for vComIndex ${action.vComIndex}`;
                            dispatch(
                                setError({
                                    icon: 'mdi-lightbulb-alert-outline',
                                    text: errorMessage,
                                }),
                            );
                            logger.error(errorMessage);
                            throw new Error(errorMessage);
                        }

                        const ATProgressWeight = 0.2;
                        const programmingProgressWeight = 1 - ATProgressWeight;

                        dispatch(
                            setProgrammingProgress({
                                index,
                                // Give some initial progress for AT commands
                                progress: (ATProgressWeight * 100) / 2,
                            }),
                        );

                        if (!alwaysProgramMwfNoATCheck) {
                            try {
                                const res = await sendATCommands(
                                    [
                                        {
                                            command: 'AT+CGMR',
                                            responseRegex:
                                                '.*(\\d+\\.\\d+\\.\\d+).*',
                                        },
                                    ],
                                    serialportPath,
                                ).catch(() => undefined);

                                if (
                                    res?.length === 1 &&
                                    res?.[0].includes(action.version)
                                ) {
                                    dispatch(
                                        setProgrammingProgress({
                                            index,
                                            progress: 100,
                                        }),
                                    );
                                    return;
                                }
                            } catch (e) {
                                dispatch(
                                    setError({
                                        icon: 'mdi-flash-alert-outline',
                                        text: `Failed to communicate with the modem on ${serialportPath}`,
                                    }),
                                );
                                logger.error(e);
                                throw e;
                            }
                        }

                        try {
                            await NrfutilDeviceLib.program(
                                device,
                                path.join(getFirmwareFolder(), file),
                                ({ totalProgressPercentage: progress }) =>
                                    dispatch(
                                        setProgrammingProgress({
                                            index,
                                            progress:
                                                progress *
                                                    programmingProgressWeight +
                                                ATProgressWeight * 100,
                                        }),
                                    ),
                                core,
                                undefined,
                            );
                        } catch (e) {
                            dispatch(
                                setError({
                                    icon: 'mdi-flash-alert-outline',
                                    text: `Failed to program the ${coreLabel || core} core`,
                                }),
                            );
                            throw e;
                        }
                    };
                }
                case 'program': {
                    const { file, core, link, coreLabel } = action.firmware;
                    const index = addActionEntry({
                        title: `${coreLabel || core} core`,
                        link,
                    });
                    return async (device: DeviceWithSerialnumber) => {
                        try {
                            await NrfutilDeviceLib.program(
                                device,
                                path.join(getFirmwareFolder(), file),
                                ({ totalProgressPercentage: progress }) =>
                                    dispatch(
                                        setProgrammingProgress({
                                            index,
                                            progress,
                                        }),
                                    ),
                                core,
                                undefined,
                            );
                        } catch (e) {
                            dispatch(
                                setError({
                                    icon: 'mdi-flash-alert-outline',
                                    text: `Failed to program the ${coreLabel || core} core`,
                                }),
                            );
                            throw e;
                        }
                    };
                }
                case 'wait':
                    return () =>
                        new Promise(resolve => {
                            setTimeout(resolve, action.durationMs);
                        });
                case 'reset': {
                    const index = addActionEntry({
                        title: 'Reset device',
                    });

                    return async (device: DeviceWithSerialnumber) => {
                        dispatch(
                            setProgrammingProgress({
                                index,
                                progress: 20,
                            }),
                        );
                        await reset(device).then(() => {
                            dispatch(
                                setProgrammingProgress({
                                    index,
                                    progress: 100,
                                }),
                            );
                        });
                    };
                }
                default:
                    return () => {};
            }
        });

        return {
            run: device =>
                actions.reduce(
                    (acc, next) =>
                        acc.then(async () => {
                            await next(device);
                        }),
                    Promise.resolve(),
                ),
            actions: actionLabels,
        };
    };
