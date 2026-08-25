/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { Back } from '../../../common/Back';
import Link from '../../../common/Link';
import Main from '../../../common/Main';
import { Next } from '../../../common/Next';

const SIMCard = () => (
    <Main>
        <Main.Content
            heading="Plug in SIM card"
            className="tw-flex tw-flex-col tw-gap-4"
        >
            <p>
                The nRF93M1 DK ships with one pre-activated SIM card. Fit it in
                the nano-SIM (4FF) socket on the underside of the board. It
                works out of the box as long as the SIM card has coverage in
                your area.
            </p>
            <div>
                <b>Onomondo</b>
                <p>
                    Includes 10 MB free data. If you register the SIM card, you
                    get an additional 40 MB to use within the SIM&apos;s
                    lifetime, plus two months of trial access to Onomondo&apos;s
                    real-time network insight tool.
                </p>
                <Link
                    label="Register ownership"
                    href="https://onomondo.com/go/nordic-dev-kit/#form"
                    color="tw-text-primary"
                />{' '}
                |{' '}
                <Link
                    label="Check coverage"
                    href="https://onomondo.com/go/nordic-dev-kit/#network"
                    color="tw-text-primary"
                />
            </div>
            <p>
                The board also carries an eSIM (MFF2) footprint if you want to
                solder your own eSIM later. The nRF93M1 supports IoT eSIM
                (SGP.32) and the integrated SoftSIM framework.
            </p>
        </Main.Content>
        <Main.Footer>
            <Back />
            <Next />
        </Main.Footer>
    </Main>
);

export default () => ({
    name: 'SIM',
    component: SIMCard,
});
