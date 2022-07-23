import { createSlice } from "@reduxjs/toolkit";

// Child Dialog State
const ChildDialogSlice = createSlice({
  name: "ChildDialogState",
  initialState: {
    childDialogMethods: {
      setChildDialogBody: null,
      displayChildDialog: null,
      closeChildDialog: null,
    },
  },
  reducers: {
    setChildDialogMethods: (state, action) => {
      state.childDialogMethods = action.payload;
    },
  },
});

export const { setChildDialogMethods } = ChildDialogSlice.actions;

export const selectChildDialogState = (state) => state.ChildDialogData;

export default ChildDialogSlice.reducer;
