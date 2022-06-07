import { Visibility, VisibilityOff, AddAPhoto } from "@mui/icons-material";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";

const Register = ({
  formFieldClassName,
  formLabelClassName,
  inputFieldClassName,
  btnSubmitClassName,
  btnResetClassName,
}) => {
  const defaultPicUrl =
    "https://res.cloudinary.com/abhi-sawant/image/upload/v1653670527/user_dqzjdz.png";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(defaultPicUrl);
  const imgInput = useRef();

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const visibilityToggle = () => {
    return (
      <span
        className="input-group-text btn btn-outline-secondary rounded-pill rounded-start"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </span>
    );
  };

  const requiredIndicator = () => {
    return <span style={{ color: "#ff0000" }}>&nbsp;*</span>;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      // show warning toast
      // Please Enter All the Fields
      // duration 5000
      // position bottom
      alert("Please Enter All the User Fields");

      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords Do Not Match");

      return;
    }

    setLoading(true);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    const formData = new FormData();
    formData.append("profilePic", profilePic);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    try {
      const { data } = await axios.post("/api/user/register", formData, config);

      // Success toast : register successful
      alert("register successful..."+JSON.stringify(data));

      sessionStorage.setItem("loggedInUser", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      alert(
        "Oops register error occurred: " +
          JSON.stringify(error.response.data.message)
      );
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setProfilePic(null);
    setProfilePicUrl(defaultPicUrl);
  };

  const handleImgInputChange = (e) => {
    const image = e.target.files[0];
    setProfilePic(image);
    setProfilePicUrl(URL.createObjectURL(image));
  };

  return (
    <form className="homepage__form user-select-none row">
      <section className="register__profilepic position-relative mb-4">
        <img
          className="border border-2 border-primary rounded-circle mt-3"
          id="register__imgProfile"
          src={profilePicUrl}
          alt="profilePic"
        />
        <i
          id="register__selectPic"
          style={{ bottom: "0%", right: "calc(50% - 50px)" }}
          className="position-absolute p-2 d-flex justify-content-center align-items-center bg-success rounded-circle pointer"
          onClick={() => {
            imgInput.current.click();
          }}
        >
          <AddAPhoto className="text-light fs-6" />
        </i>
        <input
          type="file"
          accept=".png, .jpg, .jpeg"
          onChange={handleImgInputChange}
          name="profilepic"
          id="profilepic"
          ref={imgInput}
          className="d-none"
        />
      </section>
      {/* Name input */}
      <section className={`${formFieldClassName} mb-2 col-md-6 order-md-1`}>
        <label htmlFor="register__username" className={`${formLabelClassName}`}>
          Name {requiredIndicator()}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          Email ID {requiredIndicator()}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          Password {requiredIndicator()}
        </label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            name="password"
            id="register__password"
            className={`${inputFieldClassName} rounded-end`}
            placeholder="Enter Password"
          />
          {visibilityToggle()}
        </div>
      </section>
      {/* Confirm Password input */}
      <section className={`${formFieldClassName} mb-4 col-md-6 order-md-4`}>
        <label
          htmlFor="register__confirmpassword"
          className={`${formLabelClassName}`}
        >
          Confirm Password {requiredIndicator()}
        </label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            name="confirmpassword"
            id="register__confirmpassword"
            className={`${inputFieldClassName} rounded-end`}
            placeholder="Confirm Password"
          />
          {visibilityToggle()}
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
          Register
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
