/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { HttpError } from '../../../features/flows/nRF54L15_cloud/evaluate/api';

const MEMFAULT_API = 'https://api.memfault.com/api/v0';
const NRFCLOUD_API = 'https://api.nrfcloud.com/v1';

export type ProvisioningStatus =
    | 'NOT_PROVISIONED'
    | 'IN_PROGRESS'
    | 'SUCCEEDED'
    | 'FAILED'
    | 'DEACTIVATED';

export interface Provisioning {
    status?: ProvisioningStatus;
    firstContactAt?: string;
    lastCheckInAt?: string;
    failure?: { message?: string };
}

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

const errorMessage = async (res: Response, fallback: string) => {
    try {
        const body = (await res.json()) as {
            message?: string;
            error?: { message?: string };
        };
        const message = body.message ?? body.error?.message;
        return message ? `${fallback}: ${message}` : fallback;
    } catch {
        return fallback;
    }
};

const projectPath = (orgSlug: string, projectSlug: string) =>
    `/organizations/${encodeURIComponent(
        orgSlug,
    )}/projects/${encodeURIComponent(projectSlug)}`;

export const onboardDevice = async (
    accessToken: string,
    orgSlug: string,
    projectSlug: string,
    attestationToken: string,
): Promise<string> => {
    const res = await fetch(
        `${NRFCLOUD_API}${projectPath(orgSlug, projectSlug)}/long-range/devices`,
        {
            method: 'POST',
            headers: {
                ...bearer(accessToken),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ attestationToken }),
        },
    );
    if (!res.ok) {
        throw new HttpError(
            res.status,
            await errorMessage(
                res,
                `Failed to onboard the device to nRF Cloud (${res.status})`,
            ),
        );
    }
    const { deviceId } = (await res.json()) as { deviceId: string };
    return deviceId;
};

export const fetchProvisioning = async (
    accessToken: string,
    orgSlug: string,
    projectSlug: string,
    deviceId: string,
): Promise<Provisioning | undefined> => {
    const res = await fetch(
        `${NRFCLOUD_API}${projectPath(
            orgSlug,
            projectSlug,
        )}/claimed-devices/${encodeURIComponent(deviceId)}`,
        { headers: bearer(accessToken) },
    );
    if (!res.ok) {
        throw new HttpError(
            res.status,
            await errorMessage(
                res,
                `Failed to get the provisioning status (${res.status})`,
            ),
        );
    }
    const { provisioning } = (await res.json()) as {
        provisioning?: Provisioning;
    };
    return provisioning;
};

export const fetchBatteryPercent = async (
    memfaultToken: string,
    orgSlug: string,
    projectSlug: string,
    deviceId: string,
): Promise<number | undefined> => {
    const res = await fetch(
        `${MEMFAULT_API}${projectPath(
            orgSlug,
            projectSlug,
        )}/devices/${encodeURIComponent(deviceId)}/attributes?q=battery_soc_pct`,
        { headers: bearer(memfaultToken) },
    );
    if (!res.ok) {
        throw new HttpError(
            res.status,
            await errorMessage(
                res,
                `Failed to get the battery level (${res.status})`,
            ),
        );
    }
    const { data } = (await res.json()) as {
        data: { string_key: string; state: { value?: unknown } | null }[];
    };
    const value = data.find(a => a.string_key === 'battery_soc_pct')?.state
        ?.value;
    return typeof value === 'number' ? value : undefined;
};
