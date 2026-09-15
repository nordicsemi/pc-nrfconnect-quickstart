/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useState } from 'react';
import {
    Button,
    logger,
    openUrl,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import { Back } from '../../../common/Back';
import Copy from '../../../common/Copy';
import Main from '../../../common/Main';
import { Next, Skip } from '../../../common/Next';
import runVerification from '../../../common/sendATCommands';
import {
    getSelectedDeviceUnsafely,
    selectedDeviceIsConnected,
} from '../../device/deviceSlice';
import {
    getDeviceUUID,
    getFailed,
    getRegistrationToken,
    getTeamID,
    setFailed,
    setResponses,
    setTeamID,
} from './nrf93m1Slice';

const NRF_CLOUD_SETUP_LINK = 'https://start.nrfcloud.com/nRF93M1-DK';

/*
 * In modem bypass mode the nRF93M1 UART is routed to the USB CDC-ACM port,
 * which enumerates as VCOM1 on the nRF93M1 DK.
 */
const MODEM_VCOM_INDEX = 1;

const TruncatedValue = ({
    field,
    value,
    busy,
    failed,
}: {
    field: string;
    value?: string;
    busy: boolean;
    failed: boolean;
}) => (
    <div key={field} className="tw-flex tw-flex-row tw-items-center tw-gap-1">
        <i>{field}: </i>
        {busy && <p className="ellipsis" />}
        {!!value && !busy && !failed && (
            <>
                <b
                    title={value}
                    className="tw-block tw-w-60 tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap"
                >
                    {value}
                </b>
                <Copy copyText={value} />
            </>
        )}
        {failed && <b>ERROR</b>}
    </div>
);

export default () => {
    const dispatch = useAppDispatch();
    const device = useAppSelector(getSelectedDeviceUnsafely);
    const deviceConnected = useAppSelector(selectedDeviceIsConnected);
    const teamID = useAppSelector(getTeamID);
    const registrationToken = useAppSelector(getRegistrationToken);
    const uuid = useAppSelector(getDeviceUUID);
    const failed = useAppSelector(getFailed);

    const [busy, setBusy] = useState(false);

    const getValues = useCallback(() => {
        if (!deviceConnected) {
            dispatch(setFailed('No development kit connected.'));
            return;
        }

        const path = device.serialPorts?.[MODEM_VCOM_INDEX]?.comName;
        if (!path) {
            logger.error(
                `Serialport not found. Tried to find vComIndex ${MODEM_VCOM_INDEX}, device serialports: ${device.serialPorts}`,
            );
            dispatch(setFailed('Failed to communicate with the device.'));
            return;
        }

        setBusy(true);
        dispatch(setFailed());

        runVerification(
            [
                {
                    // @ts-expect-error teamID can never be undefined here
                    command: `AT%REGJWT="${teamID.trim()}"`,
                    responseRegex: '%REGJWT: (.*)',
                },
                {
                    command: 'AT%DEVICEUUID',
                    responseRegex: '%DEVICEUUID: (.*)',
                },
            ],
            path,
            'LINE',
        )
            .then(res => {
                dispatch(setResponses(res));
            })
            .catch(e => {
                logger.error(e);
                telemetry.sendEvent(
                    'Generated the nRF Cloud registration token',
                );
                dispatch(
                    setFailed(
                        'Failed to communicate with the device. Check that the team ID is correct and that the modem has connected to the network.',
                    ),
                );
            })
            .finally(() => {
                setBusy(false);
            });
    }, [device, deviceConnected, dispatch, teamID]);

    return (
        <Main>
            <Main.Content heading="Connect to nRF Cloud">
                <div>
                    Follow the steps below to add nRF93M1 to your nRF Cloud
                    account.
                    <ol className="tw-mt-2 tw-flex tw-list-inside tw-list-decimal tw-flex-col tw-gap-2 tw-pl-2">
                        <li>
                            In nRF Cloud, go to Fleet &gt; Devices &gt; Add New
                            Devices &gt; nRF93M1. Team ID is displayed on the
                            page.
                        </li>
                        <li>
                            Copy the Team ID from nRF Cloud, paste it below and
                            generate the token.
                            <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                                <input
                                    placeholder="Team ID"
                                    type="text"
                                    value={teamID}
                                    onChange={event =>
                                        dispatch(setTeamID(event.target.value))
                                    }
                                    className="tw-h-8 tw-w-72 tw-border tw-border-solid tw-border-gray-300 tw-px-2 focus:tw-outline-0"
                                />
                                <Button
                                    variant="primary"
                                    size="lg"
                                    disabled={busy || !teamID?.trim()}
                                    onClick={getValues}
                                >
                                    Generate token
                                </Button>
                            </div>
                        </li>
                        <li>
                            Copy the following tokens:
                            <TruncatedValue
                                field="Device UUID"
                                value={uuid}
                                busy={busy}
                                failed={!!failed}
                            />
                            <TruncatedValue
                                field="Registration Token"
                                value={registrationToken}
                                busy={busy}
                                failed={!!failed}
                            />
                        </li>
                        <li>
                            Paste the tokens in nRF Cloud to finish claiming
                            your kit. The kit is added under Fleet &gt; Devices.
                            <br />
                            <Button
                                variant="link-button"
                                size="xl"
                                onClick={() => {
                                    telemetry.sendEvent('Visiting link', {
                                        NRF_CLOUD_SETUP_LINK,
                                    });
                                    openUrl(NRF_CLOUD_SETUP_LINK);
                                }}
                                className="tw-w-fit"
                            >
                                Set up your kit on nRF Cloud
                            </Button>
                        </li>
                    </ol>
                </div>
            </Main.Content>
            <Main.Footer>
                <Back disabled={busy} />
                {failed && <Skip />}
                <Next disabled={!!failed || busy} />
            </Main.Footer>
        </Main>
    );
};
