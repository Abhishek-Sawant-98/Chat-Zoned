import React, { useState } from "react";
import Login from "../components/Login";
import SignUp from "../components/Register";

const HomePage = () => {
  const [showLogin, setShowLogin] = useState(true);

  // Common classnames for login and register components
  const formClassNames = {
    formLabelClassName: "homepage_formlabel form-label pointer mb-1 ms-2",
    formFieldClassName: "homepage__formfield",
    inputFieldClassName:
      "form-control text-info text-center bg-black bg-gradient border-secondary px-3 pt-1 rounded-pill",
    btnSubmitClassName: "btn btn-outline-primary col-8 fs-4 rounded-pill",
    btnResetClassName:
      "homepage__btnReset btn btn-outline-secondary text-light fs-4 rounded-pill",
  };

  return (
    <section className="homepage container-fluid d-flex flex-column p-4">
      <section className="homepage__header container pt-0 pb-2 ps-1 pe-4 mb-2 user-select-none">
        <img
          className="me-2"
          src="https://res.cloudinary.com/abhi-sawant/image/upload/v1654451217/chat-anim2_zefm7u.gif"
          alt="chat-anim"
        />
        CHAT ZONED
      </section>
      <section className="homepage__body container p-2 mb-2">
        <div className="container d-flex justify-content-between">
          <button
            className={`homepage__btnToggle fs-4 btn ${
              showLogin ? "btn-warning" : "text-light"
            } rounded-pill col m-1`}
            onMouseDown={() => setShowLogin(true)}
          >
            Login
          </button>
          <button
            className={`homepage__btnToggle fs-4 btn ${
              showLogin ? "text-light" : "btn-warning"
            } rounded-pill col m-1`}
            onMouseDown={() => setShowLogin(false)}
          >
            Register
          </button>
        </div>
        <section className="homepage__form container text-light p-2">
          {showLogin ? (
            <Login {...formClassNames} />
          ) : (
            <SignUp {...formClassNames} />
          )}
        </section>
      </section>
    </section>
  );
};

export default HomePage;
