import AppReducer from "./slices/AppSlice.js";
import ChildDialogReducer from "./slices/ChildDialogSlice.js";
import CustomDialogReducer from "./slices/CustomDialogSlice.js";
import FormfieldReducer from "./slices/FormfieldSlice.js";
import ToastReducer from "./slices/ToastSlice.js";

const rootReducer = {
  AppData: AppReducer,
  ChildDialogData: ChildDialogReducer,
  CustomDialogData: CustomDialogReducer,
  FormfieldData: FormfieldReducer,
  ToastData: ToastReducer,
};
export default rootReducer;
