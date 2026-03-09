/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type DeviceCore } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/device';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type RootState } from '../../app/store';
import { type DeviceWithSerialnumber } from './deviceLib';

export interface Firmware {
    core?: DeviceCore;
    coreLabel?: string;
    file: string;
    link?: { label: string; href: string };
}

interface FirmwareNote {
    title: string;
    content: string;
}

interface ChoiceInfo {
    name: string;
    description: string;
    documentation: { label: string; href: string };
    firmwareNote: FirmwareNote | undefined;
}

interface BatchChoice extends ChoiceInfo {
    type: 'jlink-batch';
    programmingOptions: {
        firmwareList: Firmware[];
    };
}

interface ProgrammingAction {
    type: 'program';
    firmware: Firmware;
}

interface WaitAction {
    type: 'wait';
    durationMs: number;
}

interface ProgramModemFirmwareAction {
    type: 'program-modem-firmware';
    firmware: Firmware;
    version: string;
    vComIndex: number;
}

interface ResetAction {
    type: 'reset';
}

export type ActionListEntry =
    | ProgrammingAction
    | WaitAction
    | ProgramModemFirmwareAction
    | ResetAction;

interface ActionListChoice extends ChoiceInfo {
    type: 'action-list';
    programmingOptions: {
        actions: ActionListEntry[];
    };
}

export type Choice = BatchChoice | ActionListChoice;

interface State {
    choice?: Choice;
    connectedDevices: Map<string, DeviceWithSerialnumber>;
    selectedDevice?: DeviceWithSerialnumber;
}

const initialState: State = {
    connectedDevices: new Map(),
};

const slice = createSlice({
    name: 'device',
    initialState,
    reducers: {
        addDevice: (
            state,
            { payload: device }: PayloadAction<DeviceWithSerialnumber>,
        ) => {
            if (state.selectedDevice?.serialNumber === device.serialNumber) {
                state.selectedDevice = device as DeviceWithSerialnumber;
            }
            state.connectedDevices.set(device.serialNumber, device);
        },

        removeDevice: (state, { payload: deviceId }: PayloadAction<number>) => {
            state.connectedDevices.forEach(device => {
                if (device.id === deviceId) {
                    state.connectedDevices.delete(device.serialNumber);
                }
            });
        },

        selectDevice: (
            state,
            {
                payload: device,
            }: PayloadAction<DeviceWithSerialnumber | undefined>,
        ) => {
            state.selectedDevice = device;
        },

        setChoice: (
            state,
            { payload: choice }: PayloadAction<Choice | undefined>,
        ) => {
            state.choice = choice;
        },
    },
});

export const { addDevice, removeDevice, selectDevice, setChoice } =
    slice.actions;

export const getConnectedDevices = (state: RootState) => [
    ...state.device.connectedDevices.values(),
];
export const getSelectedDevice = (state: RootState) =>
    state.device.selectedDevice;

export const selectedDeviceIsConnected = (state: RootState) =>
    state.device.connectedDevices.has(
        state.device.selectedDevice?.serialNumber ?? '',
    );

export const getSelectedDeviceUnsafely = (state: RootState) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Because we are certain based on the step that a device is selected
    state.device.selectedDevice!;

export const getChoice = (state: RootState) => state.device.choice;
export const getChoiceUnsafely = (state: RootState) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Because we are certain based on the step that the user made a choice
    state.device.choice!;

export default slice.reducer;
