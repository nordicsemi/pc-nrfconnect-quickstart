/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// TODO: Replace this with a library that can handle ANSI removal.
const ansiPattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
].join('|');

export const cleanShellOutput = (raw: string) =>
    raw
        .replace(new RegExp(ansiPattern, 'g'), '')
        .replace(/uart:~\$ ?/g, '') // Zephyr shell prompt
        .replace(/^> ?/gm, ''); // command-echo prompt
