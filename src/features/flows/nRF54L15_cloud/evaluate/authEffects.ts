/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { inMain as auth } from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/auth';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';

import { type AppThunk, type RootState } from '../../../../app/store';
import {
    fetchMemfaultToken,
    fetchOrganizations,
    fetchProjects,
    provisionMyNordicAccount,
} from './api';
import {
    getMemfault,
    setAccessToken,
    setMemfaultError,
    setMemfaultLoading,
    setMemfaultSuccess,
    setProjects,
    setSelectedOrgSlug,
} from './cloudEvaluateSlice';

const TOKEN_EXPIRY_BUFFER_MS = 60_000;

export const getValidAccessToken =
    (): AppThunk<RootState, Promise<string>> => async (dispatch, getState) => {
        const { accessToken, accessTokenExpiresAt } = getMemfault(getState());

        if (
            accessToken &&
            accessTokenExpiresAt &&
            Date.now() < accessTokenExpiresAt - TOKEN_EXPIRY_BUFFER_MS
        ) {
            return accessToken;
        }

        const idTokenRes = await auth.getIdToken();
        if (!idTokenRes.status) {
            throw new Error(idTokenRes.error);
        }
        const { accessToken: fresh, expiresIn } = await fetchMemfaultToken(
            idTokenRes.data,
        );
        dispatch(
            setAccessToken({
                accessToken: fresh,
                expiresAt: Date.now() + expiresIn * 1000,
            }),
        );
        return fresh;
    };

export const connectMemfault =
    (): AppThunk<RootState, Promise<void>> => async dispatch => {
        dispatch(setMemfaultLoading());
        try {
            const idTokenRes = await auth.getIdToken();
            if (!idTokenRes.status) {
                throw new Error(idTokenRes.error);
            }

            // 1. provisioning (/me) — precondition
            await provisionMyNordicAccount(idTokenRes.data);

            // 2. access token (/token)
            const accessToken = await dispatch(getValidAccessToken());

            // 3. orgs/projects from /api/v0
            const organizations = await fetchOrganizations(accessToken);
            if (organizations.length === 0) {
                throw new Error('No organizations found for this account');
            }
            const firstOrg = organizations[0];
            const projects = await fetchProjects(accessToken, firstOrg.slug);

            dispatch(
                setMemfaultSuccess({
                    organizations,
                    projects,
                    selectedOrgSlug: firstOrg.slug,
                    selectedProjectSlug: projects[0]?.slug,
                }),
            );
        } catch (e) {
            dispatch(setMemfaultError(describeError(e)));
        }
    };

export const selectOrganization =
    (orgSlug: string): AppThunk<RootState, Promise<void>> =>
    async dispatch => {
        dispatch(setSelectedOrgSlug(orgSlug));
        try {
            const accessToken = await dispatch(getValidAccessToken());
            const projects = await fetchProjects(accessToken, orgSlug);
            dispatch(
                setProjects({
                    projects,
                    selectedProjectSlug: projects[0]?.slug,
                }),
            );
        } catch (e) {
            dispatch(setMemfaultError(describeError(e)));
        }
    };
