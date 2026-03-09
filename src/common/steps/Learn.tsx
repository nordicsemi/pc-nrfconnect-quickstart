/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { Back } from '../Back';
import Main from '../Main';
import { Next } from '../Next';
import { Resource, type ResourceProps } from '../Resource';

const LearnStep = ({ resources }: { resources: ResourceProps[] }) => (
    <Main>
        <Main.Content heading="Recommended learning resources">
            <div className="tw-flex tw-flex-col tw-items-start tw-justify-start tw-gap-6">
                {resources.map(props => (
                    <Resource {...props} key={props.label} />
                ))}
            </div>
        </Main.Content>
        <Main.Footer>
            <Back />
            <Next />
        </Main.Footer>
    </Main>
);

export default (resources: ResourceProps[]) => ({
    name: 'Learn',
    component: () => LearnStep({ resources }),
});
