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
    prepareProgramming,
    type ProgrammingStep,
    removeError,
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
    dispatch(removeError(undefined));

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

    // batchWithProgress should always be filled here
    const batchLength = getState().steps.program.programmingActions?.length;
    // length 0 is alse an invalid state
    if (!batchLength) {
        logger.error('Could not find valid programming progress batch');
        dispatch(
            setError({
                icon: 'mdi-lightbulb-alert-outline',
                text: 'Program is in invalid state. Please contact support.',
            }),
        );
        return;
    }
    dispatch(removeError(undefined));
    const index = batchLength - 1;
    dispatch(
        setProgrammingProgress({
            index,
            progress: 50,
        }),
    );

    reset(device)
        .then(() => {
            dispatch(
                setProgrammingProgress({
                    index,
                    progress: 100,
                }),
            );
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
