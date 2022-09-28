import { SetStateAction, useRef, useState } from "react";
import {
  Delete,
  Edit,
  InfoOutlined,
  Logout,
  PersonAdd,
} from "@mui/icons-material";
import { CircularProgress, IconButton } from "@mui/material";
import axios from "../../utils/axios";
import {
  getAxiosConfig,
  isImageFile,
  truncateString,
  TWO_MB,
} from "../../utils/appUtils";
import EditPicMenu from "../menus/EditPicMenu";
import EditNameBody from "./EditNameBody";
import ChildDialog from "../utils/ChildDialog";
import AddMembersToGroup from "./AddMembersToGroup";
import ViewGroupMembers from "./ViewGroupMembers";
import getCustomTooltip from "../utils/CustomTooltip";
import FullSizeImage from "../utils/FullSizeImage";
import {
  selectAppState,
  setGroupInfo,
  setSelectedChat,
  toggleRefresh,
} from "../../store/slices/AppSlice";
import {
  selectFormfieldState,
  setLoading,
} from "../../store/slices/FormfieldSlice";
import { selectChildDialogState } from "../../store/slices/ChildDialogSlice";
import { displayToast } from "../../store/slices/ToastSlice";
import { hideDialog } from "../../store/slices/CustomDialogSlice";
import { useAppDispatch, useAppSelector } from "../../store/storeHooks";
import {
  AxiosErrorType,
  ChangeEventHandler,
  ChatType,
  ClickEventHandler,
  ErrorType,
  KeyboardEventHandler,
  MessageType,
  ToastData,
  UserType,
} from "../../utils/AppTypes";
import { AxiosRequestConfig } from "axios";

const arrowStyles = { color: "#111" };
const tooltipStyles = {
  maxWidth: 250,
  color: "#eee",
  fontFamily: "Trebuchet MS",
  fontSize: 17,
  padding: "5px 10px",
  border: "1px solid #333",
  backgroundColor: "#111",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

interface Props {
  messages: MessageType[];
}

const GroupInfoBody = ({ messages }: Props) => {
  const { loggedInUser, groupInfo, clientSocket, isSocketConnected } =
    useAppSelector(selectAppState);
  const { childDialogMethods } = useAppSelector(selectChildDialogState);
  const { loading, disableIfLoading } = useAppSelector(selectFormfieldState);
  const dispatch = useAppDispatch();
  const { setChildDialogBody, displayChildDialog, closeChildDialog } =
    childDialogMethods;

  const groupDP = groupInfo?.chatDisplayPic;
  const groupName = groupInfo?.chatName;
  const groupMembers = groupInfo?.users;
  const admins = groupInfo?.groupAdmins;

  const [uploading, setUploading] = useState(false);
  const [editGroupDpMenuAnchor, setEditGroupDpMenuAnchor] =
    useState<HTMLElement | null>(null);
  const isUserGroupAdmin = admins?.some(
    (admin: UserType) => admin?._id === loggedInUser?._id
  );
  const [showDialogActions, setShowDialogActions] = useState(true);
  const [showDialogClose, setShowDialogClose] = useState(false);
  const imgInput = useRef<HTMLInputElement | null>(null);
  const btnClassName = "w-100 btn text-light fs-5";

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

  const updateView = (data: ChatType) => {
    dispatch(setGroupInfo(data));
    dispatch(toggleRefresh());
    dispatch(setSelectedChat(data)); // To update messages view
  };

  // Click a button/icon upon 'Enter' or 'Space' keydown
  const clickOnKeydown: KeyboardEventHandler = (e) => {
    if (e.key === " " || e.key === "Enter") {
      (e.target as HTMLElement)?.click();
    }
  };

  // To retreive added members from `AddMembersToGroup` dialog
  let updatedName = "";
  const getUpdatedName = (
    updatedValue: string,
    options: { submitUpdatedName: boolean }
  ) => {
    updatedName = updatedValue;
    if (options?.submitUpdatedName) updateGroupName({ enterKeyClicked: true });
  };

  const updateGroupName = async (options: { enterKeyClicked: boolean }) => {
    if (!updatedName) return displayWarning("Please Enter Valid Group Name");

    dispatch(setLoading(true));
    const config = getAxiosConfig({ loggedInUser });
    try {
      const { data } = await axios.put(
        "/api/chat/group/update-name",
        { groupName: updatedName, chatId: groupInfo?._id },
        config as AxiosRequestConfig
      );

      if (isSocketConnected) {
        clientSocket.emit("grp_updated", {
          updater: loggedInUser,
          updatedGroup: data,
        });
      }
      displaySuccess("Group Name Updated Successfully");

      dispatch(setLoading(false));
      updateView(data);
      if (options?.enterKeyClicked && closeChildDialog) closeChildDialog();
      else return "profileUpdated";
    } catch (error) {
      displayError(error as ErrorType, "Couldn't Update Group Name");
      dispatch(setLoading(false));
    }
  };

  // Update Group Display Pic
  const updateGroupDp: ChangeEventHandler = async (e) => {
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
    formData.append("displayPic", imageFile);
    formData.append("currentDP", groupDP);
    formData.append("cloudinary_id", groupInfo?.cloudinary_id);
    formData.append("chatId", groupInfo?._id);
    try {
      const { data } = await axios.put(
        "/api/chat/group/update-dp",
        formData,
        config as AxiosRequestConfig
      );
      if (isSocketConnected) {
        clientSocket.emit("grp_updated", {
          updater: loggedInUser,
          updatedGroup: data,
        });
      }
      displaySuccess("Group DP Updated Successfully");
      dispatch(setLoading(false));
      setUploading(false);
      updateView(data);
    } catch (error) {
      displayError(error as ErrorType, "Couldn't Update Group DP");
      dispatch(setLoading(false));
      setUploading(false);
    }
  };

  const deleteGroupDp = async () => {
    dispatch(setLoading(true));
    const config = getAxiosConfig({ loggedInUser });
    try {
      const { data } = await axios.put(
        `/api/chat/group/delete-dp`,
        {
          currentDP: groupDP,
          cloudinary_id: groupInfo?.cloudinary_id,
          chatId: groupInfo?._id,
        },
        config as AxiosRequestConfig
      );

      if (isSocketConnected) {
        clientSocket.emit("grp_updated", {
          updater: loggedInUser,
          updatedGroup: data,
        });
      }
      displaySuccess("Group DP Deleted Successfully");
      dispatch(setLoading(false));
      updateView(data);
      return "profileUpdated";
    } catch (error) {
      displayError(error as ErrorType, "Couldn't Delete Group DP");
      dispatch(setLoading(false));
    }
  };

  const exitGroup = async () => {
    if (groupMembers?.length === 1) return deleteGroup();

    dispatch(setLoading(true));
    const config = getAxiosConfig({ loggedInUser });
    try {
      const { data } = await axios.put(
        `/api/chat/group/remove`,
        {
          userToBeRemoved: loggedInUser?._id,
          isGroupAdmin: isUserGroupAdmin,
          chatId: groupInfo?._id,
        },
        config as AxiosRequestConfig
      );

      if (isSocketConnected) {
        clientSocket.emit("grp_updated", {
          updater: loggedInUser,
          updatedGroup: data,
        });
      }
      dispatch(
        displayToast({
          message: `Exited From '${data?.chatName}' Group`,
          type: "info",
          duration: 4000,
          position: "bottom-center",
        } as ToastData)
      );
      dispatch(setLoading(false));
      updateView(null);
      dispatch(hideDialog());
    } catch (error) {
      dispatch(
        displayToast({
          title: "Couldn't Exit Group",
          message:
            (error as AxiosErrorType).response?.data?.message ||
            (error as Error)?.message ||
            error,
          type: "error",
          duration: 4000,
          position: "bottom-center",
        } as ToastData)
      );
      dispatch(setLoading(false));
      return "membersUpdated";
    }
  };

  const deleteGroup = async () => {
    dispatch(setLoading(true));
    const config = getAxiosConfig({ loggedInUser });
    try {
      const deleteGroupPromise = axios.put(
        `/api/chat/group/delete`,
        {
          currentDP: groupInfo?.chatDisplayPic,
          cloudinary_id: groupInfo?.cloudinary_id,
          chatId: groupInfo?._id,
        },
        config as AxiosRequestConfig
      );
      const deleteMessagesPromise = messages?.length
        ? axios.put(
            `/api/message/delete`,
            {
              messageIds: JSON.stringify(
                messages?.map((m: MessageType) => m?._id)
              ),
              isDeleteGroupRequest: true,
            },
            config as AxiosRequestConfig
          )
        : Promise.resolve();

      // Parallel execution of independent promises
      await Promise.all([deleteGroupPromise, deleteMessagesPromise]);
      if (isSocketConnected) {
        clientSocket.emit("grp_deleted", {
          admin: loggedInUser,
          deletedGroup: groupInfo,
        });
      }
      displaySuccess("Group Deleted Successfully");
      dispatch(setLoading(false));
      updateView(null);
      dispatch(hideDialog());
    } catch (error) {
      displayError(error as ErrorType, "Couldn't Delete Group");
      dispatch(setLoading(false));
    }
  };

  // Open confirm dialogs
  const openExitGroupConfirmDialog = () => {
    setShowDialogActions(true);
    setShowDialogClose(false);
    if (!setChildDialogBody || !displayChildDialog) return;
    setChildDialogBody(
      <>
        {groupMembers?.length === 1
          ? `Since you're the only group member, this group will be 
            DELETED if you exit. Are you sure you want to exit?`
          : `This group will be removed from your chats. 
             Are you sure you want to exit this group?`}
      </>
    );
    displayChildDialog({
      title: "Exit Group",
      nolabel: "NO",
      yeslabel: "YES",
      loadingYeslabel: "Exiting...",
      action: exitGroup,
    });
  };

  const openDeleteGroupConfirmDialog = () => {
    setShowDialogActions(true);
    setShowDialogClose(false);
    if (!setChildDialogBody || !displayChildDialog) return;
    setChildDialogBody(
      <>
        All messages and files related to this group will be deleted and this
        group will be removed from the chats of ALL MEMBERS. Are you sure you
        want to delete this group?
      </>
    );
    displayChildDialog({
      title: "Delete Group",
      nolabel: "NO",
      yeslabel: "YES",
      loadingYeslabel: "Deleting...",
      action: deleteGroup,
    });
  };

  // Open edit name dialog
  const openEditGroupNameDialog = () => {
    setShowDialogActions(true);
    setShowDialogClose(false);
    if (!setChildDialogBody || !displayChildDialog) return;
    setChildDialogBody(
      <EditNameBody
        originalName={groupInfo?.chatName}
        getUpdatedName={getUpdatedName}
        placeholder="Enter New Group Name"
      />
    );
    displayChildDialog({
      title: "Edit Group Name",
      nolabel: "CANCEL",
      yeslabel: "SAVE",
      loadingYeslabel: "Saving...",
      action: updateGroupName,
    });
  };

  // Open delete photo confirm dialog
  const openDeletePhotoConfirmDialog = () => {
    setShowDialogActions(true);
    if (!setChildDialogBody || !displayChildDialog) return;
    setShowDialogClose(false);
    setChildDialogBody(<>Are you sure you want to delete this display pic?</>);
    displayChildDialog({
      title: "Delete Display Pic",
      nolabel: "NO",
      yeslabel: "YES",
      loadingYeslabel: "Deleting...",
      action: deleteGroupDp,
    });
  };

  // To retreive added members from `AddMembersToGroup` dialog
  let addedMembers: UserType[] = [];
  const getAddedMembers = (updatedMembers: UserType[]) => {
    addedMembers = updatedMembers;
  };

  const addMembersToGroup = async () => {
    if (!isUserGroupAdmin)
      return displayWarning("Only Admin Can Add Members to Group");

    if (!addedMembers?.length)
      return displayWarning("Please Select Atleast 1 Member to Add");

    dispatch(setLoading(true));
    const config = getAxiosConfig({ loggedInUser });
    try {
      const { data } = await axios.post(
        "/api/chat/group/add",
        {
          usersToBeAdded: JSON.stringify(addedMembers),
          chatId: groupInfo?._id,
        },
        config as AxiosRequestConfig
      );
      if (isSocketConnected) {
        clientSocket.emit("grp_updated", {
          updater: loggedInUser,
          updatedGroup: data,
        });
      }
      displaySuccess("Successfully Added Member/s to Group");
      dispatch(setLoading(false));
      updateView(data);
      return "profileUpdated";
    } catch (error) {
      displayError(error as ErrorType, "Couldn't Add Members to Group");
      dispatch(setLoading(false));
    }
  };

  // Open Add members dialog
  const openAddMembersDialog = () => {
    setShowDialogActions(true);
    setShowDialogClose(false);
    if (!setChildDialogBody || !displayChildDialog) return;

    setChildDialogBody(<AddMembersToGroup getAddedMembers={getAddedMembers} />);
    displayChildDialog({
      title: "Add Group Members",
      nolabel: "Cancel",
      yeslabel: "Add",
      loadingYeslabel: "Adding...",
      action: addMembersToGroup,
    });
  };

  const openViewMembersDialog = () => {
    setShowDialogActions(false);
    setShowDialogClose(true);
    if (!setChildDialogBody || !displayChildDialog) return;
    setChildDialogBody(<ViewGroupMembers />);
    displayChildDialog({
      title: ``,
    });
  };

  const displayFullSizeImage: ClickEventHandler = (e) => {
    setShowDialogActions(false);
    setShowDialogClose(true);
    if (!setChildDialogBody || !displayChildDialog) return;
    setChildDialogBody(<FullSizeImage event={e} />);
    displayChildDialog({
      isFullScreen: true,
      title: (e.target as HTMLImageElement)?.alt || "Display Pic",
    });
  };

  const openEditGroupDpMenu: ClickEventHandler = (e) => {
    setEditGroupDpMenuAnchor(e.target as SetStateAction<HTMLElement | null>);
  };

  return (
    <div className="groupDialog d-flex flex-column row">
      {/* View/Edit Display Pic */}
      {loading && uploading ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <CircularProgress
            size={60}
            style={{ margin: "20px 0px", color: "lightblue" }}
          />
          <span style={{ marginBottom: "45px" }} className="text-light h1">
            {" Updating Photo..."}
          </span>
        </div>
      ) : (
        <section className="dialogField d-flex position-relative mb-4">
          <CustomTooltip title="View DP" placement="right" arrow>
            <img
              className="img-fluid d-flex mx-auto border border-2 border-primary rounded-circle pointer"
              src={groupDP || "GroupDp"}
              style={{ width: "120px", height: "120px" }}
              onClick={displayFullSizeImage}
              alt={groupName}
            />
          </CustomTooltip>

          <CustomTooltip title="Edit Group DP" placement="right" arrow>
            <i
              id="editProfilePic"
              tabIndex={2}
              onKeyDown={clickOnKeydown}
              className={`selectPicIcon position-absolute p-2 d-flex ${disableIfLoading} justify-content-center align-items-center bg-success rounded-circle pointer`}
              onClick={openEditGroupDpMenu}
            >
              <Edit className="text-light fs-6" />
            </i>
          </CustomTooltip>
          {/* Edit/Delete display pic menu */}
          <EditPicMenu
            anchor={editGroupDpMenuAnchor as HTMLElement}
            setAnchor={setEditGroupDpMenuAnchor}
            selectProfilePic={() => imgInput?.current?.click()}
            openDeletePhotoConfirmDialog={openDeletePhotoConfirmDialog}
            deletePhotoCondition={!groupDP?.endsWith("group_mbuvht.png")}
          />
          <input
            type="file"
            accept="image/*"
            onChange={updateGroupDp}
            name="displayPic"
            id="groupInfo__displayPic"
            ref={imgInput}
            className={`d-none`}
            disabled={loading}
          />
        </section>
      )}

      {/* Group Name */}
      <section className={`dialogField text-center mb-3`}>
        <div className="input-group" style={{ marginTop: "-10px" }}>
          <CustomTooltip
            title={groupName?.length > 24 ? groupName : ""}
            placement="top"
            arrow
          >
            <div
              className="w-100 fw-bold mx-4 text-info"
              style={{ fontSize: "28px", lineHeight: "30px" }}
            >
              {truncateString(groupName, 25, 21)}
            </div>
          </CustomTooltip>
          <CustomTooltip title="Edit Group Name" placement="top" arrow>
            <IconButton
              tabIndex={3}
              onKeyDown={clickOnKeydown}
              onClick={openEditGroupNameDialog}
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
        </div>
      </section>

      {/* No of members */}
      <section
        className={`dialogField text-center mb-3 text-light text-opacity-75`}
        style={{ marginTop: "-5px", borderRadius: "10px" }}
      >
        {`${groupMembers?.length} Member${groupMembers?.length > 1 ? "s" : ""}`}
      </section>

      {/* View Members */}
      <section className={`dialogField text-center mb-2`}>
        <button
          className={`${btnClassName} btn-outline-primary`}
          onClick={openViewMembersDialog}
        >
          <InfoOutlined
            className="text-light"
            style={{ marginLeft: "-15px" }}
          />
          <span className="ms-2">View Members</span>
        </button>
      </section>

      {/* Add Members (only for admins) */}
      {isUserGroupAdmin && (
        <section className={`dialogField text-center mb-2`}>
          <button
            className={`${btnClassName} btn-outline-success`}
            onClick={openAddMembersDialog}
          >
            <PersonAdd className="text-light" style={{ marginLeft: "-20px" }} />
            <span className="ms-2">Add Members</span>
          </button>
        </section>
      )}

      {/* Exit Group */}
      <section className={`dialogField text-center mb-2`}>
        <button
          className={`${btnClassName} btn-outline-danger`}
          onClick={() => {
            if (
              isUserGroupAdmin &&
              admins?.length === 1 &&
              groupMembers?.length !== 1
            ) {
              return displayWarning(
                `Every group must have atleast 1 admin. Since 
              you're the only group admin, you won't be allowed
              to exit until you make someone else as the admin.`,
                10000
              );
            }
            openExitGroupConfirmDialog();
          }}
        >
          <Logout className="text-light" style={{ marginLeft: "-30px" }} />
          <span className="ms-2">Exit Group</span>
        </button>
      </section>

      {/* Delete Group (only for admins) */}
      {isUserGroupAdmin && (
        <section className={`dialogField text-center mb-2`}>
          <button
            className={`${btnClassName} btn-outline-danger`}
            onClick={openDeleteGroupConfirmDialog}
          >
            <Delete className="text-light" style={{ marginLeft: "-20px" }} />
            <span className="ms-2">Delete Group</span>
          </button>
        </section>
      )}

      {/* Child dialog */}
      <ChildDialog
        showChildDialogActions={showDialogActions}
        showChildDialogClose={showDialogClose}
      />
    </div>
  );
};

export default GroupInfoBody;
