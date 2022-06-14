import { AccountCircle, Edit, Email } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import axios from "../../config/axios";
import { AppState } from "../../context/ContextProvider";
import CustomDialog from "./CustomDialog";
import EditNameBody from "./EditNameBody";

const ViewOrEditProfileBody = () => {
  const { formClassNames, loggedInUser, setLoggedInUser, displayToast } =
    AppState();

  useEffect(() => {
    setProfileData({
      ...profileData,
      profilePicUrl: loggedInUser?.profilePic,
      name: loggedInUser?.name,
    });
  }, [loggedInUser]);

  const {
    loading,
    setLoading,
    disableIfLoading,
    formLabelClassName,
    formFieldClassName,
    inputFieldClassName,
  } = formClassNames;

  const [profileData, setProfileData] = useState({
    profilePic: null,
    profilePicUrl: loggedInUser?.profilePic,
    name: loggedInUser?.name,
    email: loggedInUser?.email,
  });

  const { profilePic, profilePicUrl, name, email } = profileData;
  const imgInput = useRef();
  const nameInput = useRef();

  const handleChangeFor = (prop) => (e) => {
    setProfileData({ ...profileData, [prop]: e.target.value });
  };

  const handleImgInputChange = (e) => {
    const image = e.target.files[0];
    if (!image) return;

    if (image.size >= 2097152) {
      imgInput.current.value = "";
      return displayToast({
        message: "Please Select an Image Smaller than 2 MB",
        type: "warning",
        duration: 5000,
        position: "bottom-center",
      });
    }
    setProfileData({
      ...profileData,
      profilePic: image,
      profilePicUrl: URL.createObjectURL(image),
    });
  };

  // 'Edit Name' Child Dialog config
  const [childDialogData, setChildDialogData] = useState({
    isOpen: false,
    title: "Child Dialog",
    content: "Dialog Content",
    nolabel: "NO",
    yeslabel: "YES",
    action: () => {},
  });
  const [childDialogBody, setChildDialogBody] = useState(<></>);

  const displayChildDialog = (options) => {
    setChildDialogData({
      isOpen: true,
      ...options,
    });
  };
  const handleChildDialogClose = () => {
    setChildDialogData({ ...childDialogData, isOpen: false });
  };

  // Edited Name config
  let editedName;

  const getUpdatedName = (updatedName) => {
    editedName = updatedName;
  };

  const openEditNameDialog = (e) => {
    // Open edit name dialog
    setChildDialogBody(<EditNameBody getUpdatedName={getUpdatedName} />);
    displayChildDialog({
      title: "Edit Name",
      nolabel: "CANCEL",
      yeslabel: "SAVE",
      action: async () => {
        if (!editedName) {
          return displayToast({
            message: "Please Enter a Valid Name",
            type: "warning",
            duration: 5000,
            position: "top-center",
          });
        }
        setLoading(true);

        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${loggedInUser?.token}`,
          },
        };

        try {
          const { data } = await axios.put(
            "/api/user/update/name",
            { newUserName: editedName },
            config
          );
          displayToast({
            message: "Name Updated Successfully.",
            type: "success",
            duration: 3000,
            position: "bottom-center",
          });

          setLoading(false);
          setLoggedInUser({ ...data, token: loggedInUser.token });
          return "profileUpdated";
        } catch (error) {
          displayToast({
            title: "Name Update Failed",
            message:
              error.response?.data?.message || "Oops! Something Went Wrong",
            type: "error",
            duration: 5000,
            position: "top-center",
          });
          setLoading(false);
        }
      },
    });
  };

  return (
    <>
      {/* View/Edit Profile Pic */}
      <section className="dialogField d-flex position-relative mb-4">
        <img
          className="userProfilePic d-flex mx-auto border border-2 border-primary rounded-circle mt-1"
          id="viewedit__imgProfile"
          src={profilePicUrl}
          alt="profilePic"
        />
        <Tooltip
          title="Edit Profile Pic"
          placement="right"
          className={`rounded-pill`}
          arrow
        >
          <i
            id="editProfilePic"
            className={`selectPicIcon position-absolute p-2 d-flex ${disableIfLoading} justify-content-center align-items-center bg-success rounded-circle pointer`}
            onClick={() => {
              if (!loading) imgInput.current.click();
            }}
          >
            <Edit className="text-light fs-6" />
          </i>
        </Tooltip>

        <input
          type="file"
          accept=".png, .jpg, .jpeg"
          onChange={handleImgInputChange}
          name="profilepic"
          id="viewOrEditProfilePic"
          ref={imgInput}
          className={`d-none`}
          disabled={loading}
        />
      </section>
      {/* View Name */}
      <section className={`dialogField ${formFieldClassName} mb-2`}>
        <label
          htmlFor="viewName"
          style={{ cursor: "auto" }}
          className={`${formLabelClassName}`}
        >
          <AccountCircle
            style={{ margin: "-2px 2px 0px -20px", color: "lightblue" }}
          />
          {" Name"}
        </label>
        <div className="input-group">
          <input
            type="text"
            value={name}
            ref={nameInput}
            onChange={handleChangeFor("name")}
            name="username"
            id="viewName"
            className={`${inputFieldClassName} rounded-end`}
            disabled={true}
            placeholder="Enter New Name"
          />
          <Tooltip
            title="Edit Name"
            placement="top"
            className={`rounded-pill`}
            arrow
          >
            <span
              className={`input-group-text ${disableIfLoading} btn btn-outline-info rounded-pill rounded-start`}
              onClick={openEditNameDialog}
            >
              <Edit />
            </span>
          </Tooltip>
        </div>
      </section>
      {/* View Email */}
      <section className={`dialogField ${formFieldClassName} mb-2`}>
        <label
          htmlFor="viewEmail"
          style={{ cursor: "auto" }}
          className={`${formLabelClassName}`}
        >
          <Email style={{ margin: "-2px 2px 0px -20px", color: "lightblue" }} />
          {" Email"}
        </label>
        <input
          type="text"
          value={email}
          id="viewEmail"
          className={`${inputFieldClassName}`}
          disabled={true}
        />
      </section>
      <CustomDialog
        dialogData={childDialogData}
        handleDialogClose={handleChildDialogClose}
        showDialogActions={true}
      >
        {childDialogBody}
      </CustomDialog>
    </>
  );
};

export default ViewOrEditProfileBody;
