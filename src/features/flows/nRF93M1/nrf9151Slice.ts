/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type RootState } from '../../../app/store';
import { setChoice } from '../../device/deviceSlice';

interface State {
    attestationToken?: string;
    failed?: string;
}

const initialState: State = {
    attestationToken: undefined,
    failed: undefined,
};

const slice = createSlice({
    name: 'nrf9151',
    initialState,
    reducers: {
        setAttestationToken: (
            state,
            { payload: attestationToken }: PayloadAction<string>,
        ) => {
            state.attestationToken = attestationToken;
        },
        setFailed: (state, { payload: failed }: PayloadAction<string>) => {
            state.failed = failed;
        },

        reset: () => initialState,
    },
    extraReducers: builder => {
        builder.addCase(setChoice, () => initialState);
    },
});

export const { setAttestationToken, setFailed, reset } = slice.actions;

export const getAttestationToken = (state: RootState) =>
    state.flows.nrf9151.attestationToken;
export const getFailed = (state: RootState) => state.flows.nrf9151.failed;

export default slice.reducer;
