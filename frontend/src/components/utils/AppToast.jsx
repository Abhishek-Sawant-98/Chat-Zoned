import { Alert, AlertTitle, Snackbar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { hideToast, selectToastState } from "../../store/slices/ToastSlice";

const AppToast = () => {
  const { toastData } = useSelector(selectToastState);
  const dispatch = useDispatch();

  const handleToastClose = (event, reason) => {
    if (reason === "clickaway") return;
    dispatch(hideToast());
  };

  const { isOpen, title, message, type, duration, position } = toastData;
  const positions = position.split("-");
  return (
    <Snackbar
      anchorOrigin={{
        vertical: positions[0],
        horizontal: positions[1],
      }}
      style={{ maxWidth: 340, margin: "10px auto" }}
      open={isOpen}
      autoHideDuration={duration}
      onClose={handleToastClose}
    >
      <Alert
        className="text-start"
        variant="filled"
        severity={type}
        onClose={handleToastClose}
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
