import {
  Close,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
} from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AppState } from "../../context/ContextProvider";

export const btnHoverStyle = {
  ":hover": { backgroundColor: "#93c2f727" },
};
export const btnCustomStyle = {
  fontSize: "19px",
  color: "#8cc2ff",
  fontFamily: "Mirza",
  borderRadius: "10px",
};

const CustomDialog = ({
  children,
  dialogData,
  handleDialogClose,
  showDialogActions,
  showDialogClose,
}) => {
  const { formClassNames, setSelectedChat, closeDialog } = AppState();
  const {
    isFullScreen,
    isOpen,
    title,
    nolabel,
    yeslabel,
    loadingYeslabel,
    action,
  } = dialogData;
  const { loading, disableIfLoading } = formClassNames;
  const navigate = useNavigate();

  const handleYes = async () => {
    const result = await action();
    if (
      result === "profileUpdated" ||
      result === "membersUpdated" ||
      result === "msgActionDone"
    ) {
      handleDialogClose();
    } else if (result === "createdGroup") {
      handleDialogClose();
      // Close Parent Dialog as well
      closeDialog();
    } else if (result === "pwdUpdated" || result === "loggingOut") {
      handleDialogClose();
      setSelectedChat(null);
      navigate("/");
    }
  };

  return (
    <Dialog
      fullScreen={Boolean(isFullScreen)}
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: "#4d4d4d",
        },
      }}
      className={`user-select-none ${disableIfLoading}`}
      open={isOpen}
      onClose={handleDialogClose}
    >
      <DialogTitle
        style={{ fontSize: "26px", color: "#ffffff", fontFamily: "Mirza" }}
      >
        <span
          className="d-flex"
          style={{ marginTop: "-5px", marginRight: "10px" }}
        >
          {title}
        </span>
        {showDialogClose && (
          <IconButton
            onClick={handleDialogClose}
            disabled={loading}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "#999999",
              ":hover": {
                backgroundColor: "#aaaaaa20",
              },
            }}
          >
            <Close />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent
        style={{ fontSize: "19px", color: "#e0e0e0", fontFamily: "Mirza" }}
      >
        {children}
      </DialogContent>
      {showDialogActions && (
        <DialogActions>
          <Button
            sx={btnHoverStyle}
            disabled={loading}
            style={btnCustomStyle}
            onClick={handleDialogClose}
          >
            {nolabel === "Back" ? (
              <span>
                <KeyboardDoubleArrowLeft
                  className="btnArrowIcons"
                  style={{
                    margin: "0px 5px 2px 0px",
                  }}
                />
                Back
              </span>
            ) : (
              nolabel
            )}
          </Button>
          <Button
            sx={btnHoverStyle}
            disabled={loading}
            style={btnCustomStyle}
            onClick={handleYes}
          >
            {loading && yeslabel !== "Next" ? (
              <>
                <CircularProgress size={25} style={{ marginRight: "12px" }} />
                <span style={{ marginRight: "22px" }}>{loadingYeslabel}</span>
              </>
            ) : (
              <>
                {yeslabel === "Next" ? (
                  <span>
                    Next
                    <KeyboardDoubleArrowRight
                      className="btnArrowIcons"
                      style={{
                        marginLeft: "4px",
                      }}
                    />
                  </span>
                ) : (
                  yeslabel
                )}
              </>
            )}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CustomDialog;
