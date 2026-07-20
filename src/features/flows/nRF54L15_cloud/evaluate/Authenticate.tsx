/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import {
    Button,
    Dropdown,
    type DropdownItem,
    Spinner,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import {
    type AccountInfo,
    inMain as auth,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/auth';

import Logomark from '../../../../../resources/Logomark.png';
import { useAppDispatch } from '../../../../app/store';
import { Back } from '../../../../common/Back';
import Main from '../../../../common/Main';
import { Next } from '../../../../common/Next';
import { nextSubStep, prevSubStep } from './cloudEvaluateSlice';

export default () => {
    const dispatch = useAppDispatch();
    const [account, setAccount] = useState<AccountInfo | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const [selectedOrg, setSelectedOrg] = useState<DropdownItem<string>>({
        label: '',
        value: '',
    });
    const [selectedProject, setSelectedProject] = useState<
        DropdownItem<string>
    >({ label: '', value: '' });

    const refresh = () =>
        auth.getAccountInfo().then(res => {
            if (res.status) setAccount(res.data);
            else setAccount(null);
        });

    useEffect(() => {
        refresh();
    }, []);

    const login = () => {
        setIsAuthenticating(true);
        auth.startLogin().then(res => {
            setIsAuthenticating(false);
            if (res.status) refresh();
            else setAuthError(res.error);
        });
    };

    const logout = () =>
        auth.localLogout().then(() => {
            // dispatch(reset());
            refresh();
        });

    return (
        <Main>
            <Main.Content
                heading="Register your device"
                subHeading="Authenticate"
            >
                <div className="tw-flex tw-flex-col tw-gap-3">
                    <p>
                        Connect your device to your personal cloud project to
                        capture crashes, push OTA updates, and debug remotely.
                    </p>
                    <ol className="tw-list-inside tw-list-disc">
                        <li>Over-the-air firmware updates</li>
                        <li>Remote crash analysis and debugging</li>
                        <li>
                            Access to DevZone, technical documentation, and
                            learning resources
                        </li>
                    </ol>
                    {account ? (
                        <div className="tw-flex tw-flex-col tw-gap-2 tw-border tw-border-gray-200 tw-p-3">
                            <div className="tw-flex tw-flex-row tw-items-center tw-justify-between">
                                <p>
                                    Logged in as{' '}
                                    <b>{account.name ?? account.username}</b>
                                </p>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={logout}
                                >
                                    Log out
                                </Button>
                            </div>
                            <div className="tw-flex tw-flex-row tw-gap-2">
                                <Dropdown
                                    label="Organization"
                                    items={[]}
                                    onSelect={setSelectedOrg}
                                    selectedItem={selectedOrg}
                                    size="sm"
                                />
                                <Dropdown
                                    label="Project"
                                    items={[]}
                                    onSelect={setSelectedProject}
                                    selectedItem={selectedProject}
                                    size="sm"
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <p>Sign in to continue.</p>
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={login}
                                className="tw-w-fit"
                                disabled={isAuthenticating}
                            >
                                <div className="tw-flex tw-flex-row tw-items-center tw-justify-center tw-gap-2">
                                    <img src={Logomark} alt="myNordic logo" />
                                    <span>
                                        Sign in with myNordic to register your
                                        device
                                    </span>
                                    {isAuthenticating && <Spinner size="sm" />}
                                </div>
                            </Button>
                            {authError && (
                                <p className="tw-text-red-500">{authError}</p>
                            )}
                        </>
                    )}
                </div>
            </Main.Content>
            <Main.Footer>
                <Back onClick={() => dispatch(prevSubStep())} />
                <Next
                    disabled={!account}
                    onClick={() => dispatch(nextSubStep())}
                />
            </Main.Footer>
        </Main>
    );
};
