/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { inMain as auth } from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/auth';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';

import { type AppThunk, type RootState } from '../../../../app/store';
import { exchangeToken, fetchOrganizations, fetchProjects } from './api';
import {
    getMemfault,
    setMemfaultError,
    setMemfaultLoading,
    setMemfaultSuccess,
    setProjects,
    setSelectedOrgSlug,
} from './cloudEvaluateSlice';

export const connectMemfault =
    (): AppThunk<RootState, Promise<void>> => async dispatch => {
        dispatch(setMemfaultLoading());
        try {
            console.log('Starting authentication with Memfault...');
            const tokenRes = await auth.getAccessToken();
            console.log('Access token received from auth:', tokenRes);
            if (!tokenRes.status) {
                throw new Error(tokenRes.error);
            }
            const memfaultToken = await exchangeToken(tokenRes.data);
            const organizations = await fetchOrganizations(memfaultToken);
            if (organizations.length === 0) {
                throw new Error('No organizations found for this account');
            }
            const firstOrg = organizations[0];
            const projects = await fetchProjects(memfaultToken, firstOrg.slug);

            dispatch(
                setMemfaultSuccess({
                    accessToken: memfaultToken,
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
    async (dispatch, getState) => {
        dispatch(setSelectedOrgSlug(orgSlug));
        const { accessToken } = getMemfault(getState());
        if (!accessToken) {
            return;
        }
        try {
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
