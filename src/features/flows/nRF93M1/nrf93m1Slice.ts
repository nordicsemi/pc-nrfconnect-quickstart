/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type RootState } from '../../../app/store';
import { setChoice } from '../../device/deviceSlice';

interface State {
    /* Verify step */
    responses: string[];
    verifyFailed?: string;
    showSkip: boolean;

    /* Evaluate step */
    deviceUuid?: string;
    uuidFailed?: string;
    teamId: string;
    regJwt?: string;
    jwtFailed?: string;
}

const initialState: State = {
    responses: [],
    verifyFailed: undefined,
    showSkip: false,
    deviceUuid: undefined,
    uuidFailed: undefined,
    teamId: '',
    regJwt: undefined,
    jwtFailed: undefined,
};

const slice = createSlice({
    name: 'nrf93m1',
    initialState,
    reducers: {
        setResponses: (state, { payload }: PayloadAction<string[]>) => {
            state.responses = payload;
            state.verifyFailed = undefined;
            state.showSkip = false;
        },
        setVerifyFailed: (state, { payload }: PayloadAction<string>) => {
            state.verifyFailed = payload;
            /* Keep showSkip true once a verification attempt has failed. */
            state.showSkip = !(state.showSkip === false && !state.verifyFailed);
        },
        resetVerification: state => {
            state.responses = [];
            state.verifyFailed = undefined;
            state.showSkip = false;
        },

        setDeviceUuid: (state, { payload }: PayloadAction<string>) => {
            state.deviceUuid = payload;
            state.uuidFailed = undefined;
        },
        setUuidFailed: (state, { payload }: PayloadAction<string>) => {
            state.uuidFailed = payload;
        },
        resetDeviceUuid: state => {
            state.deviceUuid = undefined;
            state.uuidFailed = undefined;
        },

        setTeamId: (state, { payload }: PayloadAction<string>) => {
            state.teamId = payload;
        },
        setRegJwt: (state, { payload }: PayloadAction<string>) => {
            state.regJwt = payload;
            state.jwtFailed = undefined;
        },
        setJwtFailed: (state, { payload }: PayloadAction<string>) => {
            state.jwtFailed = payload;
        },
        resetRegJwt: state => {
            state.regJwt = undefined;
            state.jwtFailed = undefined;
        },

        reset: () => initialState,
    },
    extraReducers: builder => {
        builder.addCase(setChoice, () => initialState);
    },
});

export const {
    setResponses,
    setVerifyFailed,
    resetVerification,
    setDeviceUuid,
    setUuidFailed,
    resetDeviceUuid,
    setTeamId,
    setRegJwt,
    setJwtFailed,
    resetRegJwt,
    reset,
} = slice.actions;

export const getResponses = (state: RootState) => state.flows.nrf93m1.responses;
export const getVerifyFailed = (state: RootState) =>
    state.flows.nrf93m1.verifyFailed;
export const getShowSkip = (state: RootState) => state.flows.nrf93m1.showSkip;

export const getDeviceUuid = (state: RootState) =>
    state.flows.nrf93m1.deviceUuid;
export const getUuidFailed = (state: RootState) =>
    state.flows.nrf93m1.uuidFailed;
export const getTeamId = (state: RootState) => state.flows.nrf93m1.teamId;
export const getRegJwt = (state: RootState) => state.flows.nrf93m1.regJwt;
export const getJwtFailed = (state: RootState) => state.flows.nrf93m1.jwtFailed;

export default slice.reducer;
