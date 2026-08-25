/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
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
import Copy from '../../../common/Copy';
import Link from '../../../common/Link';
import Main from '../../../common/Main';
import { Next } from '../../../common/Next';
import runVerification from '../../../common/sendATCommands';
import {
    getSelectedDeviceUnsafely,
    selectedDeviceIsConnected,
} from '../../device/deviceSlice';
import {
    getDeviceUuid,
    getJwtFailed,
    getRegJwt,
    getTeamId,
    getUuidFailed,
    resetDeviceUuid,
    resetRegJwt,
    setDeviceUuid,
    setJwtFailed,
    setRegJwt,
    setTeamId,
    setUuidFailed,
} from './nrf93m1Slice';

const NRF_CLOUD_SETUP_LINK = 'https://start.nrfcloud.com/nRF93M1-DK';
const AT_COMMAND_REFERENCE_LINK =
    'https://www.nordicsemi.com/-/media/Software-and-other-downloads/Product-Briefs/nrf93m1_cellular_at_commands_v0.9.pdf';

/*
 * In modem bypass mode the nRF93M1 UART is routed to the USB CDC-ACM port,
 * which enumerates as VCOM1 on the nRF93M1 DK.
 */
const MODEM_VCOM_INDEX = 1;

const TruncatedValue = ({ value, width }: { value: string; width: string }) => (
    <p className="tw-flex tw-flex-row tw-items-center tw-gap-1">
        <b
            title={value}
            className={`tw-block ${width} tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap`}
        >
            {value}
        </b>
        <Copy copyText={value} />
    </p>
);

export default () => {
    const dispatch = useAppDispatch();
    const device = useAppSelector(getSelectedDeviceUnsafely);
    const deviceConnected = useAppSelector(selectedDeviceIsConnected);

    const uuid = useAppSelector(getDeviceUuid);
    const uuidFailed = useAppSelector(getUuidFailed);
    const teamId = useAppSelector(getTeamId);
    const regJwt = useAppSelector(getRegJwt);
    const jwtFailed = useAppSelector(getJwtFailed);

    const [gettingUuid, setGettingUuid] = useState(false);
    const [gettingJwt, setGettingJwt] = useState(false);

    const busy = gettingUuid || gettingJwt;

    const sendCommand = useCallback(
        (command: string, responseRegex: string) => {
            if (!deviceConnected) {
                return Promise.reject(new Error('No development kit connected.'));
            }

            const comName = device.serialPorts?.[MODEM_VCOM_INDEX]?.comName;

            if (!comName) {
                return Promise.reject(
                    new Error('Could not find the modem serial port.'),
                );
            }

            return runVerification(
                [{ command, responseRegex }],
                comName,
                'LINE',
            ).then(res => res[0]);
        },
        [device, deviceConnected],
    );

    const getUuid = useCallback(() => {
        dispatch(resetDeviceUuid());
        setGettingUuid(true);

        sendCommand('AT%DEVICEUUID', '%DEVICEUUID: (.*)')
            .then(res => {
                dispatch(setDeviceUuid(res));
            })
            .catch(e => {
                logger.error(describeError(e));
                dispatch(setUuidFailed('Failed to read the device UUID.'));
            })
            .finally(() => setGettingUuid(false));
    }, [dispatch, sendCommand]);

    const getRegistrationToken = useCallback(() => {
        const trimmedTeamId = teamId.trim();

        if (!trimmedTeamId) {
            return;
        }

        dispatch(resetRegJwt());
        setGettingJwt(true);

        sendCommand(`AT%REGJWT=${trimmedTeamId}`, '%REGJWT: (.*)')
            .then(res => {
                dispatch(setRegJwt(res));
                telemetry.sendEvent('Generated nRF Cloud registration token');
            })
            .catch(e => {
                logger.error(describeError(e));
                dispatch(
                    setJwtFailed(
                        'Failed to generate the registration token. Check that the team ID is correct and that the modem has attached to the network.',
                    ),
                );
            })
            .finally(() => setGettingJwt(false));
    }, [dispatch, sendCommand, teamId]);

    useEffect(() => {
        if (!uuid && !uuidFailed && !gettingUuid) {
            getUuid();
        }
    }, [uuid, uuidFailed, gettingUuid, getUuid]);

    return (
        <Main>
            <Main.Content
                heading="Connect to nRF Cloud"
                subHeading="Location, observability, device management, and modem firmware updates over AT commands."
            >
                <div className="tw-flex tw-flex-col tw-gap-4">
                    <p>
                        The nRF93M1 is its own nRF Cloud client. Adding it to
                        your account takes two values, and Quick Start reads
                        both of them from the modem for you.
                    </p>

                    <div>
                        <b>1. Device UUID</b>
                        <p className={gettingUuid ? 'ellipsis' : ''}>
                            {uuid && (
                                <TruncatedValue value={uuid} width="tw-w-72" />
                            )}
                            <b>{uuidFailed && 'ERROR'}</b>
                        </p>
                    </div>

                    <div>
                        <b>2. Team ID</b>
                        <p>
                            In nRF Cloud, open Fleet, then Devices, and select
                            Add New Devices, nRF93M1. The dialog shows your team
                            ID. Paste it below.
                        </p>
                        <div className="tw-flex tw-flex-row tw-items-center tw-gap-2 tw-pt-1">
                            <input
                                placeholder="Team ID"
                                type="text"
                                value={teamId}
                                onChange={event =>
                                    dispatch(setTeamId(event.target.value))
                                }
                                className="tw-h-8 tw-w-72 tw-border tw-border-solid tw-border-gray-300 tw-px-2 focus:tw-outline-0"
                            />
                            <Button
                                variant="primary"
                                size="lg"
                                disabled={busy || !teamId.trim()}
                                onClick={getRegistrationToken}
                            >
                                {regJwt ? 'Regenerate token' : 'Generate token'}
                            </Button>
                        </div>
                    </div>

                    <div>
                        <b>3. Registration token</b>
                        <p className={gettingJwt ? 'ellipsis' : ''}>
                            {regJwt && (
                                <TruncatedValue
                                    value={regJwt}
                                    width="tw-w-96"
                                />
                            )}
                            <b>{jwtFailed && 'ERROR'}</b>
                        </p>
                        <p>
                            Paste the device UUID and this token back into nRF
                            Cloud to finish claiming the kit. It appears under
                            Fleet, Devices within a few seconds.
                        </p>
                    </div>

                    <Button
                        variant="link-button"
                        size="xl"
                        onClick={() => {
                            telemetry.sendEvent('Opened evaluation link', {
                                link: NRF_CLOUD_SETUP_LINK,
                            });
                            openUrl(NRF_CLOUD_SETUP_LINK);
                        }}
                        className="tw-w-fit"
                    >
                        Set up your kit on nRF Cloud
                    </Button>

                    <div className="tw-text-xs">
                        <Link
                            label="nRF93M1 Command Reference Guide"
                            href={AT_COMMAND_REFERENCE_LINK}
                            color="tw-text-primary"
                        />
                    </div>

                    <AcademyExerciseLink />

                    {uuidFailed && (
                        <IssueBox
                            mdiIcon="mdi-lightbulb-alert-outline"
                            color="tw-text-red"
                            title={uuidFailed}
                        />
                    )}
                    {jwtFailed && (
                        <IssueBox
                            mdiIcon="mdi-lightbulb-alert-outline"
                            color="tw-text-red"
                            title={jwtFailed}
                        />
                    )}
                </div>
            </Main.Content>
            <Main.Footer>
                {busy && (
                    <div className="tw-flex tw-flex-row tw-items-center tw-pr-4 tw-text-primary">
                        <Spinner size="lg" />
                    </div>
                )}
                <Back disabled={busy} />
                {!regJwt && <Next label="Skip" variant="link-button" />}
                {uuidFailed && !uuid ? (
                    <Next label="Retry" disabled={busy} onClick={getUuid} />
                ) : (
                    <Next disabled={busy} />
                )}
            </Main.Footer>
        </Main>
    );
};
