/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useState } from 'react';
import { IssueBox, logger } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
    getChoiceUnsafely,
    getSelectedDeviceUnsafely,
    selectedDeviceIsConnected,
} from '../../../features/device/deviceSlice';
import { Back } from '../../Back';
import Copy from '../../Copy';
import Main from '../../Main';
import { Next, Skip } from '../../Next';
import runVerification from '../../sendATCommands';
import {
    getFailed,
    getResponses,
    getShowSkip,
    setFailed,
    setResponses,
} from './verificationSlice';

export interface Command {
    title: string;
    command: string;
    responseRegex: string;
    copiable?: boolean;
}

const VerifyStep = ({
    path,
    mode,
    commands,
}: {
    path: string;
    mode: 'LINE' | 'SHELL';
    commands: Command[];
}) => {
    const dispatch = useAppDispatch();
    const responses = useAppSelector(getResponses);
    const failed = useAppSelector(getFailed);
    const showSkip = useAppSelector(getShowSkip);
    const [verifying, setVerifying] = useState(false);
    const deviceConnected = useAppSelector(selectedDeviceIsConnected);

    const gotAllResponses = responses.length === commands.length;

    const getHeading = () => {
        if (failed) {
            return 'Verification failed';
        }
        if (gotAllResponses) {
            return 'Verification successful';
        }
        return 'Verifying';
    };

    const verify = useCallback(() => {
        if (!deviceConnected) {
            dispatch(setFailed('No development kit connected.'));
            setVerifying(false);
            return;
        }

        runVerification(commands, path, mode)
            .then(res => {
                dispatch(setResponses(res));
            })
            .catch(e => {
                logger.error(e);
                dispatch(setFailed('Failed to verify device.'));
            })
            .finally(() => {
                setVerifying(false);
            });
    }, [commands, path, mode, dispatch, deviceConnected]);

    useEffect(() => {
        if (!failed && !gotAllResponses && !verifying) {
            setVerifying(true);
            setTimeout(() => verify(), 3000);
        }
    }, [failed, gotAllResponses, verifying, verify]);

    return (
        <Main>
            <Main.Content
                heading={getHeading()}
                subHeading="Automatically verify kit communication with AT commands."
            >
                <div className="tw-flex tw-flex-col tw-items-start tw-justify-start tw-gap-4">
                    {commands.map(({ title, copiable = false }, index) => (
                        <div key={title}>
                            <p>
                                <i className="tw-font-light">{title}</i>
                            </p>
                            <div className="tw-flex tw-flex-row tw-items-center tw-gap-4">
                                <p className={verifying ? 'ellipsis' : ''}>
                                    {!verifying && (
                                        <b>
                                            {!failed &&
                                                gotAllResponses &&
                                                responses[index]}
                                            {failed && 'ERROR'}
                                        </b>
                                    )}
                                </p>
                                {copiable &&
                                    responses[index] &&
                                    !failed &&
                                    !verifying && (
                                        <Copy copyText={responses[index]} />
                                    )}
                            </div>
                        </div>
                    ))}
                </div>
                {failed && (
                    <div className="tw-pt-8">
                        <IssueBox
                            mdiIcon="mdi-lightbulb-alert-outline"
                            color="tw-text-red"
                            title={failed}
                        />
                    </div>
                )}
            </Main.Content>
            <Main.Footer>
                <Back disabled={verifying} />
                {showSkip && <Skip />}
                {failed ? (
                    <Next
                        label="Retry"
                        disabled={verifying}
                        onClick={() => {
                            setVerifying(true);
                            verify();
                        }}
                    />
                ) : (
                    <Next disabled={verifying} />
                )}
            </Main.Footer>
        </Main>
    );
};

const VerifyConfigLayer = ({
    settings,
    commands,
}: {
    settings: { ref: string; vComIndex: number; mode: 'LINE' | 'SHELL' }[];
    commands: Command[];
}) => {
    const device = useAppSelector(getSelectedDeviceUnsafely);
    const choice = useAppSelector(getChoiceUnsafely);
    const choiceSettings = settings.find(s => s.ref === choice.name);
    const path =
        choiceSettings &&
        device.serialPorts?.[choiceSettings.vComIndex]?.comName;
    if (choiceSettings && path) {
        return (
            <VerifyStep
                path={path}
                mode={choiceSettings.mode}
                commands={commands}
            />
        );
    }
    logger.error(`Invalid config for ${choice.name}`);
    return null;
};

export default (config: {
    settings: { ref: string; vComIndex: number; mode: 'LINE' | 'SHELL' }[];
    commands: Command[];
}) => ({
    name: 'Verify',
    component: () => VerifyConfigLayer({ ...config }),
});
