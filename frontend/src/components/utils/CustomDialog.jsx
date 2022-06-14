import { Close } from "@mui/icons-material";
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

const CustomDialog = ({
  children,
  dialogData,
  handleDialogClose,
  showDialogActions,
}) => {
  const { formClassNames } = AppState();
  const { isOpen, title, nolabel, yeslabel, action } = dialogData;
  const { loading, disableIfLoading } = formClassNames;
  const navigate = useNavigate();

  const handleYes = async () => {
    const result = await action();
    if (result === "profileUpdated") handleDialogClose();
    else if (result === "passwordUpdated" || result === "loggingOut") {
      handleDialogClose();
      navigate("/");
    }
  };

  const btnHoverStyle = {
    ":hover": { backgroundColor: "#93c2f727" },
  };
  const btnCustomStyle = {
    fontSize: "19px",
    color: "#8cc2ff",
    fontFamily: "Mirza",
    borderRadius: "10px",
  };

  return (
    <Dialog
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
          style={{ marginTop: "-5px", marginRight: "70px" }}
        >
          {title}
        </span>
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
            {nolabel}
          </Button>
          <Button
            sx={btnHoverStyle}
            disabled={loading}
            style={btnCustomStyle}
            onClick={handleYes}
          >
            {loading ? (
              <>
                <CircularProgress size={25} style={{ marginRight: "12px" }} />
                <span style={{ marginRight: "22px" }}>{`Saving...`}</span>
              </>
            ) : (
              `${yeslabel}`
            )}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CustomDialog;
