import { useState } from "react";
import axios from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import { AppState } from "../../context/ContextProvider";
import { CircularProgress } from "@mui/material";
import PasswordVisibilityToggle from "../utils/PasswordVisibilityToggle";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [userCredentials, setUserCredentials] = useState({
    email: "",
    password: "",
  });

  const { email, password } = userCredentials;

  const handleChangeFor = (prop) => (e) => {
    setUserCredentials({
      ...userCredentials,
      [prop]: e.target.value,
    });
  };

  const { displayToast, formClassNames, setLoggedInUser } = AppState();

  const {
    loading,
    setLoading,
    disableIfLoading,
    formLabelClassName,
    formFieldClassName,
    inputFieldClassName,
    btnSubmitClassName,
    btnResetClassName,
  } = formClassNames;

  const handleLogin = async (e) => {
    e.preventDefault();

    // return setLoading(true);

    if (!email || !password) {
      return displayToast({
        message: "Please Enter All the Fields",
        type: "warning",
        duration: 5000,
        position: "bottom-center",
      });
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
      displayToast({
        message: "Login Successful",
        type: "success",
        duration: 2000,
        position: "bottom-center",
      });

      sessionStorage.setItem("loggedInUser", JSON.stringify(data));
      setLoggedInUser(data);
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      displayToast({
        title: "Login Failed",
        message: error.response?.data?.message || "Oops! Server Down",
        type: "error",
        duration: 5000,
        position: "bottom-center",
      });
      setLoading(false);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setUserCredentials({
      email: "",
      password: "",
    });
  };

  const setGuestCredentials = (e) => {
    e.preventDefault();
    setUserCredentials({
      email: "guest.user@gmail.com",
      password: "guest@987",
    });
  };

  return (
    <form className={`app__form user-select-none row`} disabled={loading}>
      {/* Email input */}
      <section className={`${formFieldClassName} mb-2 col-md-6`}>
        <label htmlFor="login__email" className={`${formLabelClassName}`}>
          Email ID <span className="required">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={handleChangeFor("email")}
          required
          autoFocus
          name="email"
          id="login__email"
          disabled={loading}
          className={`${inputFieldClassName}`}
          placeholder="Enter Email ID"
        />
      </section>
      {/* Password input */}
      <section className={`${formFieldClassName} mb-4 col-md-6`}>
        <label htmlFor="login__password" className={`${formLabelClassName}`}>
          Password <span className="required">*</span>
        </label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handleChangeFor("password")}
            required
            name="password"
            id="login__password"
            disabled={loading}
            className={`${inputFieldClassName} rounded-end`}
            placeholder="Enter Password"
          />
          <PasswordVisibilityToggle
            disableIfLoading={disableIfLoading}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
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
          {loading ? (
            <>
              <CircularProgress
                size={25}
                style={{ color: "white", margin: "0px 15px 0px -20px" }}
              />
              Signing in...
            </>
          ) : (
            "Login"
          )}
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
          disabled={loading}
          className={`btn btn-outline-success w-100 fs-4 p-1 rounded-pill`}
        >
          Get Guest Credentials
        </button>
      </section>
    </form>
  );
};

export default Login;
