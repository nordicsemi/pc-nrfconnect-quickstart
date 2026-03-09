/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    type DeviceCore,
    NrfutilDeviceLib,
} from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/device';
import path from 'path';

import { type AppThunk, type RootState } from '../../../../app/store';
import { getFirmwareFolder } from '../../../../features/device/deviceGuides';
import { type Firmware } from '../../../../features/device/deviceSlice';
import type { ProgrammingConfig } from '../programEffects';
import { setError, setProgrammingProgress } from '../programSlice';

export default (
        firmwares: Firmware[],
    ): AppThunk<RootState, ProgrammingConfig> =>
    dispatch => {
        const batch = NrfutilDeviceLib.batch();

        const nonDuplicateCores = firmwares
            .map(({ core }) => (core === 'Modem' ? 'Application' : core))
            .filter((core, index, self) => self.indexOf(core) === index);

        nonDuplicateCores.forEach((core, index) => {
            batch.recover(core as DeviceCore, {
                onTaskBegin: () => {
                    dispatch(
                        setProgrammingProgress({
                            index: 0,
                            // + 1 because we should show some progress on the first action
                            progress:
                                ((index + 1) / (nonDuplicateCores.length + 1)) *
                                100,
                        }),
                    );
                },
                onTaskEnd: end => {
                    if (end.error) {
                        dispatch(
                            setError({
                                icon: 'mdi-lightbulb-alert-outline',
                                text: 'Failed to erase device',
                            }),
                        );
                    }
                },
            });
        });
        batch.collect(nonDuplicateCores.length, () => {
            dispatch(setProgrammingProgress({ index: 0, progress: 100 }));
        });

        firmwares.forEach(({ file, core, coreLabel }, index) => {
            batch.program(
                path.join(getFirmwareFolder(), file),
                core === 'Modem' ? 'Application' : (core as DeviceCore),
                undefined,
                undefined,
                {
                    onProgress: ({ totalProgressPercentage: progress }) =>
                        dispatch(
                            setProgrammingProgress({
                                index: index + 1,
                                progress,
                            }),
                        ),
                    onTaskEnd: end => {
                        if (end.error) {
                            dispatch(
                                setError({
                                    icon: 'mdi-flash-alert-outline',
                                    text: `Failed to program the ${coreLabel || core} core`,
                                }),
                            );
                        }
                    },
                },
            );
        });

        // use 'RESET_DEFAULT' which is default when not passing anything for reset argument
        batch.reset('Application', undefined, {
            onTaskBegin: () => {
                dispatch(
                    setProgrammingProgress({
                        index: 1 + firmwares.length,
                        progress: 50,
                    }),
                );
            },
            onTaskEnd: end => {
                if (end.result === 'success') {
                    dispatch(
                        setProgrammingProgress({
                            index: 1 + firmwares.length,
                            progress: 100,
                        }),
                    );
                }
                if (end.error) {
                    dispatch(
                        setError({
                            icon: 'mdi-restore-alert',
                            text: 'Failed to reset the device',
                            buttonText: 'Reset',
                            retryRef: 'reset',
                        }),
                    );
                }
            },
        });

        return {
            run: device => batch.run(device),
            actions: [
                { title: 'Erase device' },
                ...firmwares.map(f => ({
                    title: `${f.core} core`,
                    link: f.link,
                })),
                { title: 'Reset device' },
            ],
        };
    };
