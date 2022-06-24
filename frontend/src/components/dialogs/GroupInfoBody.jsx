import { useEffect, useRef, useState } from "react";
import { AppState } from "../../context/ContextProvider";
import {
  AddAPhoto,
  ArrowCircleRight,
  ArrowForward,
  ArrowForwardIos,
  ArrowRight,
  Edit,
  KeyboardDoubleArrowRight,
  PersonAdd,
  Visibility,
} from "@mui/icons-material";
import {
  Avatar,
  Button,
  Chip,
  CircularProgress,
  DialogActions,
  IconButton,
} from "@mui/material";
import CustomDialog from "../utils/CustomDialog";
import axios from "../../utils/axios";
import getCustomTooltip from "../utils/CustomTooltip";
import {
  debounce,
  DEFAULT_GROUP_DP,
  truncateString,
} from "../../utils/appUtils";
import UserListItem from "../utils/UserListItem";
import LoadingIndicator from "../utils/LoadingIndicator";
import SearchInput from "../utils/SearchInput";
import { btnHoverStyle, btnCustomStyle } from "../utils/CustomDialog";
import EditPicMenu from "../menus/EditPicMenu";
import EditNameBody from "./EditNameBody";
import ChildDialog from "../utils/ChildDialog";
import AddMembersToGroup from "./AddMembersToGroup";

const arrowStyles = {
  color: "#111",
};
const tooltipStyles = {
  maxWidth: 250,
  color: "#eee",
  fontFamily: "Mirza",
  fontSize: 17,
  border: "1px solid #333",
  backgroundColor: "#111",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const GroupInfoBody = () => {
  const {
    formClassNames,
    loggedInUser,
    displayToast,
    refresh,
    setRefresh,
    closeDialog,
    setDialogAction,
    selectedChat,
    setSelectedChat,
    childDialogMethods,
    getChildDialogMethods,
  } = AppState();
  const {
    loading,
    setLoading,
    disableIfLoading,
    formFieldClassName,
    inputFieldClassName,
    formLabelClassName,
  } = formClassNames;

  const { setChildDialogBody, displayChildDialog } = childDialogMethods;
  const [editGroupDpMenuAnchor, setEditGroupDpMenuAnchor] = useState(null);
  const [groupData, setGroupData] = useState(selectedChat);
  const { chatDisplayPic, chatName, users } = groupData;
  const [uploading, setUploading] = useState(false);
  const imgInput = useRef(null);
  const isUserGroupAdmin = loggedInUser?._id === groupData?.groupAdmin?._id;

  // router.put("/group/remove", authorizeUser, removeUserFromGroup);
  // router.put("/group/add", authorizeUser, addUsersToGroup);
  // router.put("/group/delete", authorizeUser, deleteGroupChat);

  useEffect(() => {}, [groupData]);

  const updateView = (data) => {
    setGroupData(data);
    setRefresh(!refresh); // To update chatlist view
    setSelectedChat(data); // To update messages view
  };

  // Click a button/icon upon 'Enter' or 'Space' keydown
  const clickOnKeydown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.target.click();
    }
  };

  // Edited Name config
  let editedName;

  const getUpdatedName = (updatedName) => {
    editedName = updatedName;
  };

  const updateGroupName = async () => {
    if (!editedName) {
      return displayToast({
        message: "Please Enter Valid Group Name",
        type: "warning",
        duration: 3000,
        position: "top-center",
      });
    }
    setLoading(true);

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loggedInUser?.token}`,
      },
    };

    try {
      const { data } = await axios.put(
        "/api/chat/group/update-name",
        { groupName: editedName, chatId: groupData?._id },
        config
      );

      displayToast({
        message: "Group Name Updated Successfully",
        type: "success",
        duration: 3000,
        position: "bottom-center",
      });

      setLoading(false);
      updateView(data);
      return "profileUpdated";
    } catch (error) {
      displayToast({
        title: "Couldn't Update Group Name",
        message: error.response?.data?.message || "Oops! Server Down",
        type: "error",
        duration: 4000,
        position: "top-center",
      });
      setLoading(false);
    }
  };

  // Update Group Display Pic
  const handleImgInputChange = async (e) => {
    const image = e.target.files[0];
    if (!image) return;

    if (image.size >= 2097152) {
      imgInput.current.value = "";
      return displayToast({
        message: "Please Select an Image Smaller than 2 MB",
        type: "warning",
        duration: 4000,
        position: "top-center",
      });
    }
    setLoading(true);
    setUploading(true);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${loggedInUser.token}`,
      },
    };

    const formData = new FormData();
    formData.append("displayPic", image);
    formData.append("currentDP", groupData?.chatDisplayPic);
    formData.append("cloudinary_id", groupData?.cloudinary_id);
    formData.append("chatId", groupData?._id);
    try {
      const { data } = await axios.put(
        "/api/chat/group/update-dp",
        formData,
        config
      );

      displayToast({
        message: "Group DP Updated Successfully",
        type: "success",
        duration: 3000,
        position: "bottom-center",
      });
      setLoading(false);
      setUploading(false);
      updateView(data);
    } catch (error) {
      displayToast({
        title: "Couldn't Update Group DP",
        message: error.response?.data?.message || "Oops! Server Down",
        type: "error",
        duration: 4000,
        position: "top-center",
      });
      setLoading(false);
      setUploading(false);
    }
  };

  const deleteGroupDp = async () => {
    setLoading(true);

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loggedInUser.token}`,
      },
    };

    try {
      const { data } = await axios.put(
        "/api/chat/group/delete-dp",
        {
          currentDP: groupData?.chatDisplayPic,
          cloudinary_id: groupData?.cloudinary_id,
          chatId: groupData?._id,
        },
        config
      );

      displayToast({
        message: "Group DP Deleted Successfully",
        type: "success",
        duration: 3000,
        position: "bottom-center",
      });
      setLoading(false);
      updateView(data);
      return "profileUpdated";
    } catch (error) {
      displayToast({
        title: "Couldn't Delete Group DP",
        message: error.response?.data?.message || "Oops! Server Down",
        type: "error",
        duration: 4000,
        position: "top-center",
      });
      setLoading(false);
    }
  };

  // Open edit name dialog
  const openEditGroupNameDialog = () => {
    setChildDialogBody(
      <EditNameBody
        originalName={chatName}
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
    setChildDialogBody(<>Are you sure you want to delete this display pic?</>);
    displayChildDialog({
      title: "Delete Display Pic",
      nolabel: "NO",
      yeslabel: "YES",
      loadingYeslabel: "Deleting...",
      action: deleteGroupDp,
    });
  };

  let usersToBeAdded;
  const getUsersToBeAdded = (addedUsers) => {
    usersToBeAdded = addedUsers;
  };

  const addMembersToGroup = async () => {
    if (!isUserGroupAdmin) {
      return displayToast({
        message: "Only Admin Can Add Members to Group",
        type: "warning",
        duration: 3000,
        position: "top-center",
      });
    }
    if (!usersToBeAdded?.length) {
      return displayToast({
        message: "Please Select Atleast 1 Member to Add",
        type: "warning",
        duration: 3000,
        position: "top-center",
      });
    }
    setLoading(true);

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loggedInUser?.token}`,
      },
    };

    try {
      const { data } = await axios.put(
        "/api/chat/group/add",
        {
          usersToBeAdded: JSON.stringify(usersToBeAdded),
          chatId: groupData?._id,
        },
        config
      );

      displayToast({
        message: "Successfully Added Member/s to Group",
        type: "success",
        duration: 3000,
        position: "bottom-center",
      });

      setLoading(false);
      updateView(data);
      return "profileUpdated";
    } catch (error) {
      displayToast({
        title: "Couldn't Add Members to Group",
        message: error.response?.data?.message || "Oops! Server Down",
        type: "error",
        duration: 4000,
        position: "top-center",
      });
      setLoading(false);
    }
  };

  // Open Add members dialog
  const openAddMembersDialog = () => {
    setChildDialogBody(
      <AddMembersToGroup
        groupInfo={groupData}
        getUsersToBeAdded={getUsersToBeAdded}
      />
    );
    displayChildDialog({
      title: "Add Group Members",
      nolabel: "Cancel",
      yeslabel: "Add",
      loadingYeslabel: "Adding...",
      action: addMembersToGroup,
    });
  };

  const openViewMembersDialog = () => {
    setChildDialogBody(
      <EditNameBody
        originalName={chatName}
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

  const openEditGroupDpMenu = (e) => {
    setEditGroupDpMenuAnchor(e.target);
  };

  return (
    <div className="groupDialog d-flex flex-column row">
      {/* View/Edit Display Pic */}
      {loading && uploading ? (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <CircularProgress
            size={75}
            style={{ margin: "30px 0px", color: "lightblue" }}
          />
          <span style={{ marginBottom: "45px" }} className="text-light h1">
            {" Updating Photo..."}
          </span>
        </div>
      ) : (
        <section className="dialogField d-flex position-relative mb-4">
          <img
            className="img-fluid d-flex mx-auto border border-2 border-primary rounded-circle"
            id="groupInfo__displayPic"
            src={groupData?.chatDisplayPic || "GroupDp"}
            style={{ width: "130px", height: "130px" }}
            alt="displayPic"
          />
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
            anchor={editGroupDpMenuAnchor}
            setAnchor={setEditGroupDpMenuAnchor}
            selectProfilePic={() => imgInput.current.click()}
            openDeletePhotoConfirmDialog={openDeletePhotoConfirmDialog}
            deletePhotoCondition={!chatDisplayPic?.endsWith("group_mbuvht.png")}
          />
          <input
            type="file"
            accept=".png, .jpg, .jpeg .svg"
            onChange={handleImgInputChange}
            name="displayPic"
            id="groupInfo__displayPic"
            ref={imgInput}
            className={`d-none`}
            disabled={loading}
          />
        </section>
      )}

      {/* Group Name */}
      <section className={`dialogField text-center mb-2`}>
        <div className="input-group" style={{ marginTop: "-15px" }}>
          <CustomTooltip
            title={chatName?.length > 24 ? chatName : ""}
            placement="top"
            arrow
          >
            <div
              className="w-100 fw-bold mx-4 text-info"
              style={{ fontSize: "30px" }}
            >
              {truncateString(chatName, 25, 21)}
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
                top: 6,
                ":hover": {
                  backgroundColor: "#aaaaaa30",
                },
              }}
            >
              <Edit className="text-light" />
            </IconButton>
          </CustomTooltip>
        </div>
      </section>

      {/* No of members */}
      <section
        className={`dialogField text-center mb-3`}
        style={{ marginTop: "-10px" }}
      >
        {`Group : ${groupData?.users?.length} Members`}
      </section>

      {/* Add Members */}
      {isUserGroupAdmin && (
        <section className={`dialogField text-center mb-2`}>
          <button
            className={`w-100 btn btn-outline-success bg-opacity-50 text-light fs-5 rounded-pill`}
            onClick={openAddMembersDialog}
          >
            <PersonAdd className="text-light" style={{ marginLeft: "-20px" }} />
            <span className="ms-2">Add Members</span>
          </button>
        </section>
      )}

      {/* View Members */}
      <section className={`dialogField text-center mb-2`}>
        <button
          className={`w-100 btn btn-outline-primary bg-opacity-50 text-light fs-5 rounded-pill`}
          onClick={openViewMembersDialog}
        >
          <Visibility className="text-light" style={{ marginLeft: "-20px" }} />
          <span className="ms-2">View Members</span>
        </button>
      </section>

      {/* Child confirmation dialog */}
      <ChildDialog getChildDialogMethods={getChildDialogMethods} />
    </div>
  );
};

export default GroupInfoBody;
