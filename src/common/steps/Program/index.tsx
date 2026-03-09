/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { useAppSelector } from '../../../app/store';
import { type Choice } from '../../../features/device/deviceSlice';
import Program from './Program';
import { getProgrammingProgress } from './programSlice';
import SelectFirmware from './SelectFirmware';

const ProgramStep = ({ choices }: { choices: Choice[] }) => {
    const hasStartedProgramming = !!useAppSelector(getProgrammingProgress);

    return hasStartedProgramming ? (
        <Program />
    ) : (
        <SelectFirmware choices={choices} />
    );
};

export default (choices: Choice[]) => ({
    name: 'Program',
    component: () => ProgramStep({ choices }),
});
