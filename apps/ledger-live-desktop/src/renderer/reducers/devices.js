// @flow

import { handleActions } from "redux-actions";
import { getEnv } from "@ledgerhq/live-common/env";
import type { Device } from "@ledgerhq/live-common/hw/actions/types";
import { DeviceModelId } from "@ledgerhq/devices";

export type DevicesState = {
  currentDevice: ?Device,
  devices: Device[],
};

const initialState: DevicesState = {
  currentDevice: null,
  devices: [],
};

function setCurrentDevice(state) {
  const currentDevice = state.devices.length ? state.devices[state.devices.length - 1] : null;
  return { ...state, currentDevice };
}

const handlers: Object = {
  RESET_DEVICES: () => initialState,
  ADD_DEVICE: (state: DevicesState, { payload: device }: { payload: Device }) => {
    const duplicate = state.devices.some(
      d => d.deviceId === device.deviceId || d.deviceId?.id === device.deviceId?.id,
    );
    if (duplicate && state.currentDevice) return state;
    return setCurrentDevice({
      ...state,
      devices: duplicate ? state.devices : [...state.devices, device],
    });
  },
  REMOVE_DEVICE: (state: DevicesState, { payload: device }: { payload: Device }) => ({
    ...state,
    currentDevice:
      state.currentDevice && state.currentDevice.deviceId === device.deviceId
        ? null
        : state.currentDevice,
    devices: state.devices.filter(d => d.deviceId !== device.deviceId),
  }),
  SET_CURRENT_DEVICE: (state: DevicesState, { payload: currentDevice }: { payload: Device }) => ({
    ...state,
    currentDevice,
  }),
};

export function getCurrentDevice(state: { devices: DevicesState }) {
  if (getEnv("DEVICE_PROXY_URL") || getEnv("MOCK")) {
    // bypass the listen devices (we should remove modelId here by instead get it at open time if needed)
    return { deviceId: "", wired: true, modelId: DeviceModelId.nanoS };
  }
  return state.devices.currentDevice;
}

export function getDevices(state: { devices: DevicesState }) {
  if (getEnv("DEVICE_PROXY_URL")) {
    // bypass the listen devices
    return [{ deviceId: "", wired: true, modelId: DeviceModelId.nanoS }];
  }
  return state.devices.devices;
}

export default handleActions(handlers, initialState);
