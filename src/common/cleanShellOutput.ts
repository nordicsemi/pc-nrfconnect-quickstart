/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { removeAnsi } from '@nordicsemiconductor/pc-nrfconnect-shared';

export const cleanShellOutput = (raw: string) =>
    removeAnsi(raw)
        .replace(/uart:~\$ ?/g, '') // Zephyr shell prompt
        .replace(/^> ?/gm, ''); // command-echo prompt
