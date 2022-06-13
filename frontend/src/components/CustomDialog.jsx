import { Close } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import { AppState } from "../context/ContextProvider";

const AlertDialog = ({ children }) => {
  const { alertDialogData, handleAlertDialogClose } = AppState();
  const { isOpen, title, content, nolabel, yeslabel, action } = alertDialogData;

  const handleYes = () => {
    handleAlertDialogClose();
    action();
  };

  const btnHoverStyle = {
    ":hover": { backgroundColor: "#93c2f727" },
  };
  const btnCustomStyle = {
    fontSize: "19px",
    color: "#8cc2ff",
    fontFamily: "Mirza",
  };

  return (
    <Dialog
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: "#4d4d4d",
        },
      }}
      open={isOpen}
      onClose={handleAlertDialogClose}
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
          onClick={handleAlertDialogClose}
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
      <DialogContent>
        <DialogContentText
          style={{ fontSize: "19px", color: "#e0e0e0", fontFamily: "Mirza" }}
        >
          {children}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          sx={btnHoverStyle}
          style={btnCustomStyle}
          onClick={handleAlertDialogClose}
        >
          {nolabel}
        </Button>
        <Button sx={btnHoverStyle} style={btnCustomStyle} onClick={handleYes}>
          {yeslabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialog;
