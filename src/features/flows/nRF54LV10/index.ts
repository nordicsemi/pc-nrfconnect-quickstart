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
    title: 'nRF54L Series – nRF54LV10 DK',
    markdownContent:
        '![nRF54LV10 DK](54LV10DK.png)  \n&nbsp;  \nThe nRF54LV10 DK enables development with the nRF54LV10A SoC.  \n&nbsp;  \nnRF54LV10A is part of the nRF54L Series. All wireless System-on-Chip (SoC) options in the series integrate an ultra-low-power multiprotocol 2.4 GHz radio with MCU (Microcontroller Unit) functionality featuring a 128 MHz Arm® Cortex®-M33 processor.  \n&nbsp;  \n![nRF54LV10 DK Technologies](54LV10Tech.png)  \nnRF54LV10A is designed for applications requiring a low-voltage, 1.2-1.7V power supply and GPIOs. These include direct supply from silver oxide coin-cells. In these applications, the built-in hibernation mode extends the shelf life of devices with an enclosed battery. Additionally, low-voltage GPIO simplifies integration with external devices with voltage-limited IO interfaces.  \n&nbsp;  \nThe datasheet for the SoC and more information can be found on the web pages for the [nRF54LV10A SoC](https://www.nordicsemi.com/Products/nRF54LV10A) and the [nRF54LV10 DK](https://www.nordicsemi.com/Products/Development-hardware/nRF54LV10-DK).',
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
                    file: 'nrf54lv10dk_hello_world.hex',
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
                    file: 'nrf54lv10dk_lbs.hex',
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
                    file: 'nrf54lv10dk_power_profiling.hex',
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
                    file: 'nrf54lv10dk_peripheral_uart.hex',
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
            vComIndex: 0,
            regex: /(\*{3} Booting nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3}\r\nHello world from nrf54lv10dk.*\r\n)/,
        },
    },
    {
        ref: 'Peripheral LED Button Service',
        config: {
            vComIndex: 0,
            regex: /(\*{3} Using nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3}\r\nStarting Bluetooth Peripheral LBS sample)/,
        },
    },
    {
        ref: 'Peripheral Power Profiling',
    },
    {
        ref: 'Peripheral UART',
        config: {
            vComIndex: 0,
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
                vComIndex: 0,
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
    device: 'nRF54LV10 DK',
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
