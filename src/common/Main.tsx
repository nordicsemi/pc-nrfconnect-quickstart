/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { type ReactNode } from 'react';

const Content = ({
    heading,
    subHeading,
    className = '',
    children,
}: {
    heading: string;
    subHeading?: string;
    className?: string;
    children: ReactNode;
}) => (
    <div className="tw-flex tw-flex-col tw-items-start tw-justify-start tw-overflow-hidden tw-pb-8 tw-pr-6 tw-text-start tw-text-sm tw-text-gray-700">
        <h1 className="tw-pb-4 tw-text-2xl/6 tw-font-medium">{heading}</h1>
        <h2 className="tw-pb-8">{subHeading || '‎'}</h2>
        <div className={`scrollbar tw-w-full ${className}`}>{children}</div>
    </div>
);

const Footer = ({
    className = '',
    children,
}: {
    className?: string;
    children?: ReactNode;
}) => (
    <div
        className={`tw-flex tw-flex-row tw-justify-end tw-gap-2 tw-pr-10 ${className}`}
    >
        {children}
    </div>
);

const Main = ({
    className = '',
    children,
}: {
    className?: string;
    children: ReactNode;
}) => (
    <div
        className={`tw-flex tw-h-full tw-max-h-full tw-flex-col tw-justify-between tw-py-10 tw-pl-10 ${className}`}
    >
        {children}
    </div>
);

Main.Content = Content;
Main.Footer = Footer;

export default Main;
