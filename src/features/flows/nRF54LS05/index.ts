/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Verify from '../../../common/steps/5xFamilyVerify';
import Apps from '../../../common/steps/Apps';
import Develop from '../../../common/steps/Develop';
import { type DevelopConfig } from '../../../common/steps/Develop/OpenVsCode';
import Evaluate from '../../../common/steps/Evaluate';
import Info from '../../../common/steps/Info';
import Learn from '../../../common/steps/Learn';
import Program from '../../../common/steps/Program';
import Rename from '../../../common/steps/Rename';
import { type Choice } from '../../device/deviceSlice';
import CustomVerify from './Verify';

const infoConfig = {
    title: 'nRF54L Series – nRF54LS05 DK',
    markdownContent:
        '![nRF54LS05 DK](nRF54LS05DK.png)  \n&nbsp;  \nThe nRF54LS05 DK enables development with nRF54LS05A and nRF54LS05B SoCs.  \n&nbsp;  \nnRF54LS05A and nRF54LS05B are part of the nRF54L Series. All wireless System-on-Chip (SoC) options in the series integrate an ultra-low-power 2.4 GHz radio with MCU (Microcontroller Unit) functionality featuring a 128 MHz Arm® Cortex®-M33 processor.  \n&nbsp;  \n![nRF54LS05 DK Technologies](54LV10Tech.png)  \nThe nRF54LS05A and the larger-RAM nRF54LS05B feature a Bluetooth LE radio and an entry-level peripheral set, making them suitable as a main MCU for sensors, tags, beacons, remotes, and PC peripherals, as well as a Bluetooth companion device in larger systems.  \n&nbsp;  \nnRF54LS05A supports Bluetooth LE and 2.4 GHz proprietary protocols with data rates up to 4 Mbps for low-latency applications.  \n&nbsp;  \nFor the datasheet and more information, see the web pages for the [nRF54L05A SoC](https://www.nordicsemi.com/Products/nRF54LS05A), the [nRF54L05B SoC](https://www.nordicsemi.com/Products/nRF54LS05B), and the [nRF54LS05 DK](https://www.nordicsemi.com/Products/Development-hardware/nRF54LS05-DK).',
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
                    file: 'nrf54ls05dk_hello_world.hex',
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
                    file: 'nrf54ls05dk_lbs.hex',
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
                    file: 'nrf54ls05dk_power_profiling.hex',
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
                    file: 'nrf54ls05dk_peripheral_uart.hex',
                    link: {
                        label: 'Peripheral UART Service',
                        href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/bluetooth/peripheral_uart/README.html',
                    },
                },
            ],
        },
    },
] satisfies Choice[];

const verifyConfig = {
    'Hello World': {
        vComIndex: 0,
        regex: /(\*{3} Booting nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3}\r\nHello World! nrf54ls05dk.*\r\n)/,
    },

    'Peripheral LED Button Service': {
        vComIndex: 0,
        regex: /(\*{3} Using nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3}\r\nStarting Bluetooth Peripheral LBS sample)/,
    },

    'Peripheral Power Profiling': {
        customNode: CustomVerify,
    },
    'Peripheral UART': {
        vComIndex: 0,
        regex: /(\*{3} Using nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3}\r\nStarting Nordic UART service sample)/,
    },
};

const evaluateConfig = {
    'Hello World': [
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
    'Peripheral LED Button Service': [
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
    'Peripheral Power Profiling': [
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
    'Peripheral UART': [
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
};

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

const developConfig = {
    'Hello World': {
        type: 'sdk',
        params: {
            samplePath: 'zephyr/samples/hello_world',
        },
    },
    'Peripheral LED Button Service': {
        type: 'sdk',
        params: {
            samplePath: 'nrf/samples/bluetooth/peripheral_lbs',
        },
    },
    'Peripheral Power Profiling': {
        type: 'sdk',
        params: {
            samplePath: 'nrf/samples/bluetooth/peripheral_power_profiling',
        },
    },
    'Peripheral UART': {
        type: 'sdk',
        params: {
            samplePath: 'nrf/samples/bluetooth/peripheral_uart',
        },
    },
} satisfies DevelopConfig;

const appsConfig = [
    'pc-nrfconnect-ppk',
    'pc-nrfconnect-programmer',
    'pc-nrfconnect-serial-terminal',
    'pc-nrfconnect-board-configurator',
    'pc-nrfconnect-dtm',
];

export default {
    device: 'nRF54LS05 DK',
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
