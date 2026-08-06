/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { IssueBox, Spinner } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useAppDispatch, useAppSelector } from '../../../../app/store';
import { Back } from '../../../../common/Back';
import Main from '../../../../common/Main';
import { Next, Skip } from '../../../../common/Next';
import {
    getDeviceInfo,
    getMemfault,
    getRegistration,
    prevSubStep,
} from './cloudEvaluateSlice';
import { fetchDeviceInfo } from './deviceInfoEffects';
import { registerDevice } from './registrationEffects';

export default () => {
    const dispatch = useAppDispatch();
    const memfault = useAppSelector(getMemfault);
    const deviceInfo = useAppSelector(getDeviceInfo);
    const registration = useAppSelector(getRegistration);
    const [triedSn, setTriedSn] = useState(false);
    const [retriedChain, setRetriedChain] = useState(false);

    const hasAuth =
        !!memfault.accessToken &&
        !!memfault.selectedOrgSlug &&
        !!memfault.selectedProjectSlug;
    const hasSn = deviceInfo.status === 'success' && !!deviceInfo.serialNumber;

    // Authenticated, but no SN yet
    useEffect(() => {
        if (hasAuth && !hasSn && deviceInfo.status !== 'loading' && !triedSn) {
            setTriedSn(true);
            dispatch(fetchDeviceInfo());
        }
    }, [hasAuth, hasSn, deviceInfo.status, triedSn, dispatch]);

    // Authenticated and has SN, but not registered yet - start registration chain
    useEffect(() => {
        if (hasAuth && hasSn && registration.status === 'idle') {
            dispatch(registerDevice());
        }
    }, [hasAuth, hasSn, registration.status, dispatch]);

    const primaryAction = () => {
        if (!hasAuth) {
            return <Skip />;
        }
        if (!hasSn) {
            if (deviceInfo.status === 'error') {
                return (
                    <>
                        <Skip />
                        <Next
                            label="Retry"
                            onClick={() => dispatch(fetchDeviceInfo())}
                        />
                    </>
                );
            }
            return <Next disabled />;
        }
        if (registration.status === 'error') {
            return (
                <>
                    {retriedChain && <Skip />}
                    <Next
                        label="Retry"
                        onClick={() => {
                            setRetriedChain(true);
                            dispatch(registerDevice());
                        }}
                    />
                </>
            );
        }
        return <Next disabled={registration.status !== 'success'} />;
    };

    const issueBox = (title: string) => (
        <IssueBox
            mdiIcon="mdi-lightbulb-alert-outline"
            color="tw-text-red"
            title={title}
        />
    );

    return (
        <Main>
            <Main.Content heading="Register your device" fillHeight>
                <div className="tw-flex tw-flex-col tw-gap-5">
                    <div className="tw-flex tw-flex-col tw-gap-3">
                        {memfault.selectedOrgSlug &&
                            memfault.selectedProjectSlug && (
                                <div className="tw-flex tw-flex-row">
                                    <p className="tw-w-1/2">
                                        <b>Organization</b>
                                        <br />
                                        {memfault.selectedOrgSlug}
                                    </p>
                                    <p className="tw-w-1/2">
                                        <b>Project</b>
                                        <br />
                                        {memfault.selectedProjectSlug}
                                    </p>
                                </div>
                            )}

                        <div className="tw-flex tw-flex-col tw-gap-2">
                            <p>
                                You{' '}
                                {registration.status === 'success'
                                    ? 'connected'
                                    : 'are connecting'}{' '}
                                your device to the cloud to capture crashes,
                                push OTA updates, and debug remotely.
                            </p>
                            <ol className="tw-list-inside tw-list-disc">
                                <li>Over-the-air firmware updates</li>
                                <li>Remote crash analysis and debugging</li>
                                <li>
                                    Access to DevZone, technical documentation,
                                    and learning resources
                                </li>
                            </ol>
                        </div>
                    </div>

                    {registration.status === 'success' && (
                        <div className="tw-flex tw-flex-row tw-items-center tw-gap-2 tw-border tw-border-green-500 tw-bg-green-50 tw-px-4 tw-py-1 tw-text-green-500">
                            <span className="mdi mdi-cloud-check-variant-outline tw-text-2xl tw-leading-none" />
                            <span>
                                Your nRF54L15 DK is connected and configured.
                            </span>
                        </div>
                    )}

                    {hasAuth && hasSn && (
                        <div>
                            {registration.status === 'loading' && (
                                <div className="tw-flex tw-flex-row tw-items-center tw-gap-3">
                                    <Spinner size="sm" />
                                    <span className="tw-text-xs">
                                        Registering device online and
                                        configuring the project key…
                                    </span>
                                </div>
                            )}

                            {registration.status === 'error' &&
                                issueBox(
                                    registration.message ??
                                        'Failed to register your device. Please try again.',
                                )}
                        </div>
                    )}

                    {!hasAuth &&
                        issueBox(
                            'Failed to obtain project details. The device cannot be registered. Please try again.',
                        )}

                    {hasAuth &&
                        !hasSn &&
                        (deviceInfo.status === 'error' ? (
                            issueBox(
                                deviceInfo.message ??
                                    'Failed to obtain device information.',
                            )
                        ) : (
                            <div className="tw-flex tw-flex-row tw-items-center tw-gap-3">
                                <Spinner size="sm" />
                                <span className="tw-text-xs">
                                    Reading device information…
                                </span>
                            </div>
                        ))}
                </div>
            </Main.Content>
            <Main.Footer>
                <Back onClick={() => dispatch(prevSubStep())} />
                {primaryAction()}
            </Main.Footer>
        </Main>
    );
};
