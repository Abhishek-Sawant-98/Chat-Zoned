import { Delete, Upload } from "@mui/icons-material";
import { ListItemIcon, MenuItem } from "@mui/material";
import Menu, { menuIconProps, menuItemProps } from "../utils/Menu";
import MenuItemText from "../utils/MenuItemText";

const EditPicMenu = ({
  anchor,
  setAnchor,
  selectProfilePic,
  openDeletePhotoConfirmDialog,
  deletePhotoCondition,
}) => {
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
        <MenuItemText>Upload Photo</MenuItemText>
      </MenuItem>
      {deletePhotoCondition && (
        <MenuItem sx={menuItemProps} onClick={openDeletePhotoConfirmDialog}>
          <ListItemIcon sx={menuIconProps}>
            <Delete />
          </ListItemIcon>
          <MenuItemText>Delete Photo</MenuItemText>
        </MenuItem>
      )}
    </Menu>
  );
};

export default EditPicMenu;
