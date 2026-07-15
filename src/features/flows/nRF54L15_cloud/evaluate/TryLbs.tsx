/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

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
                <div className="tw-flex tw-flex-col tw-gap-6">
                    <p>{/* TODO: */}</p>
                    Instructions for using the LED Button Service will be
                    printed here. {/* TODO: */}
                </div>
            </Main.Content>
            <Main.Footer>
                <Back onClick={() => dispatch(prevSubStep())} />
                <Next onClick={() => dispatch(nextSubStep())} />
            </Main.Footer>
        </Main>
    );
};
