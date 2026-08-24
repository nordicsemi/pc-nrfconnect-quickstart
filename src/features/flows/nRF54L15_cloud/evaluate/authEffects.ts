/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { inMain as auth } from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/auth';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';

import { type AppThunk } from '../../../../app/store';
import {
    fetchMemfaultToken,
    fetchOrganizations,
    fetchProjects,
    HttpError,
    provisionMyNordicAccount,
} from './api';
import {
    getMemfault,
    setAccessToken,
    setMemfaultError,
    setMemfaultLoading,
    setMemfaultSuccess,
    setProjects,
} from './cloudEvaluateSlice';
import { reportEvaluateError } from './reportError';

// Fetches a new Memfault access token. A failure here (incl. 401) is surfaced
// as an error — it does NOT end the users session. The session depends solely
// on the myNordic/Entra tokens (auth.getIdToken / the shared auth state).
const refreshMemfaultToken =
    (): AppThunk<Promise<string>> => async dispatch => {
        const idTokenRes = await auth.getIdToken();
        if (!idTokenRes.status) {
            throw new Error(idTokenRes.error);
        }
        const { accessToken } = await fetchMemfaultToken(idTokenRes.data);
        dispatch(setAccessToken(accessToken));
        return accessToken;
    };

// Runs a request with the stored access token; on 401 refreshes and retries once.
export const withMemfaultToken =
    <T>(request: (accessToken: string) => Promise<T>): AppThunk<Promise<T>> =>
    async (dispatch, getState) => {
        let token = getMemfault(getState()).accessToken;
        if (!token) {
            token = await dispatch(refreshMemfaultToken());
        }
        try {
            return await request(token);
        } catch (e) {
            if (e instanceof HttpError && e.status === 401) {
                const fresh = await dispatch(refreshMemfaultToken());
                return request(fresh);
            }
            throw e;
        }
    };

export const connectMemfault =
    (): AppThunk<Promise<void>> => async dispatch => {
        dispatch(setMemfaultLoading());
        try {
            const idTokenRes = await auth.getIdToken();
            if (!idTokenRes.status) {
                throw new Error(idTokenRes.error);
            }
            await provisionMyNordicAccount(idTokenRes.data);

            const organizations = await dispatch(
                withMemfaultToken(t => fetchOrganizations(t)),
            );
            if (organizations.length === 0) {
                throw new Error('No organizations found for this account');
            }
            const projects = await dispatch(
                withMemfaultToken(t => fetchProjects(t, organizations[0].slug)),
            );
            dispatch(setMemfaultSuccess({ organizations, projects }));
        } catch (e) {
            reportEvaluateError('Authenticate', e, 'connect');
            dispatch(setMemfaultError(describeError(e)));
        }
    };

export const fetchProjectsForOrg =
    (orgSlug: string): AppThunk<Promise<void>> =>
    async dispatch => {
        try {
            const projects = await dispatch(
                withMemfaultToken(t => fetchProjects(t, orgSlug)),
            );
            dispatch(setProjects({ projects }));
        } catch (e) {
            reportEvaluateError('Authenticate', e, 'select-org');
            dispatch(setMemfaultError(describeError(e)));
        }
    };
