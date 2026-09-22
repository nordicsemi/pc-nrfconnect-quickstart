/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo } from 'react';
import {
    InfoBox,
    IssueBox,
    Spinner,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import { Back } from '../../Back';
import Main from '../../Main';
import { Next, Skip } from '../../Next';
import { retry } from './programEffects';
import {
    getError,
    getNotes,
    getProgrammingProgress,
    reset,
} from './programSlice';
import ProgressIndicators from './ProgressIndicators';

export default () => {
    const dispatch = useAppDispatch();
    const notes = useAppSelector(getNotes);
    const error = useAppSelector(getError);
    const programmingProgress = useAppSelector(getProgrammingProgress);
    const succeeded = programmingProgress?.every(
        p => p.progress === 100 || p.skipped,
    );
    const programming = !error && !succeeded;

    const header = useMemo(() => {
        if (error) return 'Programming failed';
        if (succeeded) return 'Programming successful';
        return 'Programming';
    }, [error, succeeded]);

    return (
        <Main>
            <Main.Content heading={header}>
                <ProgressIndicators />
                <div className="tw-pt-8">
                    {!error &&
                        notes.length > 0 &&
                        notes.map(({ title, content }) => (
                            <div
                                key="title"
                                className="tw-flex tw-flex-col tw-gap-2"
                            >
                                <InfoBox
                                    mdiIcon="mdi-information-outline"
                                    color="tw-text-primary"
                                    title={title}
                                    content={content}
                                />
                            </div>
                        ))}
                    {!!error && (
                        <IssueBox
                            mdiIcon={error.icon}
                            color="tw-text-red"
                            title={error.text}
                        />
                    )}
                </div>
            </Main.Content>
            <Main.Footer>
                {programming && (
                    <div className="tw-flex tw-flex-row tw-items-center tw-pr-4 tw-text-primary">
                        <Spinner size="lg" />
                    </div>
                )}
                <Back
                    onClick={() => {
                        dispatch(reset());
                    }}
                    disabled={programming}
                />
                {error ? (
                    <>
                        <Skip disabled={programming} />
                        <Next
                            label={error.buttonText || 'Retry'}
                            onClick={() => dispatch(retry(error.retryRef))}
                        />
                    </>
                ) : (
                    <Next disabled={programming} />
                )}
            </Main.Footer>
        </Main>
    );
};
