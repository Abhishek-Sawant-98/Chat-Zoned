import React, { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

const Login = ({
  formLabelClassName,
  formFieldClassName,
  inputFieldClassName,
  btnSubmitClassName,
  btnResetClassName,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const requiredIndicator = () => {
    return <span style={{ color: "#ff0000" }}>&nbsp;*</span>;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      // show warning toast
      // Please Enter All the Fields
      // duration 5000
      // position bottom
      alert("Please enter all the fields");

      return;
    }

    setLoading(true);

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      // Success toast : login successful
      alert("login successful..."+JSON.stringify(data));

      sessionStorage.setItem("loggedInUser", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      alert(
        "Oops login error occurred: " +
          JSON.stringify(error.response.data.message)
      );
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setEmail("");
    setPassword("");
  };

  const setGuestCredentials = (e) => {
    e.preventDefault();
    setEmail("guest.user@gmail.com");
    setPassword("guest@987");
  };

  return (
    <form className="homepage__form user-select-none row">
      {/* Email input */}
      <section className={`${formFieldClassName} mb-2 col-md-6`}>
        <label htmlFor="login__email" className={`${formLabelClassName}`}>
          Email ID {requiredIndicator()}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          name="email"
          id="login__email"
          className={`${inputFieldClassName}`}
          placeholder="Enter Email ID"
        />
      </section>
      {/* Password input */}
      <section className={`${formFieldClassName} mb-4 col-md-6`}>
        <label htmlFor="login__password" className={`${formLabelClassName}`}>
          Password {requiredIndicator()}
        </label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            name="password"
            id="login__password"
            className={`${inputFieldClassName} rounded-end`}
            placeholder="Enter Password"
          />
          <span
            className="input-group-text btn btn-outline-secondary rounded-pill rounded-start"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </span>
        </div>
      </section>
      <section
        className={`${formFieldClassName} mb-3 d-flex justify-content-between`}
      >
        {/* Login button */}
        <button
          type="submit"
          name="btnLogin"
          id="login__btnLogin"
          onClick={handleLogin}
          className={`${btnSubmitClassName}`}
        >
          Login
        </button>
        {/* Reset button */}
        <button
          type="reset"
          name="btnReset"
          id="login__btnReset"
          onClick={handleReset}
          className={`${btnResetClassName}`}
        >
          Reset
        </button>
      </section>
      {/* Get guest user credentials button */}
      <section className={`${formFieldClassName} mb-2`}>
        <button
          name="btnGetGuestCredentials"
          id="login__btnGetGuestCredentials"
          onClick={setGuestCredentials}
          className="btn btn-outline-success w-100 fs-4 p-1 rounded-pill"
        >
          Get Guest Credentials
        </button>
      </section>
    </form>
  );
};

export default Login;
