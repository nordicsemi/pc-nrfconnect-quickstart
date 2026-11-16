/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
    Button,
    describeError,
    Dropdown,
    type DropdownItem,
    IssueBox,
    openUrl,
    Spinner,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import {
    type AuthState,
    inMain as auth,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/auth';

import Logomark from '../../../../resources/Logomark.svg';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { selectedDeviceIsConnected } from '../../../features/device/deviceSlice';
import telemetryThunk from '../../../features/flow/telemetryThunk';
import { Back } from '../../Back';
import { ACADEMY_EXERCISE_LINK, CONNECTING_LINK } from '../../constants';
import Copy from '../../Copy';
import Main from '../../Main';
import { Next, Skip } from '../../Next';
import { type ProvisioningStatus } from './api';
import {
    loadAccount,
    onboard,
    readAttestationToken,
    refreshProvisioning,
    selectOrganization,
} from './effects';
import {
    getAccount,
    getAttestationToken,
    getAttestationTokenError,
    getOnboarding,
    type OnboardingStage,
    resetAccount,
    setSelectedProjectSlug,
} from './onboardingSlice';

const NRF_CLOUD_LINK = 'https://app.memfault.com';
const DEVICE_OVERVIEW_TAB = 'd-9263';
const PROVISIONING_POLL_INTERVAL = 5000;

const onboardingStages: {
    id: OnboardingStage;
    label: string;
    icon: string;
}[] = [
    { id: 'read-token', label: 'Read token', icon: 'mdi-key-chain-variant' },
    {
        id: 'upload-symbols',
        label: 'Upload symbols',
        icon: 'mdi-file-upload-outline',
    },
    { id: 'onboard', label: 'Onboard', icon: 'mdi-cloud-upload-outline' },
    { id: 'reboot-device', label: 'Reboot', icon: 'mdi-restart' },
];

const emptyItem: DropdownItem<string> = { label: '', value: '' };

const openLink = (link: string, event = 'Opened evaluation link') => {
    telemetry.sendEvent(event, { link });
    openUrl(link);
};

const IconLink = ({
    icon,
    label,
    link,
    event,
}: {
    icon: string;
    label: string;
    link: string;
    event?: string;
}) => (
    <Button
        variant="link-button"
        size="sm"
        className="tw-w-fit"
        onClick={() => openLink(link, event)}
    >
        <span className="tw-flex tw-flex-row tw-items-center tw-gap-1">
            <span className={`mdi ${icon} tw-text-base tw-leading-none`} />
            {label}
        </span>
    </Button>
);

const StageIcon = ({
    icon,
    active,
    complete,
}: {
    icon: string;
    active: boolean;
    complete: boolean;
}) => {
    if (complete) {
        return <span className="mdi mdi-check-circle tw-text-green-500" />;
    }
    if (active) {
        return <Spinner size="sm" />;
    }
    return <span className={`mdi ${icon} tw-text-gray-400`} />;
};

const provisioningLabels: Record<ProvisioningStatus, string> = {
    NOT_PROVISIONED: 'Waiting for the device to contact nRF Cloud',
    IN_PROGRESS: 'Installing cloud credentials on the device',
    SUCCEEDED: 'Connected to nRF Cloud',
    FAILED: 'Provisioning failed',
    DEACTIVATED: 'The device is deactivated in nRF Cloud',
};

const isProvisioningPending = (status?: ProvisioningStatus) =>
    status === undefined ||
    status === 'NOT_PROVISIONED' ||
    status === 'IN_PROGRESS';

const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString();

const usePolling = (active: boolean, interval: number, poll: () => void) => {
    useEffect(() => {
        if (!active) return undefined;
        poll();
        const timer = setInterval(poll, interval);
        return () => clearInterval(timer);
    }, [active, interval, poll]);
};

const ProvisioningIcon = ({ status }: { status?: ProvisioningStatus }) => {
    if (isProvisioningPending(status)) {
        return <Spinner size="sm" />;
    }
    if (status === 'SUCCEEDED') {
        return <span className="mdi mdi-check-circle tw-text-green-500" />;
    }
    if (status === 'FAILED') {
        return <span className="mdi mdi-alert-circle tw-text-red" />;
    }
    return <span className="mdi mdi-cancel tw-text-gray-400" />;
};

const DeviceStatus = () => {
    const dispatch = useAppDispatch();
    const { selectedOrgSlug = '', selectedProjectSlug = '' } =
        useAppSelector(getAccount);
    const {
        deviceId = '',
        provisioning,
        provisioningError,
    } = useAppSelector(getOnboarding);
    const status = provisioning?.status;

    const pollProvisioning = useCallback(
        () => dispatch(refreshProvisioning()),
        [dispatch],
    );
    usePolling(
        isProvisioningPending(status),
        PROVISIONING_POLL_INTERVAL,
        pollProvisioning,
    );

    useEffect(() => {
        if (status === 'SUCCEEDED') {
            dispatch(telemetryThunk('nRF Cloud Onboarding - Provisioned'));
        }
    }, [status, dispatch]);

    const deviceLink = `${NRF_CLOUD_LINK}/organizations/${encodeURIComponent(
        selectedOrgSlug,
    )}/projects/${encodeURIComponent(
        selectedProjectSlug,
    )}/devices/${encodeURIComponent(deviceId)}?tab=${DEVICE_OVERVIEW_TAB}`;
    const checkIns = [
        provisioning?.firstContactAt &&
            `First contact ${formatTime(provisioning.firstContactAt)}`,
        provisioning?.lastCheckInAt &&
            `Last check-in ${formatTime(provisioning.lastCheckInAt)}`,
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <div className="tw-flex tw-flex-col tw-gap-2">
            <div className="tw-flex tw-flex-row tw-items-center tw-gap-2 tw-text-green-700">
                <span className="mdi mdi-cloud-check-variant-outline tw-text-2xl tw-leading-none" />
                <span>Onboarded</span>
                <IconLink
                    icon="mdi-open-in-new"
                    label="View device in nRF Cloud"
                    link={deviceLink}
                />
            </div>
            <div className="tw-flex tw-flex-row tw-items-start tw-gap-2">
                <ProvisioningIcon status={status} />
                <div className="tw-flex tw-flex-col">
                    <span>
                        {status
                            ? provisioningLabels[status]
                            : 'Checking the provisioning status'}
                    </span>
                    {status === 'FAILED' && provisioning?.failure?.message && (
                        <span className="tw-text-xs tw-text-red">
                            {provisioning.failure.message}
                        </span>
                    )}
                    {checkIns && (
                        <span className="tw-text-xs tw-text-gray-500">
                            {checkIns}
                        </span>
                    )}
                    {provisioningError && (
                        <span className="tw-text-xs tw-text-red">
                            {provisioningError}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const ManualOnboarding = ({
    token,
    failed,
    reading,
}: {
    token?: string;
    failed?: string;
    reading: boolean;
}) => (
    <div className="tw-flex tw-flex-col tw-gap-3">
        <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
            <span
                className="mdi mdi-key-chain-variant tw-text-lg tw-leading-none"
                title="Attestation token"
            />
            {reading && <Spinner size="sm" />}
            {token && (
                <>
                    <b
                        title={token}
                        className="tw-block tw-w-60 tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap"
                    >
                        {token}
                    </b>
                    <Copy copyText={token} />
                </>
            )}
        </div>
        <IconLink
            icon="mdi-book-open-variant"
            label="Onboarding instructions"
            link={CONNECTING_LINK}
        />
        <IconLink
            icon="mdi-school-outline"
            label="Developer Academy exercise"
            link={ACADEMY_EXERCISE_LINK}
            event="Opened DevAcademy exercise"
        />
        {failed && (
            <IssueBox
                mdiIcon="mdi-lightbulb-alert-outline"
                color="tw-text-red"
                title={failed}
            />
        )}
    </div>
);

export default ({ vComIndex }: { vComIndex: number }) => {
    const dispatch = useAppDispatch();
    const account = useAppSelector(getAccount);
    const attestationToken = useAppSelector(getAttestationToken);
    const attestationTokenError = useAppSelector(getAttestationTokenError);
    const onboarding = useAppSelector(getOnboarding);
    const deviceConnected = useAppSelector(selectedDeviceIsConnected);

    const [authState, setAuthState] = useState<AuthState | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);
    const [manual, setManual] = useState(false);
    const [readingToken, setReadingToken] = useState(false);

    const authStatus = authState?.status;
    const isSignedIn = authStatus === 'signedIn' || authStatus === 'signingOut';
    const isSigningIn = authStatus === 'signingIn';
    const isOnboarding = onboarding.status === 'loading';

    useEffect(() => {
        auth.getAuthStatus().then(setAuthState);
        auth.registerOnStateChanged(state => {
            if (state.status === 'signedOut') {
                dispatch(resetAccount());
            }
            setAuthState(state);
        });
    }, [dispatch]);

    useEffect(() => {
        if (authStatus === 'signedIn') {
            dispatch(telemetryThunk('nRF Cloud Onboarding - Signed in'));
        }
    }, [authStatus, dispatch]);

    useEffect(() => {
        if (authStatus === 'signedIn' && account.status === 'idle') {
            dispatch(loadAccount());
        }
    }, [authStatus, account.status, dispatch]);

    useEffect(() => {
        if (onboarding.status === 'success') {
            dispatch(telemetryThunk('nRF Cloud Onboarding - Onboarded'));
        }
    }, [onboarding.status, dispatch]);

    useEffect(() => {
        if (
            !manual ||
            !deviceConnected ||
            attestationToken ||
            attestationTokenError ||
            readingToken
        ) {
            return;
        }
        dispatch(telemetryThunk('nRF Cloud Onboarding - Manual onboarding'));
        setReadingToken(true);
        dispatch(readAttestationToken(vComIndex))
            .catch(() => {})
            .finally(() => setReadingToken(false));
    }, [
        manual,
        deviceConnected,
        attestationToken,
        attestationTokenError,
        readingToken,
        vComIndex,
        dispatch,
    ]);

    const signIn = async () => {
        setAuthError(null);
        try {
            const result = await auth.startSignIn();
            if (!result.status) {
                setAuthError(result.error);
                return;
            }
            dispatch(resetAccount());
        } catch (e) {
            setAuthError(describeError(e));
        }
    };

    const signOut = async () => {
        await auth.singleSignOut();
        dispatch(resetAccount());
    };

    const orgItems: DropdownItem<string>[] = account.organizations.map(o => ({
        label: o.name,
        value: o.slug,
    }));
    const projectItems: DropdownItem<string>[] = account.projects.map(p => ({
        label: p.name,
        value: p.slug,
    }));
    const selectedOrgItem =
        orgItems.find(i => i.value === account.selectedOrgSlug) ?? emptyItem;
    const selectedProjectItem =
        projectItems.find(i => i.value === account.selectedProjectSlug) ??
        emptyItem;

    const activeStageIndex = onboardingStages.findIndex(
        ({ id }) => id === onboarding.stage,
    );

    const canOnboard =
        deviceConnected &&
        authStatus === 'signedIn' &&
        account.status === 'success' &&
        !!account.selectedProjectSlug &&
        !isOnboarding;

    const signedInContent = (
        <>
            <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                <span className="mdi mdi-account-circle-outline tw-text-lg tw-leading-none" />
                <b>
                    {authState?.account?.name ?? authState?.account?.username}
                </b>
                <Button
                    variant="link-button"
                    size="sm"
                    title="Sign out"
                    onClick={signOut}
                    disabled={authStatus === 'signingOut' || isOnboarding}
                >
                    <span className="mdi mdi-logout tw-text-base tw-leading-none" />
                </Button>
            </div>

            {account.status === 'loading' && <Spinner size="sm" />}

            {account.status === 'success' && (
                <div className="tw-flex tw-flex-row tw-gap-2">
                    <Dropdown
                        label="Organization"
                        items={orgItems}
                        onSelect={item =>
                            dispatch(selectOrganization(item.value))
                        }
                        numItemsBeforeScroll={10}
                        selectedItem={selectedOrgItem}
                        disabled={isOnboarding}
                        size="sm"
                    />
                    <Dropdown
                        label="Project"
                        items={projectItems}
                        onSelect={item =>
                            dispatch(setSelectedProjectSlug(item.value))
                        }
                        numItemsBeforeScroll={10}
                        selectedItem={selectedProjectItem}
                        disabled={isOnboarding}
                        size="sm"
                    />
                </div>
            )}

            {account.status === 'error' && (
                <IssueBox
                    mdiIcon="mdi-lightbulb-alert-outline"
                    color="tw-text-red"
                    title={
                        account.message ??
                        'Failed to load organizations and projects'
                    }
                />
            )}
        </>
    );

    const signedOutContent = (
        <>
            <div className="tw-flex tw-flex-row tw-gap-2.5">
                <Button
                    variant="link-button"
                    size="xl"
                    onClick={signIn}
                    className="tw-w-fit"
                    disabled={isSigningIn}
                >
                    <div className="tw-flex tw-flex-row tw-items-center tw-justify-center tw-gap-2">
                        <img
                            src={Logomark}
                            alt="myNordic logo"
                            className="tw-h-[17px] tw-w-[20px]"
                        />
                        <span>Sign in with myNordic</span>
                        {isSigningIn && <Spinner size="sm" />}
                    </div>
                </Button>
                {isSigningIn && (
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
        </>
    );

    const automaticOnboarding = (
        <div className="tw-flex tw-flex-col tw-gap-3">
            {isSignedIn ? signedInContent : signedOutContent}

            {(onboarding.status === 'loading' ||
                onboarding.status === 'success') && (
                <ol className="tw-flex tw-flex-row tw-gap-4">
                    {onboardingStages.map((stage, index) => {
                        const complete =
                            onboarding.status === 'success' ||
                            index < activeStageIndex;
                        const active =
                            isOnboarding && index === activeStageIndex;
                        return (
                            <li
                                className="tw-flex tw-items-center tw-gap-1"
                                key={stage.id}
                            >
                                <StageIcon
                                    icon={stage.icon}
                                    active={active}
                                    complete={complete}
                                />
                                <span
                                    className={
                                        active ? 'tw-font-medium' : undefined
                                    }
                                >
                                    {stage.label}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            )}

            {onboarding.status === 'success' && <DeviceStatus />}

            {onboarding.status === 'error' && (
                <IssueBox
                    mdiIcon="mdi-lightbulb-alert-outline"
                    color="tw-text-red"
                    title={
                        onboarding.message ?? 'Failed to onboard the device.'
                    }
                />
            )}
        </div>
    );

    const footer = () => {
        if (manual || onboarding.status === 'success') {
            return <Next />;
        }
        return (
            <>
                <Skip disabled={isOnboarding} />
                <Next
                    label={
                        onboarding.status === 'error'
                            ? 'Retry'
                            : 'Onboard device'
                    }
                    disabled={!canOnboard}
                    onClick={() => dispatch(onboard(vComIndex))}
                />
            </>
        );
    };

    return (
        <Main>
            <Main.Content
                heading="nRF Cloud Onboarding"
                noScrollBar={
                    !manual && isSignedIn && account.status === 'success'
                }
            >
                <div className="tw-flex tw-flex-col tw-gap-3">
                    {manual ? (
                        <ManualOnboarding
                            token={attestationToken}
                            failed={attestationTokenError}
                            reading={readingToken}
                        />
                    ) : (
                        automaticOnboarding
                    )}

                    {!deviceConnected && (
                        <IssueBox
                            mdiIcon="mdi-lightbulb-alert-outline"
                            color="tw-text-red"
                            title="No development kit connected."
                        />
                    )}

                    {onboarding.status !== 'success' && (
                        <Button
                            variant="link-button"
                            size="sm"
                            className="tw-w-fit"
                            disabled={isOnboarding}
                            onClick={() => setManual(!manual)}
                        >
                            <span className="tw-flex tw-flex-row tw-items-center tw-gap-1">
                                <span
                                    className={`mdi ${
                                        manual
                                            ? 'mdi-auto-fix'
                                            : 'mdi-hand-back-right-outline'
                                    } tw-text-base tw-leading-none`}
                                />
                                {manual
                                    ? 'Onboard automatically'
                                    : 'Onboard manually'}
                            </span>
                        </Button>
                    )}
                </div>
            </Main.Content>
            <Main.Footer>
                {isOnboarding && (
                    <div className="tw-flex tw-flex-row tw-items-center tw-pr-4 tw-text-primary">
                        <Spinner size="lg" />
                    </div>
                )}
                <Back disabled={isOnboarding} />
                {footer()}
            </Main.Footer>
        </Main>
    );
};
