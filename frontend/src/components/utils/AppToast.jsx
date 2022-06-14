import { Alert, AlertTitle, Snackbar } from "@mui/material";
import { AppState } from "../../context/ContextProvider";

const AppToast = () => {
  const { toastData, handleToastClose } = AppState();
  const { isOpen, title, message, type, duration, position } = toastData;
  const positions = position.split("-");
  return (
    <Snackbar
      anchorOrigin={{
        vertical: positions[0],
        horizontal: positions[1],
      }}
      style={{ maxWidth: "340px", margin: "10px auto" }}
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
        {title ? (
          <AlertTitle className="fw-bold user-select-none">{title}</AlertTitle>
        ) : (
          ""
        )}
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AppToast;
