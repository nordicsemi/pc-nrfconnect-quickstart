/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../../../app/store';
import telemetryThunk from '../../../flow/telemetryThunk';
import Authenticate from './Authenticate';
import {
    CloudSubStep,
    cloudSubStepTelemetryName,
    getDeviceInfo,
    getSubStep,
} from './cloudEvaluateSlice';
import { fetchDeviceInfo } from './deviceInfoEffects';
import DeviceRegistration from './DeviceRegistration';
import EstablishConnection from './EstablishConnection';
import TestCrash from './TestCrash';
import TryLbs from './TryLbs';

export default () => {
    const dispatch = useAppDispatch();
    const subStep = useAppSelector(getSubStep);
    const deviceInfo = useAppSelector(getDeviceInfo);

    useEffect(() => {
        dispatch(telemetryThunk(cloudSubStepTelemetryName(subStep)));
    }, [dispatch, subStep]);

    useEffect(() => {
        if (deviceInfo.status === 'idle') {
            dispatch(fetchDeviceInfo());
        }
    }, [dispatch, deviceInfo.status]);

    switch (subStep) {
        case CloudSubStep.ESTABLISH_CONNECTION:
            return <EstablishConnection />;
        case CloudSubStep.TRY_LBS:
            return <TryLbs />;
        case CloudSubStep.TEST_CRASH:
            return <TestCrash />;
        case CloudSubStep.AUTHENTICATE:
            return <Authenticate />;
        case CloudSubStep.DEVICE_REGISTRATION:
            return <DeviceRegistration />;
    }
};
