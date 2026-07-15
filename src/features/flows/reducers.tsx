/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { combineReducers } from '@reduxjs/toolkit';

import type { AppThunk } from '../../app/store';
import nrf54l15Cloud, {
    reset as nrf54l15CloudReset,
} from './nRF54L15_cloud/evaluate/cloudEvaluateSlice';
import nrf9151, { reset as nrf9151Reset } from './nRF9151/nrf9151Slice';
import nrf9151SMA, {
    reset as nrf9151SMAReset,
} from './nRF9151SMA/nrf9151SMASlice';
import nrf9161, { reset as nrf9161Reset } from './nRF9161/nrf9161Slice';
import thingy91x, { reset as thingy91xReset } from './thingy91x/thingy91xSlice';

export const allReset = (): AppThunk => dispatch => {
    dispatch(nrf9151Reset());
    dispatch(nrf9151SMAReset());
    dispatch(nrf9161Reset());
    dispatch(thingy91xReset());
    dispatch(nrf54l15CloudReset());
};

export default combineReducers({
    nrf9151SMA,
    thingy91x,
    nrf9151,
    nrf9161,
    nrf54l15Cloud,
});
