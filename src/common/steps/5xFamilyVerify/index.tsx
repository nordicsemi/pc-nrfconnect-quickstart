/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import StepByChoice from '../../StepByChoice';
import Verify from './Verify';

interface Config {
    vComIndex: number;
    regex: RegExp;
}
export default (
    configs: Record<string, Config | { customNode: () => React.ReactNode }>,
) => ({
    name: 'Verify',
    component: () =>
        StepByChoice<Config>({
            defaultNode: Verify,
            configs,
        }),
});
