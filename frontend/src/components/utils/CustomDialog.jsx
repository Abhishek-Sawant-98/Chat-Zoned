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
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSelectedChat } from "../../store/slices/AppSlice";
import { hideDialog } from "../../store/slices/CustomDialogSlice";
import { selectFormfieldState } from "../../store/slices/FormfieldSlice";
import { truncateString } from "../../utils/appUtils";

export const btnHoverStyle = { ":hover": { backgroundColor: "#93c2f727" } };
export const btnCustomStyle = {
  fontSize: 17,
  color: "#8cc2ff",
  fontFamily: "Trebuchet MS",
  borderRadius: 10,
};

const CustomDialog = ({
  children,
  dialogData,
  showDialogActions,
  showDialogClose,
  closeDialog,
}) => {
  const { loading, disableIfLoading } = useSelector(selectFormfieldState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    isFullScreen,
    isOpen,
    title,
    nolabel,
    yeslabel,
    loadingYeslabel,
    action,
  } = dialogData;

  const handleDialogClose = () => {
    if (closeDialog) return closeDialog();
    dispatch(hideDialog());
  };

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
      dispatch(hideDialog());
    } else if (result === "pwdUpdated" || result === "loggingOut") {
      handleDialogClose();
      dispatch(setSelectedChat(null));
      navigate("/");
    }
  };

  return (
    <Dialog
      fullScreen={Boolean(isFullScreen)}
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundImage: "linear-gradient(0deg,#353535,#444)",
        },
      }}
      className={`user-select-none ${disableIfLoading}`}
      open={isOpen}
      onClose={handleDialogClose}
    >
      <DialogTitle
        style={{
          fontSize: 25,
          color: "#A4D0F0",
          fontFamily: "Trebuchet MS",
          fontWeight: "bold",
        }}
      >
        <span
          className="d-flex"
          title={title}
          style={{ marginTop: -5, marginRight: 10 }}
        >
          {truncateString(title, 24, 21)}
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
        style={{ fontSize: 19, color: "#e0e0e0", fontFamily: "Trebuchet MS" }}
      >
        {children || <></>}
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
                <CircularProgress size={25} style={{ marginRight: 12 }} />
                <span style={{ marginRight: 22 }}>{loadingYeslabel}</span>
              </>
            ) : (
              <>
                {yeslabel === "Next" ? (
                  <span>
                    Next
                    <KeyboardDoubleArrowRight
                      className="btnArrowIcons"
                      style={{
                        marginLeft: 4,
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
