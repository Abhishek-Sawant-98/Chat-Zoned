import { Delete, Edit } from "@mui/icons-material";
import { ListItemIcon, MenuItem } from "@mui/material";
import { AnchorSetter, ClickEventHandler } from "../../utils/AppTypes";
import Menu, { menuIconProps, menuItemProps } from "../utils/Menu";
import MenuItemText from "../utils/MenuItemText";

interface Props {
  anchor: HTMLElement;
  setAnchor: AnchorSetter;
  editMsgHandler: ClickEventHandler;
  openDeleteMsgConfirmDialog: ClickEventHandler;
}

const MsgOptionsMenu = ({
  anchor,
  setAnchor,
  editMsgHandler,
  openDeleteMsgConfirmDialog,
}: Props) => {
  return (
    <Menu
      open={Boolean(anchor)}
      menuAnchor={anchor}
      setMenuAnchor={setAnchor}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <MenuItem sx={menuItemProps} onClick={editMsgHandler}>
        <ListItemIcon sx={menuIconProps}>
          <Edit />
        </ListItemIcon>
        <MenuItemText>Edit Message</MenuItemText>
      </MenuItem>
      <MenuItem sx={menuItemProps} onClick={openDeleteMsgConfirmDialog}>
        <ListItemIcon sx={menuIconProps}>
          <Delete />
        </ListItemIcon>
        <MenuItemText>Delete Message</MenuItemText>
      </MenuItem>
    </Menu>
  );
};

export default MsgOptionsMenu;
