/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
    Button,
    IssueBox,
    logger,
    openUrl,
    Spinner,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import { AcademyExerciseLink } from '../../../common/AcademyExerciseLink';
import { Back } from '../../../common/Back';
import { PROVISIONING_LINK } from '../../../common/constants';
import Copy from '../../../common/Copy';
import Main from '../../../common/Main';
import { Next } from '../../../common/Next';
import runVerification from '../../../common/sendATCommands';
import {
    getSelectedDeviceUnsafely,
    selectedDeviceIsConnected,
} from '../../device/deviceSlice';
import {
    getAttestationToken,
    getFailed,
    reset,
    setAttestationToken,
    setFailed,
} from './thingy91xSlice';

export default () => {
    const dispatch = useAppDispatch();
    const device = useAppSelector(getSelectedDeviceUnsafely);
    const token = useAppSelector(getAttestationToken);
    const failed = useAppSelector(getFailed);
    const [gettingToken, setGettingToken] = useState(false);
    const deviceConnected = useAppSelector(selectedDeviceIsConnected);

    const getToken = useCallback(() => {
        dispatch(reset());
        setGettingToken(true);

        if (!deviceConnected) {
            dispatch(setFailed('No development kit connected.'));
            setGettingToken(false);
            return;
        }

        runVerification(
            [
                {
                    command: 'AT%ATTESTTOKEN',
                    responseRegex: '%ATTESTTOKEN: "(.*)"',
                },
            ],
            device.serialPorts?.[0].comName || '',
            'SHELL',
        )
            .then(res => {
                dispatch(setAttestationToken(res[0]));
            })
            .catch(e => {
                logger.error(describeError(e));
                dispatch(setFailed('Failed to get attestation token.'));
            })
            .finally(() => setGettingToken(false));
    }, [device, dispatch, deviceConnected]);

    useEffect(() => {
        if (!token && !failed && !gettingToken) {
            getToken();
        }
    }, [token, failed, gettingToken, getToken]);

    return (
        <Main>
            <Main.Content
                heading="Evaluate Asset Tracker sample"
                subHeading="Onboarding, data collection, FOTA updates, location, logging, alerts, and more."
            >
                <div className="tw-flex tw-flex-col tw-gap-4">
                    <div>
                        <b>Claim your device</b>
                        <p>
                            To evaluate all features, you need to connect your
                            DK to nRF Cloud. Before proceeding with the
                            instructions, copy the attestation token below and
                            store it securely.
                        </p>
                    </div>
                    <div className="tw-flex tw-flex-row tw-gap-1">
                        <p className={gettingToken ? 'ellipsis' : ''}>
                            {token && (
                                <p className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                                    <b
                                        title={token}
                                        className="tw-block tw-w-60 tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap"
                                    >
                                        {token}
                                    </b>
                                    <Copy copyText={token} />
                                </p>
                            )}
                            <b>{failed && 'ERROR'}</b>
                        </p>
                    </div>

                    <Button
                        variant="link-button"
                        size="xl"
                        onClick={() => {
                            telemetry.sendEvent('Opened evaluation link', {
                                link: PROVISIONING_LINK,
                            });
                            openUrl(PROVISIONING_LINK);
                        }}
                        className="tw-w-fit"
                    >
                        Open instructions about how to claim your device
                    </Button>

                    <AcademyExerciseLink />

                    {failed && (
                        <IssueBox
                            mdiIcon="mdi-lightbulb-alert-outline"
                            color="tw-text-red"
                            title={failed}
                        />
                    )}
                </div>
            </Main.Content>
            <Main.Footer>
                {gettingToken && (
                    <div className="tw-flex tw-flex-row tw-items-center tw-pr-4 tw-text-primary">
                        <Spinner size="lg" />
                    </div>
                )}
                <Back disabled={gettingToken} />
                {!token && <Next label="Skip" variant="link-button" />}
                {failed ? (
                    <Next
                        label="Retry"
                        disabled={gettingToken}
                        onClick={getToken}
                    />
                ) : (
                    <Next disabled={gettingToken} />
                )}
            </Main.Footer>
        </Main>
    );
};
