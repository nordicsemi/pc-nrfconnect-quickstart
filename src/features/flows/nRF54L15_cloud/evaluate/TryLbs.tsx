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
                    <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                        <div className="tw-row-span-3 tw-grid tw-grid-rows-subgrid tw-gap-2 tw-px-3">
                            <span className="tw-font-bold">Press a button</span>

                            <div className="tw-flex tw-h-full tw-flex-col">
                                <div className="tw-flex tw-flex-1 tw-items-center tw-justify-center">
                                    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center">
                                        <img
                                            className="tw-h-auto tw-max-w-full"
                                            src={cloudButtonState}
                                            alt="Press button state in nRF Toolbox"
                                        />
                                        <div className="tw-mt-2 tw-text-center tw-text-xs tw-text-gray-500">
                                            Screenshot
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="tw-text-xs">
                                Press <b>Button 0</b> on the DK. nRF Toolbox
                                shows the Button characteristic flip between
                                Button released and Button pressed.
                            </p>
                        </div>

                        <div className="tw-row-span-3 tw-grid tw-grid-rows-subgrid tw-gap-2 tw-px-3">
                            <span className="tw-font-bold">
                                Turn the LED on and off
                            </span>

                            <div className="tw-flex tw-h-full tw-flex-col">
                                <div className="tw-flex tw-flex-1 tw-items-center tw-justify-center">
                                    <img
                                        className="tw-h-auto tw-max-w-full"
                                        src={cloudLedState}
                                        alt="Enable the LED toggle in nRF Toolbox"
                                    />
                                </div>

                                <div className="tw-mt-2 tw-text-center tw-text-xs tw-text-gray-500">
                                    Screenshot
                                </div>
                            </div>

                            <p className="tw-text-xs">
                                Tap the toggle in nRF Toolbox to turn{' '}
                                <b>LED 2</b> on your DK on and off.
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
