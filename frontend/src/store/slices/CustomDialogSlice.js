import { createSlice } from "@reduxjs/toolkit";

// Custom Dialog State
const CustomDialogSlice = createSlice({
  name: "CustomDialogState",
  initialState: {
    dialogData: {
      isOpen: false,
      title: "Alert Dialog",
      nolabel: "NO",
      yeslabel: "YES",
      loadingYeslabel: "Please Wait...",
      action: null,
    },
    showDialogActions: false,
  },
  reducers: {
    setShowDialogActions: (state, action) => {
      state.showDialogActions = action.payload;
    },
    displayDialog: (state, action) => {
      state.dialogData = { ...action.payload, isOpen: true };
    },
    hideDialog: (state) => {
      state.dialogData["isOpen"] = false;
    },
    setDialogAction: (state, action) => {
      state.dialogData["action"] = action.payload;
    },
    setDialogTitle: (state, action) => {
      state.dialogData["title"] = action.payload;
    },
  },
});

export const {
  setShowDialogActions,
  displayDialog,
  hideDialog,
  setDialogAction,
  setDialogTitle,
} = CustomDialogSlice.actions;

export const selectCustomDialogState = (state) => state.CustomDialogData;

export default CustomDialogSlice.reducer;
