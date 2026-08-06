/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface CrashFrame {
    index: number;
    function: string;
    file: string;
    lineno: number;
    address: string;
    module: string;
}

export interface CrashReport {
    reason: string;
    title: string;
    capturedDate: string;
    frames: CrashFrame[];
}

export interface Organization {
    id: number;
    name: string;
    slug: string;
}

export interface Project {
    id: number;
    name: string;
    slug: string;
}

export interface RegisterDeviceParams {
    deviceSerial: string;
    hardwareVersion: string;
    nickname?: string;
}

export interface SoftwareVersion {
    version?: string;
    softwareType?: string;
}

export interface DeviceInfo {
    serialNumber: string;
    swType?: string;
    swVersion?: string;
    hwVersion?: string;
}

export interface SymbolUploadUrl {
    uploadUrl: string;
    uploadToken: string;
}

export interface MemfaultToken {
    accessToken: string;
    expiresIn: number;
}
