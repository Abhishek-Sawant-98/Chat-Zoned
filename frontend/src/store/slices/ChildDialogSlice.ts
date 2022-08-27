import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChildDialogMethods, ChildDialogState } from "../../utils/AppTypes";
import type { RootState } from "../store";

const initialState: ChildDialogState = {
  childDialogMethods: {
    setChildDialogBody: null,
    displayChildDialog: null,
    closeChildDialog: null,
  },
};

// Child Dialog State
const ChildDialogSlice = createSlice({
  name: "ChildDialogState",
  initialState,
  reducers: {
    setChildDialogMethods: (
      state,
      action: PayloadAction<ChildDialogMethods>
    ) => {
      state.childDialogMethods = action.payload;
    },
  },
});

export const { setChildDialogMethods } = ChildDialogSlice.actions;

export const selectChildDialogState = (state: RootState) =>
  state.ChildDialogData;

export default ChildDialogSlice.reducer;
