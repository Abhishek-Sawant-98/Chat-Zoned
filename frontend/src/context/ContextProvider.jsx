import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

const ContextProvider = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState({});
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

  return (
    <AppContext.Provider
      value={{
        loggedInUser,
        setLoggedInUser,
        toastData,
        displayToast,
        handleToastClose,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppState = () => useContext(AppContext);

export default ContextProvider;
