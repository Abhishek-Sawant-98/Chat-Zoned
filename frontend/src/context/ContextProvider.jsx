import { createContext, useContext, useState } from "react";
import { defaultGroupDisplayPic } from "../utils/appUtils";

const AppContext = createContext();

const ContextProvider = ({ children }) => {
  // User and chat config
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [refresh, setRefresh] = useState(false);

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

  // Alert dialog config
  const [dialogData, setDialogData] = useState({
    isOpen: false,
    title: "Alert Dialog",
    content: "Dialog Content",
    nolabel: "NO",
    yeslabel: "YES",
    loadingYeslabel: "Please Wait...",
    action: () => {},
  });

  // Custom Dialog config
  const [dialogBody, setDialogBody] = useState(<></>);
  const [showDialogActions, setShowDialogActions] = useState(true);

  const displayDialog = (options) => {
    setDialogData({ ...options, isOpen: true });
  };
  const closeDialog = () => {
    setDialogData({ ...dialogData, isOpen: false });
  };
  const setDialogAction = (action) => {
    setDialogData({ ...dialogData, action });
  };

  // Form field config
  const [loading, setLoading] = useState(false);
  const disableIfLoading = `${loading ? "disabled notAllowed" : ""}`;

  const formClassNames = {
    loading,
    setLoading,
    disableIfLoading,
    formLabelClassName: `app__formlabel ${disableIfLoading} form-label pointer mb-1 ms-2`,
    formFieldClassName: `app__formfield text-center`,
    inputFieldClassName: `app__inputfield form-control ${disableIfLoading} text-info text-center bg-black bg-gradient border-secondary ps-2 pt-1 rounded-pill`,
    btnSubmitClassName: `btn btn-primary ${disableIfLoading} d-flex justify-content-center align-items-center col-8 fs-4 rounded-pill`,
    btnResetClassName: `app__btnReset ${disableIfLoading} btn btn-outline-secondary text-light fs-4 rounded-pill`,
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
        refresh,
        setRefresh,
        toastData,
        displayToast,
        handleToastClose,
        dialogData,
        displayDialog,
        closeDialog,
        setDialogAction,
        dialogBody,
        setDialogBody,
        showDialogActions,
        setShowDialogActions,
        formClassNames,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppState = () => useContext(AppContext);

export default ContextProvider;
