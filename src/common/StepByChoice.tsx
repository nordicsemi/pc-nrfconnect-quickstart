/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type React from 'react';

import { useAppSelector } from '../app/store';
import { getChoiceUnsafely } from '../features/device/deviceSlice';

export default ({
    steps,
}: {
    steps: Record<string, () => React.ReactNode>;
}) => {
    const choice = useAppSelector(getChoiceUnsafely);

    return steps[choice.name]?.() || null;
};
