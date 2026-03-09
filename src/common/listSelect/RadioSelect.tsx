/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { classNames } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    type DisabledListItem,
    DisabledListItemContainer,
    SelectableItem,
    type SelectableListItem,
} from './ListSelectItem';

const RadioSelectListItem = ({
    onSelect,
    children,
    selected,
}: {
    onSelect: () => void;
    children: React.ReactNode;
    selected: boolean;
}) => (
    <SelectableItem
        onSelect={onSelect}
        selected={selected}
        selector={
            <span
                className={classNames(
                    selected
                        ? 'mdi-radiobox-marked tw-text-gray-50'
                        : 'mdi-radiobox-blank tw-text-primary',
                    `mdi tw-text-xl/5`,
                )}
            />
        }
    >
        {children}
    </SelectableItem>
);

export const RadioSelect = <T extends SelectableListItem>({
    items,
    onSelect,
}: {
    items: (T | DisabledListItem)[];
    onSelect: (item: T) => void;
}) => (
    <div className="tw-flex tw-flex-col tw-gap-px">
        {items.map(item =>
            (item as DisabledListItem).disabled ? (
                <DisabledListItemContainer
                    key={item.id}
                    disabledSelector={
                        (item as DisabledListItem).disabledSelector
                    }
                >
                    {item.content}
                </DisabledListItemContainer>
            ) : (
                <RadioSelectListItem
                    key={item.id}
                    onSelect={() => onSelect(item as T)}
                    selected={(item as SelectableListItem).selected}
                >
                    {item.content}
                </RadioSelectListItem>
            ),
        )}
    </div>
);
