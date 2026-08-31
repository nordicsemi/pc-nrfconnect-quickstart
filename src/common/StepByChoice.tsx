/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type React from 'react';

import { useAppSelector } from '../app/store';
import { getChoiceUnsafely } from '../features/device/deviceSlice';

// I don't want to type arguments as unknown since this forces me to typecast them

export interface SwitchStepConfig<T> {
    defaultNode: ({
        config,
        ref,
    }: {
        config: T;
        ref: string;
    }) => React.ReactNode;
    configs: Record<
        string,
        | T
        | {
              customNode: ({ ref }: { ref?: string }) => React.ReactNode;
          }
    >;
}

const StepByChoice = <T,>({ defaultNode, configs }: SwitchStepConfig<T>) => {
    const choice = useAppSelector(getChoiceUnsafely);

    const config = configs[choice.name];

    return config && typeof config === 'object' && 'customNode' in config
        ? config.customNode({ ref: choice.name })
        : defaultNode({ config, ref: choice.name });
};

export default StepByChoice;
