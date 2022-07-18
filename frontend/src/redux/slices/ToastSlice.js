import { createSlice } from "@reduxjs/toolkit";

// App Toast State
const ToastSlice = createSlice({
  name: "ToastState",
  initialState: {
    toastData: {
      isOpen: false,
      title: "",
      message: "Default toast message",
      type: "success",
      duration: 5000,
      position: "bottom-center",
    },
  },
  reducers: {
    displayToast: (state, action) => {
      state.toastData = { ...action.payload, isOpen: true };
    },
    hideToast: (state) => {
      state.toastData.isOpen = false;
    },
  },
});

export const { displayToast, hideToast } = ToastSlice.actions;

export const selectToastState = (state) => state.ToastData;

export default ToastSlice.reducer;
