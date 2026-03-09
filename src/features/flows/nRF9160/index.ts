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
import { type Choice } from '../../device/deviceSlice';
import SIM from './SIM';

const infoConfig = {
    title: 'Cellular Powerhouse',
    markdownContent:
        "![nRF9160 DK](9160DK.png)  \n&nbsp;  \nThe nRF9160 Development Kit is perfect for evaluating the nRF9160 SiP and developing cellular IoT applications.  \n&nbsp;  \nIt includes SEGGER's J-Link OB debug probe and all the necessary external circuitry, like (e)SIM interface, antenna, access to all IO pins, and relevant module interfaces.  \n&nbsp;  \n[Hardware documentation](https://docs.nordicsemi.com/bundle/ug_nrf9160_dk/page/UG/nrf91_DK/intro.html)  \n&nbsp;  \n![nRF9160 SiP Cores](9160Cores.png)  \nYou have two options for leveraging the nRF9160 SiP:  \n&nbsp;  \n**Option 1** *Recommended*  \nHarness the full potential of nRF9160 by using the entire application core for your code, eliminating the need for an external MCU, and fully capitalizing on the advantages offered by nRF9160.  \n&nbsp;  \n**Option 2**  \nIntegrate nRF9160 as a *modem only* alongside your existing design running a serial AT command set on the application core.",
};

const programConfig = [
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
                    firmware: {
                        core: 'Modem',
                        file: 'mfw_nrf9160_1.3.7.zip',
                        link: {
                            label: 'Firmware v1.3.7',
                            href: 'https://nsscprodmedia.blob.core.windows.net/prod/software-and-other-downloads/dev-kits/nrf9160-dk/release_notes_modemfirmware/mfw_nrf9160_1.3.7_release_notes.txt',
                        },
                    },
                    version: '1.3.7',
                    vComIndex: 0,
                },
                {
                    type: 'wait',
                    durationMs: 2000,
                },
                {
                    type: 'program',
                    firmware: {
                        core: 'Application',
                        file: 'nrf9160dk_serial_lte_modem.hex',
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
        name: 'Asset Tracking',
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
                    firmware: {
                        core: 'Modem',
                        file: 'mfw_nrf9160_1.3.7.zip',
                        link: {
                            label: 'Firmware v1.3.7',
                            href: 'https://nsscprodmedia.blob.core.windows.net/prod/software-and-other-downloads/dev-kits/nrf9160-dk/release_notes_modemfirmware/mfw_nrf9160_1.3.7_release_notes.txt',
                        },
                    },
                    version: '1.3.7',
                    vComIndex: 0,
                },
                {
                    type: 'wait',
                    durationMs: 2000,
                },
                {
                    type: 'program',
                    firmware: {
                        core: 'Application',
                        file: 'nrf9160dk_asset_tracker.hex',
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
                    firmware: {
                        core: 'Modem',
                        file: 'mfw_nrf9160_1.3.7.zip',
                        link: {
                            label: 'Firmware v1.3.7',
                            href: 'https://nsscprodmedia.blob.core.windows.net/prod/software-and-other-downloads/dev-kits/nrf9160-dk/release_notes_modemfirmware/mfw_nrf9160_1.3.7_release_notes.txt',
                        },
                    },
                    version: '1.3.7',
                    vComIndex: 0,
                },
                {
                    type: 'wait',
                    durationMs: 2000,
                },
                {
                    type: 'program',
                    firmware: {
                        core: 'Application',
                        file: 'nrf9160dk_modem_shell.hex',
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
] as Choice[];

const verificationConfig = {
    settings: [
        {
            ref: 'AT Commands',
            vComIndex: 0,
            mode: 'LINE' as const,
        },
        {
            ref: 'Asset Tracking',
            vComIndex: 0,
            mode: 'LINE' as const,
        },
        {
            ref: 'Shell Command Line Interface',
            vComIndex: 0,
            mode: 'SHELL' as const,
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
        ref: 'AT Commands',
        resources: [
            {
                app: 'pc-nrfconnect-serial-terminal',
                description:
                    'Use the Serial Terminal desktop application as a serial interface to send AT commands to the device.',
                vComIndex: 0,
                supplementaryLinks: [
                    {
                        label: 'AT Commands reference manual',
                        href: 'https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/intro_nrf9160.html',
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
        ref: 'Asset Tracking',
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
                        href: 'https://docs.nordicsemi.com/bundle/ref_at_commands/page/REF/at_commands/intro_nrf9160.html',
                    },
                ],
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
];

const developConfig = [
    {
        ref: 'AT Commands',
        sampleSource: 'nrf/applications/serial_lte_modem',
    },
    {
        ref: 'Asset Tracking',
        sampleSource: 'nrf/applications/asset_tracker_v2',
    },
    {
        ref: 'Shell Command Line Interface',
        sampleSource: 'nrf/samples/cellular/modem_shell',
    },
];

const appsConfig = [
    'pc-nrfconnect-cellularmonitor',
    'pc-nrfconnect-serial-terminal',
    'pc-nrfconnect-programmer',
    'pc-nrfconnect-ppk',
];

export default {
    device: 'nRF9160 DK',
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
