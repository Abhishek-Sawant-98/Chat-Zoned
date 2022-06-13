import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

const ContextProvider = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState({});
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState({});

  // Toast config
  const [toastData, setToastData] = useState({
    isOpen: false,
    title: "",
    message: "Default toast message",
    type: "success",
    duration: 5000,
    position: "bottom-center",
  });

  const displayToast = (options) => {
    setToastData({
      isOpen: true,
      ...options,
    });
  };
  const handleToastClose = (event, reason) => {
    if (reason === "clickaway") return;
    setToastData({ ...toastData, isOpen: false });
  };

  // Menu anchors config
  const [msgSettingsMenuAnchor, setMsgSettingsMenuAnchor] = useState(null);
  const [notificationsMenuAnchor, setNotificationsMenuAnchor] = useState(null);
  const [profileSettingsMenuAnchor, setProfileSettingsMenuAnchor] =
    useState(null);

  // Alert dialog config
  const [dialogData, setDialogData] = useState({
    isOpen: false,
    title: "Alert Dialog",
    content: "Dialog Content",
    nolabel: "NO",
    yeslabel: "YES",
    action: () => {},
  });
  const [dialogBody, setDialogBody] = useState();

  const displayAlertDialog = (options) => {
    setDialogData({
      isOpen: true,
      ...options,
    });
  };
  const handleAlertDialogClose = () => {
    setDialogData({ ...dialogData, isOpen: false });
  };

  return (
    <AppContext.Provider
      value={{
        loggedInUser,
        setLoggedInUser,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        toastData,
        displayToast,
        handleToastClose,
        msgSettingsMenuAnchor,
        setMsgSettingsMenuAnchor,
        notificationsMenuAnchor,
        setNotificationsMenuAnchor,
        profileSettingsMenuAnchor,
        setProfileSettingsMenuAnchor,
        alertDialogData: dialogData,
        displayAlertDialog,
        handleAlertDialogClose,
        dialogBody,
        setDialogBody,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppState = () => useContext(AppContext);

export default ContextProvider;
