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
    IssueBox,
    Spinner,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import {
    type AuthState,
    inMain as auth,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/auth';

import Logomark from '../../../../../resources/Logomark.svg';
import { useAppDispatch, useAppSelector } from '../../../../app/store';
import { Back } from '../../../../common/Back';
import Main from '../../../../common/Main';
import { Next, Skip } from '../../../../common/Next';
import { connectMemfault, fetchProjectsForOrg } from './authEffects';
import {
    getMemfault,
    nextSubStep,
    prevSubStep,
    resetMemfault,
    setSelectedOrgSlug,
    setSelectedProjectSlug,
} from './cloudEvaluateSlice';
import { reportEvaluateError } from './reportError';

const emptyItem: DropdownItem<string> = { label: '', value: '' };

export default () => {
    const dispatch = useAppDispatch();
    const memfault = useAppSelector(getMemfault);
    const [authState, setAuthState] = useState<AuthState | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);

    const authStatus = authState?.status;
    const account = authState?.account ?? null;

    const isSignedIn = authStatus === 'signedIn' || authStatus === 'signingOut';
    const isAuthenticating = authStatus === 'signingIn';
    const needsReauth = authStatus === 'interactionRequired';

    useEffect(() => {
        auth.getAuthStatus().then(setAuthState);
        auth.registerOnStateChanged(setAuthState);
    }, []);

    const signIn = async () => {
        setAuthError(null);
        try {
            const signInResult = await auth.startSignIn();
            if (!signInResult.status) {
                reportEvaluateError(
                    'Authenticate',
                    signInResult.error,
                    'sign-in',
                );
                setAuthError(signInResult.error);
                return;
            }
            dispatch(resetMemfault());
        } catch (e) {
            reportEvaluateError('Authenticate', e, 'sign-in');
            setAuthError(describeError(e));
        }
    };

    const signOut = async () => {
        await auth.singleSignOut();
        dispatch(resetMemfault());
    };

    useEffect(() => {
        if (authStatus === 'signedIn' && memfault.status === 'idle') {
            dispatch(connectMemfault());
        }
    }, [authStatus, memfault.status, dispatch]);

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

    useEffect(() => {
        if (
            memfault.status === 'success' &&
            !memfault.selectedOrgSlug &&
            memfault.organizations.length
        ) {
            dispatch(setSelectedOrgSlug(memfault.organizations[0].slug));
        }
    }, [
        dispatch,
        memfault.status,
        memfault.selectedOrgSlug,
        memfault.organizations,
    ]);

    useEffect(() => {
        if (
            memfault.status === 'success' &&
            memfault.projects.length &&
            !memfault.projects.some(
                p => p.slug === memfault.selectedProjectSlug,
            )
        ) {
            dispatch(setSelectedProjectSlug(memfault.projects[0].slug));
        }
    }, [
        dispatch,
        memfault.status,
        memfault.selectedProjectSlug,
        memfault.projects,
    ]);

    const signInPrompt = needsReauth
        ? 'Your session expired. Please sign in again.'
        : 'Sign in to continue.';

    return (
        <Main className="tw-min-h-0 tw-flex-1">
            <Main.Content heading="Register your device" fillHeight>
                <div className="tw-flex tw-flex-col tw-gap-5">
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
                        <div className="tw-flex tw-flex-col tw-gap-5 tw-border-t tw-border-gray-200 tw-pt-5">
                            <div className="tw-flex tw-flex-row tw-justify-between">
                                <p className="tw-leading-none">
                                    Signed in as{' '}
                                    <b>{account?.name ?? account?.username}</b>
                                </p>
                                <Button
                                    variant="link-button"
                                    size="sm"
                                    onClick={signOut}
                                    disabled={authStatus === 'signingOut'}
                                >
                                    {authStatus === 'signingOut'
                                        ? 'Signing out…'
                                        : 'Sign out'}
                                </Button>
                            </div>

                            {memfault.status === 'loading' && (
                                <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                                    <Spinner size="sm" />
                                    <span className="tw-text-xs">
                                        Loading organizations and projects…
                                    </span>
                                </div>
                            )}

                            {memfault.status === 'success' && (
                                <div className="tw-flex tw-flex-row tw-gap-2">
                                    <Dropdown
                                        label="Organization"
                                        items={orgItems}
                                        onSelect={item => {
                                            dispatch(
                                                setSelectedOrgSlug(item.value),
                                            );
                                            dispatch(
                                                fetchProjectsForOrg(item.value),
                                            );
                                        }}
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

                            {memfault.status === 'error' && (
                                <IssueBox
                                    mdiIcon="mdi-lightbulb-alert-outline"
                                    color="tw-text-red"
                                    title={
                                        memfault.message ??
                                        'Failed to load organizations and projects'
                                    }
                                />
                            )}
                        </div>
                    ) : (
                        <>
                            <p className={needsReauth ? 'tw-text-red' : ''}>
                                {signInPrompt}
                            </p>
                            <div className="tw-flex tw-flex-col tw-gap-6">
                                <div className="tw-flex tw-flex-row tw-gap-2.5">
                                    <Button
                                        variant="link-button"
                                        size="xl"
                                        onClick={signIn}
                                        className="tw-w-fit"
                                        disabled={isAuthenticating}
                                    >
                                        <div className="tw-flex tw-flex-row tw-items-center tw-justify-center tw-gap-2">
                                            <img
                                                src={Logomark}
                                                alt="myNordic logo"
                                                className="tw-h-[17px] tw-w-[20px]"
                                            />
                                            <span>
                                                Sign in with myNordic to
                                                register your device
                                            </span>
                                            {isAuthenticating && (
                                                <Spinner size="sm" />
                                            )}
                                        </div>
                                    </Button>
                                    {isAuthenticating && (
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            onClick={() => auth.cancelSignIn()}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                                {authError && (
                                    <IssueBox
                                        mdiIcon="mdi-lightbulb-alert-outline"
                                        color="tw-text-red"
                                        title={authError}
                                    />
                                )}
                            </div>
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
                            authStatus !== 'signedIn' ||
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
