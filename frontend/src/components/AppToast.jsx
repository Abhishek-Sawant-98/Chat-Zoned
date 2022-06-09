import { Alert, AlertTitle, Snackbar } from "@mui/material";
import { AppState } from "../context/ContextProvider";

const AppToast = () => {
  const { toastData, handleToastClose } = AppState();
  return (
    <Snackbar
      anchorOrigin={{
        vertical: toastData.position.split("-")[0],
        horizontal: toastData.position.split("-")[1],
      }}
      open={toastData.isOpen}
      autoHideDuration={toastData.duration}
      onClose={handleToastClose}
    >
      <Alert
        variant="filled"
        severity={toastData.type}
        onClose={handleToastClose}
      >
        {toastData.title ? (
          <AlertTitle className="text-start fw-bold user-select-none">
            {toastData.title}
          </AlertTitle>
        ) : (
          ""
        )}
        {toastData.message}
      </Alert>
    </Snackbar>
  );
};

export default AppToast;
