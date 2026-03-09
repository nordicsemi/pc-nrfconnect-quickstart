/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    createSerialPort,
    type SerialPort,
    type ShellParser,
    shellParser,
    xTerminalShellParserWrapper,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { Terminal } from '@xterm/headless';

import { formatResponse } from './formatATResponse';

export interface Command {
    command: string;
    responseRegex: string;
}

const sendCommandShellMode = (parser: ShellParser, command: string) =>
    new Promise<string>((resolve, reject) => {
        parser.enqueueRequest(`at ${command}`, {
            onSuccess: res => {
                resolve(res);
            },
            onError: err => {
                reject(err);
            },
            onTimeout: () => {
                reject(new Error('timeout'));
            },
        });
    });
const decoder = new TextDecoder();
const sendCommandLineMode = (serialPort: SerialPort, command: string) =>
    new Promise<string>((resolve, reject) => {
        let response = '';
        let finishedWriting = false;
        let timeout: NodeJS.Timeout;
        const handler = serialPort.onData(data => {
            if (!finishedWriting) return;

            response += decoder.decode(data);
            const isCompleteResponse =
                response.includes('\nOK') || response.includes('\nERROR');
            if (isCompleteResponse) {
                clearTimeout(timeout);
                finishedWriting = false;
                handler();
                if (response.includes('ERROR')) {
                    reject(new Error(`Response has ERROR ${response}`));
                }
                if (response.includes('OK')) {
                    resolve(response);
                }
            }
        });

        timeout = setTimeout(() => {
            handler();
            reject(new Error('Timed out'));
        }, 2000);

        serialPort.write(`${command}\r\n`).then(() => {
            finishedWriting = true;
        });
    });

export default async (
    commands: Command[],
    path: string,
    mode?: 'LINE' | 'SHELL',
) => {
    let serialPort: {
        sendCommand: (cmd: string) => Promise<string>;
        unregister: () => void;
    };

    const createdSerialPort = await createSerialPort(
        {
            path,
            baudRate: 115200,
        },
        { overwrite: true, settingsLocked: true },
    );

    if (!mode) {
        try {
            await sendCommandLineMode(createdSerialPort, 'at AT');
            mode = 'SHELL';
        } catch {
            mode = 'LINE';
        }
    }

    if (mode === 'SHELL') {
        const sp = await shellParser(
            createdSerialPort,
            xTerminalShellParserWrapper(
                new Terminal({
                    allowProposedApi: true,
                    cols: 999,
                }),
            ),
            {
                logRegex:
                    /[[][0-9]{2,}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <([^<^>]+)> ([^:]+): .*(\r\n|\r|\n)$/,
                errorRegex: /ERROR/,
                timeout: 1000,
                columnWidth: 80,
            },
        );
        serialPort = {
            sendCommand: (cmd: string) => sendCommandShellMode(sp, cmd),
            unregister: () => {
                sp.unregister();
                createdSerialPort.close();
            },
        };
    } else {
        serialPort = {
            sendCommand: (cmd: string) =>
                sendCommandLineMode(createdSerialPort, cmd),
            unregister: () => {
                createdSerialPort.close();
            },
        };
    }

    const newResponses: string[] = [];
    const reducedPromise = commands.reduce(
        (acc, next) =>
            acc.then(() =>
                serialPort.sendCommand(next.command).then(value => {
                    newResponses.push(
                        formatResponse(value, next.responseRegex),
                    );

                    return Promise.resolve();
                }),
            ),
        Promise.resolve(),
    );

    try {
        await reducedPromise;
    } catch (e) {
        serialPort.unregister();
        throw e;
    }

    serialPort.unregister();
    return newResponses;
};
