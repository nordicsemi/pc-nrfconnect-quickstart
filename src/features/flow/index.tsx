/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import {
    deviceInfo,
    logger,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useAppDispatch, useAppSelector } from '../../app/store';
import { allReset } from '../../common/steps/stepReducers';
import { getSelectedDevice } from '../device/deviceSlice';
import type { Flow } from '../flows';
import flows from '../flows';
import { allReset as flowsAllReset } from '../flows/reducers';
import Connect from './connect';
import Finish from './finish';
import FlowProgress from './FlowProgress';
import {
    getCurrentStepIndex,
    getFlow,
    isConnectVisible,
    setFlow,
} from './flowSlice';
import telemetryThunk from './telemetryThunk';

const useLogSteps = () => {
    const dispatch = useAppDispatch();
    const currentStepIndex = useAppSelector(getCurrentStepIndex);
    const flow = useAppSelector(getFlow);

    // Telemetry when user changes step
    useEffect(() => {
        const step = flow[currentStepIndex] || 'Connect';

        logger.debug(`Changed step: ${step}`);
        telemetry.sendEvent('Changed step', { step });

        dispatch(telemetryThunk());
    }, [flow, currentStepIndex, dispatch]);
};

const Flow = () => {
    const dispatch = useAppDispatch();
    const device = useAppSelector(getSelectedDevice);
    const deviceName = device && deviceInfo(device).name;
    const validFlow = deviceName && !!flows[deviceName];
    const currentStepIndex = useAppSelector(getCurrentStepIndex);
    const [flowWithFinish, setFlowWithFinish] = React.useState<Flow[]>([]);

    useEffect(() => {
        if (validFlow && !flowWithFinish.length) {
            const newFlow = [...flows[deviceName], Finish()];

            dispatch(allReset());
            dispatch(flowsAllReset());
            setFlowWithFinish(newFlow);
            dispatch(setFlow(newFlow.map(f => f.name)));
        }
    }, [validFlow, flowWithFinish, deviceName, dispatch]);

    const Step =
        currentStepIndex >= 0
            ? flowWithFinish[currentStepIndex].component
            : undefined;

    return Step ? <Step /> : null;
};

export default () => {
    const showConnect = useAppSelector(isConnectVisible);

    useLogSteps();

    return (
        <>
            <FlowProgress />
            <div className="tw-flex-1">
                {!showConnect ? <Flow /> : <Connect />}
            </div>
        </>
    );
};
