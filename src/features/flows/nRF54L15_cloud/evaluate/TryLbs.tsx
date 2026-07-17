/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import cloudButtonState from '../../../../../resources/devices/images/cloud_button_state.png';
import cloudLedState from '../../../../../resources/devices/images/cloud_led_toggle.png';
import { useAppDispatch } from '../../../../app/store';
import { Back } from '../../../../common/Back';
import Main from '../../../../common/Main';
import { Next } from '../../../../common/Next';
import { nextSubStep, prevSubStep } from './cloudEvaluateSlice';

export default () => {
    const dispatch = useAppDispatch();

    return (
        <Main>
            <Main.Content
                heading="Remote connection"
                subHeading="Try the LED Button Service"
            >
                <div className="tw-flex tw-flex-col tw-gap-3">
                    <p>
                        The LED Button Service opens automatically once your DK
                        is connected in nRF Toolbox. Try both interactions
                        below.
                    </p>
                    <div className="tw-flex tw-flex-row tw-gap-3">
                        <div className="tw-flex tw-flex-1 tw-flex-col tw-gap-2 tw-border tw-border-gray-200 tw-p-3">
                            <span className="tw-font-bold">Press a button</span>
                            <img
                                src={cloudButtonState}
                                alt="Press button state in nRF Toolbox"
                            />
                            <p className="tw-text-xs">
                                Press Button 0 on the DK. nRF Toolbox shows the
                                Button characteristic flip between Button
                                released and Button pressed.
                            </p>
                        </div>
                        <div className="tw-flex tw-flex-1 tw-flex-col tw-gap-2 tw-border tw-border-gray-200 tw-p-3">
                            <span className="tw-font-bold">Toggle the LED</span>
                            <img
                                src={cloudLedState}
                                alt="Toggle LED toggle in nRF Toolbox"
                            />
                            <p className="tw-text-xs">
                                Tap ON / OFF in nRF Toolbox to switch LED 2 on
                                your DK on and off.
                            </p>
                        </div>
                    </div>
                </div>
            </Main.Content>
            <Main.Footer>
                <Back onClick={() => dispatch(prevSubStep())} />
                <Next onClick={() => dispatch(nextSubStep())} />
            </Main.Footer>
        </Main>
    );
};
