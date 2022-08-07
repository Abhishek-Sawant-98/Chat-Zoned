import { AddAPhoto } from "@mui/icons-material";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import { CircularProgress } from "@mui/material";
import PasswordVisibilityToggle from "../utils/PasswordVisibilityToggle";
import { getAxiosConfig, isImageFile, TWO_MB } from "../../utils/appUtils";
import { useDispatch, useSelector } from "react-redux";
import {
  selectFormfieldState,
  setLoading,
} from "../../store/slices/FormfieldSlice";
import { displayToast } from "../../store/slices/ToastSlice";
import { setLoggedInUser } from "../../store/slices/AppSlice";

const DEFAULT_USER_DP = process.env.REACT_APP_DEFAULT_USER_DP;

const Register = () => {
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
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const imgInput = useRef();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePic: null,
    profilePicUrl: DEFAULT_USER_DP,
  });

  const { name, email, password, confirmPassword, profilePic, profilePicUrl } =
    userData;

  const handleChangeFor = (prop) => (e) => {
    setUserData({ ...userData, [prop]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // return dispatch(setLoading(true));

    if (!name || !email || !password || !confirmPassword) {
      return dispatch(
        displayToast({
          message: "Please Enter All the Fields",
          type: "warning",
          duration: 3000,
          position: "bottom-center",
        })
      );
    }

    if (name.length > 25) {
      return dispatch(
        displayToast({
          message: "Name Must be Less than 25 characters",
          type: "warning",
          duration: 3000,
          position: "bottom-center",
        })
      );
    }

    // Validate email
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return dispatch(
        displayToast({
          message: "Please Enter a Valid Email ID",
          type: "warning",
          duration: 3000,
          position: "bottom-center",
        })
      );
    }

    if (password !== confirmPassword) {
      return dispatch(
        displayToast({
          message: "Passwords Do Not Match",
          type: "warning",
          duration: 3000,
          position: "bottom-center",
        })
      );
    }
    dispatch(setLoading(true));
    const config = getAxiosConfig({ formData: true });

    const formData = new FormData();
    formData.append("profilePic", profilePic);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    try {
      const { data } = await axios.post("/api/user/register", formData, config);
      // Success toast : register successful
      dispatch(
        displayToast({
          title: "Registration Successful",
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
          title: "Registration Failed",
          message: error.response?.data?.message || error.message,
          type: "error",
          duration: 4000,
          position: "bottom-center",
        })
      );
      dispatch(setLoading(false));
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setUserData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      profilePic: null,
      profilePicUrl: DEFAULT_USER_DP,
    });
    imgInput.current.value = "";
  };

  const handleImgInputChange = (e) => {
    const image = e.target.files[0];
    if (!image) return;

    if (!isImageFile(image.name)) {
      return dispatch(
        displayToast({
          title: "Invalid Image File",
          message: "Please Select an Image File (png/jpg/jpeg/svg/webp)",
          type: "warning",
          duration: 5000,
          position: "bottom-center",
        })
      );
    }

    if (image.size >= TWO_MB) {
      imgInput.current.value = "";
      return dispatch(
        displayToast({
          message: "Please Select an Image Smaller than 2 MB",
          type: "warning",
          duration: 3000,
          position: "bottom-center",
        })
      );
    }
    setUserData({
      ...userData,
      profilePic: image,
      profilePicUrl: URL.createObjectURL(image),
    });
  };

  return (
    <form
      className={`app__form user-select-none row ${disableIfLoading}`}
      style={{ pointerEvents: loading ? "none" : "auto" }}
    >
      {/* Select Profile Pic */}
      <section className="app__formfield position-relative mb-4">
        <img
          className="userProfilePic img-fluid border border-2 border-primary rounded-circle mt-3"
          id="register__imgProfile"
          src={profilePicUrl}
          alt="profilePic"
        />
        <i
          id="register__selectPic"
          className={`selectPicIcon position-absolute p-2 d-flex ${disableIfLoading} justify-content-center align-items-center bg-success rounded-circle pointer`}
          onClick={() => {
            if (!loading) imgInput.current.click();
          }}
        >
          <AddAPhoto className="text-light fs-6" />
        </i>
        <input
          type="file"
          accept="image/*"
          onChange={handleImgInputChange}
          name="profilepic"
          id="register__img_input"
          ref={imgInput}
          className={`d-none`}
        />
      </section>
      {/* Name input */}
      <section className={`${formFieldClassName} mb-2 col-md-6 order-md-1`}>
        <label htmlFor="register__username" className={`${formLabelClassName}`}>
          Name <span className="required">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={handleChangeFor("name")}
          required
          name="username"
          id="register__username"
          className={`${inputFieldClassName}`}
          placeholder="Eg: John Titor"
        />
      </section>
      {/* Email input */}
      <section className={`${formFieldClassName} mb-2 col-md-6 order-md-3`}>
        <label htmlFor="register__email" className={`${formLabelClassName}`}>
          Email ID <span className="required">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={handleChangeFor("email")}
          required
          name="email"
          id="register__email"
          className={`${inputFieldClassName}`}
          placeholder="Eg: john.titor@yahoo.com"
        />
      </section>
      {/* Password input */}
      <section className={`${formFieldClassName} mb-2 col-md-6 order-md-2`}>
        <label htmlFor="register__password" className={`${formLabelClassName}`}>
          Password <span className="required">*</span>
        </label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handleChangeFor("password")}
            required
            name="password"
            id="register__password"
            className={`${inputFieldClassName} rounded-end`}
            placeholder="Please Remember This"
          />
          <PasswordVisibilityToggle
            disableIfLoading={disableIfLoading}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        </div>
      </section>
      {/* Confirm Password input */}
      <section className={`${formFieldClassName} mb-4 col-md-6 order-md-4`}>
        <label
          htmlFor="register__confirmpassword"
          className={`${formLabelClassName}`}
        >
          Confirm Password <span className="required">*</span>
        </label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={handleChangeFor("confirmPassword")}
            required
            name="confirmpassword"
            id="register__confirmpassword"
            className={`${inputFieldClassName} rounded-end`}
            placeholder="Must Match the Above"
          />
          <PasswordVisibilityToggle
            disableIfLoading={disableIfLoading}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        </div>
      </section>
      <section
        className={`${formFieldClassName} mb-2 d-flex justify-content-between order-last`}
      >
        {/* Register button */}
        <button
          type="submit"
          name="btnRegister"
          id="register__btnRegister"
          onClick={handleRegister}
          className={`${btnSubmitClassName}`}
        >
          {loading ? (
            <>
              <CircularProgress
                size={25}
                style={{ color: "white", margin: "0px 15px 0px -20px" }}
              />
              Signing Up...
            </>
          ) : (
            "Register"
          )}
        </button>
        {/* Reset button */}
        <button
          type="reset"
          name="btnReset"
          id="register__btnReset"
          onClick={handleReset}
          className={`${btnResetClassName}`}
        >
          Reset
        </button>
      </section>
    </form>
  );
};

export default Register;
