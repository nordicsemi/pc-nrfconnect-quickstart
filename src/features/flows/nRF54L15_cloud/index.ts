/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Verify from '../../../common/steps/5xFamilyVerify';
import Apps from '../../../common/steps/Apps';
import Develop from '../../../common/steps/Develop';
import Evaluate from '../../../common/steps/Evaluate';
import Info from '../../../common/steps/Info';
import Learn from '../../../common/steps/Learn';
import Program from '../../../common/steps/Program';
import Rename from '../../../common/steps/Rename';
import { type Choice } from '../../device/deviceSlice';
import CloudEvaluate from './evaluate';

const infoConfig = {
    title: 'nRF54L Series – nRF54L15 DK',
    markdownContent:
        '![nRF54L15 DK](54L15DK.png)  \n&nbsp;  \nThe nRF54L15 DK features the nRF54L15 wireless SoC and can also emulate the nRF54L10 and nRF54L05.   \n&nbsp;  \nThe nRF54L15, nRF54L10, and nRF54L05 are part of the nRF54L Series. These wireless SoCs integrate an ultra-low-power, multiprotocol 2.4-GHz radio and MCU functionality featuring a 128-MHz Arm Cortex-M33 processor. They include a comprehensive peripheral set and scalable memory configurations, with 0.5 MB to 1.5 MB NVM and 96 KB to 256 KB RAM.  \n&nbsp;  \n![nRF54L15 DK Technologies](54SeriesTech.png)  \nThe multiprotocol 2.4-GHz radio of nRF54L15, nRF54L10, and nRF54L05 supports Bluetooth® LE with optional features, including Channel Sounding introduced in Bluetooth Core 6.0, as well as 802.15.4-2020 for standards such as Thread, Matter, and Zigbee. It also supports a proprietary 2.4-GHz mode with up to 4 Mbps for higher throughput.  \n&nbsp;  \nFor more information, read the [datasheet](https://docs.nordicsemi.com/bundle/ps_nrf54L15/page/keyfeatures_html5.html) and visit the [nRF54L15 SoC](https://www.nordicsemi.com/Products/nRF54L15) and the [nRF54L15 DK](https://www.nordicsemi.com/Products/Development-hardware/nRF54L15-DK) web pages.',
};

const programConfig = [
    {
        name: 'Cloud Connectivity',
        type: 'jlink-batch',
        description:
            "The Peripheral Memfault Diagnostic Service sample, configured to connect to a shared Memfault project (same project as for the OAT token). The device_id will be based on the hardware id of the device. It's based on two FICR words, and the value when the device shows up in memfault is opposite of what nrfutil prints, so they should be swapped when reading out from the quick start guide",
        documentation: {
            label: 'Bluetooth: Peripheral Memfault Diagnostic Service (MDS)',
            href: 'https://nrfconnectdocs.nordicsemi.com/ncs/latest/nrf/samples/bluetooth/peripheral_mds/README.html',
        },
        programmingOptions: {
            firmwareList: [
                {
                    core: 'Application',
                    file: 'nrf54l15dk_cloud.hex',
                    link: {
                        label: 'Bluetooth: Peripheral Memfault Diagnostic Service (MDS)',
                        href: 'https://nrfconnectdocs.nordicsemi.com/ncs/latest/nrf/samples/bluetooth/peripheral_mds/README.html',
                    },
                },
            ],
        },
    },
] as Choice[];

const verifyConfig = [
    {
        ref: 'Cloud Connectivity',
        config: {
            vComIndex: 1,
            regex: /(\*{3} Booting Quickstart Bluetooth .* \*{3}\r\n\*{3} Using nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3}\r\n)/,
        },
    },
];

const evaluateConfig = [
    {
        ref: 'Cloud Connectivity',
        component: CloudEvaluate,
    },
];

const learnConfig = [
    {
        label: 'Developer Academy',
        description:
            'Speed up your wireless IoT learning journey with Nordic devices.',
        link: {
            label: 'Nordic Developer Academy',
            href: 'https://academy.nordicsemi.com/',
        },
    },
    {
        label: 'nRF Connect SDK and Zephyr',
        description:
            'Learn about the application development in the nRF Connect SDK and Zephyr.',
        link: {
            label: 'Application development',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/app_dev.html',
        },
    },
    {
        label: 'Developing with nRF54L Series',
        description:
            'Device-specific information about features, DFU solution, and development.',
        link: {
            label: 'Developing with nRF54L Series',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/app_dev/device_guides/nrf54l/index.html',
        },
    },
];

const developConfig = [
    {
        ref: 'Cloud Connectivity',
        sampleSource: 'nrf/samples/bluetooth/peripheral_lbs',
    },
    {
        ref: 'Hello World',
        sampleSource: 'zephyr/samples/hello_world',
    },
    {
        ref: 'Peripheral LED Button Service',
        sampleSource: 'nrf/samples/bluetooth/peripheral_lbs',
    },
    {
        ref: 'Peripheral UART',
        sampleSource: 'nrf/samples/bluetooth/peripheral_uart',
    },
];

const appsConfig = [
    'pc-nrfconnect-programmer',
    'pc-nrfconnect-serial-terminal',
    'pc-nrfconnect-board-configurator',
    'pc-nrfconnect-dtm',
];

export default {
    device: 'nRF54L15 DK',
    flow: [
        Info(infoConfig),
        Rename(),
        Program(programConfig),
        Verify(verifyConfig),
        Evaluate(evaluateConfig),
        Learn(learnConfig),
        Develop(developConfig),
        Apps(appsConfig),
    ],
};
