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

export default ({ vComIndex }: { vComIndex: number }) => {
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
            dispatch(fetchDeviceInfo(vComIndex));
        }
    }, [hasAuth, hasSn, deviceInfo.status, triedSn, vComIndex, dispatch]);

    // Authenticated and has SN, but not registered yet - start registration chain
    useEffect(() => {
        if (hasAuth && hasSn && registration.status === 'idle') {
            dispatch(registerDevice(vComIndex));
        }
    }, [hasAuth, hasSn, registration.status, vComIndex, dispatch]);

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
                            onClick={() => dispatch(fetchDeviceInfo(vComIndex))}
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
                            dispatch(registerDevice(vComIndex));
                        }}
                    />
                </>
            );
        }
        return <Next disabled={registration.status !== 'success'} />;
    };

    const loadingMessage = (() => {
        if (hasAuth && !hasSn && deviceInfo.status !== 'error') {
            return 'Reading device information…';
        }
        if (hasAuth && hasSn && registration.status === 'loading') {
            return 'Registering device online and configuring the project key…';
        }
        return undefined;
    })();

    const errorMessage = (() => {
        if (!hasAuth) {
            return 'Error: Failed to obtain project details. The device cannot be registered. Please try again.';
        }
        if (!hasSn) {
            return deviceInfo.status === 'error'
                ? (deviceInfo.message ??
                      'Error: Failed to obtain device information.')
                : undefined; // still loading device info, no error
        }
        if (registration.status === 'error') {
            return (
                registration.message ??
                'Error: Failed to register your device. Please try again.'
            );
        }
        return undefined;
    })();

    return (
        <Main>
            <Main.Content heading="Register your device" fillHeight>
                <div className="tw-flex tw-flex-col tw-gap-5">
                    <div className="tw-flex tw-flex-col tw-gap-3">
                        {hasAuth && (
                            <div className="tw-flex tw-flex-row">
                                <p className="tw-w-1/2">
                                    <b>Organization</b>
                                    <br />
                                    {memfault.selectedOrgSlug ?? 'Unknown'}
                                </p>
                                <p className="tw-w-1/2">
                                    <b>Project</b>
                                    <br />
                                    {memfault.selectedProjectSlug ?? 'Unknown'}
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

                    {loadingMessage && (
                        <div className="tw-flex tw-flex-row tw-items-center tw-gap-3">
                            <Spinner size="sm" />
                            <span className="tw-text-xs">{loadingMessage}</span>
                        </div>
                    )}

                    {errorMessage && (
                        <IssueBox
                            mdiIcon="mdi-lightbulb-alert-outline"
                            color="tw-text-red"
                            title={errorMessage}
                        />
                    )}
                </div>
            </Main.Content>
            <Main.Footer>
                <Back onClick={() => dispatch(prevSubStep())} />
                {primaryAction()}
            </Main.Footer>
        </Main>
    );
};
