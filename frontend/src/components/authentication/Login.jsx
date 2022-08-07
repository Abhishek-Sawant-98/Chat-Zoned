import { useState } from "react";
import axios from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import PasswordVisibilityToggle from "../utils/PasswordVisibilityToggle";
import { useDispatch, useSelector } from "react-redux";
import { setLoggedInUser } from "../../store/slices/AppSlice";
import {
  selectFormfieldState,
  setLoading,
} from "../../store/slices/FormfieldSlice";
import { displayToast } from "../../store/slices/ToastSlice";
import { getAxiosConfig } from "../../utils/appUtils";

const Login = () => {
  const {
    loading,
    disableIfLoading,
    formLabelClassName,
    formFieldClassName,
    inputFieldClassName,
    btnSubmitClassName,
    btnResetClassName,
  } = useSelector(selectFormfieldState);

  const dispatch = useDispatch();
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

  const handleLogin = async (e) => {
    e.preventDefault();
    // return dispatch(setLoading(true));
    if (!email || !password) {
      return dispatch(
        displayToast({
          message: "Please Enter All the Fields",
          type: "warning",
          duration: 5000,
          position: "bottom-center",
        })
      );
    }
    dispatch(setLoading(true));
    const config = getAxiosConfig({});
    try {
      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );
      // Success toast : login successful
      dispatch(
        displayToast({
          title: "Login Successful",
          message: "Your login session will expire in 15 days",
          type: "success",
          duration: 5000,
          position: "bottom-center",
        })
      );

      localStorage.setItem("loggedInUser", JSON.stringify(data));
      dispatch(setLoggedInUser(data));
      dispatch(setLoading(false));
      navigate("/chats");
    } catch (error) {
      dispatch(
        displayToast({
          title: "Login Failed",
          message: error.response?.data?.message || error.message,
          type: "error",
          duration: 5000,
          position: "bottom-center",
        })
      );
      dispatch(setLoading(false));
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
    <form
      className={`app__form user-select-none row`}
      style={{ pointerEvents: loading ? "none" : "auto" }}
    >
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
          className={`${inputFieldClassName}`}
          placeholder="Used While Registering"
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
            className={`${inputFieldClassName} rounded-end`}
            placeholder="Hope You Remember"
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
          className={`btn btn-outline-success w-100 fs-4 p-1 rounded-pill`}
        >
          Get Guest Credentials
        </button>
      </section>
    </form>
  );
};

export default Login;
