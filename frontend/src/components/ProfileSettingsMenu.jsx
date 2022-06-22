import { Key, Logout, ManageAccounts, Person } from "@mui/icons-material";
import { ListItemIcon, MenuItem } from "@mui/material";
import Menu, { menuIconProps, menuItemProps } from "./utils/Menu";
import { AppState } from "../context/ContextProvider";
import axios from "../utils/axios";
import ChangePasswordBody from "./dialogs/ChangePasswordBody";
import ViewOrEditProfileBody from "./dialogs/EditProfileBody";

const ProfileSettingsMenu = ({ anchor, setAnchor }) => {
  const {
    loggedInUser,
    setLoggedInUser,
    displayDialog,
    displayToast,
    setDialogBody,
    setShowDialogActions,
    formClassNames,
  } = AppState();

  const { setLoading } = formClassNames;
  const isGuestUser = loggedInUser?.email === "guest.user@gmail.com";

  let editPasswordData;

  const getUpdatedState = (updatedState) => {
    editPasswordData = updatedState;
  };

  const openLogoutConfirmDialog = () => {
    setShowDialogActions(true);
    setDialogBody(<>Are you sure you want to log out?</>);
    displayDialog({
      title: "Logout Confirmation",
      nolabel: "NO",
      yeslabel: "YES",
      loadingYeslabel: "Logging Out...",
      action: () => {
        sessionStorage.removeItem("loggedInUser");
        setLoggedInUser(null);
        displayToast({
          message: "Logged Out",
          type: "info",
          duration: 2000,
          position: "bottom-center",
        });
        return "loggingOut";
      },
    });
  };

  const openViewOrEditProfileDialog = () => {
    setShowDialogActions(false);
    setDialogBody(<ViewOrEditProfileBody />);
    displayDialog({
      title: isGuestUser ? "View Profile" : "Edit Profile",
    });
  };

  const openEditPasswordDialog = () => {
    setShowDialogActions(true);
    setDialogBody(<ChangePasswordBody getUpdatedState={getUpdatedState} />);
    displayDialog({
      title: "Change Password",
      nolabel: "CANCEL",
      yeslabel: "SAVE",
      loadingYeslabel: "Saving...",
      action: async () => {
        const { currentPassword, newPassword, confirmNewPassword } =
          editPasswordData;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
          return displayToast({
            message: "Please Enter All the Fields",
            type: "warning",
            duration: 5000,
            position: "top-center",
          });
        }
        if (currentPassword === newPassword) {
          return displayToast({
            message: "New Password Must Differ from Current Password",
            type: "warning",
            duration: 5000,
            position: "top-center",
          });
        }
        if (newPassword !== confirmNewPassword) {
          return displayToast({
            message: "New Password Must Match Confirm New Password",
            type: "warning",
            duration: 5000,
            position: "top-center",
          });
        }

        setLoading(true);

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
          displayToast({
            message:
              "Password Updated Successfully. Please Login Again with Updated Password.",
            type: "success",
            duration: 5000,
            position: "bottom-center",
          });

          setLoading(false);
          sessionStorage.removeItem("loggedInUser");
          setLoggedInUser(null);
          return "pwdUpdated";
        } catch (error) {
          displayToast({
            title: "Password Update Failed",
            message: error.response?.data?.message || "Oops! Server Down",
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
    <Menu
      menuAnchor={anchor}
      setMenuAnchor={setAnchor}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <MenuItem sx={menuItemProps} onClick={openViewOrEditProfileDialog}>
        <ListItemIcon sx={menuIconProps}>
          {isGuestUser ? <Person /> : <ManageAccounts />}
        </ListItemIcon>
        {isGuestUser ? "View" : "Edit"} Profile
      </MenuItem>
      {!isGuestUser && (
        <MenuItem sx={menuItemProps} onClick={openEditPasswordDialog}>
          <ListItemIcon sx={menuIconProps}>
            <Key />
          </ListItemIcon>
          Change Password
        </MenuItem>
      )}
      <MenuItem sx={menuItemProps} onClick={openLogoutConfirmDialog}>
        <ListItemIcon sx={menuIconProps}>
          <Logout />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );
};

export default ProfileSettingsMenu;
