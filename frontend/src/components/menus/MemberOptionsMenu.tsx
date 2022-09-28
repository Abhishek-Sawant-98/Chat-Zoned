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
  setDeleteNotifsOfChat,
  setFetchMsgs,
  setGroupInfo,
  setSelectedChat,
  toggleRefresh,
} from "../../store/slices/AppSlice";
import { displayToast } from "../../store/slices/ToastSlice";
import { setLoading } from "../../store/slices/FormfieldSlice";
import { hideDialog } from "../../store/slices/CustomDialogSlice";
import {
  AnchorSetter,
  AxiosErrorType,
  ChatType,
  ChildDialogMethods,
  ErrorType,
  ToastData,
  UserType,
} from "../../utils/AppTypes";
import { AxiosRequestConfig } from "axios";

interface Props {
  anchor: HTMLElement;
  setAnchor: AnchorSetter;
  clickedMember: UserType;
  setShowDialogActions: (flag: boolean) => void;
  setShowDialogClose: (flag: boolean) => void;
  childDialogMethods: ChildDialogMethods;
}

const MemberOptionsMenu = ({
  anchor,
  setAnchor,
  clickedMember,
  setShowDialogActions,
  setShowDialogClose,
  childDialogMethods,
}: Props) => {
  const { loggedInUser, groupInfo, clientSocket, isSocketConnected } =
    useSelector(selectAppState);
  const dispatch = useDispatch();

  const { setChildDialogBody, displayChildDialog } = childDialogMethods;
  const isLoggedInUserGroupAdmin = groupInfo?.groupAdmins?.some(
    (admin: UserType) => admin?._id === loggedInUser?._id
  );
  const clickedMemberName: string = truncateString(
    clickedMember?.name?.split(" ")[0],
    12,
    9
  );
  const styledMemberName = (
    <span style={{ color: "violet", fontSize: "22px" }}>
      {clickedMemberName}
    </span>
  );
  const updateView = (data: ChatType) => {
    dispatch(toggleRefresh());
    dispatch(setSelectedChat(data));
  };

  const displayError = (
    error: ErrorType = "Oops! Something went wrong",
    title: string = "Operation Failed"
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
        position: "bottom-center",
      } as ToastData)
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
        config as AxiosRequestConfig
      );

      dispatch(setLoading(false));
      updateView(data);
      dispatch(setFetchMsgs(true));
      dispatch(setDeleteNotifsOfChat(data._id));
    } catch (error) {
      displayError(error as ErrorType, "Couldn't Create/Retrieve Chat");
      dispatch(setLoading(false));
    }
  };

  const openViewProfileDialog = () => {
    setShowDialogActions(false);
    setShowDialogClose(true);
    if (!setChildDialogBody || !displayChildDialog) return;

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
        config as AxiosRequestConfig
      );
      if (isSocketConnected) {
        clientSocket.emit("grp_updated", {
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
        } as ToastData)
      );
      dispatch(setGroupInfo(data));
      updateView(data);
      dispatch(setLoading(false));
    } catch (error) {
      displayError(error as ErrorType, "Make Group Admin Failed");
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
        config as AxiosRequestConfig
      );
      if (isSocketConnected) {
        clientSocket.emit("grp_updated", {
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
        } as ToastData)
      );
      dispatch(setLoading(false));
      dispatch(setGroupInfo(data));
      updateView(data);
      return "membersUpdated";
    } catch (error) {
      displayError(error as ErrorType, "Dismiss As Group Admin Failed");
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
        config as AxiosRequestConfig
      );

      data["removedUser"] = clickedMember;
      if (isSocketConnected) {
        clientSocket.emit("grp_updated", {
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
        } as ToastData)
      );
      dispatch(setLoading(false));
      dispatch(setGroupInfo(data));
      updateView(data);
      return "membersUpdated";
    } catch (error) {
      displayError(error as ErrorType, "Remove From Group Failed");
      dispatch(setLoading(false));
      return "membersUpdated";
    }
  };

  // Confirmation dialogs
  const openDismissAsAdminConfirmDialog = () => {
    setShowDialogActions(true);
    setShowDialogClose(false);
    if (!setChildDialogBody || !displayChildDialog) return;

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
    if (!setChildDialogBody || !displayChildDialog) return;

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
      open={Boolean(anchor)}
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
