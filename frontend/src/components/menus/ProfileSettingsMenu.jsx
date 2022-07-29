import { Key, Logout, ManageAccounts, Person } from "@mui/icons-material";
import { ListItemIcon, MenuItem } from "@mui/material";
import Menu, { menuIconProps, menuItemProps } from "../utils/Menu";
import axios from "../../utils/axios";
import ChangePasswordBody from "../dialogs/ChangePasswordBody";
import EditProfileBody from "../dialogs/EditProfileBody";
import MenuItemText from "../utils/MenuItemText";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAppState,
  setLoggedInUser,
  setSelectedChat,
} from "../../store/slices/AppSlice";
import { setLoading } from "../../store/slices/FormfieldSlice";
import {
  displayDialog,
  hideDialog,
  setShowDialogActions,
} from "../../store/slices/CustomDialogSlice";
import { displayToast } from "../../store/slices/ToastSlice";
import { useNavigate } from "react-router-dom";

const ProfileSettingsMenu = ({ anchor, setAnchor, setDialogBody }) => {
  const { loggedInUser } = useSelector(selectAppState);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isGuestUser = loggedInUser?.email === "guest.user@gmail.com";

  // Edit Password Config
  let editPasswordData;

  const getUpdatedState = (updatedState, options) => {
    editPasswordData = updatedState;
    if (options?.submitUpdatedPassword)
      updatePassword({ enterKeyPressed: true });
  };

  const updatePassword = async (options) => {
    const { currentPassword, newPassword, confirmNewPassword } =
      editPasswordData;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return dispatch(
        displayToast({
          message: "Please Enter All the Fields",
          type: "warning",
          duration: 5000,
          position: "top-center",
        })
      );
    }
    if (currentPassword === newPassword) {
      return dispatch(
        displayToast({
          message: "New Password Must Differ from Current Password",
          type: "warning",
          duration: 5000,
          position: "top-center",
        })
      );
    }
    if (newPassword !== confirmNewPassword) {
      return dispatch(
        displayToast({
          message: "New Password Must Match Confirm New Password",
          type: "warning",
          duration: 5000,
          position: "top-center",
        })
      );
    }
    dispatch(setLoading(true));

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loggedInUser.token}`,
      },
    };

    try {
      await axios.put(
        "/api/user/update/password",
        { currentPassword, newPassword },
        config
      );
      dispatch(
        displayToast({
          message:
            "Password Updated Successfully. Please Login Again with Updated Password.",
          type: "success",
          duration: 5000,
          position: "bottom-center",
        })
      );

      dispatch(setLoading(false));
      localStorage.removeItem("loggedInUser");
      dispatch(setLoggedInUser(null));
      if (options?.enterKeyPressed) {
        dispatch(hideDialog());
        dispatch(setSelectedChat(null));
        navigate("/");
        return;
      }
      return "pwdUpdated";
    } catch (error) {
      dispatch(
        displayToast({
          title: "Password Update Failed",
          message: error.response?.data?.message || error.message,
          type: "error",
          duration: 5000,
          position: "top-center",
        })
      );
      dispatch(setLoading(false));
    }
  };

  const logout = () => {
    localStorage.removeItem("loggedInUser");
    dispatch(setLoggedInUser(null));
    dispatch(
      displayToast({
        message: "Logged Out",
        type: "success",
        duration: 2000,
        position: "bottom-center",
      })
    );
    return "loggingOut";
  };

  // Open dialogs
  const openLogoutConfirmDialog = () => {
    dispatch(setShowDialogActions(true));
    setDialogBody(<>Are you sure you want to log out?</>);
    dispatch(
      displayDialog({
        title: "Logout Confirmation",
        nolabel: "NO",
        yeslabel: "YES",
        loadingYeslabel: "Logging Out...",
        action: logout,
      })
    );
  };

  const openEditProfileDialog = () => {
    dispatch(setShowDialogActions(false));
    setDialogBody(<EditProfileBody />);
    dispatch(
      displayDialog({
        title: isGuestUser ? "View Profile" : "Edit Profile",
      })
    );
  };

  const openEditPasswordDialog = () => {
    dispatch(setShowDialogActions(true));
    setDialogBody(<ChangePasswordBody getUpdatedState={getUpdatedState} />);
    dispatch(
      displayDialog({
        title: "Change Password",
        nolabel: "CANCEL",
        yeslabel: "SAVE",
        loadingYeslabel: "Saving...",
        action: updatePassword,
      })
    );
  };

  return (
    <Menu
      menuAnchor={anchor}
      setMenuAnchor={setAnchor}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <MenuItem sx={menuItemProps} onClick={openEditProfileDialog}>
        <ListItemIcon sx={menuIconProps}>
          {isGuestUser ? <Person /> : <ManageAccounts />}
        </ListItemIcon>
        <MenuItemText>{isGuestUser ? "View" : "Edit"} Profile</MenuItemText>
      </MenuItem>
      {!isGuestUser && (
        <MenuItem sx={menuItemProps} onClick={openEditPasswordDialog}>
          <ListItemIcon sx={menuIconProps}>
            <Key />
          </ListItemIcon>
          <MenuItemText>Change Password</MenuItemText>
        </MenuItem>
      )}
      <MenuItem sx={menuItemProps} onClick={openLogoutConfirmDialog}>
        <ListItemIcon sx={menuIconProps}>
          <Logout />
        </ListItemIcon>
        <MenuItemText>Logout</MenuItemText>
      </MenuItem>
    </Menu>
  );
};

export default ProfileSettingsMenu;
