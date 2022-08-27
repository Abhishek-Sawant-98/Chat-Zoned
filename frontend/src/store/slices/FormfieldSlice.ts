import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FormfieldState } from "../../utils/AppTypes";
import type { RootState } from "../store";

const initialState: FormfieldState = {
  loading: false,
  disableIfLoading: ``,
  formLabelClassName: `app__formlabel form-label pointer mb-1 ms-2`,
  formFieldClassName: `app__formfield text-center`,
  inputFieldClassName: `app__inputfield form-control text-info text-center bg-black bg-gradient border-secondary ps-2 pt-1 rounded-pill`,
  btnSubmitClassName: `btn btn-primary d-flex justify-content-center align-items-center col-8 fs-4 rounded-pill`,
  btnResetClassName: `app__btnReset btn btn-outline-secondary text-light fs-4 rounded-pill`,
};

// Form Fields State
const FormfieldSlice = createSlice({
  name: "FormfieldState",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      state.disableIfLoading = `${state.loading ? "disabled notAllowed" : ""}`;
      state.formLabelClassName = `app__formlabel ${state.disableIfLoading} form-label pointer mb-1 ms-2`;
      state.inputFieldClassName = `app__inputfield form-control ${state.disableIfLoading} text-info text-center bg-black bg-gradient border-secondary ps-2 pt-1 rounded-pill`;
      state.btnSubmitClassName = `btn btn-primary ${state.disableIfLoading} d-flex justify-content-center align-items-center col-8 fs-4 rounded-pill`;
      state.btnResetClassName = `app__btnReset ${state.disableIfLoading} btn btn-outline-secondary text-light fs-4 rounded-pill`;
    },
  },
});

export const { setLoading } = FormfieldSlice.actions;

export const selectFormfieldState = (state: RootState) => state.FormfieldData;

export default FormfieldSlice.reducer;
