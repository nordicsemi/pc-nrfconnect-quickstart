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
import { nrf54LLearnConfig } from './learnConfig';

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
        ncsAddon:
            'app=quickstart-bluetooth&branch=v1.1.1&manifest=&repo=https://github.com/nrfconnect/quickstart-bluetooth',
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
    {
        name: 'Hello World',
        type: 'jlink-batch',
        description: 'Print "Hello World" to a console over UART.',
        documentation: {
            label: 'Hello World',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/zephyr/samples/hello_world/README.html',
        },
        programmingOptions: {
            firmwareList: [
                {
                    core: 'Application',
                    file: 'nrf54l15dk_hello_world.hex',
                    link: {
                        label: 'Hello World',
                        href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/zephyr/samples/hello_world/README.html',
                    },
                },
            ],
        },
    },
    {
        name: 'Peripheral LED Button Service',
        type: 'jlink-batch',
        description:
            'Sample for controlling LEDs and buttons on the DK. Test it with Bluetooth® LE in the Evaluate step.',
        documentation: {
            label: 'Peripheral LBS',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/bluetooth/peripheral_lbs/README.html',
        },
        programmingOptions: {
            firmwareList: [
                {
                    core: 'Application',
                    file: 'nrf54l15dk_lbs.hex',
                    link: {
                        label: 'Peripheral LBS',
                        href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/bluetooth/peripheral_lbs/README.html',
                    },
                },
            ],
        },
    },
    {
        name: 'Peripheral UART',
        type: 'jlink-batch',
        description:
            'Sample for emulating UART over Bluetooth® LE. Test it with Bluetooth® LE in the Evaluate step.',
        documentation: {
            label: 'Peripheral UART',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/bluetooth/peripheral_uart/README.html',
        },
        programmingOptions: {
            firmwareList: [
                {
                    core: 'Application',
                    file: 'nrf54l15dk_peripheral_uart.hex',
                    link: {
                        label: 'Peripheral UART Service',
                        href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/bluetooth/peripheral_uart/README.html',
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
    {
        ref: 'Hello World',
        config: {
            vComIndex: VCOM_INDEX,
            regex: /(\*{3} Booting nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3}\r\nHello World! nrf54l15dk.*\r\n)/,
        },
    },
    {
        ref: 'Peripheral LED Button Service',
        config: {
            vComIndex: VCOM_INDEX,
            regex: /(\*{3} Using nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3}\r\nStarting Bluetooth Peripheral LBS sample)/,
        },
    },
    {
        ref: 'Peripheral UART',
        config: {
            vComIndex: VCOM_INDEX,
            regex: /(\*{3} Using nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3}\r\nStarting Nordic UART service sample)/,
        },
    },
];

const evaluateConfig = [
    {
        ref: 'nRF Cloud Bluetooth Quick Start',
        component: () => CloudEvaluate({ vComIndex: VCOM_INDEX }),
    },
    {
        ref: 'Hello World',
        resources: [
            {
                title: 'Test the sample',
                description:
                    'Open the nRF Connect Serial Terminal application and press reset on the device to print the output.',
                app: 'pc-nrfconnect-serial-terminal',
                vComIndex: VCOM_INDEX,
            },
            {
                title: 'Documentation',
                description: 'Read the complete documentation for the sample.',
                mainLink: {
                    label: 'Open documentation',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/zephyr/samples/hello_world/README.html',
                },
            },
        ],
    },
    {
        ref: 'Peripheral LED Button Service',
        resources: [
            {
                title: 'Test the sample',
                description: 'Follow the testing steps to evaluate the sample.',
                mainLink: {
                    label: 'Testing steps',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/bluetooth/peripheral_lbs/README.html#testing',
                },
            },
            {
                title: 'Documentation',
                description: 'Read the complete documentation for the sample.',
                mainLink: {
                    label: 'Open documentation',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/bluetooth/peripheral_lbs/README.html',
                },
            },
        ],
    },
    {
        ref: 'Peripheral UART',
        resources: [
            {
                title: 'Test the sample',
                description:
                    'Follow the testing steps instructions to evaluate the sample.',
                mainLink: {
                    label: 'Testing steps',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/bluetooth/peripheral_uart/README.html#testing',
                },
            },
            {
                title: 'Documentation',
                description: 'Read the complete documentation for the sample.',
                mainLink: {
                    label: 'Open documentation',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/bluetooth/peripheral_uart/README.html',
                },
            },
        ],
    },
];

const developConfig = [
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
        Learn(nrf54LLearnConfig),
        Develop(developConfig),
        Apps(appsConfig),
    ],
};
