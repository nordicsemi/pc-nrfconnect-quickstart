/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Verify from '../../../common/steps/91FamilyVerify';
import Apps from '../../../common/steps/Apps';
import Develop from '../../../common/steps/Develop';
import Evaluate from '../../../common/steps/Evaluate';
import Info from '../../../common/steps/Info';
import Learn from '../../../common/steps/Learn';
import Program from '../../../common/steps/Program';
import Rename from '../../../common/steps/Rename';
import { type Choice } from '../../device/deviceSlice';
import CustomEvaluate from './Evaluate';
import SIM from './SIM';

const infoConfig = {
    title: 'LTE Cat 1 bis, host and modem',
    markdownContent:
        '![nRF93M1 DK](93M1DK.png)  \n&nbsp;  \nThe nRF93M1 DK is the fastest way to evaluate the nRF93M1 and prototype an LTE Cat 1 bis cellular IoT application.  \n&nbsp;  \nThe board pairs the nRF93M1 module with an nRF54L15 host MCU over a UART link with hardware flow control. It includes a SEGGER J-Link OB debug probe, a nano-SIM (4FF) socket with an eSIM (MFF2) footprint, an SMA connector for the LTE antenna in the box, an nPM1300 PMIC, 64 Mb of external flash, programmable buttons and LEDs, GPIO and UART pin headers, and a current-measurement header for the Power Profiler Kit II.  \n&nbsp;  \n[Hardware documentation](https://www.nordicsemi.com/Products/Development-hardware/nRF93M1-DK)  \n&nbsp;  \n![nRF93M1 DK architecture](93M1Cores.png)  \nYou have two ways to work with the nRF93M1:  \n&nbsp;  \n**Option 1** *Recommended*  \nRun your application on the nRF54L15 host and let the host own the network stack. The host brings up a PPP link over CMUX to the modem and terminates DTLS and CoAP to [nRF Cloud](https://nrfcloud.com) itself, so credentials and transport stay under your control.  \n&nbsp;  \n**Option 2**  \nDrive the nRF93M1 directly with AT commands from a serial terminal. The modem runs its own nRF Cloud client, so you reach [location](https://www.nordicsemi.com/Products/Cloud-services), observability, and device management services without writing host application code.',
};

const programConfig = [
    {
        name: 'AT Commands',
        type: 'jlink-batch',
        description:
            'Send AT commands straight to the nRF93M1 from a serial terminal. The nRF54L15 host switches the modem UART into bypass mode and forwards it to the USB CDC-ACM port, so the modem answers your terminal directly.',
        documentation: {
            label: 'Modem bypass',
            href: 'https://nrfconnectdocs.nordicsemi.com/ncs/latest/nrf/samples/nrf93m1dk/modem_bypass/README.html',
        },
        programmingOptions: {
            firmwareList: [
                {
                    core: 'Application',
                    file: 'nrf93m1dk_modem_bypass.hex',
                    link: {
                        label: 'Modem bypass',
                        href: 'https://nrfconnectdocs.nordicsemi.com/ncs/latest/nrf/samples/nrf93m1dk/modem_bypass/README.html',
                    },
                },
            ],
        },
    },
    {
        name: 'PPP Host Application',
        type: 'jlink-batch',
        description:
            'Run the Serial Modem Host application on the nRF54L15. The host establishes a PPP link over CMUX to the nRF93M1 and terminates DTLS and CoAP to nRF Cloud itself for telemetry, location, and FOTA.',
        documentation: {
            label: 'Serial Modem Host application',
            href: 'https://github.com/nrfconnect/ncs-serial-modem-host-applications/tree/main/applications/93m1_ppp',
        },
        firmwareNote: {
            title: 'Credentials are stored on the host',
            content:
                'The application stores its TLS credentials in Protected Storage on the nRF54L15. Reprogramming with a full erase clears them, and you then need to provision the device again.',
        },
        programmingOptions: {
            firmwareList: [
                {
                    core: 'Application',
                    file: 'nrf93m1dk_ppp_shell.hex',
                    link: {
                        label: 'Serial Modem Host application',
                        href: 'https://github.com/nrfconnect/ncs-serial-modem-host-applications/tree/main/applications/93m1_ppp',
                    },
                },
            ],
        },
    },
] as Choice[];

const verificationConfig = {
    settings: [
        {
            ref: 'AT Commands',
            vComIndex: 1,
            mode: 'LINE' as const,
        },
        {
            ref: 'PPP Host Application',
            vComIndex: 0,
            mode: 'LINE' as const,
        },
    ],
    commands: [
        {
            title: 'Manufacturer',
            command: 'modem at "AT+CGMI"',
            responseRegex: '(.*)',
        },
        {
            title: 'Model',
            command: 'modem at "AT+CGMM"',
            responseRegex: '(.*)',
        },
        {
            title: 'Modem firmware version',
            command: 'modem at "AT+CGMR"',
            responseRegex: '(.*)',
        },
        {
            title: 'International Mobile Equipment Identity',
            command: 'modem at "AT+CGSN=1"',
            responseRegex: '\\+CGSN: "(.*)"',
            copiable: true,
        },
    ],
};

const evaluationConfig = [
    {
        ref: 'AT Commands',
        component: CustomEvaluate,
    },
    {
        ref: 'PPP Host Application',
        resources: [
            {
                title: 'Provision and onboard with nRF Cloud',
                mainLink: {
                    label: 'Open nRF Cloud setup',
                    href: 'https://start.nrfcloud.com/nRF93M1-DK',
                },
                description:
                    'The host holds its own credentials. Read the device ID from the boot log, install a device certificate with nRF Cloud Utils, and onboard the device. It then appears under Fleet, Devices in nRF Cloud.',
                supplementaryLinks: [
                    {
                        label: 'Provisioning steps for the PPP host application',
                        href: 'https://github.com/nrfconnect/ncs-serial-modem-host-applications/blob/main/applications/93m1_ppp/doc/README.md',
                    },
                    {
                        label: 'nRF Cloud device claiming',
                        href: 'https://docs.nrfcloud.com/docs/nrfcloud/claiming-device-ownership-portal',
                    },
                ],
            },
            {
                app: 'pc-nrfconnect-serial-terminal',
                description:
                    'Open the host console to read the device ID from the boot log and to drive the application shell. Use network connect to bring up the link, and modem at "<command>" to reach the modem.',
                vComIndex: 0,
                supplementaryLinks: [
                    {
                        label: 'nRF93M1 Command Reference Guide',
                        href: 'https://www.nordicsemi.com/-/media/Software-and-other-downloads/Product-Briefs/nrf93m1_cellular_at_commands_v0.9.pdf',
                    },
                ],
            },
        ],
    },
];

const learnConfig = [
    {
        label: 'Developer Academy',
        description:
            'Work through the Cellular IoT Fundamentals course to see how LTE networks, AT commands, and cloud connectivity fit together.',
        link: {
            label: 'Cellular IoT Fundamentals',
            href: 'https://academy.nordicsemi.com/courses/cellular-iot-fundamentals/',
        },
    },
    {
        label: 'nRF93M1 command reference',
        description:
            'Look up every AT command the nRF93M1 supports for network control, location, and nRF Cloud services.',
        link: {
            label: 'nRF93M1 Command Reference Guide',
            href: 'https://www.nordicsemi.com/-/media/Software-and-other-downloads/Product-Briefs/nrf93m1_cellular_at_commands_v0.9.pdf',
        },
    },
    {
        label: 'nRF Connect SDK and Zephyr',
        description:
            'Learn how application development works in the nRF Connect SDK and Zephyr.',
        link: {
            label: 'Application development',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/app_dev.html',
        },
    },
    {
        label: 'nRF93M1 DK board documentation',
        description:
            'Read the board documentation for the host and modem UART mapping, control signals, and supported features.',
        link: {
            label: 'nRF93M1 DK',
            href: 'https://nrfconnectdocs.nordicsemi.com/ncs/latest/zephyr/boards/nordic/nrf93m1dk/doc/index.html',
        },
    },
];

const developConfig = [
    {
        ref: 'AT Commands',
        sampleSource: 'nrf/samples/nrf93m1dk/modem_bypass',
    },
];

const appsConfig = [
    'pc-nrfconnect-serial-terminal',
    'pc-nrfconnect-programmer',
    'pc-nrfconnect-ppk',
];

export default {
    device: 'nRF93M1 DK',
    flow: [
        Info(infoConfig),
        Rename(),
        Program(programConfig),
        Verify(verificationConfig),
        SIM(),
        Evaluate(evaluationConfig),
        Learn(learnConfig),
        Develop(developConfig),
        Apps(appsConfig),
    ],
};
