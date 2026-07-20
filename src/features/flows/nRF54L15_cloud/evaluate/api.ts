/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';

// const BASE_URL = 'https://api.memfault.com/api/v0';
const BASE_URL = 'http://127.0.0.1:8000';
const POLL_INTERVAL_MS = 5000;

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

interface RawCrash {
    reason: string;
    title: string;
    captured_date: string;
    frames: CrashFrame[];
}

interface CrashReportResponse {
    status: 'waiting' | 'processing' | 'processed' | 'symbolicated';
    crash: RawCrash | null;
}

interface CrashReportFetch {
    status: CrashReportResponse['status'];
    crash: CrashReport | null;
    serverTime: number;
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

interface TokenExchangeResponse {
    access_token: string;
}

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

const mapCrash = ({
    captured_date: capturedDate,
    ...rest
}: RawCrash): CrashReport => ({ ...rest, capturedDate });

const parseServerDate = (res: Response): number => {
    const dateHeader = res.headers.get('date');
    const time = dateHeader ? Date.parse(dateHeader) : NaN;
    if (Number.isNaN(time)) {
        throw new Error(
            'Missing/unreadable server Date header (CORS: exposed?)',
        );
    }
    return time;
};

const delay = (ms: number, signal: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
        const onAbort = () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
        };
        const timer = setTimeout(() => {
            signal.removeEventListener('abort', onAbort);
            resolve();
        }, ms);
        signal.addEventListener('abort', onAbort, { once: true });
    });

const fetchCrashReport = async (
    deviceSerial: string,
    signal: AbortSignal,
): Promise<CrashReportFetch> => {
    const crashReportUrl = `${BASE_URL}/quickstart/crash-report?device_serial=${encodeURIComponent(
        deviceSerial,
    )}`;

    try {
        const res = await fetch(crashReportUrl, { signal });

        if (!res.ok) {
            logger.error(
                `Crash report request failed. Server response code ${res.status}`,
            );
            throw new Error(
                `Failed to fetch crash report from the cloud (${res.status})`,
            );
        }

        const serverTime = parseServerDate(res);
        const data = (await res.json()) as CrashReportResponse;

        return {
            status: data.status,
            crash: data.crash ? mapCrash(data.crash) : null,
            serverTime,
        };
    } catch (e) {
        logger.error(
            `Failed to fetch crash report from the cloud: ${(e as Error).message}`,
        );
        throw new Error(`Failed to fetch crash report from the cloud.`);
    }
};

export const fetchServerTime = async (
    deviceSerial: string,
    signal: AbortSignal,
): Promise<number> => (await fetchCrashReport(deviceSerial, signal)).serverTime;

export const pollCrashReport = (
    deviceSerial: string,
    signal: AbortSignal,
    baseline: number,
    intervalMs = POLL_INTERVAL_MS,
): Promise<CrashReport> => {
    const attempt = async (): Promise<CrashReport> => {
        if (signal.aborted) {
            logger.warn('pollCrashReport aborted');
            throw new DOMException('Aborted', 'AbortError');
        }

        const { status, crash } = await fetchCrashReport(deviceSerial, signal);
        const isTerminal = status === 'processed' || status === 'symbolicated';

        if (isTerminal && crash) {
            const capturedAt = Date.parse(crash.capturedDate);
            if (!Number.isNaN(capturedAt) && capturedAt > baseline) {
                logger.info(
                    `Crash report captured at ${capturedAt} is newer than baseline ${baseline}`,
                );
                return crash;
            }
        }

        await delay(intervalMs, signal);
        return attempt();
    };

    return attempt();
};

export const exchangeToken = async (
    entraAccessToken: string,
): Promise<string> => {
    const res = await fetch(`${BASE_URL}/access-token/exchange`, {
        method: 'POST',
        headers: bearer(entraAccessToken),
    });
    if (!res.ok) {
        throw new Error(`Token exchange failed (${res.status})`);
    }
    const { access_token: accessToken } =
        (await res.json()) as TokenExchangeResponse;
    return accessToken;
};

export const fetchOrganizations = async (
    memfaultToken: string,
): Promise<Organization[]> => {
    const res = await fetch(`${BASE_URL}/organizations`, {
        headers: bearer(memfaultToken),
    });
    if (!res.ok) {
        throw new Error(`Failed to fetch organizations (${res.status})`);
    }
    const { data } = (await res.json()) as { data: Organization[] };
    return data;
};

export const fetchProjects = async (
    memfaultToken: string,
    orgSlug: string,
): Promise<Project[]> => {
    const res = await fetch(
        `${BASE_URL}/organizations/${encodeURIComponent(orgSlug)}/projects`,
        { headers: bearer(memfaultToken) },
    );
    if (!res.ok) {
        throw new Error(`Failed to fetch projects (${res.status})`);
    }
    const { data } = (await res.json()) as { data: Project[] };
    return data;
};
