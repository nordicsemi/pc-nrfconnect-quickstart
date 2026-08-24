/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    describeError,
    logger,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { NrfutilDeviceLib } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/device';
import path from 'path';

import { alwaysProgramMwfNoATCheck } from '../../../../app/devOptions';
import { type AppThunk, type RootState } from '../../../../app/store';
import { getFirmwareFolder } from '../../../../features/device/deviceGuides';
import {
    type DeviceWithSerialnumber,
    reset,
} from '../../../../features/device/deviceLib';
import {
    type ActionListEntry,
    type ProgrammingAction,
    type ProgramModemFirmwareAction,
    type WaitAction,
} from '../../../../features/device/deviceSlice';
import sendATCommands from '../../../sendATCommands';
import type { ProgrammingConfig } from '../programEffects';
import {
    type ActionListProgrammingStep,
    getProgrammingActions,
    setError,
    setProgrammingProgress,
} from '../programSlice';

const runResetAction =
    (
        index: number,
        device: DeviceWithSerialnumber,
    ): AppThunk<RootState, Promise<void>> =>
    async dispatch => {
        dispatch(
            setProgrammingProgress({
                index,
                progress: 20,
            }),
        );
        await reset(device)
            .then(() => {
                dispatch(
                    setProgrammingProgress({
                        index,
                        progress: 100,
                    }),
                );
                dispatch(runNextProgrammingAction(device, index));
            })
            .catch(e => {
                dispatch(
                    setError({
                        icon: 'mdi-restore-alert',
                        text: 'Failed to reset the device',
                        buttonText: 'Reset',
                        retryRef: 'reset',
                    }),
                );
                throw e;
            });
    };

const runWaitAction =
    (
        index: number,
        device: DeviceWithSerialnumber,
        config: WaitAction,
    ): AppThunk<RootState, Promise<void>> =>
    async dispatch => {
        await new Promise(resolve => {
            setTimeout(resolve, config.durationMs);
        });

        dispatch(runNextProgrammingAction(device, index));
    };

const runProgramAction =
    (
        index: number,
        device: DeviceWithSerialnumber,
        config: ProgrammingAction,
    ): AppThunk<RootState, Promise<void>> =>
    async dispatch => {
        const { core, coreLabel, file } = config.firmware;
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
            dispatch(runNextProgrammingAction(device, index));
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

const runModemFirmwareAction =
    (
        index: number,
        device: DeviceWithSerialnumber,
        config: ProgramModemFirmwareAction,
    ): AppThunk<RootState, Promise<void>> =>
    async dispatch => {
        const { file, core, coreLabel } = config.firmware;
        const serialportPath = device.serialPorts?.[config.vComIndex]?.comName;

        if (!serialportPath) {
            const errorMessage = `COM port not found for vComIndex ${config.vComIndex}`;
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
                            responseRegex: '.*(\\d+\\.\\d+\\.\\d+).*',
                        },
                    ],
                    serialportPath,
                ).catch(() => undefined);

                if (res?.length === 1 && res?.[0].includes(config.version)) {
                    dispatch(
                        setProgrammingProgress({
                            index,
                            progress: 100,
                        }),
                    );
                    dispatch(runNextProgrammingAction(device, index));
                    return;
                }
            } catch (e) {
                dispatch(
                    setError({
                        icon: 'mdi-flash-alert-outline',
                        text: `Failed to communicate with the modem on ${serialportPath}`,
                    }),
                );
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
                                progress * programmingProgressWeight +
                                ATProgressWeight * 100,
                        }),
                    ),
                core,
                undefined,
            );
            dispatch(runNextProgrammingAction(device, index));
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

export const runNextProgrammingAction =
    (device: DeviceWithSerialnumber, index?: number): AppThunk =>
    (dispatch, getState) => {
        try {
            index = index !== undefined ? index + 1 : 0;
            const action = getProgrammingActions(getState()).at(index);
            if (!!action && 'config' in action) {
                const { config } = action;
                switch (config.type) {
                    case 'program-modem-firmware':
                        dispatch(runModemFirmwareAction(index, device, config));
                        break;
                    case 'program':
                        dispatch(runProgramAction(index, device, config));
                        break;
                    case 'wait':
                        dispatch(runWaitAction(index, device, config));
                        break;
                    case 'reset':
                        dispatch(runResetAction(index, device));
                        break;
                }
            }
        } catch (e) {
            // Actions will run their own handlers, we just want to log it
            logger.error(describeError(e));
        }
    };

export default (actionList: ActionListEntry[]): AppThunk<ProgrammingConfig> =>
    dispatch => {
        // I have this separate to avoid accidentally forgetting to set `progress`
        // The reason that I return the entire object with a displayInfo member is just so I can spread it for nicer syntax later on
        const displayInfo = (
            title: string,
            link?: { label: string; href: string },
        ) => ({
            displayInfo: {
                title,
                link,
                progress: 0,
            },
        });

        const actions: ActionListProgrammingStep[] = actionList
            .map(config => {
                switch (config.type) {
                    case 'program-modem-firmware': {
                        const { core, link, coreLabel } = config.firmware;
                        return {
                            ...displayInfo(`${coreLabel || core} core`, link),
                            config,
                        };
                    }
                    case 'program': {
                        const { core, link, coreLabel } = config.firmware;
                        return {
                            ...displayInfo(`${coreLabel || core} core`, link),
                            config,
                        };
                    }
                    case 'reset':
                        return {
                            ...displayInfo('Reset device'),
                            config,
                        };
                    case 'wait':
                        return {
                            config,
                        };
                    default:
                        return undefined;
                }
            })
            .filter(v => v !== undefined);

        return {
            run: device => dispatch(runNextProgrammingAction(device)),
            actions,
        };
    };
