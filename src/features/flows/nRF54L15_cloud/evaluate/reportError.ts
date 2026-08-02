/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { telemetry } from '@nordicsemiconductor/pc-nrfconnect-shared';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';

const isAbort = (e: unknown) => (e as Error)?.name === 'AbortError';

export const reportEvaluateError = (
    subStep: string,
    error: unknown,
    phase?: string,
) => {
    if (isAbort(error)) return;

    const context = phase ? `${subStep} / ${phase}` : subStep;
    const err =
        error instanceof Error ? error : new Error(describeError(error));
    err.message = `[${context}] ${err.message}`;

    telemetry.sendErrorReport(err);
};
