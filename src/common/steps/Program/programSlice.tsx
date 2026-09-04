/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type RootState } from '../../../app/store';
import { type ActionListEntry } from '../../../features/device/deviceSlice';

type ProgressInfo = {
    title: string;
    link?: { label: string; href: string };
    progress: number;
};

export interface ActionListProgrammingStep {
    displayInfo?: ProgressInfo;
    config: ActionListEntry;
}

export type ProgrammingStep =
    | ActionListProgrammingStep
    | {
          displayInfo: ProgressInfo;
      };

export type RetryRef = 'reset' | 'standard';
interface Error {
    icon: string;
    text: string;
    buttonText?: string;
    retryRef?: RetryRef;
}

interface State {
    programmingActions: ProgrammingStep[];
    error?: Error;
}

const initialState: State = {
    programmingActions: [],
    error: undefined,
};

const slice = createSlice({
    name: 'program',
    initialState,
    reducers: {
        prepareProgramming: (
            state,
            action: PayloadAction<ProgrammingStep[]>,
        ) => {
            state.programmingActions = action.payload;
        },
        setProgrammingProgress: (
            state,
            action: PayloadAction<{
                progress: number;
                index: number;
            }>,
        ) => {
            // This is here for lint but cannot happen
            if (!state.programmingActions) return;

            const updatedFirmwareWithProgress = state.programmingActions.map(
                (f, index) => {
                    if (index === action.payload.index && f.displayInfo) {
                        f.displayInfo.progress = action.payload.progress;
                    }
                    return f;
                },
            );

            state.programmingActions = updatedFirmwareWithProgress;
        },
        setError: (state, action: PayloadAction<Error>) => {
            state.error = action.payload;
        },
        removeError: state => {
            state.error = undefined;
        },

        reset: () => initialState,
    },
});

export const {
    prepareProgramming,
    setProgrammingProgress,
    setError,
    removeError,
    reset,
} = slice.actions;

export const getProgrammingActions = (state: RootState) =>
    state.steps.program.programmingActions;
export const getProgrammingProgress = (state: RootState): ProgressInfo[] =>
    state.steps.program.programmingActions
        .map(a => a.displayInfo)
        .filter(v => v !== undefined);
export const getError = (state: RootState) => state.steps.program.error;

export default slice.reducer;
