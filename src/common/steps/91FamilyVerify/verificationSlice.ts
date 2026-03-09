/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type RootState } from '../../../app/store';
import { setChoice } from '../../../features/device/deviceSlice';

interface State {
    responses: string[];
    failed?: string;
    showSkip: boolean;
}

const initialState: State = {
    responses: [],
    failed: undefined,
    showSkip: false,
};

const slice = createSlice({
    name: 'verification91',
    initialState,
    reducers: {
        setResponses: (state, action: PayloadAction<string[]>) => {
            state.responses = action.payload;
            state.failed = undefined;
            state.showSkip = false;
        },
        setFailed: (state, action: PayloadAction<string>) => {
            state.failed = action.payload;
            // always keep/set to true except case showSkip=false and payload=false
            state.showSkip = !(state.showSkip === false && !state.failed);
        },
        reset: () => initialState,
    },
    extraReducers: builder => {
        builder.addCase(setChoice, () => initialState);
    },
});

export const { setResponses, setFailed, reset } = slice.actions;

export const getResponses = (state: RootState) =>
    state.steps.verification91.responses;
export const getFailed = (state: RootState) =>
    state.steps.verification91.failed;
export const getShowSkip = (state: RootState) =>
    state.steps.verification91.showSkip;

export default slice.reducer;
