import { Logout, ManageAccounts } from "@mui/icons-material";
import { ListItemIcon, MenuItem } from "@mui/material";
import Menu, { menuIconProps, menuItemProps } from "../utils/Menu";
import MenuItemText from "../utils/MenuItemText";
import { useDispatch, useSelector } from "react-redux";
import { selectAppState } from "../../redux/slices/AppSlice";

const NotificationsMenu = ({ anchor, setAnchor }) => {
  const { loggedInUser } = useSelector(selectAppState);
  const dispatch = useDispatch();
  const notifs = loggedInUser?.notifications;
  return (
    <Menu
      menuAnchor={anchor}
      setMenuAnchor={setAnchor}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      {notifs?.length ? (
        notifs.map((n) => (
          <MenuItem
            key={n._id}
            sx={menuItemProps}
            onClick={() => {}}
          ></MenuItem>
        ))
      ) : (
        <MenuItem sx={menuItemProps}>
          <MenuItemText>No notifications</MenuItemText>
        </MenuItem>
      )}
    </Menu>
  );
};

export default NotificationsMenu;
