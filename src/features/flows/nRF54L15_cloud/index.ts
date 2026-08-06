/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Verify from '../../../common/steps/5xFamilyVerify';
import Apps from '../../../common/steps/Apps';
import Develop from '../../../common/steps/Develop';
import { type SampleWithRef } from '../../../common/steps/Develop/OpenVsCode';
import Evaluate from '../../../common/steps/Evaluate';
import Info from '../../../common/steps/Info';
import Learn from '../../../common/steps/Learn';
import Program from '../../../common/steps/Program';
import Rename from '../../../common/steps/Rename';
import { type Choice } from '../../device/deviceSlice';
import CloudEvaluate from './evaluate';

const VCOM_INDEX = 1;

const infoConfig = {
    title: 'nRF54L Series – nRF54L15 DK',
    markdownContent:
        '![nRF54L15 DK](54L15DK.png)  \n&nbsp;  \nThe nRF54L15 DK features the nRF54L15 wireless SoC and can also emulate the nRF54L10 and nRF54L05.   \n&nbsp;  \nThe nRF54L15, nRF54L10, and nRF54L05 are part of the nRF54L Series. These wireless SoCs integrate an ultra-low-power, multiprotocol 2.4-GHz radio and MCU functionality featuring a 128-MHz Arm Cortex-M33 processor. They include a comprehensive peripheral set and scalable memory configurations, with 0.5 MB to 1.5 MB NVM and 96 KB to 256 KB RAM.  \n&nbsp;  \n![nRF54L15 DK Technologies](54SeriesTech.png)  \nThe multiprotocol 2.4-GHz radio of nRF54L15, nRF54L10, and nRF54L05 supports Bluetooth® LE with optional features, including Channel Sounding introduced in Bluetooth Core 6.0, as well as 802.15.4-2020 for standards such as Thread, Matter, and Zigbee. It also supports a proprietary 2.4-GHz mode with up to 4 Mbps for higher throughput.  \n&nbsp;  \nFor more information, read the [datasheet](https://docs.nordicsemi.com/bundle/ps_nrf54L15/page/keyfeatures_html5.html) and visit the [nRF54L15 SoC](https://www.nordicsemi.com/Products/nRF54L15) and the [nRF54L15 DK](https://www.nordicsemi.com/Products/Development-hardware/nRF54L15-DK) web pages.',
};

const programConfig = [
    {
        name: 'nRF Cloud Bluetooth Quick Start',
        type: 'jlink-batch',
        description:
            "This sample turns your nRF54L15 DK into a Bluetooth LE peripheral with cloud-based device health monitoring built in. The device reports heartbeats over Bluetooth. Once connected and paired, you'll see your board in nRF Cloud. Pressing a button triggers a fake crash, which sends a coredump over Bluetooth to nRF Cloud.",
        documentation: {
            label: 'nRF Cloud Bluetooth Quick Start',
            href: 'https://github.com/nrfconnect/quickstart-bluetooth',
        },
        programmingOptions: {
            firmwareList: [
                {
                    core: 'Application',
                    file: 'nrf54l15dk_quickstart_bluetooth.hex',
                    elfFile: 'nrf54l15dk_quickstart_bluetooth.elf',
                    link: {
                        label: 'nRF Cloud Bluetooth Quick Start',
                        href: 'https://github.com/nrfconnect/quickstart-bluetooth',
                    },
                },
            ],
        },
    },
] as Choice[];

const verifyConfig = [
    {
        ref: 'nRF Cloud Bluetooth Quick Start',
        config: {
            vComIndex: VCOM_INDEX,
            regex: /(\*{3} Booting Quickstart Bluetooth .* \*{3}\r\n\*{3} Using nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3}\r\n)/,
        },
    },
];

const evaluateConfig = [
    {
        ref: 'nRF Cloud Bluetooth Quick Start',
        component: () => CloudEvaluate({ vComIndex: VCOM_INDEX }),
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
        ref: 'Hello World',
        type: 'sdk',
        params: {
            samplePath: 'zephyr/samples/hello_world',
        },
    },
    {
        ref: 'Peripheral LED Button Service',
        type: 'sdk',
        params: {
            samplePath: 'nrf/samples/bluetooth/peripheral_lbs',
        },
    },
    {
        ref: 'Peripheral UART',
        type: 'sdk',
        params: {
            samplePath: 'nrf/samples/bluetooth/peripheral_uart',
        },
    },
] satisfies SampleWithRef[];

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
