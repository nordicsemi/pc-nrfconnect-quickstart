/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { InfoBox } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { Back } from '../../../common/Back';
import Main from '../../../common/Main';
import { Next } from '../../../common/Next';
import StepByChoice from '../../../common/StepByChoice';
import Verify from '../../../common/steps/5xFamilyVerify/Verify';

interface VerifyConfig {
    vComIndex: number;
    regex: RegExp;
}

export default (
    pages: {
        ref: string;
        config?: VerifyConfig;
    }[],
) => ({
    name: 'Verify',
    component: () =>
        StepByChoice({
            steps: pages.reduce(
                (acc, next) => ({
                    ...acc,
                    [next.ref]: next.config
                        ? () => Verify({ ...(next.config as VerifyConfig) })
                        : () => (
                              <Main>
                                  <Main.Content heading="Verification">
                                      <InfoBox
                                          mdiIcon="mdi-information-outline"
                                          color="tw-text-primary"
                                          title="Verification for the Power Profiling sample is not supported."
                                          content="Normally, samples in Quick Start are verified by checking the UART output from the DK. Because the Power Profiling sample's UART is disabled to achieve low power consumption, this method won't work. Instead, you can verify that the sample is working correctly by continuing directly to the Evaluate step."
                                      />
                                  </Main.Content>
                                  <Main.Footer>
                                      <Back />
                                      <Next />
                                  </Main.Footer>
                              </Main>
                          ),
                }),
                {},
            ),
        }),
});
