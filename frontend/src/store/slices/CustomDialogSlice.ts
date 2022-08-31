import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CustomDialogState, DialogData, falsyType } from "../../utils/AppTypes";
import type { RootState } from "../store";

// isFullScreen,
// isOpen,
// title,
// nolabel,
// yeslabel,
// loadingYeslabel,
// action,

const initialState: CustomDialogState = {
  dialogData: {
    isOpen: false,
    title: "Alert Dialog",
    nolabel: "NO",
    yeslabel: "YES",
    loadingYeslabel: "Please Wait...",
    action: null,
  },
  showDialogActions: false,
};

// Custom Dialog State
const CustomDialogSlice = createSlice({
  name: "CustomDialogState",
  initialState,
  reducers: {
    setShowDialogActions: (state, action: PayloadAction<boolean>) => {
      state.showDialogActions = action.payload;
    },
    displayDialog: (state, action: PayloadAction<DialogData>) => {
      state.dialogData = { ...action.payload, isOpen: true };
    },
    hideDialog: (state) => {
      state.dialogData["isOpen"] = false;
    },
    setDialogAction: (state, action: PayloadAction<Function | falsyType>) => {
      state.dialogData["action"] = action.payload;
    },
    setDialogTitle: (state, action: PayloadAction<string>) => {
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

export const selectCustomDialogState = (state: RootState) =>
  state.CustomDialogData;

export default CustomDialogSlice.reducer;
