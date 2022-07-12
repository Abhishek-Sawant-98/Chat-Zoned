import ReactDOM from "react-dom/client";
import "./sass/index.scss";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import ContextProvider from "./context/ContextProvider";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <ContextProvider>
      <App />
    </ContextProvider>
  </BrowserRouter>
);

serviceWorkerRegistration.register();
