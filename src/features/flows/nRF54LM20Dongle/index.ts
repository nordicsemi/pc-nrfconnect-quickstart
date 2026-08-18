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

const infoConfig = {
    title: 'nRF54L Series – nRF54LM20 Dongle',
    markdownContent:
        '![nRF54LM20 Dongle](54LM20Dongle.png)  \n&nbsp;  \nThe nRF54LM20 Dongle is a small, low cost development board to enable rapid prototyping with the nRF54LM20B SoC.  \n&nbsp;  \nThe nRF54LM20B SoC is the most powerful part of the nRF54L Series. It integrates an ultra-low-power, multiprotocol 2.4 GHz radio and MCU functionality featuring a 128 MHz Arm Cortex-M33 processor and a 128 MHz RISC-V coprocessor. The SoC has 2036KB of NVM and 512KB of RAM, and 66 GPIO in total, 25 which are available in the side pads.  \n&nbsp;  \nIt also integrates an Axon Neural Processing Unit (NPU), which increases the speed and efficiency of on-device AI inference by up to 15x compared to the same task running on the CPU.  \n&nbsp;  \n![nRF54LM20 Dongle Technologies](54LM20DongleTech.png)  \nThe multiprotocol 2.4 GHz radio supports Bluetooth® LE with optional features including Channel Sounding introduced in Bluetooth Core 6.0, as well as 802.15.4-2020 for standards such as Thread®, Matter, and Zigbee®, and a proprietary 2.4 GHz mode supporting up to 4 Mbps for higher throughput.  \n&nbsp;  \nFor the full datasheet and information, see the webpages for the [nRF54LM20B](https://www.nordicsemi.com/Products/nRF54LM20B) and [nRF54LM20 Dongle](https://www.nordicsemi.com/Products/Development-hardware/nRF54LM20-Dongle).  \n&nbsp;  \nBecause of its small size, the nRF54LM20 Dongle does not have an on board debugger, but it comes preloaded with a firmware that enables DFU by the USB port, to speed up the first steps.  \n&nbsp;  \nThe nRF54LM20 Dongle also has an [nPM1300](https://www.nordicsemi.com/Products/nPM1300), which is connected to the nRF54LM20B by the I2C bus, and has dedicated separate battery pin and NTC lines, which simplifies the design and testing of battery powered prototypes.  ',
};

const programConfig = [
    {
        name: 'Central UART',
        type: 'jlink-batch',
        description:
            //  TODO: Put real description
            '-',
        documentation: {
            label: 'Central UART',
            href: 'https://nrfconnectdocs.nordicsemi.com/ncs/latest/nrf/samples/bluetooth/central_uart/README.html',
        },
        programmingOptions: {
            firmwareList: [
                {
                    core: 'Application',
                    file: 'nrf54lm20dongle_central_uart.hex',
                    link: {
                        label: 'Central UART Service',
                        href: 'https://nrfconnectdocs.nordicsemi.com/ncs/latest/nrf/samples/bluetooth/central_uart/README.html',
                    },
                },
            ],
        },
    },
] as Choice[];

const verifyConfig = [
    {
        //  TODO: To confirm
        ref: 'Central UART',
        config: {
            vComIndex: 1,
            regex: /(\*{3} Using nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3}\r\nStarting Nordic UART service sample)/,
        },
    },
];

const evaluateConfig = [
    {
        //  TODO: To confirm
        ref: 'Central UART',
        resources: [
            {
                title: 'Test the sample',
                description:
                    'Follow the testing steps instructions to evaluate the sample.',
                mainLink: {
                    label: 'Testing steps',
                    href: 'https://nrfconnectdocs.nordicsemi.com/ncs/latest/nrf/samples/bluetooth/central_uart/README.html#testing',
                },
            },
            {
                title: 'Documentation',
                description: 'Read the complete documentation for the sample.',
                mainLink: {
                    label: 'Open documentation',
                    href: 'https://nrfconnectdocs.nordicsemi.com/ncs/latest/nrf/samples/bluetooth/central_uart/README.html',
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
        //  TODO: To confirm
        ref: 'Central UART',
        sampleSource: 'nrf/samples/bluetooth/central_uart',
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
    device: 'nRF54LM20 Dongle',
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
