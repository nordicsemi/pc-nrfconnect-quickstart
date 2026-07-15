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
import { fetchServerTime, pollCrashReport } from './api';
import {
    getCrashReport,
    getCrashReportBaseLine,
    getDeviceInfo,
    nextSubStep,
    prevSubStep,
    setCrashReport,
    setCrashReportBaseLine,
} from './cloudEvaluateSlice';
import { fetchDeviceInfo } from './deviceInfoEffects';

export default () => {
    const dispatch = useAppDispatch();
    const deviceInfo = useAppSelector(getDeviceInfo);
    const crashReportBaseLine = useAppSelector(getCrashReportBaseLine);
    const crashReport = useAppSelector(getCrashReport);
    const [error, setError] = useState<string>();

    const serialNumber =
        deviceInfo.status === 'success' ? deviceInfo.serialNumber : undefined;

    useEffect(() => {
        if (crashReportBaseLine !== undefined || !serialNumber || error) {
            return undefined;
        }
        const controller = new AbortController();
        fetchServerTime(serialNumber, controller.signal)
            .then(t => dispatch(setCrashReportBaseLine(t)))
            .catch(e => {
                if ((e as Error).name !== 'AbortError') {
                    setError(describeError(e));
                }
            });
        return () => controller.abort();
    }, [dispatch, serialNumber, crashReportBaseLine, error]);

    useEffect(() => {
        if (
            crashReportBaseLine === undefined ||
            !serialNumber ||
            crashReport ||
            error
        ) {
            return undefined;
        }
        const controller = new AbortController();
        pollCrashReport(serialNumber, controller.signal, crashReportBaseLine)
            .then(crash => dispatch(setCrashReport(crash)))
            .catch(e => {
                if ((e as Error).name !== 'AbortError') {
                    setError(describeError(e));
                }
            });
        return () => controller.abort();
    }, [dispatch, serialNumber, crashReportBaseLine, crashReport, error]);

    const waitingForCrash =
        deviceInfo.status === 'success' && !crashReport && !error;

    return (
        <Main>
            <Main.Content heading="Remote connection" subHeading="Test crash">
                <div className="tw-flex tw-flex-col tw-gap-4">
                    <div className="tw-flex tw-flex-col tw-gap-1">
                        <span className="tw-text-base">
                            Trigger a test crash by pressing <b>button 1</b>.
                        </span>
                        <span>
                            Your device will fault, reboot, and send the crash
                            report to cloud over BLE.
                        </span>
                    </div>
                    {deviceInfo.status === 'fetching' && (
                        <div className="tw-flex tw-flex-row tw-items-center tw-gap-3">
                            <Spinner size="sm" />
                            <span>Reading device information…</span>
                        </div>
                    )}
                    {waitingForCrash && (
                        <div className="tw-flex tw-flex-row tw-items-center tw-gap-3">
                            <Spinner size="sm" />
                            <span>
                                Waiting for a crash report from the device. It
                                may take a few moments…
                            </span>
                        </div>
                    )}
                    {deviceInfo.status === 'error' && (
                        <IssueBox
                            mdiIcon="tw-mdi-alert"
                            color="tw-text-red"
                            title={
                                deviceInfo.message ??
                                'Failed to read device information'
                            }
                        />
                    )}
                    {error && (
                        <IssueBox
                            mdiIcon="tw-mdi-alert"
                            color="tw-text-red"
                            title={error}
                        />
                    )}
                    {crashReport && (
                        <div className="tw-flex tw-flex-col tw-gap-2">
                            <div className="tw-text-green-500">
                                Your crash reached the cloud.
                            </div>
                            <div className="tw-flex tw-flex-col tw-border tw-border-gray-200">
                                <div className="tw-border-b tw-border-gray-200 tw-bg-gray-50 tw-p-2">
                                    <b>{crashReport.reason}</b> —{' '}
                                    {crashReport.title}
                                </div>
                                <div className="tw-p-2 tw-ps-5">
                                    <ul className="tw-flex tw-flex-col tw-gap-1 tw-text-sm">
                                        {crashReport.frames.map(f => (
                                            <li key={f.index}>
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
                {(error || deviceInfo.status === 'error') && (
                    <Skip
                        label="Skip"
                        onClick={() => dispatch(nextSubStep())}
                    />
                )}

                {deviceInfo.status === 'error' ? (
                    <Next
                        label="Retry"
                        onClick={() => dispatch(fetchDeviceInfo())}
                    />
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
