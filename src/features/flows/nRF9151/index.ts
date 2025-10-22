/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
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
import { Choice } from '../../device/deviceSlice';
import CustomEvaluate from './Evaluate';
import SIM from './SIM';

const infoConfig = {
    title: 'Massive IoT Powerhouse',
    markdownContent:
        "![nRF9151 DK](9151DK.png)  \n&nbsp;  \nThe nRF9151 Development Kit is perfect for evaluating the nRF9151 SiP and developing cellular IoT or DECT NR+ applications.  \n&nbsp;  \nIt includes SEGGER's J-Link OB debug probe and all the necessary external circuitry, like (e)SIM interface, antennas, access to all IO pins, programmable buttons, and module interfaces.  \n&nbsp;  \n[Hardware documentation](https://docs.nordicsemi.com/bundle/ug_nrf9151_dk/page/UG/nrf91_DK/intro.html)  \n&nbsp;  \n![nRF9151 SiP Cores](9151Cores.png)  \nYou have two options for leveraging the nRF9151 SiP:  \n&nbsp;  \n**Option 1** *Recommended*  \nHarness the full potential of nRF9151 by using the entire application core for your code, eliminating the need for an external MCU, and fully capitalizing on the advantages offered by nRF9151.  \n&nbsp;  \n**Option 2**  \nIntegrate nRF9151 as a [cellular](https://www.nordicsemi.com/Products/Low-power-cellular-IoT/What-is-cellular-IoT#infotabs) or [NR+](https://www.nordicsemi.com/Products/DECT-NR) modem alongside your existing design running a serial AT command set on the application core.",
};

const programConfig = [
    {
        name: 'Asset Tracker',
        type: 'action-list',
        description:
            'Provision and connect to your own nRF Cloud account. The Asset Tracker Template is a customizable, power-optimized application framework that provides cloud-connected, battery-efficient asset tracking and sensor data collection.',
        documentation: {
            label: 'Asset Tracker Template',
            href: 'https://docs.nordicsemi.com/bundle/asset-tracker-template-latest/page/index.html',
        },
        firmwareNote: {
            title: 'Increased power consumption',
            content:
                'Modem Trace is enabled; the current consumption will be higher than usual.',
        },
        programmingOptions: {
            actions: [
                {
                    type: 'program-modem-firmware',
                    version: '2.0.4',
                    vComIndex: 0,
                    firmware: {
                        core: 'Modem',
                        file: 'mfw_nrf91x1_2.0.4.zip',
                        link: {
                            label: 'Firmware v2.0.4',
                            href: 'https://nsscprodmedia.blob.core.windows.net/prod/software-and-other-downloads/sip/nrf91x1-sip/nrf91x1-lte-modem-firmware/release-notes/mfw_nrf91x1_2.0.4_release_notes.txt',
                        },
                    },
                },
                {
                    type: 'wait',
                    durationMs: 2000,
                },
                {
                    type: 'program',
                    firmware: {
                        core: 'Application',
                        file: 'nrf9151dk_asset_tracker_template.hex',
                        link: {
                            label: 'Asset Tracker',
                            href: 'https://docs.nordicsemi.com/bundle/asset-tracker-template-latest/page/index.html',
                        },
                    },
                },
                {
                    type: 'reset',
                },
            ],
        },
    },
    {
        name: 'AT Commands',
        type: 'action-list',
        description: 'Evaluate the cellular modem using AT commands.',
        documentation: {
            label: 'Serial LTE Modem',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/applications/serial_lte_modem/README.html',
        },
        firmwareNote: {
            title: 'Increased power consumption',
            content:
                'Modem Trace is enabled; the current consumption will be higher than usual.',
        },
        programmingOptions: {
            actions: [
                {
                    type: 'program-modem-firmware',
                    version: '2.0.4',
                    vComIndex: 0,
                    firmware: {
                        core: 'Modem',
                        file: 'mfw_nrf91x1_2.0.4.zip',
                        link: {
                            label: 'Firmware v2.0.4',
                            href: 'https://nsscprodmedia.blob.core.windows.net/prod/software-and-other-downloads/sip/nrf91x1-sip/nrf91x1-lte-modem-firmware/release-notes/mfw_nrf91x1_2.0.4_release_notes.txt',
                        },
                    },
                },
                {
                    type: 'wait',
                    durationMs: 2000,
                },
                {
                    type: 'program',
                    firmware: {
                        core: 'Application',
                        file: 'nrf9151dk_serial_lte_modem.hex',
                        link: {
                            label: 'Serial LTE Modem',
                            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/applications/serial_lte_modem/README.html',
                        },
                    },
                },
                {
                    type: 'reset',
                },
            ],
        },
    },
    {
        name: 'Shell Command Line Interface',
        type: 'action-list',
        description: 'Evaluate throughput, connectivity, and more.',
        documentation: {
            label: 'Modem Shell',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/cellular/modem_shell/README.html',
        },
        firmwareNote: {
            title: 'Increased power consumption',
            content:
                'Modem Trace is enabled; the current consumption will be higher than usual.',
        },
        programmingOptions: {
            actions: [
                {
                    type: 'program-modem-firmware',
                    version: '2.0.4',
                    vComIndex: 0,
                    firmware: {
                        core: 'Modem',
                        file: 'mfw_nrf91x1_2.0.4.zip',
                        link: {
                            label: 'Firmware v2.0.4',
                            href: 'https://nsscprodmedia.blob.core.windows.net/prod/software-and-other-downloads/sip/nrf91x1-sip/nrf91x1-lte-modem-firmware/release-notes/mfw_nrf91x1_2.0.4_release_notes.txt',
                        },
                    },
                },
                {
                    type: 'wait',
                    durationMs: 2000,
                },
                {
                    type: 'program',
                    firmware: {
                        core: 'Application',
                        file: 'nrf9151dk_modem_shell.hex',
                        link: {
                            label: 'Modem Shell',
                            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/cellular/modem_shell/README.html',
                        },
                    },
                },
                {
                    type: 'reset',
                },
            ],
        },
    },
    {
        name: 'Legacy Asset Tracker',
        type: 'action-list',
        description:
            'Evaluate cloud interaction, location services, GNSS, and real-time configurations.',
        documentation: {
            label: 'Asset Tracker v2',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/applications/asset_tracker_v2/README.html',
        },
        firmwareNote: {
            title: 'Increased power consumption',
            content:
                'Modem Trace is enabled; the current consumption will be higher than usual.',
        },
        programmingOptions: {
            actions: [
                {
                    type: 'program-modem-firmware',
                    version: '2.0.4',
                    vComIndex: 0,
                    firmware: {
                        core: 'Modem',
                        file: 'mfw_nrf91x1_2.0.4.zip',
                        link: {
                            label: 'Firmware v2.0.4',
                            href: 'https://nsscprodmedia.blob.core.windows.net/prod/software-and-other-downloads/sip/nrf91x1-sip/nrf91x1-lte-modem-firmware/release-notes/mfw_nrf91x1_2.0.4_release_notes.txt',
                        },
                    },
                },
                {
                    type: 'wait',
                    durationMs: 2000,
                },
                {
                    type: 'program',
                    firmware: {
                        core: 'Application',
                        file: 'nrf9161dk_asset_tracker.hex',
                        link: {
                            label: 'Asset Tracker v2',
                            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/applications/asset_tracker_v2/README.html',
                        },
                    },
                },
                {
                    type: 'reset',
                },
            ],
        },
    },
] as Choice[];

const verificationConfig = {
    settings: [
        {
            ref: 'Asset Tracker',
            vComIndex: 0,
            mode: 'SHELL' as const,
        },
        {
            ref: 'AT Commands',
            vComIndex: 0,
            mode: 'LINE' as const,
        },
        {
            ref: 'Shell Command Line Interface',
            vComIndex: 0,
            mode: 'SHELL' as const,
        },
        {
            ref: 'Legacy Asset Tracker',
            vComIndex: 0,
            mode: 'LINE' as const,
        },
    ],
    commands: [
        {
            title: 'Manufacturer',
            command: 'AT+CGMI',
            responseRegex: '(.*)',
        },
        {
            title: 'Hardware version',
            command: 'AT%HWVERSION',
            responseRegex: '%HWVERSION: (.*)',
        },
        {
            title: 'International Mobile Equipment Identity',
            command: 'AT+CGSN=1',
            responseRegex: '\\+CGSN: "(.*)"',
            copiable: true,
        },
    ],
};

const evaluationConfig = [
    {
        ref: 'Asset Tracker',
        component: CustomEvaluate,
    },
    {
        ref: 'AT Commands',
        resources: [
            {
                app: 'pc-nrfconnect-serial-terminal',
                description:
                    'Use the Serial Terminal desktop application as a serial interface to send AT commands to the device.',
                vComIndex: 0,
                links: [
                    {
                        label: 'AT Commands reference manual',
                        href: 'https://docs.nordicsemi.com/bundle/ref_at_commands_nrf91x1/page/REF/at_commands/intro_nrf91x1.html',
                    },
                    {
                        label: 'IP AT Commands Documentation',
                        href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/applications/serial_lte_modem/doc/AT_commands.html',
                    },
                ],
            },
            {
                app: 'pc-nrfconnect-cellularmonitor',
                description: 'Automatically connect and evaluate parameters.',
            },
        ],
    },
    {
        ref: 'Shell Command Line Interface',
        resources: [
            {
                app: 'pc-nrfconnect-serial-terminal',
                description: 'Serial interface to send commands to the device.',
                vComIndex: 0,
                supplementaryLinks: [
                    {
                        label: 'Modem shell commands',
                        href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/cellular/modem_shell/README.html#overview',
                    },
                    {
                        label: 'AT Commands reference manual',
                        href: 'https://docs.nordicsemi.com/bundle/ref_at_commands_nrf91x1/page/REF/at_commands/intro_nrf91x1.html',
                    },
                ],
            },
            {
                app: 'pc-nrfconnect-cellularmonitor',
                description: 'Automatically connect and evaluate parameters.',
            },
        ],
    },
    {
        ref: 'Legacy Asset Tracker',
        resources: [
            {
                title: 'Cellular IoT Fundamentals',
                mainLink: {
                    label: 'Open course',
                    href: 'https://academy.nordicsemi.com/courses/cellular-iot-fundamentals/lessons/lesson-1-cellular-fundamentals/topic/lesson-1-exercise-1/',
                },
                description:
                    'Follow Exercise 1 in the Cellular IoT Fundamentals course to evaluate cloud connectivity.',
            },
            {
                app: 'pc-nrfconnect-cellularmonitor',
                description: 'Automatically connect and evaluate parameters.',
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
        label: 'Developing with nRF91 Series',
        description:
            'Device-specific information on working with nRF91 Series devices.',
        link: {
            label: 'Developing with nRF91 Series',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/app_dev/device_guides/nrf91/index.html',
        },
    },
];

const developConfig = [
    {
        ref: 'AT Commands',
        sampleSource: 'nrf/applications/serial_lte_modem',
    },
    {
        ref: 'Shell Command Line Interface',
        sampleSource: 'nrf/samples/cellular/modem_shell',
    },
    {
        ref: 'Legacy Asset Tracker',
        sampleSource: 'nrf/applications/asset_tracker_v2',
    },
];

const appsConfig = [
    'pc-nrfconnect-cellularmonitor',
    'pc-nrfconnect-serial-terminal',
    'pc-nrfconnect-programmer',
    'pc-nrfconnect-ppk',
];

export default {
    device: 'nRF9151 DK',
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
