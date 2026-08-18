/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { IssueBox, Spinner } from '@nordicsemiconductor/pc-nrfconnect-shared';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';

import { useAppDispatch, useAppSelector } from '../../../../app/store';
import { Back } from '../../../../common/Back';
import Main from '../../../../common/Main';
import { Next, Skip } from '../../../../common/Next';
import { pollCrashReport } from './api';
import {
    getCrashBaseline,
    getCrashReport,
    getDeviceInfo,
    nextSubStep,
    prevSubStep,
    setCrashReport,
} from './cloudEvaluateSlice';
import { fetchCrashReportBaseline } from './crashBaselineEffects';
import { fetchDeviceInfo } from './deviceInfoEffects';
import { reportEvaluateError } from './reportError';

export default ({ vComIndex }: { vComIndex: number }) => {
    const dispatch = useAppDispatch();
    const deviceInfo = useAppSelector(getDeviceInfo);
    const crashBaseline = useAppSelector(getCrashBaseline);
    const crashReport = useAppSelector(getCrashReport);
    const [error, setError] = useState<string>();

    const serialNumber =
        deviceInfo.status === 'success' ? deviceInfo.serialNumber : undefined;

    // Only once the baseline is known can a crash report be recognised as the
    // one the user is about to trigger, so nothing is asked of them until then.
    const baselineReady = crashBaseline.status === 'success';
    const baselineDate = crashBaseline.capturedDate ?? null;

    useEffect(() => {
        if (!serialNumber || !baselineReady || crashReport || error) {
            return undefined;
        }

        const controller = new AbortController();
        pollCrashReport(serialNumber, controller.signal, baselineDate)
            .then(crash => dispatch(setCrashReport(crash)))
            .catch(e => {
                if ((e as Error).name === 'AbortError') {
                    return;
                }
                reportEvaluateError('Test crash', e, 'poll-crash');
                setError(describeError(e));
            });

        return () => controller.abort();
    }, [
        dispatch,
        serialNumber,
        baselineReady,
        baselineDate,
        crashReport,
        error,
    ]);

    const preparing =
        deviceInfo.status === 'loading' ||
        (deviceInfo.status === 'success' &&
            (crashBaseline.status === 'idle' ||
                crashBaseline.status === 'loading'));

    const waitingForCrash = baselineReady && !crashReport && !error;

    const retry = () => {
        if (deviceInfo.status === 'error') {
            dispatch(fetchDeviceInfo(vComIndex));
        } else {
            dispatch(fetchCrashReportBaseline());
        }
    };

    return (
        <Main>
            <Main.Content
                heading="Remote connection"
                subHeading="Trigger a test crash"
                fillHeight
            >
                <div className="tw-flex tw-flex-col tw-gap-4">
                    {baselineReady && (
                        <div className="tw-flex tw-flex-col tw-gap-1">
                            <span>
                                Trigger a test crash by pressing <b>Button 1</b>
                                .
                            </span>
                            <span>
                                Your device will fault, reboot, and disconnect
                                from the app. You need to reconnect the device
                                to the app, which will send the crash report to
                                the cloud over Bluetooth LE.
                            </span>
                        </div>
                    )}

                    {preparing && (
                        <div className="tw-flex tw-flex-row tw-items-center tw-gap-3">
                            <Spinner size="sm" />
                            <span className="tw-text-xs">
                                Preparing the crash report check…
                            </span>
                        </div>
                    )}

                    {waitingForCrash && (
                        <div className="tw-flex tw-flex-row tw-items-center tw-gap-3">
                            <Spinner size="sm" />
                            <span className="tw-text-xs">
                                Waiting for a crash report from the device. It
                                may take a few moments…
                            </span>
                        </div>
                    )}

                    {deviceInfo.status === 'error' && (
                        <IssueBox
                            mdiIcon="mdi-lightbulb-alert-outline"
                            color="tw-text-red"
                            title={
                                deviceInfo.message ??
                                'Failed to read device information'
                            }
                        />
                    )}

                    {crashBaseline.status === 'error' && (
                        <IssueBox
                            mdiIcon="mdi-lightbulb-alert-outline"
                            color="tw-text-red"
                            title={
                                crashBaseline.message ??
                                'Failed to reach the cloud. Retry before triggering a crash.'
                            }
                        />
                    )}

                    {error && (
                        <IssueBox
                            mdiIcon="mdi-lightbulb-alert-outline"
                            color="tw-text-red"
                            title={error}
                        />
                    )}

                    {crashReport && (
                        <div className="tw-flex tw-flex-col tw-gap-2">
                            <div className="tw-text-green-500">
                                Information about your crash reached the cloud.
                            </div>
                            <div className="tw-flex tw-flex-col tw-border tw-border-gray-200">
                                <div className="tw-border-b tw-border-gray-200 tw-bg-gray-50 tw-p-2">
                                    <b>{crashReport.reason}</b> —{' '}
                                    {crashReport.title}
                                </div>
                                <div className="tw-p-2 tw-ps-5">
                                    <ul className="tw-flex tw-flex-col tw-gap-1 tw-text-sm">
                                        {crashReport.frames.map(f => (
                                            <li
                                                key={f.index}
                                                className="tw-text-xs"
                                            >
                                                #{f.index}&emsp;{f.function} (
                                                {f.file}:{f.lineno})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="tw-border-t tw-border-gray-200 tw-p-2 tw-text-xs tw-text-gray-500">
                                    Captured at:{' '}
                                    {new Date(
                                        crashReport.capturedDate,
                                    ).toLocaleString('en-US')}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Main.Content>
            <Main.Footer>
                <Back onClick={() => dispatch(prevSubStep())} />
                {(error ||
                    deviceInfo.status === 'error' ||
                    crashBaseline.status === 'error') && (
                    <Skip
                        label="Skip"
                        onClick={() => dispatch(nextSubStep())}
                    />
                )}

                {deviceInfo.status === 'error' ||
                crashBaseline.status === 'error' ? (
                    <Next label="Retry" onClick={retry} />
                ) : (
                    <Next
                        disabled={!crashReport || !!error}
                        onClick={() => dispatch(nextSubStep())}
                    />
                )}
            </Main.Footer>
        </Main>
    );
};
