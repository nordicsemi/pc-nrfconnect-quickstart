/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import {
    getPersistedNickname,
    logger,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import qrImage from '../../../../../resources/cloud_qr.svg';
import { useAppDispatch, useAppSelector } from '../../../../app/store';
import { Back } from '../../../../common/Back';
import Main from '../../../../common/Main';
import { Next } from '../../../../common/Next';
import { reset } from '../../../device/deviceLib';
import { getSelectedDeviceUnsafely } from '../../../device/deviceSlice';
import { getBtName, nextSubStep, setBtName } from './cloudEvaluateSlice';
import { setDeviceName } from './device';

export default ({ vComIndex }: { vComIndex: number }) => {
    const dispatch = useAppDispatch();
    const device = useAppSelector(getSelectedDeviceUnsafely);
    const btName = useAppSelector(getBtName);

    useEffect(() => {
        const persistedName = getPersistedNickname(device.serialNumber);
        if (persistedName && btName !== persistedName) {
            setDeviceName(
                device,
                vComIndex,
                getPersistedNickname(device.serialNumber),
            )
                .then(() => {
                    reset(device);
                    dispatch(setBtName(persistedName));
                })
                .catch(logger.error);
        }
    }, [btName, device, dispatch, vComIndex]);

    return (
        <Main>
            <Main.Content
                heading="Remote connection"
                subHeading="Use your phone as a gateway"
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
                    <div className="-tw-mt-1 tw-flex tw-flex-col tw-gap-2">
                        <p>
                            Establish a remote connection gateway for your{' '}
                            <b>nRF54L15 DK</b> using your mobile device as a
                            Bluetooth LE relay.
                        </p>
                        <ol className="tw-list-inside tw-list-decimal">
                            <li>
                                <b>Download</b> nRF Toolbox on your mobile
                                device (iOS or Android).
                            </li>
                            <li>
                                <b>Scan</b> for nearby devices and select your
                                nRF54L15 DK from the list.
                            </li>
                            <li>
                                <b>Connect</b> to your device.
                            </li>
                            <li>
                                After connecting the device in the app, click{' '}
                                <b>Continue</b> below.
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
