/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type RootState } from '../../../app/store';
import { setChoice } from '../../../features/device/deviceSlice';

interface State {
    response?: string;
    error?: string;
}

const initialState: State = {};

const slice = createSlice({
    name: 'verification5x',
    initialState,
    reducers: {
        setResponse: (state, action: PayloadAction<string>) => {
            state.response =
                state.response?.concat(action.payload) || action.payload;
            state.error = undefined;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        onClosedPort: state => {
            if (!state.response) {
                state.error = 'No data received from the device';
            }
        },
        reset: () => initialState,
    },
    extraReducers: builder => {
        builder.addCase(setChoice, () => initialState);
    },
});

export const { setResponse, setError, reset } = slice.actions;

export const getResponse = (state: RootState) =>
    state.steps.verification5x.response;
export const getError = (state: RootState) => state.steps.verification5x.error;

export default slice.reducer;
