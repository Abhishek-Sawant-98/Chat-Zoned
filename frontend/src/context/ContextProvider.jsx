import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

const ContextProvider = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState({});

  return (
    <AppContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const AppState = () => useContext(AppContext);

export default ContextProvider;
