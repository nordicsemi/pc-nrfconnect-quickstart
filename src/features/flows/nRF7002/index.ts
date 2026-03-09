/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
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
    title: 'Development Kit for nRF7002 Wi-Fi 6 companion IC',
    markdownContent:
        "![nRF7002 DK](7002DK.png)  \n&nbsp;  \nThe nRF7002 DK is the development kit for the nRF7002, and nRF7001 Wi-Fi 6 Companion ICs. It contains everything needed to get started developing on a single board. The DK features an nRF5340 multiprotocol System-on-Chip (SoC) as a host processor for the nRF7002.  \n&nbsp;  \n&nbsp;  \n![Technologies](7002DKTech.png)  \n&nbsp;  \nThe DK supports the development of low-power Wi-Fi applications and enables Wi-Fi 6 features like OFDMA, Beamforming, and Target Wake Time.  \n&nbsp;  \nThe nRF7002 is a Wi-Fi 6 companion IC, providing seamless connectivity and Wi-Fi-based locationing (SSID sniffing of local Wi-Fi hubs). It is designed to be used alongside Nordic's existing nRF52® and nRF53® Series Bluetooth Systems-on-Chip (SoCs), and nRF91® Series cellular IoT Systems-in-Package (SiPs). The nRF7002 can also be used in conjunction with non-Nordic host devices.  \n&nbsp;  \nTo communicate with the host, SPI or QSPI can be used, and an extra coexistence feature allows for seamless coexistence with other protocols like Bluetooth, Thread, or Zigbee. The nRF7002 is integrated and supported in Nordic's nRF Connect SDK and the nRF7002 DK can also be used to emulate the nRF7001.  \n&nbsp;  \n[Hardware documentation](https://docs.nordicsemi.com/bundle/ug_nrf7002_dk/page/UG/nrf7002_DK/intro.html)",
};

const programConfig = [
    {
        name: 'Hello World',
        type: 'jlink-batch',
        description: 'Print "Hello World" to a console using UART.',
        documentation: {
            label: 'Hello World',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/zephyr/samples/hello_world/README.html',
        },
        programmingOptions: {
            firmwareList: [
                {
                    core: 'Application',
                    file: 'nrf53dk_hello_world.hex',
                    link: {
                        label: 'Hello World',
                        href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/zephyr/samples/hello_world/README.html',
                    },
                },
            ],
        },
    },
    {
        name: 'Wi-Fi Scan',
        type: 'jlink-batch',
        description:
            'Sample for scanning for Wi-Fi access points using the nRF7002 companion IC.',
        documentation: {
            label: 'Wi-Fi Scan',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/wifi/scan/README.html',
        },
        programmingOptions: {
            firmwareList: [
                {
                    core: 'Application',
                    file: 'nrf7002dk_wifi_scan_sample_ncs2.9.0.hex',
                    link: {
                        label: 'Wi-Fi Scan',
                        href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/wifi/scan/README.html',
                    },
                },
            ],
        },
    },
    {
        name: 'Wi-Fi Bluetooth LE Provisioning',
        type: 'jlink-batch',
        description:
            'Sample for provisioning Wi-Fi credentials over Bluetooth Low Energy.',
        documentation: {
            label: 'Wi-Fi Bluetooth LE based provision',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/wifi/provisioning/ble/README.html',
        },
        programmingOptions: {
            firmwareList: [
                {
                    core: 'Application',
                    file: 'nrf7002dk_wifi_ble_provisioning_sample_ncs2.9.0_merged.hex',
                    link: {
                        label: 'Wi-Fi Bluetooth LE based provision',
                        href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/wifi/provisioning/ble/README.html',
                    },
                },
                {
                    core: 'Network',
                    file: 'nrf7002dk_wifi_ble_provisioning_sample_ncs2.9.0_merged_CPUNET.hex',
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
            regex: /(\*{3} Booting nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3}\r\nHello World! nrf5340dk\/nrf5340\/cpuapp)/,
        },
    },
    {
        ref: 'Wi-Fi Scan',
        config: {
            vComIndex: 1,
            regex: /(\*{3} Booting nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3})/,
        },
    },
    {
        ref: 'Wi-Fi Bluetooth LE Provisioning',
        config: {
            vComIndex: 1,
            regex: /(\*{3} Booting nRF Connect SDK .* \*{3}\r\n\*{3} Using Zephyr OS .* \*{3})/,
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
        ref: 'Wi-Fi Scan',
        resources: [
            {
                title: 'Test the sample',
                description:
                    'Open the nRF Connect Serial Terminal application to view the scan results of nearby Wi-Fi access points.',
                app: 'pc-nrfconnect-serial-terminal',
                vComIndex: 1,
            },
            {
                title: 'Documentation',
                description: 'Read the complete documentation for the sample.',
                mainLink: {
                    label: 'Open documentation',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/wifi/scan/README.html',
                },
            },
        ],
    },
    {
        ref: 'Wi-Fi Bluetooth LE Provisioning',
        resources: [
            {
                title: 'Test the sample',
                description:
                    'Follow the testing steps to provision Wi-Fi credentials over Bluetooth LE.',
                mainLink: {
                    label: 'Testing steps',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/wifi/provisioning/ble/README.html#testing',
                },
            },
            {
                title: 'Documentation',
                description: 'Read the complete documentation for the sample.',
                mainLink: {
                    label: 'Open documentation',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/wifi/provisioning/ble/README.html',
                },
            },
        ],
    },
];

const learnConfig = [
    {
        label: 'Developer Academy',
        description:
            'Get the know-how to build wireless products using Nordic Semiconductor solutions.',
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
        label: 'Developing with nRF70 Series',
        description:
            'Device-specific information about features, connectivity, and development.',
        link: {
            label: 'Developing with nRF70 Series',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/app_dev/device_guides/nrf70/index.html',
        },
    },
];

const developConfig = [
    {
        ref: 'Hello World',
        sampleSource: 'zephyr/samples/hello_world',
    },
    {
        ref: 'Wi-Fi Scan',
        sampleSource: 'nrf/samples/wifi/scan',
    },
    {
        ref: 'Wi-Fi Bluetooth LE Provisioning',
        sampleSource: 'nrf/samples/wifi/provisioning/ble',
    },
];

const appsConfig = [
    'pc-nrfconnect-programmer',
    'pc-nrfconnect-serial-terminal',
];

export default {
    device: 'nRF7002 DK',
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
