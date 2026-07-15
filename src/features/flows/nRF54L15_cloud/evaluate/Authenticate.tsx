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
                heading="Register your device"
                subHeading="Authenticate"
            >
                <div className="tw-flex tw-flex-col tw-gap-4">
                    Auth will be printed here. {/* TODO: auth */}
                </div>
            </Main.Content>
            <Main.Footer>
                <Back onClick={() => dispatch(prevSubStep())} />
                <Next
                    disabled={false}
                    onClick={() => dispatch(nextSubStep())}
                />
            </Main.Footer>
        </Main>
    );
};
