import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducer.js";

export default configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
