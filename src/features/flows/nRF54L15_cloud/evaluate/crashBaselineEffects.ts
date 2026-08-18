/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';

import { type AppThunk, type RootState } from '../../../../app/store';
import { fetchCrashBaseline } from './api';
import {
    getCrashBaseline,
    getDeviceInfo,
    setCrashBaseline,
    setCrashBaselineError,
    setCrashBaselineFetching,
} from './cloudEvaluateSlice';
import { reportEvaluateError } from './reportError';

// Records which crash is already in the cloud, so the one the user triggers on
// the test crash step can be told apart from it. Dispatched as soon as the
// device serial number is known — several sub-steps before the user is asked to
// press Button 1 — because a crash arriving before this resolves would be taken
// for the pre-existing one and then ignored.
export const fetchCrashReportBaseline =
    (): AppThunk<RootState, Promise<void>> => async (dispatch, getState) => {
        const state = getState();
        const deviceInfo = getDeviceInfo(state);

        if (deviceInfo.status !== 'success' || !deviceInfo.serialNumber) {
            return;
        }
        if (getCrashBaseline(state).status === 'loading') {
            return;
        }

        dispatch(setCrashBaselineFetching());
        try {
            dispatch(
                setCrashBaseline(
                    await fetchCrashBaseline(deviceInfo.serialNumber),
                ),
            );
        } catch (e) {
            reportEvaluateError('Test crash', e, 'crash-baseline');
            dispatch(setCrashBaselineError(describeError(e)));
        }
    };
