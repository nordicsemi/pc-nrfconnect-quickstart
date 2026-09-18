/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type RootState } from '../../../app/store';
import { setChoice } from '../../device/deviceSlice';

interface State {
    failed?: string;
    uuid?: string;
    teamID?: string;
    registrationToken?: string;
}

const initialState: State = {
    failed: undefined,
    uuid: undefined,
    teamID: undefined,
    registrationToken: undefined,
};

const slice = createSlice({
    name: 'nrf93m1',
    initialState,
    reducers: {
        setResponses: (state, { payload }: PayloadAction<string[]>) => {
            state.uuid = payload[0];
            state.registrationToken = payload[1];
        },
        setFailed: (state, { payload }: PayloadAction<string | undefined>) => {
            state.failed = payload;
        },
        setTeamID: (state, { payload }: PayloadAction<string>) => {
            state.teamID = payload;
        },
        reset: () => initialState,
    },
    extraReducers: builder => {
        builder.addCase(setChoice, () => initialState);
    },
});

export const { setResponses, setFailed, setTeamID, reset } = slice.actions;

export const getFailed = (state: RootState) => state.flows.nrf93m1.failed;
export const getDeviceUUID = (state: RootState) => state.flows.nrf93m1.uuid;
export const getTeamID = (state: RootState) => state.flows.nrf93m1.teamID;
export const getRegistrationToken = (state: RootState) =>
    state.flows.nrf93m1.registrationToken;

export default slice.reducer;
