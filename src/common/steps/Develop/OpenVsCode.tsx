/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { openUrl, telemetry } from '@nordicsemiconductor/pc-nrfconnect-shared';

import logo from '../../../../resources/nrf_connect_for_vs_code.svg';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { getChoiceUnsafely } from '../../../features/device/deviceSlice';
import { Back } from '../../Back';
import Main from '../../Main';
import { Next, Skip } from '../../Next';
import {
    DevelopState,
    getIsVsCodeInstalled,
    setDevelopState,
} from './developSlice';
import { detectVsCodeRepeatedly } from './vsCodeEffects';
import VsCodeNotInstalled from './VsCodeNotInstalled';

const valueIsDefined = (
    paramValuePair: [string, string | undefined | null],
): paramValuePair is [string, string] => paramValuePair[1] != null;

export const queryParamsString = (
    queryParams: Record<string, string | undefined | null>,
) =>
    Object.entries(queryParams)
        .filter(valueIsDefined)
        .map(([param, value]) => `${param}=${encodeURIComponent(value)}`)
        .join('&');

export enum SDKType {
    nRFConnectSDK = 'nRF Connect SDK', // Must match the description on nrfutil SDK types.
    nRFConnectSDKBareMetal = 'nRF Connect SDK Bare Metal', // Must match the description on nrfutil SDK types.
}

interface NCSAddon {
    type: 'ncsAddon';
    link: string;
}

interface SDKParams {
    type: 'sdk';
    params: {
        samplePath: string;
        sdkVersion?: string;
        sdkType?: SDKType;
    };
}

type Sample = {
    type: 'sdk' | 'ncsAddon';
} & (NCSAddon | SDKParams);

export type DevelopConfig = Record<string, Sample>;

export default ({ samples }: { samples: DevelopConfig }) => {
    const dispatch = useAppDispatch();
    const isVsCodeInstalled = useAppSelector(getIsVsCodeInstalled);
    const choice = useAppSelector(getChoiceUnsafely);

    const sample = samples[choice.name];

    useEffect(
        () => detectVsCodeRepeatedly(dispatch, isVsCodeInstalled),
        [dispatch, isVsCodeInstalled],
    );

    if (!isVsCodeInstalled) {
        return <VsCodeNotInstalled />;
    }

    return (
        <Main>
            <Main.Content heading="Open VS Code">
                <div className="tw-flex tw-flex-col tw-items-start tw-gap-6">
                    <img src={logo} alt="" className="tw-h-12" />
                    <p>
                        Nordic Semiconductor&apos;s nRF Connect for VS Code
                        extension enhances the development experience for all
                        aspects of the nRF Connect SDK application development
                        in VS Code.
                    </p>
                    <p>
                        Click to open VS Code and install the nRF Connect for VS
                        Code extension. Follow the instructions in the extension
                        to install the toolchain and the SDK, and start
                        developing.
                    </p>
                </div>
            </Main.Content>
            <Main.Footer>
                <Back
                    onClick={() => {
                        dispatch(setDevelopState(DevelopState.CHOOSE));
                    }}
                />
                <Skip />
                <Next
                    label="Open VS Code with extension"
                    onClick={() => {
                        const deepLink =
                            'vscode://nordic-semiconductor.nrf-connect/';

                        switch (sample?.type) {
                            case 'ncsAddon':
                                openUrl(
                                    `${deepLink}openFromAppIndex${sample.link}`,
                                );
                                break;
                            case 'sdk':
                                openUrl(
                                    `${deepLink}openSampleFromSDK?${queryParamsString(
                                        sample.params,
                                    )}`,
                                );
                                break;
                            default:
                                openUrl(`${deepLink}openSampleFromSDK`);
                                break;
                        }

                        dispatch(setDevelopState(DevelopState.VS_CODE_OPENED));
                        telemetry.sendEvent('Opened VS Code');
                    }}
                />
            </Main.Footer>
        </Main>
    );
};
