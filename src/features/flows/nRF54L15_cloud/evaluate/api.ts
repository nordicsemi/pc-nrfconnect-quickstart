/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { describeError } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    type CrashFrame,
    type CrashReport,
    type MemfaultToken,
    type Organization,
    type Project,
    type RegisterDeviceParams,
    type SoftwareVersion,
    type SymbolUploadUrl,
} from './types';

// Real:
const API_BASE = 'https://api.memfault.com/api/v0';
const MYNORDIC_BASE = 'https://api.memfault.com/mynordic';
// Mock:
// const API_BASE = 'http://127.0.0.1:8000';
// const MYNORDIC_BASE = 'http://127.0.0.1:8000/mynordic';

const POLL_INTERVAL_MS = 5000;

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
}

interface UploadUrlResponse {
    data: { upload_url: string; token: string };
}

interface TokenResponse {
    token_type: string;
    access_token: string;
    expires_in: number;
    scope: string;
}

interface RegisterDeviceBody {
    device_serial: string;
    hardware_version: string;
    nickname?: string;
}

interface FinalizeSymbolBody {
    file: { token: string };
    software_version?: {
        version?: string;
        software_type?: string;
    };
}

interface PollBaseline {
    baseline: string | null | undefined;
    onBaseline: (capturedDate: string | null) => void;
}

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

const mapCrash = ({
    captured_date: capturedDate,
    ...rest
}: RawCrash): CrashReport => ({ ...rest, capturedDate });

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

export const provisionMyNordicAccount = async (
    idToken: string,
): Promise<void> => {
    const res = await fetch(`${MYNORDIC_BASE}/me`, {
        method: 'POST',
        headers: bearer(idToken),
    });
    if (!res.ok) {
        throw new Error(`Failed to provision myNordic account (${res.status})`);
    }
};

export const fetchMemfaultToken = async (
    idToken: string,
): Promise<MemfaultToken> => {
    const res = await fetch(`${MYNORDIC_BASE}/token`, {
        method: 'POST',
        headers: bearer(idToken),
    });
    if (!res.ok) {
        throw new Error(
            `Failed to obtain Memfault access token (${res.status})`,
        );
    }
    const { access_token: accessToken, expires_in: expiresIn } =
        (await res.json()) as TokenResponse;
    return { accessToken, expiresIn };
};

const fetchCrashReport = async (
    deviceSerial: string,
    signal: AbortSignal,
): Promise<CrashReportFetch> => {
    const crashReportUrl = `${API_BASE}/quickstart/crash-report?device_serial=${encodeURIComponent(
        deviceSerial,
    )}`;

    try {
        const res = await fetch(crashReportUrl, { signal });

        if (!res.ok) {
            throw new Error(
                `Failed to fetch crash report from the cloud (${res.status})`,
            );
        }
        const data = (await res.json()) as CrashReportResponse;

        return {
            status: data.status,
            crash: data.crash ? mapCrash(data.crash) : null,
        };
    } catch (e) {
        if ((e as Error).name === 'AbortError') throw e;

        throw new Error(
            `Failed to fetch crash report from the cloud. ${describeError(e)}`,
        );
    }
};

export const pollCrashReport = (
    deviceSerial: string,
    signal: AbortSignal,
    { baseline, onBaseline }: PollBaseline,
    intervalMs = POLL_INTERVAL_MS,
): Promise<CrashReport> => {
    let current = baseline;

    const attempt = async (): Promise<CrashReport> => {
        if (signal.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }
        const { status, crash } = await fetchCrashReport(deviceSerial, signal);
        const isTerminal = status === 'processed' || status === 'symbolicated';

        if (current === undefined) {
            // The first request sets the baseline: the crash that exists now (if any) is old.
            current = isTerminal && crash ? crash.capturedDate : null;
            onBaseline(current);
        } else if (isTerminal && crash) {
            const isNew =
                current === null ||
                Date.parse(crash.capturedDate) > Date.parse(current);
            if (isNew) {
                return crash;
            }
        }

        await delay(intervalMs, signal);
        return attempt();
    };

    return attempt();
};

export const fetchOrganizations = async (
    memfaultToken: string,
): Promise<Organization[]> => {
    const res = await fetch(`${API_BASE}/organizations`, {
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
        `${API_BASE}/organizations/${encodeURIComponent(orgSlug)}/projects`,
        { headers: bearer(memfaultToken) },
    );
    if (!res.ok) {
        throw new Error(`Failed to fetch projects (${res.status})`);
    }
    const { data } = (await res.json()) as { data: Project[] };
    return data;
};

export const fetchProjectKey = async (
    memfaultToken: string,
    orgSlug: string,
    projectSlug: string,
): Promise<string> => {
    const res = await fetch(
        `${API_BASE}/organizations/${encodeURIComponent(
            orgSlug,
        )}/projects/${encodeURIComponent(projectSlug)}/data-routes`,
        { headers: bearer(memfaultToken) },
    );
    if (!res.ok) {
        throw new Error(`Failed to fetch project key (${res.status})`);
    }
    const { data } = (await res.json()) as { data: { token: string }[] };
    const token = data[0]?.token;
    if (!token) {
        throw new Error('No project key found for this project');
    }
    return token;
};

export const postRegisterDevice = async (
    memfaultToken: string,
    orgSlug: string,
    projectSlug: string,
    params: RegisterDeviceParams,
): Promise<void> => {
    const body: RegisterDeviceBody = {
        device_serial: params.deviceSerial,
        hardware_version: params.hardwareVersion,
        ...(params.nickname ? { nickname: params.nickname } : {}),
    };

    const res = await fetch(
        `${API_BASE}/organizations/${encodeURIComponent(
            orgSlug,
        )}/projects/${encodeURIComponent(
            projectSlug,
        )}/quickstart/register-device`,
        {
            method: 'POST',
            headers: {
                ...bearer(memfaultToken),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        },
    );
    if (!res.ok) {
        throw new Error(`Device registration failed (${res.status})`);
    }
};

export const requestSymbolUploadUrl = async (
    memfaultToken: string,
    orgSlug: string,
    projectSlug: string,
): Promise<SymbolUploadUrl> => {
    const res = await fetch(
        `${API_BASE}/organizations/${encodeURIComponent(
            orgSlug,
        )}/projects/${encodeURIComponent(projectSlug)}/upload`,
        {
            method: 'POST',
            headers: {
                ...bearer(memfaultToken),
                'Content-Type': 'application/json',
            },
            body: '{}',
        },
    );
    if (!res.ok) {
        throw new Error(`Failed to request upload URL (${res.status})`);
    }
    const { data } = (await res.json()) as UploadUrlResponse;
    const { upload_url: uploadUrl, token: uploadToken } = data;
    return { uploadUrl, uploadToken };
};

export const uploadSymbolBinary = async (
    uploadUrl: string,
    bytes: Uint8Array,
): Promise<void> => {
    const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: new Blob([new Uint8Array(bytes)]),
    });
    if (!res.ok) {
        throw new Error(`Failed to upload symbol file (${res.status})`);
    }
};

export const finalizeSymbolFile = async (
    memfaultToken: string,
    orgSlug: string,
    projectSlug: string,
    uploadToken: string,
    sw?: SoftwareVersion,
): Promise<void> => {
    const body: FinalizeSymbolBody = {
        file: { token: uploadToken },
        ...(sw && (sw.version || sw.softwareType)
            ? {
                  software_version: {
                      version: sw.version,
                      software_type: sw.softwareType,
                  },
              }
            : {}),
    };

    const res = await fetch(
        `${API_BASE}/organizations/${encodeURIComponent(
            orgSlug,
        )}/projects/${encodeURIComponent(projectSlug)}/symbols`,
        {
            method: 'POST',
            headers: {
                ...bearer(memfaultToken),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        },
    );

    // Symbol file already exists  — treat as success
    if (res.status === 409) {
        return;
    }
    if (!res.ok) {
        throw new Error(`Failed to finalize symbol file (${res.status})`);
    }
};
