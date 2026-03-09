/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app } from '@electron/remote';
import { existsSync } from 'fs';
import { dirname, join } from 'path';

import { type AppDispatch } from '../../../app/store';
import { setIsVsCodeInstalled } from './developSlice';

const isVsCodeInstalledOnLinux = () =>
    app.getApplicationNameForProtocol('vscode://') !== '';

const isVsCodeInstalledOnMacOS = async () => {
    try {
        const { path } = await app.getApplicationInfoForProtocol('vscode://');

        return existsSync(path);
    } catch {
        return false;
    }
};

const isVsCodeInstalledOnWindows = async () => {
    try {
        const { path } = await app.getApplicationInfoForProtocol('vscode://');

        return existsSync(join(dirname(path), 'bin', 'code'));
    } catch {
        return false;
    }
};

const isVsCodeInstalled = () => {
    switch (process.platform) {
        case 'linux':
            return isVsCodeInstalledOnLinux();
        case 'darwin':
            return isVsCodeInstalledOnMacOS();
        case 'win32':
            return isVsCodeInstalledOnWindows();
        default:
            throw new Error(`Unsupported platform ${process.platform}`);
    }
};

export const detectVsCode = async (dispatch: AppDispatch) => {
    dispatch(setIsVsCodeInstalled(await isVsCodeInstalled()));
};

export const detectVsCodeRepeatedly = (
    dispatch: AppDispatch,
    wasVsCodeInstalled: boolean,
) => {
    const id = setInterval(async () => {
        const isVsCodeInstalledNow = await isVsCodeInstalled();
        if (isVsCodeInstalledNow !== wasVsCodeInstalled) {
            dispatch(setIsVsCodeInstalled(isVsCodeInstalledNow));
        }
    }, 200);

    return () => clearInterval(id);
};
