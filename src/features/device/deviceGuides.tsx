/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { deviceInfo } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { type NrfutilDevice } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/device';
import path from 'path';

export const getFirmwareFolder = () =>
    path.resolve(__dirname, '..', 'resources', 'devices', 'firmware');

export const getImageFolder = () =>
    path.resolve(__dirname, '..', 'resources', 'devices', 'images');

export const deviceName = (device: NrfutilDevice) => deviceInfo(device).name;

export const DeviceIcon = ({
    device,
    className = '',
}: {
    device: NrfutilDevice;
    className?: string;
}) => {
    const Icon = deviceInfo(device).icon;
    return Icon ? <Icon className={className} /> : null;
};
