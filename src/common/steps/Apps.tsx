/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import {
    apps as appsService,
    deviceInfo,
    DownloadableApp,
    logger,
    Spinner,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';

import { useAppSelector } from '../../app/store';
import { getSelectedDeviceUnsafely } from '../../features/device/deviceSlice';
import { Back } from '../Back';
import MultipleSelect from '../listSelect/MultipleSelect';
import Main from '../Main';
import { Next, Skip } from '../Next';

type App = DownloadableApp & {
    selected: boolean;
    installing: boolean;
    failed: boolean;
};

const DisabledSelector = ({
    installed,
    failed,
}: {
    installed: boolean;
    failed: boolean;
}) => {
    if (!installed && failed) {
        return <p className="tw-text-sm">FAILED</p>;
    }
    if (!installed) {
        return <Spinner size="sm" />;
    }
    return <p className="tw-text-sm">INSTALLED</p>;
};

const AppsStep = ({ apps }: { apps: string[] }) => {
    const device = useAppSelector(getSelectedDeviceUnsafely);
    const [recommendedApps, setRecommendedApps] = useState<App[]>([]);

    const items = recommendedApps.map(app => ({
        id: app.name,
        selected: app.selected,
        disabled: appsService.isInstalled(app) || app.installing || app.failed,
        disabledSelector: (
            <DisabledSelector
                installed={appsService.isInstalled(app)}
                failed={app.failed}
            />
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

    const updateApp = (appName: string, updates: Partial<App>) => {
        setRecommendedApps(old =>
            old.map(a => {
                if (a.name === appName) return { ...a, ...updates } as App;
                return a;
            }),
        );
    };

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
                        failed: false,
                    })),
            );
        });
    }, [apps, device]);

    const installApp = (appToBeInstalled: App) => {
        telemetry.sendEvent('Installing app', {
            app: appToBeInstalled,
        });
        updateApp(appToBeInstalled.name, { installing: true, failed: false });
        appsService
            .installDownloadableApp(appToBeInstalled)
            .then(installedApp =>
                updateApp(installedApp.name, {
                    installing: false,
                    failed: false,
                    selected: false,
                }),
            )
            .catch(e => {
                logger.error(describeError(e));
                updateApp(appToBeInstalled.name, {
                    installing: false,
                    failed: true,
                });
            });
    };

    const anySelected = recommendedApps.some(app => app.selected);
    const anyFailed = recommendedApps.some(app => app.failed);
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
                        updateApp(item.id, { selected })
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
                        {anyFailed && (
                            <Next
                                label="Retry failed"
                                variant="secondary"
                                disabled={anyInstalling}
                                onClick={() =>
                                    recommendedApps.forEach(app => {
                                        if (app.failed) {
                                            installApp(app);
                                        }
                                    })
                                }
                            />
                        )}
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
