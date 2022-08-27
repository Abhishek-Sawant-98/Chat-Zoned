import AppReducer from "./slices/AppSlice";
import ChildDialogReducer from "./slices/ChildDialogSlice";
import CustomDialogReducer from "./slices/CustomDialogSlice";
import FormfieldReducer from "./slices/FormfieldSlice";
import ToastReducer from "./slices/ToastSlice";

const rootReducer = {
  AppData: AppReducer,
  ChildDialogData: ChildDialogReducer,
  CustomDialogData: CustomDialogReducer,
  FormfieldData: FormfieldReducer,
  ToastData: ToastReducer,
};
export default rootReducer;
