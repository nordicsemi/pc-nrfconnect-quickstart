/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { type AppThunk } from '../../../app/store';
import {
    type DeviceWithSerialnumber,
    reset,
} from '../../../features/device/deviceLib';
import {
    getChoiceUnsafely,
    getSelectedDeviceUnsafely,
    selectedDeviceIsConnected,
} from '../../../features/device/deviceSlice';
import actionList from './actionVariants/actionList';
import jlinkBatch from './actionVariants/jlinkBatch';
import {
    addNote,
    prepareProgramming,
    type ProgrammingStep,
    type RetryRef,
    setError,
    setProgrammingProgress,
} from './programSlice';

const checkDeviceConnected = (): AppThunk<boolean> => (dispatch, getState) => {
    if (!selectedDeviceIsConnected(getState())) {
        dispatch(
            setError({
                icon: 'mdi-lightbulb-alert-outline',
                text: 'No development kit detected',
            }),
        );
        return false;
    }
    return true;
};

export interface ProgrammingConfig {
    run: (device: DeviceWithSerialnumber) => unknown;
    actions: ProgrammingStep[];
}

export const startProgramming = (): AppThunk => (dispatch, getState) => {
    const choice = getChoiceUnsafely(getState());

    let config;

    switch (choice.type) {
        case 'jlink-batch':
            config = dispatch(
                jlinkBatch(choice.programmingOptions.firmwareList),
            );
            break;
        case 'action-list':
            config = dispatch(actionList(choice.programmingOptions.actions));
            break;
        default:
            dispatch(
                setError({
                    icon: 'mdi-lightbulb-alert-outline',
                    text: 'Unsupported programming choice',
                }),
            );
            return;
    }

    dispatch(prepareProgramming(config.actions));
    if (choice.firmwareNote) {
        dispatch(addNote(choice.firmwareNote));
    }

    if (!dispatch(checkDeviceConnected())) return;

    try {
        config.run(getSelectedDeviceUnsafely(getState()));
    } catch (e) {
        logger.error(e);
        if (!getState().steps.program.error) {
            dispatch(
                setError({
                    icon: 'mdi-lightbulb-alert-outline',
                    text: 'Unknown error',
                }),
            );
        }
    }
};

export const retry =
    (retryref: RetryRef = 'standard'): AppThunk =>
    dispatch => {
        switch (retryref) {
            case 'reset':
                return dispatch(resetDevice());
            case 'standard':
            default:
                return dispatch(startProgramming());
        }
    };

const resetDevice = (): AppThunk => (dispatch, getState) => {
    if (!dispatch(checkDeviceConnected())) return;

    const device = getSelectedDeviceUnsafely(getState());

    dispatch(setError(undefined));

    // This must happen during a batch program, and all batch programming will have a reset at the very end.
    // We do not increase the index after reset has finished, and so we can simply set the reset progress
    // This isn't preferable, so an alternative should be found to handle this more explicitly
    dispatch(setProgrammingProgress(50));

    reset(device)
        .then(() => {
            dispatch(setProgrammingProgress(100));
        })
        .catch(() =>
            dispatch(
                setError({
                    icon: 'mdi-restore-alert',
                    text: 'Failed to reset the device',
                    buttonText: 'Reset',
                    retryRef: 'reset',
                }),
            ),
        );
};
