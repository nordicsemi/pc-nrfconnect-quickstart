/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useAppDispatch, useAppSelector } from '../../../../app/store';
import telemetryThunk from '../../../flow/telemetryThunk';
import Authenticate from './Authenticate';
import {
    CloudSubStep,
    cloudSubStepTelemetryName,
    getCrashBaseline,
    getDeviceInfo,
    getSubStep,
} from './cloudEvaluateSlice';
import { fetchCrashReportBaseline } from './crashBaselineEffects';
import { fetchDeviceInfo } from './deviceInfoEffects';
import DeviceRegistration from './DeviceRegistration';
import EstablishConnection from './EstablishConnection';
import TestCrash from './TestCrash';
import TryLbs from './TryLbs';

export default ({ vComIndex }: { vComIndex: number }) => {
    const dispatch = useAppDispatch();
    const subStep = useAppSelector(getSubStep);
    const deviceInfo = useAppSelector(getDeviceInfo);
    const crashBaseline = useAppSelector(getCrashBaseline);

    useEffect(() => {
        logger.debug(`Changed sub-step: ${cloudSubStepTelemetryName(subStep)}`);
        dispatch(telemetryThunk(cloudSubStepTelemetryName(subStep)));
    }, [dispatch, subStep]);

    useEffect(() => {
        if (deviceInfo.status === 'idle') {
            dispatch(fetchDeviceInfo(vComIndex));
        }
    }, [dispatch, deviceInfo.status, vComIndex]);

    // Established here rather than on the test crash sub-step so that it is
    // settled long before the user is told to press Button 1.
    useEffect(() => {
        if (
            deviceInfo.status === 'success' &&
            crashBaseline.status === 'idle'
        ) {
            dispatch(fetchCrashReportBaseline());
        }
    }, [dispatch, deviceInfo.status, crashBaseline.status]);

    switch (subStep) {
        case CloudSubStep.ESTABLISH_CONNECTION:
            return <EstablishConnection />;
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
