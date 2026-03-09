/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    type TypedUseSelectorHook,
    useDispatch,
    useSelector,
} from 'react-redux';
import {
    type AnyAction,
    configureStore,
    type ThunkAction,
} from '@reduxjs/toolkit';

import steps from '../common/steps/stepReducers';
import device from '../features/device/deviceSlice';
import flowProgress from '../features/flow/flowSlice';
import flows from '../features/flows/reducers';

const ifBuiltForDevelopment = <X>(value: X) =>
    process.env.NODE_ENV === 'development' ? value : undefined;

export const store = configureStore({
    reducer: {
        device,
        flowProgress,
        steps,
        flows,
    },
    devTools: {
        maxAge: ifBuiltForDevelopment(100),
        serialize: ifBuiltForDevelopment(true),
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<AppLayout = RootState, ReturnType = void> = ThunkAction<
    ReturnType,
    AppLayout,
    unknown,
    AnyAction
>;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
