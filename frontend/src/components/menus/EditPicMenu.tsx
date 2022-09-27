import { Delete, Upload } from "@mui/icons-material";
import { ListItemIcon, MenuItem } from "@mui/material";
import { AnchorSetter, ClickEventHandler } from "../../utils/AppTypes";
import Menu, { menuIconProps, menuItemProps } from "../utils/Menu";
import MenuItemText from "../utils/MenuItemText";

interface Props {
  anchor: HTMLElement;
  setAnchor: AnchorSetter;
  selectProfilePic: ClickEventHandler;
  openDeletePhotoConfirmDialog: ClickEventHandler;
  deletePhotoCondition: boolean;
}

const EditPicMenu = ({
  anchor,
  setAnchor,
  selectProfilePic,
  openDeletePhotoConfirmDialog,
  deletePhotoCondition,
}: Props) => {
  return (
    <Menu
      open={Boolean(anchor)}
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
