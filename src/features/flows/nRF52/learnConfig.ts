/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type ResourceProps } from '../../../common/Resource';
import {
    developerAcademy,
    nrfCloud,
    nrfConnectSdkAndZephyr,
} from '../learnConfig';

export const nrf52LearnConfig: ResourceProps[] = [
    developerAcademy,
    nrfConnectSdkAndZephyr,
    {
        label: 'Developing with nRF52 Series',
        description:
            'Device-specific information about features, DFU solution, and development.',
        link: {
            label: 'Developing with nRF52 Series',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/app_dev/device_guides/nrf52/index.html',
        },
    },
    nrfCloud,
];
