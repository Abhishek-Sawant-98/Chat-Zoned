import { Edit } from "@mui/icons-material";
import { SetStateAction, useEffect, useRef, useState } from "react";
import axios from "../../utils/axios";
import EditNameBody from "./EditNameBody";
import { CircularProgress, IconButton } from "@mui/material";
import EditPicMenu from "../menus/EditPicMenu";
import getCustomTooltip from "../utils/CustomTooltip";
import {
  getAxiosConfig,
  isImageFile,
  truncateString,
  truncateWords,
  TWO_MB,
} from "../../utils/appUtils";
import ChildDialog from "../utils/ChildDialog";
import {
  selectFormfieldState,
  setLoading,
} from "../../store/slices/FormfieldSlice";
import { selectAppState, setLoggedInUser } from "../../store/slices/AppSlice";
import { selectChildDialogState } from "../../store/slices/ChildDialogSlice";
import { displayToast } from "../../store/slices/ToastSlice";
import { useAppDispatch, useAppSelector } from "../../store/storeHooks";
import {
  AxiosErrorType,
  ChangeEventHandler,
  ClickEventHandler,
  ErrorType,
  KeyboardEventHandler,
  ToastData,
  UserType,
} from "../../utils/AppTypes";
import { AxiosRequestConfig } from "axios";

const arrowStyles = { color: "#111" };
const tooltipStyles = {
  maxWidth: 260,
  color: "#eee",
  fontFamily: "Trebuchet MS",
  fontSize: 17,
  padding: "5px 10px",
  border: "1px solid #333",
  backgroundColor: "#111",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

interface ProfileData {
  profilePicUrl: string;
  name: string;
  email: string;
}

const EditProfileBody = () => {
  const { loggedInUser } = useAppSelector(selectAppState);
  const { loading, disableIfLoading } = useAppSelector(selectFormfieldState);
  const { childDialogMethods } = useAppSelector(selectChildDialogState);
  const dispatch = useAppDispatch();
  const { setChildDialogBody, displayChildDialog, closeChildDialog } =
    childDialogMethods;

  const [profileData, setProfileData] = useState<ProfileData>({
    profilePicUrl: loggedInUser?.profilePic as string,
    name: loggedInUser?.name as string,
    email: loggedInUser?.email as string,
  });
  const [editProfilePicMenuAnchor, setEditProfilePicMenuAnchor] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    setProfileData({
      ...profileData,
      profilePicUrl: loggedInUser?.profilePic as string,
      name: loggedInUser?.name as string,
    });
  }, [loggedInUser]);

  const displayWarning = (message = "Warning", duration = 3000) => {
    dispatch(
      displayToast({
        message,
        type: "warning",
        duration,
        position: "top-center",
      } as ToastData)
    );
  };

  const displayError = (
    error: ErrorType = "Oops! Something went wrong",
    title = "Operation Failed"
  ) => {
    dispatch(
      displayToast({
        title,
        message:
          (error as AxiosErrorType).response?.data?.message ||
          (error as Error)?.message ||
          error,
        type: "error",
        duration: 5000,
        position: "top-center",
      } as ToastData)
    );
  };

  const displaySuccess = (message = "Operation Successful") => {
    dispatch(
      displayToast({
        message,
        type: "success",
        duration: 3000,
        position: "bottom-center",
      } as ToastData)
    );
  };

  // For profile pic upload loading indicator
  const [uploading, setUploading] = useState(false);

  const { profilePicUrl, name, email } = profileData;
  const imgInput = useRef<HTMLInputElement>();
  const isGuestUser = loggedInUser?.email === "guest.user@gmail.com";

  const persistUpdatedUser = (updatedUser: UserType) => {
    // localStorage persists updated user even after page refresh
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
    dispatch(setLoggedInUser(updatedUser));
  };

  // Click a button/icon upon 'Enter' or 'Space' keydown
  const clickOnKeydown: KeyboardEventHandler = (e) => {
    if (e.key === " " || e.key === "Enter") {
      (e.target as HTMLElement).click();
    }
  };

  // Update Profile Pic
  const handleImgInputChange: ChangeEventHandler = async (e) => {
    if (!e.target?.files) return;
    const imageFile = e.target.files[0];
    if (!imageFile) return;

    if (!isImageFile(imageFile.name)) {
      return dispatch(
        displayToast({
          title: "Invalid Image File",
          message: "Please Select an Image File (png/jpg/jpeg/svg/webp)",
          type: "warning",
          duration: 5000,
          position: "bottom-center",
        } as ToastData)
      );
    }

    if (imageFile.size >= TWO_MB) {
      if (!imgInput?.current) return;
      imgInput.current.value = "";
      return displayWarning("Please Select an Image Smaller than 2 MB", 4000);
    }
    dispatch(setLoading(true));
    setUploading(true);
    const config = getAxiosConfig({ loggedInUser, formData: true });

    const formData = new FormData();
    formData.append("profilePic", imageFile);
    formData.append("currentProfilePic", loggedInUser?.profilePic as string);
    formData.append("cloudinary_id", loggedInUser?.cloudinary_id as string);

    try {
      const { data } = await axios.put(
        "/api/user/update/profile-pic",
        formData,
        config as AxiosRequestConfig
      );
      displaySuccess("ProfilePic Updated Successfully");
      dispatch(setLoading(false));
      setUploading(false);
      persistUpdatedUser({
        ...data,
        token: loggedInUser?.token,
        expiryTime: loggedInUser?.expiryTime,
      });
    } catch (error) {
      displayError(error as ErrorType, "ProfilePic Update Failed");
      dispatch(setLoading(false));
      setUploading(false);
    }
  };

  const deleteProfilePic = async () => {
    dispatch(setLoading(true));
    const config = getAxiosConfig({ loggedInUser });
    try {
      const { data } = await axios.put(
        "/api/user/delete/profile-pic",
        {
          currentProfilePic: loggedInUser?.profilePic,
          cloudinary_id: loggedInUser?.cloudinary_id,
        },
        config as AxiosRequestConfig
      );
      displaySuccess("ProfilePic Deleted Successfully");
      dispatch(setLoading(false));
      persistUpdatedUser({
        ...data,
        token: loggedInUser?.token,
        expiryTime: loggedInUser?.expiryTime,
      });
      return "profileUpdated";
    } catch (error) {
      displayError(error as ErrorType, "ProfilePic Deletion Failed");
      dispatch(setLoading(false));
    }
  };

  // Edited Name config
  let editedName: string;

  const getUpdatedName = (
    updatedValue: string,
    options?: { submitUpdatedName: boolean }
  ) => {
    editedName = updatedValue;
    if (options?.submitUpdatedName)
      updateProfileName({ enterKeyPressed: true });
  };

  const updateProfileName = async (options?: { enterKeyPressed: boolean }) => {
    if (!editedName) return displayWarning("Please Enter a Valid Name");

    dispatch(setLoading(true));
    const config = getAxiosConfig({ loggedInUser });
    try {
      const { data } = await axios.put(
        "/api/user/update/name",
        { newUserName: editedName },
        config as AxiosRequestConfig
      );
      displaySuccess("Name Updated Successfully");
      dispatch(setLoading(false));
      persistUpdatedUser({
        ...data,
        token: loggedInUser?.token,
        expiryTime: loggedInUser?.expiryTime,
      });
      if (options?.enterKeyPressed && closeChildDialog) closeChildDialog();
      else return "profileUpdated";
    } catch (error) {
      displayError(error as ErrorType, "Name Update Failed");
      dispatch(setLoading(false));
    }
  };

  // Open edit name dialog
  const openEditNameDialog: ClickEventHandler = () => {
    if (!setChildDialogBody || !displayChildDialog) return;
    setChildDialogBody(
      <EditNameBody
        originalName={loggedInUser?.name as string}
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
    if (!setChildDialogBody || !displayChildDialog) return;
    setChildDialogBody(<>Are you sure you want to delete this profile pic?</>);
    displayChildDialog({
      title: "Delete Profile Pic",
      nolabel: "NO",
      yeslabel: "YES",
      loadingYeslabel: "Deleting...",
      action: deleteProfilePic,
    });
  };

  const openEditProfilePicMenu: ClickEventHandler = (e) => {
    setEditProfilePicMenuAnchor(e.target as SetStateAction<HTMLElement | null>);
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
            src={profilePicUrl as string}
            alt="profilePic"
          />
          {!isGuestUser && (
            <CustomTooltip title="Edit Profile Pic" placement="top-start" arrow>
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
            anchor={editProfilePicMenuAnchor as HTMLElement}
            setAnchor={setEditProfilePicMenuAnchor}
            selectProfilePic={() => imgInput?.current?.click()}
            openDeletePhotoConfirmDialog={openDeletePhotoConfirmDialog}
            deletePhotoCondition={
              !loggedInUser?.profilePic?.endsWith("user_dqzjdz.png")
            }
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImgInputChange}
            name="profilepic"
            id="editProfilePic"
            ref={imgInput as React.LegacyRef<HTMLInputElement>}
            className={`d-none`}
            disabled={loading}
          />
        </section>
      )}
      {/* View Name */}
      <section className={`dialogField text-center mb-2`}>
        <div className="input-group" style={{ marginTop: "-15px" }}>
          <CustomTooltip title={name as string} placement="top" arrow>
            <div
              className="w-100 h1 fw-bold mx-4 text-info"
              style={{ fontSize: "32px", wordWrap: "break-word" }}
            >
              {truncateWords(name, 14, 11)}
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
                  top: 0,
                  ":hover": { backgroundColor: "#aaaaaa30" },
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
          title={((email?.length as number) > 24 ? email : "") as string}
          placement="bottom"
          arrow
        >
          <span className="h4" style={{ color: "lightblue" }}>
            {truncateString(email, 25, 21)}
          </span>
        </CustomTooltip>
      </section>
      {/* Child confirmation dialog */}
      <ChildDialog showChildDialogActions={true} showChildDialogClose={false} />
    </>
  );
};

export default EditProfileBody;
