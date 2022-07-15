import { Edit } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import axios from "../../utils/axios";
import { AppState } from "../../context/ContextProvider";
import EditNameBody from "./EditNameBody";
import { CircularProgress, IconButton } from "@mui/material";
import EditPicMenu from "../menus/EditPicMenu";
import getCustomTooltip from "../utils/CustomTooltip";
import { truncateString } from "../../utils/appUtils";
import ChildDialog from "../utils/ChildDialog";

const arrowStyles = {
  color: "#111",
};
const tooltipStyles = {
  maxWidth: 250,
  color: "#eee",
  fontFamily: "Mirza",
  fontSize: 17,
  border: "1px solid #333",
  backgroundColor: "#111",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const EditProfileBody = () => {
  const {
    formClassNames,
    loggedInUser,
    setLoggedInUser,
    displayToast,
    childDialogMethods,
    getChildDialogMethods,
  } = AppState();

  const { loading, setLoading, disableIfLoading } = formClassNames;
  const { setChildDialogBody, displayChildDialog } = childDialogMethods;

  const [profileData, setProfileData] = useState({
    profilePicUrl: loggedInUser?.profilePic,
    name: loggedInUser?.name,
    email: loggedInUser?.email,
  });
  const [editProfilePicMenuAnchor, setEditProfilePicMenuAnchor] =
    useState(null);

  useEffect(() => {
    setProfileData({
      ...profileData,
      profilePicUrl: loggedInUser?.profilePic,
      name: loggedInUser?.name,
    });
  }, [loggedInUser]);

  // For profile pic upload loading indicator
  const [uploading, setUploading] = useState(false);

  const { profilePicUrl, name, email } = profileData;
  const imgInput = useRef();
  const isGuestUser = loggedInUser?.email === "guest.user@gmail.com";

  const persistUpdatedUser = (updatedUser) => {
    // Session storage persists updated user even after page refresh
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
    setLoggedInUser(updatedUser);
  };

  // Click a button/icon upon 'Enter' or 'Space' keydown
  const clickOnKeydown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.target.click();
    }
  };

  // Update Profile Pic
  const handleImgInputChange = async (e) => {
    const image = e.target.files[0];
    if (!image) return;

    if (image.size >= 2097152) {
      imgInput.current.value = "";
      return displayToast({
        message: "Please Select an Image Smaller than 2 MB",
        type: "warning",
        duration: 4000,
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
        duration: 3000,
        position: "bottom-center",
      });
      setLoading(false);
      setUploading(false);
      persistUpdatedUser({
        ...data,
        token: loggedInUser.token,
        expiryTime: loggedInUser.expiryTime,
      });
    } catch (error) {
      displayToast({
        title: "ProfilePic Update Failed",
        message: error.response?.data?.message || error.message,
        type: "error",
        duration: 5000,
        position: "top-center",
      });
      setLoading(false);
      setUploading(false);
    }
  };

  const deleteProfilePic = async () => {
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
      persistUpdatedUser({
        ...data,
        token: loggedInUser.token,
        expiryTime: loggedInUser.expiryTime,
      });
      return "profileUpdated";
    } catch (error) {
      displayToast({
        title: "ProfilePic Deletion Failed",
        message: error.response?.data?.message || error.message,
        type: "error",
        duration: 5000,
        position: "top-center",
      });
      setLoading(false);
    }
  };

  // Edited Name config
  let editedName;

  const getUpdatedName = (updatedName) => {
    editedName = updatedName;
  };

  const updateProfileName = async () => {
    if (!editedName) {
      return displayToast({
        message: "Please Enter a Valid Name",
        type: "warning",
        duration: 3000,
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
      persistUpdatedUser({
        ...data,
        token: loggedInUser.token,
        expiryTime: loggedInUser.expiryTime,
      });
      return "profileUpdated";
    } catch (error) {
      displayToast({
        title: "Name Update Failed",
        message: error.response?.data?.message || error.message,
        type: "error",
        duration: 5000,
        position: "top-center",
      });
      setLoading(false);
    }
  };

  // Open edit name dialog
  const openEditNameDialog = () => {
    setChildDialogBody(
      <EditNameBody
        originalName={loggedInUser?.name}
        getUpdatedName={getUpdatedName}
        placeholder="Enter New Name"
      />
    );
    displayChildDialog({
      title: "Edit Name",
      nolabel: "CANCEL",
      yeslabel: "SAVE",
      loadingYeslabel: "Saving...",
      action: updateProfileName,
    });
  };

  // Open delete photo confirm dialog
  const openDeletePhotoConfirmDialog = () => {
    setChildDialogBody(<>Are you sure you want to delete this profile pic?</>);
    displayChildDialog({
      title: "Delete Profile Pic",
      nolabel: "NO",
      yeslabel: "YES",
      loadingYeslabel: "Deleting...",
      action: deleteProfilePic,
    });
  };

  const openEditProfilePicMenu = (e) => {
    setEditProfilePicMenuAnchor(e.target);
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
            className="img-fluid d-flex mx-auto border border-2 border-primary rounded-circle mt-1"
            id="viewedit__profilePic"
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
          <EditPicMenu
            anchor={editProfilePicMenuAnchor}
            setAnchor={setEditProfilePicMenuAnchor}
            selectProfilePic={() => imgInput.current.click()}
            openDeletePhotoConfirmDialog={openDeletePhotoConfirmDialog}
            deletePhotoCondition={
              !loggedInUser?.profilePic?.endsWith("user_dqzjdz.png")
            }
          />
          <input
            type="file"
            accept=".png, .jpg, .jpeg .svg"
            onChange={handleImgInputChange}
            name="profilepic"
            id="editProfilePic"
            ref={imgInput}
            className={`d-none`}
            disabled={loading}
          />
        </section>
      )}
      {/* View Name */}
      <section className={`dialogField text-center mb-2`}>
        <div className="input-group" style={{ marginTop: "-15px" }}>
          <CustomTooltip
            title={name?.length > 24 ? name : ""}
            placement="top-start"
            arrow
          >
            <div
              className="w-100 h1 fw-bold mx-4 text-info"
              style={{ fontSize: "35px" }}
            >
              {truncateString(name, 25, 21)}
            </div>
          </CustomTooltip>
          {!isGuestUser && (
            <CustomTooltip title="Edit Name" placement="top" arrow>
              <IconButton
                tabIndex={3}
                onKeyDown={clickOnKeydown}
                onClick={openEditNameDialog}
                sx={{
                  position: "absolute",
                  right: -8,
                  top: 6,
                  ":hover": {
                    backgroundColor: "#aaaaaa30",
                  },
                }}
              >
                <Edit className="text-light" />
              </IconButton>
            </CustomTooltip>
          )}
        </div>
      </section>
      {/* View Email */}
      <section
        className={`dialogField text-center mb-2`}
        style={{ marginTop: "-10px" }}
      >
        <CustomTooltip
          title={email?.length > 24 ? email : ""}
          placement="bottom"
          arrow
        >
          <span className="h4" style={{ color: "lightblue" }}>
            {truncateString(email, 25, 21)}
          </span>
        </CustomTooltip>
      </section>
      {/* Child confirmation dialog */}
      <ChildDialog getChildDialogMethods={getChildDialogMethods} />
    </>
  );
};

export default EditProfileBody;
