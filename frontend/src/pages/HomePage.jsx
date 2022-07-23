import { useState, useEffect, useRef } from "react";
import Login from "../components/authentication/Login";
import SignUp from "../components/authentication/Register";
import LottieAnimation from "../components/utils/LottieAnimation";
import { useNavigate } from "react-router-dom";
import animationData from "../animations/chat-gif.json";
import { useDispatch, useSelector } from "react-redux";
import { selectAppState } from "../store/slices/AppSlice";
import { selectFormfieldState } from "../store/slices/FormfieldSlice";

const HomePage = () => {
  const { loggedInUser } = useSelector(selectAppState);
  const { disableIfLoading } = useSelector(selectFormfieldState);
  const dispatch = useDispatch();
  const appGif = useRef();

  const [showLogin, setShowLogin] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // Session storage persists data even after page refresh, unlike state
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (user && Date.now() < parseInt(user.expiryTime)) navigate("/chats");
  }, []);

  return (
    <>
      {!loggedInUser && (
        <section className="homepage container-fluid d-flex flex-column p-4">
          <section className="homepage__header container pt-0 pb-2 ps-1 pe-4 mb-2 user-select-none">
            <LottieAnimation
              ref={appGif}
              className={"d-inline-block me-2"}
              style={{ width: "35px", height: "35px" }}
              animationData={animationData}
            />
            <span className="d-inline-block mt-2">CHAT ZONED</span>
          </section>
          <section
            className={`app__body container p-2 mb-2 ${disableIfLoading}`}
          >
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
      )}
      {showLogin && (
        <div className={`footer fs-5 w-50 text-light`}>
          &copy; 2022 Made with 💙 by &nbsp;
          <a
            id="footerLink"
            className="text-decoration-none"
            href="https://github.com/Abhishek-Sawant-98"
            target="blank"
          >
            <strong>Abhishek Sawant</strong>
          </a>
        </div>
      )}
    </>
  );
};

export default HomePage;
