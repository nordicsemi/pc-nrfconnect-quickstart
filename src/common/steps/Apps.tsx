/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import {
    apps as appsService,
    deviceInfo,
    type DownloadableApp,
    logger,
    Spinner,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';

import { useAppSelector } from '../../app/store';
import { getSelectedDeviceUnsafely } from '../../features/device/deviceSlice';
import { Back } from '../Back';
import { type SelectableListItem } from '../listSelect/ListSelectItem';
import MultipleSelect from '../listSelect/MultipleSelect';
import Main from '../Main';
import { Next, Skip } from '../Next';

type App = DownloadableApp & {
    selected: boolean;
    installing: boolean;
};

const AppsStep = ({ apps }: { apps: string[] }) => {
    const device = useAppSelector(getSelectedDeviceUnsafely);
    const [recommendedApps, setRecommendedApps] = useState<App[]>([]);

    const items = recommendedApps.map(app => ({
        id: app.name,
        selected: app.selected,
        disabled: appsService.isInstalled(app) || app.installing,
        disabledSelector: appsService.isInstalled(app) ? (
            <p className="tw-text-sm">INSTALLED</p>
        ) : (
            <Spinner size="sm" />
        ),
        content: (
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-start">
                <div className="tw-w-32 tw-flex-shrink-0 tw-pr-5">
                    <b>{app.displayName}</b>
                </div>
                <div className="tw-flex tw-w-80 tw-flex-col">
                    {app.description}
                </div>
            </div>
        ),
    }));

    useEffect(() => {
        appsService.getDownloadableApps().then(({ apps: downloadableApps }) => {
            setRecommendedApps(
                downloadableApps
                    .filter(
                        app =>
                            app.source === 'official' &&
                            apps.includes(app.name),
                    )
                    .map(app => ({
                        ...app,
                        selected: false,
                        installing: false,
                    })),
            );
        });
    }, [apps, device]);

    const setAppSelected = (app: SelectableListItem, selected: boolean) =>
        setRecommendedApps(oldRecommendedApps =>
            oldRecommendedApps.map(a => {
                if (a.name === app.id) {
                    a.selected = selected;
                }
                return a;
            }),
        );

    const installApp = (appToBeInstalled: App) => {
        appsService
            .installDownloadableApp(appToBeInstalled)
            .then(installedApp =>
                setRecommendedApps(oldRecommendedApps =>
                    oldRecommendedApps.map(app =>
                        app.name === installedApp.name
                            ? {
                                  ...installedApp,
                                  selected: false,
                                  installing: false,
                              }
                            : app,
                    ),
                ),
            )
            .catch(e => logger.error(describeError(e)));
    };

    const anySelected = recommendedApps.some(app => app.selected);
    const anyInstalling = recommendedApps.some(app => app.installing);
    const allInstalled = recommendedApps.every(app =>
        appsService.isInstalled(app),
    );

    return (
        <Main>
            <Main.Content
                heading="Select apps to install"
                subHeading={`Check out these nRF Connect for Desktop applications for ${
                    deviceInfo(device).name
                }`}
            >
                <MultipleSelect
                    items={items}
                    onSelect={(item, selected) =>
                        setAppSelected(item, selected)
                    }
                />
            </Main.Content>
            <Main.Footer>
                <Back disabled={anyInstalling} />
                {allInstalled ? (
                    <Next />
                ) : (
                    <>
                        <Skip disabled={anyInstalling} />
                        <Next
                            label="Install"
                            variant="primary"
                            disabled={!anySelected || anyInstalling}
                            onClick={() =>
                                recommendedApps.forEach(app => {
                                    if (
                                        !appsService.isInstalled(app) &&
                                        app.selected
                                    ) {
                                        setRecommendedApps(oldRecommendedApps =>
                                            oldRecommendedApps.map(a =>
                                                a === app
                                                    ? {
                                                          ...app,
                                                          installing: true,
                                                      }
                                                    : a,
                                            ),
                                        );
                                        telemetry.sendEvent('Installing app', {
                                            app,
                                        });
                                        installApp(app);
                                    }
                                })
                            }
                        />
                    </>
                )}
            </Main.Footer>
        </Main>
    );
};

export default (apps: string[]) => ({
    name: 'Apps',
    component: () => AppsStep({ apps }),
});
