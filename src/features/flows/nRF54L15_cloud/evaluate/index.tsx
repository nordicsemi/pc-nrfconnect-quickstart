/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef } from 'react';
import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { inMain as auth } from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/auth';

import { useAppDispatch, useAppSelector } from '../../../../app/store';
import telemetryThunk from '../../../flow/telemetryThunk';
import Authenticate from './Authenticate';
import {
    CloudSubStep,
    cloudSubStepTelemetryName,
    getDeviceInfo,
    getSubStep,
    resetMemfault,
    setSubStep,
} from './cloudEvaluateSlice';
import { fetchDeviceInfo } from './deviceInfoEffects';
import DeviceRegistration from './DeviceRegistration';
import EstablishConnection from './EstablishConnection';
import TestCrash from './TestCrash';
import TryLbs from './TryLbs';

export default ({ vComIndex }: { vComIndex: number }) => {
    const dispatch = useAppDispatch();
    const subStep = useAppSelector(getSubStep);
    const deviceInfo = useAppSelector(getDeviceInfo);

    const subStepRef = useRef(subStep);
    subStepRef.current = subStep;

    useEffect(() => {
        logger.debug(`Changed sub-step: ${cloudSubStepTelemetryName(subStep)}`);
        dispatch(telemetryThunk(cloudSubStepTelemetryName(subStep)));
    }, [dispatch, subStep]);

    // Reset auth-derived state when signed out externally (e.g. from the
    // launcher via IPC). Only send the user back if they are on the
    // registration sub-step.
    useEffect(() => {
        auth.registerOnStateChanged(state => {
            if (state.status === 'signedOut') {
                dispatch(resetMemfault());
                if (subStepRef.current === CloudSubStep.DEVICE_REGISTRATION) {
                    dispatch(setSubStep(CloudSubStep.AUTHENTICATE));
                }
            }
        });
    }, [dispatch]);

    useEffect(() => {
        if (deviceInfo.status === 'idle') {
            dispatch(fetchDeviceInfo(vComIndex));
        }
    }, [dispatch, deviceInfo.status, vComIndex]);

    switch (subStep) {
        case CloudSubStep.ESTABLISH_CONNECTION:
            return <EstablishConnection vComIndex={vComIndex} />;
        case CloudSubStep.TRY_LBS:
            return <TryLbs />;
        case CloudSubStep.TEST_CRASH:
            return <TestCrash vComIndex={vComIndex} />;
        case CloudSubStep.AUTHENTICATE:
            return <Authenticate />;
        case CloudSubStep.DEVICE_REGISTRATION:
            return <DeviceRegistration vComIndex={vComIndex} />;
    }
};
