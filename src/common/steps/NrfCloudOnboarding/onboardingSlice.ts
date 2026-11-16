/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type RootState } from '../../../app/store';
import { setChoice } from '../../../features/device/deviceSlice';
import {
    type AsyncStatus,
    type Organization,
    type Project,
} from '../../../features/flows/nRF54L15_cloud/evaluate/types';
import { type Provisioning } from './api';

export type OnboardingStage =
    | 'read-token'
    | 'upload-symbols'
    | 'onboard'
    | 'reboot-device';

interface AccountState {
    status: AsyncStatus;
    accessToken?: string;
    organizations: Organization[];
    projects: Project[];
    selectedOrgSlug?: string;
    selectedProjectSlug?: string;
    message?: string;
}

interface OnboardingState {
    status: AsyncStatus;
    stage?: OnboardingStage;
    message?: string;
    deviceId?: string;
    provisioning?: Provisioning;
    provisioningError?: string;
}

interface State {
    account: AccountState;
    attestationToken?: string;
    attestationTokenError?: string;
    onboarding: OnboardingState;
}

const initialAccount: AccountState = {
    status: 'idle',
    organizations: [],
    projects: [],
};

const initialState: State = {
    account: initialAccount,
    onboarding: { status: 'idle' },
};

const slice = createSlice({
    name: 'nrfCloudOnboarding',
    initialState,
    reducers: {
        setAccountLoading: state => {
            state.account.status = 'loading';
            state.account.message = undefined;
        },
        setAccountError: (state, { payload }: PayloadAction<string>) => {
            state.account.status = 'error';
            state.account.message = payload;
        },
        setAccountSuccess: (
            state,
            {
                payload,
            }: PayloadAction<{
                organizations: Organization[];
                projects: Project[];
            }>,
        ) => {
            state.account.status = 'success';
            state.account.message = undefined;
            state.account.organizations = payload.organizations;
            state.account.projects = payload.projects;
            state.account.selectedOrgSlug = payload.organizations[0]?.slug;
            state.account.selectedProjectSlug = payload.projects[0]?.slug;
        },
        setAccessToken: (state, { payload }: PayloadAction<string>) => {
            state.account.accessToken = payload;
        },
        setSelectedOrgSlug: (state, { payload }: PayloadAction<string>) => {
            if (state.account.selectedOrgSlug !== payload) {
                state.account.projects = [];
                state.account.selectedProjectSlug = undefined;
                state.onboarding = { status: 'idle' };
            }
            state.account.selectedOrgSlug = payload;
        },
        setProjects: (state, { payload }: PayloadAction<Project[]>) => {
            state.account.projects = payload;
            state.account.selectedProjectSlug = payload[0]?.slug;
        },
        setSelectedProjectSlug: (state, { payload }: PayloadAction<string>) => {
            if (state.account.selectedProjectSlug !== payload) {
                state.onboarding = { status: 'idle' };
            }
            state.account.selectedProjectSlug = payload;
        },
        setAttestationToken: (state, { payload }: PayloadAction<string>) => {
            state.attestationToken = payload;
            state.attestationTokenError = undefined;
        },
        setAttestationTokenError: (
            state,
            { payload }: PayloadAction<string>,
        ) => {
            state.attestationTokenError = payload;
        },
        setOnboarding: (state, { payload }: PayloadAction<OnboardingState>) => {
            state.onboarding = payload;
        },
        setProvisioning: (
            state,
            { payload }: PayloadAction<Provisioning | undefined>,
        ) => {
            state.onboarding.provisioning = payload;
            state.onboarding.provisioningError = undefined;
        },
        setProvisioningError: (state, { payload }: PayloadAction<string>) => {
            state.onboarding.provisioningError = payload;
        },
        resetAccount: state => {
            state.account = initialAccount;
            state.onboarding = { status: 'idle' };
        },
        reset: () => initialState,
    },
    extraReducers: builder => {
        builder.addCase(setChoice, () => initialState);
    },
});

export const {
    setAccountLoading,
    setAccountError,
    setAccountSuccess,
    setAccessToken,
    setSelectedOrgSlug,
    setProjects,
    setSelectedProjectSlug,
    setAttestationToken,
    setAttestationTokenError,
    setOnboarding,
    setProvisioning,
    setProvisioningError,
    resetAccount,
    reset,
} = slice.actions;

export const getAccount = (state: RootState) =>
    state.flows.nrfCloudOnboarding.account;
export const getAttestationToken = (state: RootState) =>
    state.flows.nrfCloudOnboarding.attestationToken;
export const getAttestationTokenError = (state: RootState) =>
    state.flows.nrfCloudOnboarding.attestationTokenError;
export const getOnboarding = (state: RootState) =>
    state.flows.nrfCloudOnboarding.onboarding;

export default slice.reducer;
