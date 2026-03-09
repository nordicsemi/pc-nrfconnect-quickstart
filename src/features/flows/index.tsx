/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type React from 'react';

import NRF52 from './nRF52';
import NRF54L15 from './nRF54L15';
import NRF54LM20 from './nRF54LM20';
import NRF54LV10 from './nRF54LV10';
import NRF5340 from './nRF5340';
import NRF7002 from './nRF7002';
import NRF9151 from './nRF9151';
import NRF9151SMA from './nRF9151SMA';
import NRF9160 from './nRF9160';
import NRF9161 from './nRF9161';
import NRF52833 from './nRF52833';
import NRF52840 from './nRF52840';
import THINGY91X from './thingy91x';

export interface Flow {
    name: string;
    component: React.FC;
}

export default {
    [NRF52840.device]: NRF52840.flow,
    [NRF52833.device]: NRF52833.flow,
    [NRF52.device]: NRF52.flow,
    [NRF5340.device]: NRF5340.flow,
    [NRF7002.device]: NRF7002.flow,
    [NRF9160.device]: NRF9160.flow,
    [NRF9161.device]: NRF9161.flow,
    [NRF9151.device]: NRF9151.flow,
    [NRF9151SMA.device]: NRF9151SMA.flow,
    [NRF54L15.device]: NRF54L15.flow,
    [NRF54LM20.device]: NRF54LM20.flow,
    [NRF54LV10.device]: NRF54LV10.flow,
    [THINGY91X.device]: THINGY91X.flow,
} as Record<string, Flow[]>;
