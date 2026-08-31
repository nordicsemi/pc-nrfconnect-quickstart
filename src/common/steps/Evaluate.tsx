/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import {
    openUrl,
    Spinner,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { Back } from '../Back';
import Main from '../Main';
import { Next } from '../Next';
import { AppResourceButton, ResourceWithButton } from '../Resource';
import StepByChoice from '../StepByChoice';

interface CommonResourceProps {
    title?: string;
    description: string;
    supplementaryLinks?: { label: string; href: string }[];
}

interface ExternalLinkResource extends CommonResourceProps {
    title: string;
    mainLink: { label: string; href: string };
}

interface AppResource extends CommonResourceProps {
    app: string;
    vComIndex?: number;
}

const isExternalLinkResource = (
    resource: AppResource | ExternalLinkResource,
): resource is ExternalLinkResource => 'mainLink' in resource;

type ResourcePage = (AppResource | ExternalLinkResource)[];

interface ResourceComponent {
    customNode: () => React.ReactNode;
}

const EvaluateStep = ({
    config,
    ref,
}: {
    config: ResourcePage;
    ref: string;
}) => {
    const [busy, setBusy] = useState(false);
    console.log(config, ref);
    return (
        <Main>
            <Main.Content heading={`Evaluate ${ref}`}>
                <div className="tw-flex tw-flex-col tw-gap-6">
                    {config.map(resource =>
                        isExternalLinkResource(resource) ? (
                            <ResourceWithButton
                                key={resource.title}
                                title={resource.title}
                                buttonLabel={resource.mainLink.label}
                                description={resource.description}
                                links={resource.supplementaryLinks}
                                onClick={() => {
                                    telemetry.sendEvent(
                                        'Opened evaluation link',
                                        {
                                            link: resource.mainLink.href,
                                        },
                                    );
                                    openUrl(resource.mainLink.href);
                                }}
                            />
                        ) : (
                            <AppResourceButton
                                key={resource.app}
                                description={resource.description}
                                app={resource.app}
                                title={resource.title}
                                links={resource.supplementaryLinks}
                                onInstallStart={() => setBusy(true)}
                                onInstallFinish={() => setBusy(false)}
                                vComIndex={resource.vComIndex}
                            />
                        ),
                    )}
                </div>
            </Main.Content>
            <Main.Footer>
                {busy && (
                    <div className="tw-flex tw-flex-row tw-items-center tw-pr-4 tw-text-primary">
                        <Spinner size="lg" />
                    </div>
                )}
                <Back disabled={busy} />
                <Next disabled={busy} />
            </Main.Footer>
        </Main>
    );
};

export default (configs: Record<string, ResourcePage | ResourceComponent>) => ({
    name: 'Evaluate',
    component: () =>
        StepByChoice<ResourcePage>({
            defaultNode: EvaluateStep,
            configs,
        }),
});
