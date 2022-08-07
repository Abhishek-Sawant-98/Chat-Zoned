import {
  AdminPanelSettings,
  GroupRemove,
  InfoOutlined,
  Message,
} from "@mui/icons-material";
import { ListItemIcon, MenuItem } from "@mui/material";
import Menu, { menuIconProps, menuItemProps } from "../utils/Menu";
import axios from "../../utils/axios";
import MenuItemText from "../utils/MenuItemText";
import { getAxiosConfig, truncateString } from "../../utils/appUtils";
import ViewProfileBody from "../dialogs/ViewProfileBody";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAppState,
  setGroupInfo,
  setSelectedChat,
  toggleRefresh,
} from "../../store/slices/AppSlice";
import { displayToast } from "../../store/slices/ToastSlice";
import { setLoading } from "../../store/slices/FormfieldSlice";
import { hideDialog } from "../../store/slices/CustomDialogSlice";

const MemberOptionsMenu = ({
  anchor,
  setAnchor,
  clickedMember,
  setShowDialogActions,
  setShowDialogClose,
  childDialogMethods,
}) => {
  const { loggedInUser, refresh, groupInfo, clientSocket, isSocketConnected } =
    useSelector(selectAppState);
  const dispatch = useDispatch();

  const { setChildDialogBody, displayChildDialog } = childDialogMethods;
  const isLoggedInUserGroupAdmin = groupInfo?.groupAdmins?.some(
    (admin) => admin?._id === loggedInUser?._id
  );
  const clickedMemberName = truncateString(
    clickedMember?.name?.split(" ")[0],
    12,
    9
  );
  const styledMemberName = (
    <span style={{ color: "violet", fontSize: "22px" }}>
      {clickedMemberName}
    </span>
  );
  const updateView = (data) => {
    dispatch(toggleRefresh(!refresh));
    dispatch(setSelectedChat(data));
  };

  const displayError = (
    error = "Oops! Something went wrong",
    title = "Operation Failed"
  ) => {
    dispatch(
      displayToast({
        title,
        message: error.response?.data?.message || error.message,
        type: "error",
        duration: 5000,
        position: "bottom-center",
      })
    );
  };

  // Create/Retreive chat when 'Message Member' is clicked
  const openChat = async () => {
    dispatch(hideDialog()); // Close all dialogs by closing parent dialog
    dispatch(setLoading(true));
    const config = getAxiosConfig({ loggedInUser });
    try {
      const { data } = await axios.post(
        `/api/chat`,
        { userId: clickedMember?._id },
        config
      );

      dispatch(setLoading(false));
      updateView(data);
    } catch (error) {
      displayError(error, "Couldn't Create/Retrieve Chat");
      dispatch(setLoading(false));
    }
  };

  const openViewProfileDialog = () => {
    setShowDialogActions(false);
    setShowDialogClose(true);
    setChildDialogBody(
      <ViewProfileBody
        memberProfilePic={clickedMember?.profilePic}
        memberName={clickedMember?.name}
        memberEmail={clickedMember?.email}
      />
    );
    displayChildDialog({ title: "View Profile" });
  };

  const makeGroupAdmin = async () => {
    dispatch(setLoading(true));
    const config = getAxiosConfig({ loggedInUser });
    try {
      const { data } = await axios.post(
        `/api/chat/group/make-admin`,
        { userId: clickedMember?._id, chatId: groupInfo?._id },
        config
      );
      if (isSocketConnected) {
        clientSocket.emit("grp updated", {
          updater: loggedInUser,
          updatedGroup: data,
          createdAdmin: clickedMember,
        });
      }
      dispatch(
        displayToast({
          message: `${clickedMemberName} is now a Group Admin`,
          type: "success",
          duration: 4000,
          position: "bottom-center",
        })
      );
      dispatch(setGroupInfo(data));
      updateView(data);
      dispatch(setLoading(false));
    } catch (error) {
      displayError(error, "Make Group Admin Failed");
      dispatch(setLoading(false));
    }
  };

  const dismissAsAdmin = async () => {
    dispatch(setLoading(true));
    const config = getAxiosConfig({ loggedInUser });
    try {
      const { data } = await axios.put(
        `/api/chat/group/dismiss-admin`,
        { userId: clickedMember?._id, chatId: groupInfo?._id },
        config
      );
      if (isSocketConnected) {
        clientSocket.emit("grp updated", {
          updater: loggedInUser,
          updatedGroup: data,
          dismissedAdmin: clickedMember,
        });
      }
      dispatch(
        displayToast({
          message: `${clickedMemberName} is no longer a Group Admin`,
          type: "info",
          duration: 4000,
          position: "bottom-center",
        })
      );
      dispatch(setLoading(false));
      dispatch(setGroupInfo(data));
      updateView(data);
      return "membersUpdated";
    } catch (error) {
      displayError(error, "Dismiss As Group Admin Failed");
      dispatch(setLoading(false));
      return "membersUpdated";
    }
  };

  const removeFromGroup = async () => {
    dispatch(setLoading(true));
    const config = getAxiosConfig({ loggedInUser });
    try {
      const { data } = await axios.put(
        `/api/chat/group/remove`,
        {
          userToBeRemoved: clickedMember?._id,
          isGroupAdmin: clickedMember?.isGroupAdmin,
          chatId: groupInfo?._id,
        },
        config
      );

      data["removedUser"] = clickedMember;
      if (isSocketConnected) {
        clientSocket.emit("grp updated", {
          updater: loggedInUser,
          updatedGroup: data,
        });
      }
      dispatch(
        displayToast({
          message: `${clickedMemberName} removed from Group`,
          type: "info",
          duration: 4000,
          position: "bottom-center",
        })
      );
      dispatch(setLoading(false));
      dispatch(setGroupInfo(data));
      updateView(data);
      return "membersUpdated";
    } catch (error) {
      displayError(error, "Remove From Group Failed");
      dispatch(setLoading(false));
      return "membersUpdated";
    }
  };

  // Confirmation dialogs
  const openDismissAsAdminConfirmDialog = () => {
    setShowDialogActions(true);
    setShowDialogClose(false);
    setChildDialogBody(
      <>Are you sure you want to dismiss {styledMemberName} as group admin?</>
    );
    displayChildDialog({
      title: "Dismiss As Admin",
      nolabel: "NO",
      yeslabel: "YES",
      loadingYeslabel: "Saving...",
      action: dismissAsAdmin,
    });
  };

  const openRemoveFromGroupConfirmDialog = () => {
    setShowDialogActions(true);
    setShowDialogClose(false);
    setChildDialogBody(
      <>Are you sure you want to remove {styledMemberName} from this group?</>
    );
    displayChildDialog({
      title: "Remove From Group",
      nolabel: "NO",
      yeslabel: "YES",
      loadingYeslabel: "Saving...",
      action: removeFromGroup,
    });
  };

  return (
    <Menu
      menuAnchor={anchor}
      setMenuAnchor={setAnchor}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      {/* Message X */}
      <MenuItem sx={menuItemProps} onClick={openChat}>
        <ListItemIcon sx={menuIconProps}>
          <Message />
        </ListItemIcon>
        <MenuItemText>{`Message ${
          clickedMemberName || "Member"
        }`}</MenuItemText>
      </MenuItem>
      {/* View X */}
      <MenuItem sx={menuItemProps} onClick={openViewProfileDialog}>
        <ListItemIcon sx={menuIconProps}>
          <InfoOutlined />
        </ListItemIcon>
        <MenuItemText>{`View ${clickedMemberName || "Member"}`}</MenuItemText>
      </MenuItem>
      {/* Make Group Admin / Dismiss as Admin */}
      {isLoggedInUserGroupAdmin && (
        <MenuItem
          sx={menuItemProps}
          onClick={
            clickedMember?.isGroupAdmin
              ? openDismissAsAdminConfirmDialog
              : makeGroupAdmin
          }
        >
          <ListItemIcon sx={menuIconProps}>
            <AdminPanelSettings />
          </ListItemIcon>
          <MenuItemText>
            {clickedMember?.isGroupAdmin
              ? "Dismiss as Admin"
              : "Make Group Admin"}
          </MenuItemText>
        </MenuItem>
      )}
      {/* Remove X */}
      {isLoggedInUserGroupAdmin && (
        <MenuItem sx={menuItemProps} onClick={openRemoveFromGroupConfirmDialog}>
          <ListItemIcon sx={menuIconProps}>
            <GroupRemove />
          </ListItemIcon>
          <MenuItemText>{`Remove ${
            clickedMemberName || "Member"
          }`}</MenuItemText>
        </MenuItem>
      )}
    </Menu>
  );
};

export default MemberOptionsMenu;
