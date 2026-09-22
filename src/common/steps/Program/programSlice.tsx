/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type RootState } from '../../../app/store';
import { type ActionListEntry } from '../../../features/device/deviceSlice';

export type ProgressInfo = {
    title: string;
    link?: { label: string; href: string };
    progress: number;
    skipped?: boolean;
    confirm?:
        | {
              visible: true;
              text: string;
          }
        | {
              visible: false;
          };
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
    notes: { title: string; content: string }[];
    currentIndex: number;
}

const initialState: State = {
    programmingActions: [],
    error: undefined,
    notes: [],
    currentIndex: 0,
};

const updateCurrentActionDisplayInfo = (
    actions: ProgrammingStep[],
    index: number,
    config: Partial<ProgressInfo>,
) => {
    // We can't splice since we don't have an array of primitives
    // Redux needs a whole new array to register the change
    const updatedActions = actions.map((a, i) => {
        if (i === index && a.displayInfo) {
            a.displayInfo = { ...a.displayInfo, ...config };
        }
        return a;
    });

    return updatedActions;
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
            state.notes = [];
            state.error = undefined;
            state.currentIndex = 0;
        },
        addNote: (
            state,
            action: PayloadAction<{ title: string; content: string }>,
        ) => {
            state.notes.push(action.payload);
        },
        setProgrammingProgress: (state, action: PayloadAction<number>) => {
            state.programmingActions = updateCurrentActionDisplayInfo(
                state.programmingActions,
                state.currentIndex,
                { progress: action.payload },
            );
        },
        skipProgrammingAction: state => {
            state.programmingActions = updateCurrentActionDisplayInfo(
                state.programmingActions,
                state.currentIndex,
                {
                    skipped: true,
                },
            );
        },
        showConfirmDialog: (state, action: PayloadAction<string>) => {
            state.programmingActions = updateCurrentActionDisplayInfo(
                state.programmingActions,
                state.currentIndex,
                {
                    confirm: {
                        visible: true,
                        text: action.payload,
                    },
                },
            );
        },
        hideConfirmDialog: state => {
            state.programmingActions = updateCurrentActionDisplayInfo(
                state.programmingActions,
                state.currentIndex,
                { confirm: { visible: false } },
            );
        },
        increaseCurrentIndex: state => {
            state.currentIndex += 1;
        },
        setError: (state, action: PayloadAction<Error | undefined>) => {
            state.error = action.payload;
        },
        reset: () => initialState,
    },
});

export const {
    prepareProgramming,
    setProgrammingProgress,
    increaseCurrentIndex,
    showConfirmDialog,
    hideConfirmDialog,
    skipProgrammingAction,
    setError,
    addNote,
    reset,
} = slice.actions;

export const getProgrammingActions = (state: RootState) =>
    state.steps.program.programmingActions;
export const getProgrammingProgress = (state: RootState): ProgressInfo[] =>
    state.steps.program.programmingActions
        .map(a => a.displayInfo)
        .filter(v => v !== undefined);
export const getError = (state: RootState) => state.steps.program.error;
export const getCurrentAction = (state: RootState) =>
    state.steps.program.programmingActions.at(state.steps.program.currentIndex);
export const getNotes = (state: RootState) => state.steps.program.notes;

export default slice.reducer;
