import { useState, useEffect } from "react";
import Login from "../components/authentication/Login";
import SignUp from "../components/authentication/Register";
import AppGif from "../components/utils/AppGif";
import { useNavigate, useLocation } from "react-router-dom";
import { AppState } from "../context/ContextProvider";

const HomePage = () => {
  const { formClassNames } = AppState();
  const { disableIfLoading } = formClassNames;

  const [showLogin, setShowLogin] = useState(true);

  const navigate = useNavigate();
  const location = useLocation().pathname;

  useEffect(() => {
    const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

    if (loggedInUser) navigate("/chats");
  }, []);

  return (
    <section className="homepage container-fluid d-flex flex-column p-4">
      <section className="homepage__header container pt-0 pb-2 ps-1 pe-4 mb-2 user-select-none">
        <AppGif />
        CHAT ZONED
      </section>
      <section className={`app__body container p-2 mb-2 ${disableIfLoading}`}>
        <div className="container d-flex justify-content-between">
          <button
            className={`app__btnToggle fs-4 btn ${
              showLogin ? "btn-warning" : "text-light"
            } rounded-pill col m-1 ${disableIfLoading}`}
            onMouseDown={() => setShowLogin(true)}
          >
            Login
          </button>
          <button
            className={`app__btnToggle fs-4 btn ${
              showLogin ? "text-light" : "btn-warning"
            } rounded-pill col m-1 ${disableIfLoading}`}
            onMouseDown={() => setShowLogin(false)}
          >
            Register
          </button>
        </div>
        <section
          className={`app__form container text-light p-2 ${disableIfLoading}`}
        >
          {showLogin ? <Login /> : <SignUp />}
        </section>
      </section>
    </section>
  );
};

export default HomePage;
