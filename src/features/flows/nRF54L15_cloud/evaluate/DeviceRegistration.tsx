/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useCallback, useEffect } from 'react';
import { IssueBox, Spinner } from '@nordicsemiconductor/pc-nrfconnect-shared';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';

import { useAppDispatch, useAppSelector } from '../../../../app/store';
import { Back } from '../../../../common/Back';
import Main from '../../../../common/Main';
import { Next } from '../../../../common/Next';
import { getSelectedDeviceUnsafely } from '../../../device/deviceSlice';
import {
    getRegistration,
    prevSubStep,
    setRegistration,
} from './cloudEvaluateSlice';

export default () => {
    const dispatch = useAppDispatch();
    const device = useAppSelector(getSelectedDeviceUnsafely);
    const registration = useAppSelector(getRegistration);

    return (
        <Main>
            <Main.Content heading="Register your device" subHeading="">
                <div className="tw-flex tw-flex-col tw-gap-4">
                    {registration.status === 'pending' && (
                        <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                            <Spinner size="lg" />
                            <span>Registering device…</span>
                        </div>
                    )}
                    {registration.status === 'success' && (
                        <IssueBox
                            mdiIcon="tw-mdi-check-circle"
                            color="tw-text-green"
                            title="Device registered successfully"
                        />
                    )}
                    {registration.status === 'error' && (
                        <IssueBox
                            mdiIcon="tw-mdi-alert"
                            color="tw-text-red"
                            title={
                                registration.message ?? 'Registration failed'
                            }
                        />
                    )}
                </div>
            </Main.Content>
            <Main.Footer>
                <Back onClick={() => dispatch(prevSubStep())} />
                {registration.status === 'error' ? (
                    <Next
                        label="Retry"
                        onClick={() =>
                            dispatch(setRegistration({ status: 'idle' }))
                        }
                    />
                ) : (
                    <Next disabled={false} />
                )}
            </Main.Footer>
        </Main>
    );
};
