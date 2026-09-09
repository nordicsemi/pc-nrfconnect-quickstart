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

import { type AppThunk } from '../../../../app/store';
import { getFirmwareFolder } from '../../../../features/device/deviceGuides';
import { type Firmware } from '../../../../features/device/deviceSlice';
import type { ProgrammingConfig } from '../programEffects';
import {
    increaseCurrentIndex,
    setError,
    setProgrammingProgress,
} from '../programSlice';

export default (firmwares: Firmware[]): AppThunk<ProgrammingConfig> =>
    dispatch => {
        const batch = NrfutilDeviceLib.batch();

        const nonDuplicateCores = firmwares
            .map(({ core }) => (core === 'Modem' ? 'Application' : core))
            .filter((core, index, self) => self.indexOf(core) === index);

        nonDuplicateCores.forEach((core, index) => {
            batch.recover(core as DeviceCore, {
                onTaskBegin: () => {
                    dispatch(
                        setProgrammingProgress(
                            // + 1 because we should show some progress on the first action
                            ((index + 1) / (nonDuplicateCores.length + 1)) *
                                100,
                        ),
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
            dispatch(setProgrammingProgress(100));
            dispatch(increaseCurrentIndex());
        });

        firmwares.forEach(({ file, core, coreLabel }) => {
            batch.program(
                path.join(getFirmwareFolder(), file),
                core === 'Modem' ? 'Application' : (core as DeviceCore),
                undefined,
                undefined,
                {
                    onProgress: ({ totalProgressPercentage: progress }) =>
                        dispatch(setProgrammingProgress(progress)),
                    onTaskEnd: end => {
                        dispatch(increaseCurrentIndex());
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
                dispatch(setProgrammingProgress(50));
            },
            onTaskEnd: end => {
                if (end.result === 'success') {
                    dispatch(setProgrammingProgress(100));
                    // Do not increase index here!
                    // We must keep correct index of reset action in order to retry in the case of only resetting again correctly
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
            ].map(v => ({ displayInfo: { ...v, progress: 0 } })),
        };
    };
