/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { useAppSelector } from '../../../app/store';
import Choose from './Choose';
import CLI from './CLI';
import { DevelopState, getDevelopState } from './developSlice';
import OpenVsCode, { type SampleWithRef } from './OpenVsCode';
import VsCodeOpened from './VsCodeOpened';

const DevelopStep = ({ samples }: { samples: SampleWithRef[] }) => {
    const developState = useAppSelector(getDevelopState);

    return (
        <>
            {developState === DevelopState.CHOOSE && <Choose />}
            {developState === DevelopState.OPEN_VS_CODE && (
                <OpenVsCode samples={samples} />
            )}
            {developState === DevelopState.VS_CODE_OPENED && <VsCodeOpened />}
            {developState === DevelopState.CLI && <CLI />}
        </>
    );
};

export default (samples: SampleWithRef[]) => ({
    name: 'Develop',
    component: () => DevelopStep({ samples }),
});
