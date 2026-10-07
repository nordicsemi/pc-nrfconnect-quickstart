/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef, useState } from 'react';
import { IssueBox, Spinner } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useAppDispatch, useAppSelector } from '../../../../app/store';
import { Back } from '../../../../common/Back';
import Link from '../../../../common/Link';
import Main from '../../../../common/Main';
import { Next, Skip } from '../../../../common/Next';
import {
    getDeviceInfo,
    getMemfault,
    getRegistration,
    prevSubStep,
    type RegistrationStage,
} from './cloudEvaluateSlice';
import { fetchDeviceInfo } from './deviceInfoEffects';
import { registerDevice } from './registrationEffects';

const registrationStages: Array<{
    id: RegistrationStage;
    label: string;
}> = [
    { id: 'assign-project-key', label: 'Assign project key to the device' },
    { id: 'reset-device', label: 'Reset device' },
    { id: 'register-device', label: 'Register device online' },
];

const RegistrationStageIcon = ({
    active,
    complete,
}: {
    active: boolean;
    complete: boolean;
}) => {
    if (complete) {
        return <span className="mdi mdi-check-circle tw-text-green-500" />;
    }
    if (active) {
        return <Spinner size="sm" />;
    }
    return <span className="mdi mdi-circle-outline tw-text-gray-400" />;
};

export default ({ vComIndex }: { vComIndex: number }) => {
    const dispatch = useAppDispatch();
    const memfault = useAppSelector(getMemfault);
    const deviceInfo = useAppSelector(getDeviceInfo);
    const registration = useAppSelector(getRegistration);
    const [triedSn, setTriedSn] = useState(false);
    const [retriedChain, setRetriedChain] = useState(false);
    const successMessageRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (registration.status === 'success') {
            successMessageRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [registration.status]);

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
        return undefined;
    })();

    const activeStageIndex = registrationStages.findIndex(
        ({ id }) => id === registration.stage,
    );

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

                    {(registration.status === 'loading' ||
                        registration.status === 'success') && (
                        <ol className="tw-flex tw-flex-col tw-gap-2">
                            {registrationStages.map((stage, index) => {
                                const complete =
                                    registration.status === 'success' ||
                                    index < activeStageIndex;
                                const active =
                                    registration.status === 'loading' &&
                                    index === activeStageIndex;

                                return (
                                    <li
                                        className="tw-flex tw-items-center tw-gap-2"
                                        key={stage.id}
                                    >
                                        <RegistrationStageIcon
                                            active={active}
                                            complete={complete}
                                        />
                                        <span
                                            className={
                                                active
                                                    ? 'tw-font-medium'
                                                    : undefined
                                            }
                                        >
                                            {stage.label}
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                    )}

                    {registration.status === 'success' && (
                        <div
                            ref={successMessageRef}
                            className="tw-flex tw-flex-col tw-gap-2 tw-border tw-border-green-500 tw-bg-green-50 tw-px-4 tw-py-2 tw-text-green-700"
                        >
                            <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                                <span className="mdi mdi-cloud-check-variant-outline tw-text-2xl tw-leading-none" />
                                <span>
                                    Your nRF54L15 DK is registered and
                                    configured.
                                </span>
                            </div>
                            <p className="tw-text-xs">
                                The device has been reset. Reconnect to
                                the nRF Toolbox mobile app to see device events and
                                data in{' '}
                                <Link
                                    label="nRF Cloud"
                                    href="https://app.memfault.com"
                                    color="tw-text-primary"
                                />
                            </p>
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
