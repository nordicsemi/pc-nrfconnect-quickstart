/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import {
    Button,
    describeError,
    Dropdown,
    type DropdownItem,
    Spinner,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import {
    type AuthState,
    inMain as auth,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/auth';

import Logomark from '../../../../../resources/Logomark.png';
import { useAppDispatch, useAppSelector } from '../../../../app/store';
import { Back } from '../../../../common/Back';
import Main from '../../../../common/Main';
import { Next, Skip } from '../../../../common/Next';
import { connectMemfault, selectOrganization } from './authEffects';
import {
    getMemfault,
    nextSubStep,
    prevSubStep,
    resetMemfault,
    setSelectedProjectSlug,
} from './cloudEvaluateSlice';
import { reportEvaluateError } from './reportError';

const emptyItem: DropdownItem<string> = { label: '', value: '' };

export default () => {
    const dispatch = useAppDispatch();
    const memfault = useAppSelector(getMemfault);
    const [authState, setAuthState] = useState<AuthState | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);

    const status = authState?.status;
    const account = authState?.account ?? null;

    const isSignedIn = status === 'signedIn' || status === 'signingOut';
    const isAuthenticating = status === 'signingIn';
    const needsReauth = status === 'interactionRequired';

    useEffect(() => {
        auth.getAuthStatus().then(setAuthState);
        auth.registerOnStateChanged(setAuthState);
    }, []);

    const login = async () => {
        setAuthError(null);
        try {
            const res = await auth.startLogin();
            if (!res.status) {
                reportEvaluateError('Authenticate', res.error, 'sign-in');
                setAuthError(res.error);
                return;
            }
            dispatch(resetMemfault());
        } catch (e) {
            reportEvaluateError('Authenticate', e, 'sign-in');
            setAuthError(describeError(e));
        }
    };

    const logout = async () => {
        await auth.singleSignOut();
        dispatch(resetMemfault());
    };

    useEffect(() => {
        if (status === 'signedIn' && memfault.status === 'idle') {
            dispatch(connectMemfault());
        }
    }, [status, memfault.status, dispatch]);

    const orgItems: DropdownItem<string>[] = memfault.organizations.map(o => ({
        label: o.name,
        value: o.slug,
    }));
    const projectItems: DropdownItem<string>[] = memfault.projects.map(p => ({
        label: p.name,
        value: p.slug,
    }));
    const selectedOrgItem =
        orgItems.find(i => i.value === memfault.selectedOrgSlug) ?? emptyItem;
    const selectedProjectItem =
        projectItems.find(i => i.value === memfault.selectedProjectSlug) ??
        emptyItem;

    const signInPrompt = needsReauth
        ? 'Your session expired. Please sign in again.'
        : 'Sign in to continue.';

    return (
        <Main>
            <Main.Content heading="Register your device" subHeading="">
                <div className="tw-flex tw-flex-col tw-gap-3">
                    <div className="tw-flex tw-flex-col tw-gap-2">
                        <p>
                            Connect your device to cloud to capture crashes,
                            push OTA updates, and debug remotely.
                        </p>
                        <ol className="tw-list-inside tw-list-disc">
                            <li>Over-the-air firmware updates</li>
                            <li>Remote crash analysis and debugging</li>
                            <li>
                                Access to DevZone, technical documentation, and
                                learning resources
                            </li>
                        </ol>
                    </div>
                    {isSignedIn ? (
                        <div className="tw-flex tw-flex-col tw-gap-2 tw-border tw-border-gray-200 tw-p-3">
                            <div className="tw-flex tw-flex-row tw-items-center tw-justify-between">
                                <p>
                                    Logged in as{' '}
                                    <b>{account?.name ?? account?.username}</b>
                                </p>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={logout}
                                    disabled={status === 'signingOut'}
                                >
                                    {status === 'signingOut'
                                        ? 'Logging out…'
                                        : 'Log out'}
                                </Button>
                            </div>

                            {memfault.status === 'loading' && (
                                <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                                    <Spinner size="sm" />
                                    <span>
                                        Loading organizations and projects…
                                    </span>
                                </div>
                            )}

                            {memfault.status === 'error' && (
                                <p className="tw-text-red">
                                    {memfault.message ??
                                        'Failed to load organizations and projects'}
                                </p>
                            )}

                            {memfault.status === 'success' && (
                                <div className="tw-flex tw-flex-row tw-gap-2">
                                    <Dropdown
                                        label="Organization"
                                        items={orgItems}
                                        onSelect={item =>
                                            dispatch(
                                                selectOrganization(item.value),
                                            )
                                        }
                                        selectedItem={selectedOrgItem}
                                        size="sm"
                                    />
                                    <Dropdown
                                        label="Project"
                                        items={projectItems}
                                        onSelect={item =>
                                            dispatch(
                                                setSelectedProjectSlug(
                                                    item.value,
                                                ),
                                            )
                                        }
                                        selectedItem={selectedProjectItem}
                                        size="sm"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <p className={needsReauth ? 'tw-text-red' : ''}>
                                {signInPrompt}
                            </p>
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
                                <p className="tw-text-red">{authError}</p>
                            )}
                        </>
                    )}
                </div>
            </Main.Content>
            <Main.Footer>
                <Back onClick={() => dispatch(prevSubStep())} />
                {memfault.status === 'error' ? (
                    <>
                        <Skip onClick={() => dispatch(nextSubStep())} />
                        <Next
                            label="Retry"
                            onClick={() => dispatch(connectMemfault())}
                        />
                    </>
                ) : (
                    <Next
                        disabled={
                            status !== 'signedIn' ||
                            memfault.status !== 'success' ||
                            !memfault.selectedProjectSlug
                        }
                        onClick={() => dispatch(nextSubStep())}
                    />
                )}
            </Main.Footer>
        </Main>
    );
};
