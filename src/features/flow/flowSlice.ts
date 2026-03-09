/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type RootState } from '../../app/store';

interface State {
    flow: string[];
    currentStepIndex: number;
    finishedLastStep: boolean;
    isConnectVisible: boolean;
}

const initialState: State = {
    flow: [],
    currentStepIndex: -1,
    finishedLastStep: false,
    isConnectVisible: true,
};

const slice = createSlice({
    name: 'flowProgress',
    initialState,
    reducers: {
        setFlow: (state, action: PayloadAction<string[]>) => {
            state.flow = action.payload;
            state.currentStepIndex = 0;
        },
        goToNextStep: state => {
            state.currentStepIndex = Math.min(
                (state.currentStepIndex += 1),
                state.flow.length - 1,
            );
        },
        goToPreviousStep: state => {
            if (state.currentStepIndex === 0) {
                state.flow = [];
                state.isConnectVisible = true;
            }
            state.currentStepIndex = Math.max(
                (state.currentStepIndex -= 1),
                -1,
            );
        },
        setFinishedLastStep: (state, action: PayloadAction<boolean>) => {
            state.finishedLastStep = action.payload;
        },

        setIsConnectVisible: (state, action: PayloadAction<boolean>) => {
            state.isConnectVisible = action.payload;
        },
    },
});

export const {
    setFlow,
    goToNextStep,
    goToPreviousStep,
    setFinishedLastStep,
    setIsConnectVisible,
} = slice.actions;

export const isConnectVisible = (state: RootState) =>
    state.flowProgress.isConnectVisible;
export const getFlow = (state: RootState) => state.flowProgress.flow;
export const getCurrentStepIndex = (state: RootState) =>
    state.flowProgress.currentStepIndex;
export const getFinishedLastStep = (state: RootState) =>
    state.flowProgress.finishedLastStep;

export default slice.reducer;
