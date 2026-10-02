/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type ResourceProps } from '../../../common/Resource';
import {
    nrfCloud,
    nrfConnectSdkAndZephyr,
    wirelessIotDeveloperAcademy,
} from '../learnConfig';

export const nrf54LLearnConfig: ResourceProps[] = [
    wirelessIotDeveloperAcademy,
    nrfConnectSdkAndZephyr,
    {
        label: 'Developing with nRF54L Series',
        description:
            'Device-specific information about features, DFU solution, and development.',
        link: {
            label: 'Developing with nRF54L Series',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/app_dev/device_guides/nrf54l/index.html',
        },
    },
    nrfCloud,
];
