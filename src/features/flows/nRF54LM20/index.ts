/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Apps from '../../../common/steps/Apps';
import Develop from '../../../common/steps/Develop';
import Evaluate from '../../../common/steps/Evaluate';
import Info from '../../../common/steps/Info';
import Learn from '../../../common/steps/Learn';
import Program from '../../../common/steps/Program';
import Rename from '../../../common/steps/Rename';
import { type Choice } from '../../device/deviceSlice';
import Verify from './Verify';

const infoConfig = {
    title: 'nRF54L Series – nRF54LM20 DK',
    markdownContent:
        '![nRF54LM20 DK](54LM20DK.png)  \n&nbsp;  \nThe nRF54LM20 DK enables development with nRF54LM20A SoC.  \n&nbsp;  \nnRF54LM20A is part of the nRF54L Series. All wireless System-on-Chip (SoC) options in the series integrate an ultra-low-power, multiprotocol 2.4-GHz radio and MCU functionality featuring a 128-MHz Arm Cortex-M33 processor. The nRF54LM20A features an extended peripheral set, high-speed USB, increased memory size with 2036 KB NVM and 512 KB RAM, and up to 66 GPIOs.  \n&nbsp;  \n![nRF54LM20 DK Technologies](54SeriesTech.png)  \nThe multiprotocol 2.4-GHz radio of nRF54LM20A supports Bluetooth® LE with optional features, including Channel Sounding introduced in Bluetooth Core 6.0, as well as 802.15.4-2020 for standards such as Thread, Matter, and Zigbee. It also supports a proprietary 2.4-GHz mode with up to 4 Mbps for higher throughput.  \n&nbsp;  \nFor more information, read the [datasheet](https://docs.nordicsemi.com/bundle/ps_nrf54LM20A/page/keyfeatures_html5.html) and visit the [nRF54LM20A SoC](https://www.nordicsemi.com/Products/nRF54LM20A) and the [nRF54LM20 DK](https://www.nordicsemi.com/Products/Development-hardware/nRF54LM20-DK) web pages.',
};

const programConfig = [
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
                    file: 'nrf54lm20dk_hello_world.hex',
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
                    file: 'nrf54lm20dk_lbs.hex',
                    link: {
                        label: 'Peripheral LBS',
                        href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/bluetooth/peripheral_lbs/README.html',
                    },
                },
            ],
        },
    },
    {
        name: 'Peripheral Power Profiling',
        type: 'jlink-batch',
        description:
            'Sample for measuring power consumption when Bluetooth® LE stack is used for communication.',
        documentation: {
            label: 'Peripheral Power Profiling',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/bluetooth/peripheral_power_profiling/README.html',
        },
        programmingOptions: {
            firmwareList: [
                {
                    core: 'Application',
                    file: 'nrf54lm20dk_power_profiling.hex',
                    link: {
                        label: 'Peripheral Power Profiling',
                        href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/bluetooth/peripheral_power_profiling/README.html',
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
                    file: 'nrf54lm20dk_peripheral_uart.hex',
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
        ref: 'Hello World',
        config: {
            vComIndex: 1,
            regex: /(\*{3} Booting nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3}\r\nHello World! nrf54lm20dk.*\r\n)/,
        },
    },
    {
        ref: 'Peripheral LED Button Service',
        config: {
            vComIndex: 1,
            regex: /(\*{3} Using nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3}\r\nStarting Bluetooth Peripheral LBS sample)/,
        },
    },
    {
        ref: 'Peripheral Power Profiling',
    },
    {
        ref: 'Peripheral UART',
        config: {
            vComIndex: 1,
            regex: /(\*{3} Using nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3}\r\nStarting Nordic UART service sample)/,
        },
    },
];

const evaluateConfig = [
    {
        ref: 'Hello World',
        resources: [
            {
                title: 'Test the sample',
                description:
                    'Open the nRF Connect Serial Terminal application and press reset on the device to print the output.',
                app: 'pc-nrfconnect-serial-terminal',
                vComIndex: 1,
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
        ref: 'Peripheral Power Profiling',
        resources: [
            {
                title: 'Test the sample',
                description:
                    'Follow the testing steps instructions to evaluate the sample.',
                mainLink: {
                    label: 'Testing steps',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/bluetooth/peripheral_power_profiling/README.html#testing',
                },
            },
            {
                title: 'Documentation',
                description: 'Read the complete documentation for the sample.',
                mainLink: {
                    label: 'Open documentation',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/bluetooth/peripheral_power_profiling/README.html',
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
        sampleSource: 'zephyr/samples/hello_world',
    },
    {
        ref: 'Peripheral LED Button Service',
        sampleSource: 'nrf/samples/bluetooth/peripheral_lbs',
    },
    {
        ref: 'Peripheral Power Profiling',
        sampleSource: 'nrf/samples/bluetooth/peripheral_uart',
    },
    {
        ref: 'Peripheral UART',
        sampleSource: 'nrf/samples/bluetooth/peripheral_uart',
    },
];

const appsConfig = [
    'pc-nrfconnect-ppk',
    'pc-nrfconnect-programmer',
    'pc-nrfconnect-serial-terminal',
    'pc-nrfconnect-board-configurator',
    'pc-nrfconnect-dtm',
];

export default {
    device: 'nRF54LM20 DK',
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
