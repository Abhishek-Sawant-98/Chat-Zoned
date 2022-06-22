import { Delete, Upload } from "@mui/icons-material";
import { ListItemIcon, MenuItem } from "@mui/material";
import Menu, { menuIconProps, menuItemProps } from "./utils/Menu";
import { AppState } from "../context/ContextProvider";

const EditProfilePicMenu = ({
  anchor,
  setAnchor,
  selectProfilePic,
  openDeletePhotoConfirmDialog,
}) => {
  const { loggedInUser } = AppState();

  return (
    <Menu
      menuAnchor={anchor}
      setMenuAnchor={setAnchor}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <MenuItem sx={menuItemProps} onClick={selectProfilePic}>
        <ListItemIcon sx={menuIconProps}>
          <Upload />
        </ListItemIcon>
        Upload Photo
      </MenuItem>
      {!loggedInUser?.profilePic?.endsWith("user_dqzjdz.png") && (
        <MenuItem sx={menuItemProps} onClick={openDeletePhotoConfirmDialog}>
          <ListItemIcon sx={menuIconProps}>
            <Delete />
          </ListItemIcon>
          Delete Photo
        </MenuItem>
      )}
    </Menu>
  );
};

export default EditProfilePicMenu;
