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
        {title && (
          <AlertTitle
            style={{ fontFamily: "Mirza", fontSize: "20px", marginTop: "-8px" }}
            className="fw-bold user-select-none"
          >
            {title}
          </AlertTitle>
        )}
        <div style={{ fontSize: "17px", marginTop: "-4px" }}>{message}</div>
      </Alert>
    </Snackbar>
  );
};

export default AppToast;
