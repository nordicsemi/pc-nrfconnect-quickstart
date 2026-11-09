/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { useAppSelector } from '../../../app/store';
import { AppLink } from '../../../common/Resource';
import Verify from '../../../common/steps/91FamilyVerify';
import { getChoiceUnsafely } from '../../device/deviceSlice';

const DtrHelp = () => {
    const choice = useAppSelector(getChoiceUnsafely);
    if (choice.name !== 'Serial Modem') return null;

    return (
        <p className="tw-pt-2">
            DTR must be enabled on the board controller. Enable it in{' '}
            <AppLink
                app="pc-nrfconnect-board-configurator"
                label="Board Configurator"
            />
            , then retry the verification.
        </p>
    );
};

export default (config: Parameters<typeof Verify>[0]) =>
    Verify({ ...config, FailureHelp: DtrHelp });
