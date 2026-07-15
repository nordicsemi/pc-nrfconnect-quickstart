/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import qrImage from '../../../../../resources/cloud-qr.png';
import { useAppDispatch } from '../../../../app/store';
import { Back } from '../../../../common/Back';
import Main from '../../../../common/Main';
import { Next } from '../../../../common/Next';
import { nextSubStep } from './cloudEvaluateSlice';

export default () => {
    const dispatch = useAppDispatch();

    return (
        <Main>
            <Main.Content
                heading="Remote connection"
                subHeading="Establish remote connection"
            >
                <div className="tw-flex tw-flex-row tw-gap-3">
                    <div className="tw-flex tw-flex-shrink-0 tw-flex-col tw-items-center">
                        <img
                            src={qrImage}
                            alt="Remote connection QR code"
                            className="tw-h-32 tw-w-32"
                        />
                        Scan to download
                    </div>
                    <div className="tw-flex tw-flex-col tw-gap-2">
                        <p>
                            Establish a remote connection gateway for your{' '}
                            <b>nRF54L15 DK</b> using your mobile device as a BLE
                            relay.
                        </p>
                        <ol className="tw-list-inside tw-list-decimal">
                            <li>
                                <b>Download</b> nRF Connect for Mobile on your
                                mobile device (iOS or Android).
                            </li>
                            <li>
                                <b>Scan</b> for nearby devices and select your
                                nRF54L15 DK from the list.
                            </li>
                            <li>
                                <b>Connect</b> to your device.
                            </li>
                        </ol>
                    </div>
                </div>
            </Main.Content>
            <Main.Footer>
                <Back />
                <Next onClick={() => dispatch(nextSubStep())} />
            </Main.Footer>
        </Main>
    );
};
