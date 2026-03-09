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

const MultipleSelectListItem = ({
    selected,
    onSelect,
    children,
}: {
    selected: boolean;
    onSelect: (selected: boolean) => void;
    children: React.ReactNode;
}) => (
    <SelectableItem
        onSelect={() => onSelect(!selected)}
        selected={selected}
        selector={
            <span
                className={classNames(
                    selected
                        ? 'mdi-square-circle tw-text-gray-50'
                        : 'mdi-square-outline tw-text-primary',
                    `mdi tw-text-xl/5`,
                )}
            />
        }
    >
        {children}
    </SelectableItem>
);

export default ({
    items,
    onSelect,
}: {
    items: (SelectableListItem | DisabledListItem)[];
    onSelect: (item: SelectableListItem, selected: boolean) => void;
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
                <MultipleSelectListItem
                    key={item.id}
                    onSelect={selected =>
                        onSelect(item as SelectableListItem, selected)
                    }
                    selected={(item as SelectableListItem).selected}
                >
                    {item.content}
                </MultipleSelectListItem>
            ),
        )}
    </div>
);
