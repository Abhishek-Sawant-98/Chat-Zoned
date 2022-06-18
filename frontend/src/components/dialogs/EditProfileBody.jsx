import { AccountCircle, Edit, Email } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import axios from "../../utils/axios";
import { AppState } from "../../context/ContextProvider";
import CustomDialog from "../utils/CustomDialog";
import EditNameBody from "./EditNameBody";
import { CircularProgress } from "@mui/material";
import EditProfilePicMenu from "../EditProfilePicMenu";
import getCustomTooltip from "../utils/CustomTooltip";
import { truncateString } from "../../utils/appUtils";

const arrowStyles = {
  color: "#111",
};
const tooltipStyles = {
  maxWidth: 250,
  color: "#eee",
  fontFamily: "Mirza",
  fontSize: 17,
  backgroundColor: "#111",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const EditProfileBody = () => {
  const {
    formClassNames,
    loggedInUser,
    setLoggedInUser,
    displayToast,
    setEditProfilePicMenuAnchor,
  } = AppState();

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
    profilePicUrl: loggedInUser?.profilePic,
    name: loggedInUser?.name,
    email: loggedInUser?.email,
  });

  // For profile pic upload loading indicator
  const [uploading, setUploading] = useState(false);

  const { profilePicUrl, name, email } = profileData;
  const imgInput = useRef();
  const nameInput = useRef();
  const isGuestUser = loggedInUser?.email === "guest.user@gmail.com";

  const handleChangeFor = (prop) => (e) => {
    setProfileData({ ...profileData, [prop]: e.target.value });
  };

  // Click a button/icon upon 'Enter' or 'Space' keydown
  const clickOnKeydown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.target.click();
    }
  };

  // Upload new profile pic
  const handleImgInputChange = async (e) => {
    const image = e.target.files[0];
    if (!image) return;

    if (image.size >= 2097152) {
      imgInput.current.value = "";
      return displayToast({
        message: "Please Select an Image Smaller than 2 MB",
        type: "warning",
        duration: 5000,
        position: "top-center",
      });
    }
    setLoading(true);
    setUploading(true);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${loggedInUser.token}`,
      },
    };

    const formData = new FormData();
    formData.append("profilePic", image);
    formData.append("currentProfilePic", loggedInUser?.profilePic);
    formData.append("cloudinary_id", loggedInUser?.cloudinary_id);

    try {
      const { data } = await axios.put(
        "/api/user/update/profile-pic",
        formData,
        config
      );

      displayToast({
        message: "ProfilePic Updated Successfully.",
        type: "success",
        duration: 4000,
        position: "bottom-center",
      });
      setLoading(false);
      setUploading(false);
      setLoggedInUser({ ...data, token: loggedInUser.token });
    } catch (error) {
      displayToast({
        title: "ProfilePic Update Failed",
        message: error.response?.data?.message || "Oops! Server Down",
        type: "error",
        duration: 5000,
        position: "top-center",
      });
      setLoading(false);
      setUploading(false);
    }
  };

  // Delete profile pic
  const openDeletePhotoConfirmDialog = () => {
    setChildDialogBody(<>Are you sure you want to delete this profile pic?</>);
    displayChildDialog({
      title: "Delete Profile Pic",
      nolabel: "NO",
      yeslabel: "YES",
      loadingYeslabel: "Deleting...",
      action: async () => {
        setLoading(true);

        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${loggedInUser.token}`,
          },
        };

        try {
          const { data } = await axios.put(
            "/api/user/delete/profile-pic",
            {
              currentProfilePic: loggedInUser?.profilePic,
              cloudinary_id: loggedInUser?.cloudinary_id,
            },
            config
          );

          displayToast({
            message: "ProfilePic Deleted Successfully.",
            type: "success",
            duration: 4000,
            position: "bottom-center",
          });
          setLoading(false);
          setLoggedInUser({ ...data, token: loggedInUser.token });
          return "profileUpdated";
        } catch (error) {
          displayToast({
            title: "ProfilePic Deletion Failed",
            message:
              error.response?.data?.message || "Oops! Server Down",
            type: "error",
            duration: 5000,
            position: "top-center",
          });
          setLoading(false);
        }
      },
    });
  };

  const openEditProfilePicMenu = (e) => {
    setEditProfilePicMenuAnchor(e.target);
  };

  // 'Edit Name' Child Dialog config
  const [childDialogData, setChildDialogData] = useState({
    isOpen: false,
    title: "Child Dialog",
    content: "Dialog Content",
    nolabel: "NO",
    yeslabel: "YES",
    loadingYeslabel: "Updating...",
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
      loadingYeslabel: "Saving...",
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
              error.response?.data?.message || "Oops! Server Down",
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
      {loading && uploading ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <CircularProgress
            size={75}
            style={{ margin: "30px 0px", color: "lightblue" }}
          />
          <span style={{ marginBottom: "45px" }} className="text-light h1">
            {" Updating Photo..."}
          </span>
        </div>
      ) : (
        <section className="dialogField d-flex position-relative mb-4">
          <img
            className="userProfilePic d-flex mx-auto border border-2 border-primary rounded-circle mt-1"
            id="viewedit__imgProfile"
            src={profilePicUrl}
            alt="profilePic"
          />
          {!isGuestUser && (
            <CustomTooltip title="Edit Profile Pic" placement="right" arrow>
              <i
                id="editProfilePic"
                tabIndex={2}
                onKeyDown={clickOnKeydown}
                className={`selectPicIcon position-absolute p-2 d-flex ${disableIfLoading} justify-content-center align-items-center bg-success rounded-circle pointer`}
                onClick={openEditProfilePicMenu}
              >
                <Edit className="text-light fs-6" />
              </i>
            </CustomTooltip>
          )}
          {/* Edit/Delete profile pic menu */}
          <EditProfilePicMenu
            selectProfilePic={() => imgInput.current.click()}
            openDeletePhotoConfirmDialog={openDeletePhotoConfirmDialog}
          />
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
      )}
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
          <CustomTooltip title={`${name}`} placement="top-start" arrow>
            <input
              type="text"
              value={truncateString(name, 25, 21)}
              ref={nameInput}
              name="username"
              id="viewName"
              className={`${inputFieldClassName} ${
                !isGuestUser && "rounded-end"
              }`}
              disabled={true}
              placeholder="Enter New Name"
            />
          </CustomTooltip>
          {!isGuestUser && (
            <CustomTooltip title="Edit Name" placement="top" arrow>
              <span
                tabIndex={3}
                onKeyDown={clickOnKeydown}
                className={`input-group-text ${disableIfLoading} btn btn-outline-info rounded-pill rounded-start`}
                onClick={openEditNameDialog}
              >
                <Edit />
              </span>
            </CustomTooltip>
          )}
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
        <CustomTooltip title={`${email}`} placement="bottom" arrow>
          <input
            type="text"
            value={truncateString(email, 25, 21)}
            id="viewEmail"
            className={`${inputFieldClassName}`}
            disabled={true}
          />
        </CustomTooltip>
      </section>
      {/* Child confirmation dialog */}
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

export default EditProfileBody;
