/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { openUrl, telemetry } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { ACADEMY_EXERCISE_LINK } from './constants';

export const AcademyExerciseLink = () => (
    <p className="tw-mt-2 tw-text-sm tw-text-gray-600">
        Follow our walkthrough to complete the quick start process and claim
        your device in nRF Cloud:{' '}
        <a
            href={ACADEMY_EXERCISE_LINK}
            onClick={e => {
                e.preventDefault();
                telemetry.sendEvent('Opened DevAcademy exercise', {
                    link: ACADEMY_EXERCISE_LINK,
                });
                openUrl(ACADEMY_EXERCISE_LINK);
            }}
            className="tw-cursor-pointer tw-text-nordicBlue tw-underline hover:tw-no-underline"
        >
            Nordic Developer Academy Cellular IoT Fundamentals Exercise 1
        </a>
    </p>
);
