/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { telemetry } from '@nordicsemiconductor/pc-nrfconnect-shared';

import vscodeIcon from '../../../../resources/vscode.svg';
import vscodeAltIcon from '../../../../resources/vscode-alt.svg';
import { useAppDispatch } from '../../../app/store';
import { Back } from '../../Back';
import { type ListItemVariant } from '../../listSelect/ListSelectItem';
import { RadioSelect } from '../../listSelect/RadioSelect';
import Main from '../../Main';
import { Next, Skip } from '../../Next';
import { DevelopState, setDevelopState } from './developSlice';
import { detectVsCode } from './vsCodeEffects';

type Item = ListItemVariant & {
    state: DevelopState;
};

export default () => {
    const dispatch = useAppDispatch();
    const [selected, setSelected] = useState<Item>();

    useEffect(() => {
        detectVsCode(dispatch);
    }, [dispatch]);

    const items = [
        {
            id: 'vscode',
            state: DevelopState.OPEN_VS_CODE,
            selected: selected?.id === 'vscode',
            content: (
                <div className="tw-flex tw-flex-row tw-items-start tw-justify-start tw-text-sm">
                    <div className="tw-w-32 tw-flex-shrink-0 tw-pr-10">
                        <div className="tw-flex tw-flex-col tw-items-center tw-gap-4">
                            <b>VS Code IDE</b>
                            <img
                                src={
                                    selected?.id === 'vscode'
                                        ? vscodeAltIcon
                                        : vscodeIcon
                                }
                                alt="VS Code icon"
                                className="tw-h-10 tw-w-10"
                            />
                        </div>
                    </div>
                    <div>
                        Use the recommended nRF Connect Extension Pack for
                        building and debugging applications based on the nRF
                        Connect SDK in Visual Studio Code.
                    </div>
                </div>
            ),
        },
        {
            id: 'cli',
            state: DevelopState.CLI,
            selected: selected?.id === 'cli',
            content: (
                <div className="tw-flex tw-flex-row tw-items-start tw-justify-start tw-text-sm">
                    <div className="tw-w-32 tw-flex-shrink-0 tw-pr-5">
                        <div>
                            <b>Command Line</b>
                        </div>
                    </div>
                    <div>
                        Use the nRF Util and west tools to configure and build
                        applications based on the nRF Connect SDK in a command
                        line environment.
                    </div>
                </div>
            ),
        },
    ];

    return (
        <Main>
            <Main.Content heading="How would you like to start developing">
                <RadioSelect items={items} onSelect={setSelected} />
            </Main.Content>
            <Main.Footer>
                <Back />
                <Skip />
                <Next
                    disabled={!selected}
                    onClick={() => {
                        if (selected == null) {
                            return;
                        }

                        telemetry.sendEvent('Selected developing option', {
                            option: selected.id,
                        });

                        dispatch(setDevelopState(selected.state));
                    }}
                />
            </Main.Footer>
        </Main>
    );
};
