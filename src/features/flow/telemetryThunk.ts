/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    type AppThunk,
    deviceInfo,
    telemetry,
    // telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { type RootState } from '../../app/store';
import { getChoice, getSelectedDevice } from '../device/deviceSlice';
import { getCurrentStepIndex, getFlow } from './flowSlice';

const telemetrySent = new Set<string>();
let selectedDevice: string | undefined;
let selectedFW: string | undefined;

function reset() {
    selectedDevice = undefined;
    selectedFW = undefined;
    telemetrySent.clear();
}

export default (subStepName?: string): AppThunk<RootState> =>
    (_, getState) => {
        const currentStepIndex = getCurrentStepIndex(getState());
        const flow = getFlow(getState());
        const step = flow[currentStepIndex] || 'Connect';
        const connectedDevice = getSelectedDevice(getState());
        const choise = getChoice(getState());
        const stepIndex = getCurrentStepIndex(getState());
        const fw = choise?.name;
        const device = connectedDevice
            ? (deviceInfo(connectedDevice).name ?? 'Unknown device')
            : undefined;

        if (
            (fw && selectedFW && fw !== selectedFW) ||
            (device && selectedDevice && selectedDevice !== device)
        ) {
            reset();
        }

        const telemetryKey = `Step ${step} ${subStepName ? `- ${subStepName}` : ''}`;

        if (telemetrySent.has(telemetryKey)) {
            // we want to sent telemetry once per step (including sub steps).
            return;
        }

        telemetrySent.add(telemetryKey);

        selectedDevice = device;
        selectedFW = fw;

        telemetry.sendEvent(telemetryKey, {
            step: subStepName ?? step,
            device,
            fw,
            stepIndex,
        });
    };
