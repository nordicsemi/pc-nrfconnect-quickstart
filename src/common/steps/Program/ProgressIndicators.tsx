/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Button, classNames } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    type AppThunk,
    useAppDispatch,
    useAppSelector,
} from '../../../app/store';
import { type DeviceWithSerialnumber } from '../../../features/device/deviceLib';
import {
    type ActionListEntry,
    getSelectedDeviceUnsafely,
} from '../../../features/device/deviceSlice';
import Link from '../../Link';
import { runProgrammingAction } from './actionVariants/actionList';
import {
    getCurrentAction,
    getError,
    getProgrammingProgress,
    hideConfirmDialog,
} from './programSlice';

const ProgressBar = ({
    percentage,
    failed,
    skipped,
}: {
    percentage: number;
    failed?: boolean;
    skipped?: boolean;
}) => (
    <div className="tw-h-1 tw-w-full tw-bg-gray-50">
        <div
            className={classNames(
                'tw-h-full',
                skipped && !failed && 'tw-bg-amber',
                percentage < 100 && failed && !skipped && 'tw-bg-red',
                percentage < 100 && !failed && !skipped && 'tw-bg-primary',
                percentage >= 100 && 'tw-bg-green',
            )}
            style={{ width: `${failed || skipped ? 100 : percentage}%` }}
        />
    </div>
);

const ConfirmButton = ({
    type,
    action,
    device,
}: {
    type: 'Confirm' | 'Cancel';
    action:
        | ActionListEntry
        | ((device: DeviceWithSerialnumber) => AppThunk<Promise<void>>);
    device: DeviceWithSerialnumber;
}) => {
    const dispatch = useAppDispatch();
    return (
        <Button
            variant={type === 'Confirm' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
                dispatch(hideConfirmDialog());
                if (typeof action === 'function') dispatch(action(device));
                else dispatch(runProgrammingAction(device, action));
            }}
        >
            {type}
        </Button>
    );
};

const Confirm = ({ text }: { text: string }) => {
    const currentAction = useAppSelector(getCurrentAction);
    const device = useAppSelector(getSelectedDeviceUnsafely);
    if (
        !!currentAction &&
        'config' in currentAction &&
        currentAction.config.type === 'custom' &&
        currentAction.config.onConfirm &&
        currentAction.config.onCancel
    ) {
        const { onConfirm, onCancel } = currentAction.config;
        return (
            <div className="tw-flex tw-flex-row tw-gap-3 tw-bg-gray-800 tw-p-4">
                <span className="mdi mdi-alert-outline tw-align-middle tw-text-3xl/8 tw-text-white" />
                <div className="tw-text-white">{text}</div>
                <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
                    <ConfirmButton
                        type="Cancel"
                        action={onCancel}
                        device={device}
                    />
                    <ConfirmButton
                        type="Confirm"
                        action={onConfirm}
                        device={device}
                    />
                </div>
            </div>
        );
    }

    return null;
};

export default () => {
    const programProgress = useAppSelector(getProgrammingProgress);
    const failed = !!useAppSelector(getError);

    return (
        <div
            className={`tw-flex tw-w-full tw-flex-col ${
                programProgress.length === 4 ? 'tw-gap-[15px]' : 'tw-gap-8'
            }`}
        >
            {programProgress.map(
                ({ title, link, progress, confirm, skipped }) => (
                    <div key={title} className="tw-flex tw-flex-col tw-gap-1">
                        <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-text-sm">
                            <p>{title}</p>
                            {link && (
                                <Link label={link.label} href={link.href} />
                            )}
                        </div>
                        <ProgressBar
                            percentage={progress}
                            failed={failed}
                            skipped={skipped}
                        />
                        {confirm?.visible && !failed && !skipped && (
                            <Confirm text={confirm.text} />
                        )}
                    </div>
                ),
            )}
        </div>
    );
};
