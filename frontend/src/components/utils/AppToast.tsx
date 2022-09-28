import {
  Alert,
  AlertColor,
  AlertTitle,
  Snackbar,
  SnackbarCloseReason,
} from "@mui/material";
import { SyntheticEvent } from "react";
import { hideToast, selectToastState } from "../../store/slices/ToastSlice";
import { useAppDispatch, useAppSelector } from "../../store/storeHooks";

const AppToast = () => {
  const { toastData } = useAppSelector(selectToastState);
  const dispatch = useAppDispatch();

  const handleToastClose = (
    event: Event | SyntheticEvent<any | Event>,
    reason: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") return;
    dispatch(hideToast());
  };

  const { isOpen, title, message, type, duration, position } = toastData;
  const positions = position.split("-");
  return (
    <Snackbar
      anchorOrigin={{
        vertical: positions[0] as "top" | "bottom",
        horizontal: positions[1] as "left" | "right" | "center",
      }}
      style={{ maxWidth: 340, margin: "10px auto" }}
      open={isOpen}
      autoHideDuration={duration}
      onClose={handleToastClose}
    >
      <Alert
        className="text-start"
        variant="filled"
        severity={type as AlertColor}
        onClose={
          handleToastClose as (event: SyntheticEvent<Element, Event>) => void
        }
      >
        {title && (
          <AlertTitle
            style={{ fontFamily: "Trebuchet MS", fontSize: 20, marginTop: -8 }}
            className="fw-bold user-select-none"
          >
            {title}
          </AlertTitle>
        )}
        <div style={{ fontSize: 17, marginTop: -4 }}>{message}</div>
      </Alert>
    </Snackbar>
  );
};

export default AppToast;
