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

export const nrf91LearnConfig: ResourceProps[] = [
    wirelessIotDeveloperAcademy,
    nrfConnectSdkAndZephyr,
    {
        label: 'Developing with nRF91 Series',
        description:
            'Device-specific information on working with nRF91 Series devices.',
        link: {
            label: 'Developing with nRF91 Series',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/app_dev/device_guides/nrf91/index.html',
        },
    },
    nrfCloud,
];
