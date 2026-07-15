/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type RootState } from '../../../../app/store';
import { setChoice } from '../../../device/deviceSlice';
import { type CrashReport } from './api';

export enum CloudSubStep {
    ESTABLISH_CONNECTION,
    TRY_LBS,
    TEST_CRASH,
    AUTHENTICATE,
    DEVICE_REGISTRATION,
}

const LAST_SUB_STEP = CloudSubStep.DEVICE_REGISTRATION;

export const cloudSubStepTelemetryName = (subStep: CloudSubStep) => {
    switch (subStep) {
        case CloudSubStep.ESTABLISH_CONNECTION:
            return 'Remote connection - Establish remote connection';
        case CloudSubStep.TRY_LBS:
            return 'Remote connection - Try the LED Button Service';
        case CloudSubStep.TEST_CRASH:
            return 'Remote connection - Test crash';
        case CloudSubStep.AUTHENTICATE:
            return 'Register your device - Authenticate';
        case CloudSubStep.DEVICE_REGISTRATION:
            return 'Register your device - Device registration';
    }
};

interface DeviceInfoState {
    status: 'idle' | 'fetching' | 'success' | 'error';
    serialNumber?: string;
    swType?: string;
    swVersion?: string;
    hwVersion?: string;
    message?: string;
}

interface RegistrationState {
    status: 'idle' | 'pending' | 'success' | 'error';
    message?: string;
    key?: string;
}

interface State {
    subStep: CloudSubStep;
    deviceInfo: DeviceInfoState;
    crashReportBaseLine?: number;
    crashReport?: CrashReport;
    registration: RegistrationState;
}

const initialState: State = {
    subStep: CloudSubStep.ESTABLISH_CONNECTION,
    deviceInfo: { status: 'idle' },
    registration: { status: 'idle' },
};

const slice = createSlice({
    name: 'nrf54l15Cloud',
    initialState,
    reducers: {
        setSubStep: (state, { payload }: PayloadAction<CloudSubStep>) => {
            state.subStep = payload;
        },
        nextSubStep: state => {
            state.subStep = Math.min(state.subStep + 1, LAST_SUB_STEP);
        },
        prevSubStep: state => {
            state.subStep = Math.max(
                state.subStep - 1,
                CloudSubStep.ESTABLISH_CONNECTION,
            );
        },
        setDeviceInfoFetching: state => {
            state.deviceInfo = { status: 'fetching' };
        },
        setDeviceInfo: (
            state,
            {
                payload,
            }: PayloadAction<Omit<DeviceInfoState, 'status' | 'message'>>,
        ) => {
            state.deviceInfo = { status: 'success', ...payload };
        },
        setDeviceInfoError: (state, { payload }: PayloadAction<string>) => {
            state.deviceInfo = { status: 'error', message: payload };
        },
        setCrashReportBaseLine: (state, { payload }: PayloadAction<number>) => {
            state.crashReportBaseLine = payload;
        },
        setCrashReport: (state, { payload }: PayloadAction<CrashReport>) => {
            state.crashReport = payload;
        },
        setRegistration: (
            state,
            { payload }: PayloadAction<RegistrationState>,
        ) => {
            state.registration = payload;
        },

        reset: () => initialState,
    },
    extraReducers: builder => {
        // Resets when device or FW are changed.
        builder.addCase(setChoice, () => initialState);
    },
});

export const {
    setSubStep,
    nextSubStep,
    prevSubStep,
    setDeviceInfoFetching,
    setDeviceInfo,
    setDeviceInfoError,
    setCrashReportBaseLine,
    setCrashReport,
    setRegistration,
    reset,
} = slice.actions;

export const getSubStep = (state: RootState) =>
    state.flows.nrf54l15Cloud.subStep;
export const getDeviceInfo = (state: RootState) =>
    state.flows.nrf54l15Cloud.deviceInfo;
export const getCrashReportBaseLine = (state: RootState) =>
    state.flows.nrf54l15Cloud.crashReportBaseLine;
export const getCrashReport = (state: RootState) =>
    state.flows.nrf54l15Cloud.crashReport;
export const getRegistration = (state: RootState) =>
    state.flows.nrf54l15Cloud.registration;

export default slice.reducer;
