import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ToastData, ToastState } from "../../utils/AppTypes";
import type { RootState } from "../store";

const initialState: ToastState = {
  toastData: {
    isOpen: false,
    title: "",
    message: "Default toast message",
    type: "success",
    duration: 5000,
    position: "bottom-center",
  },
};

// App Toast State
const ToastSlice = createSlice({
  name: "ToastState",
  initialState,
  reducers: {
    displayToast: (state, action: PayloadAction<ToastData>) => {
      state.toastData = { ...action.payload, isOpen: true };
    },
    hideToast: (state) => {
      state.toastData.isOpen = false;
    },
  },
});

export const { displayToast, hideToast } = ToastSlice.actions;

export const selectToastState = (state: RootState) => state.ToastData;

export default ToastSlice.reducer;
