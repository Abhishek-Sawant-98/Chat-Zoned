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
} from "@mui/icons-material";
import { Avatar, Button, Chip, DialogActions, IconButton } from "@mui/material";
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

const NewGroupBody = ({ data, getData }) => {
  const {
    formClassNames,
    loggedInUser,
    displayToast,
    refresh,
    setRefresh,
    closeDialog,
    setDialogAction,
  } = AppState();
  const {
    loading,
    setLoading,
    disableIfLoading,
    formFieldClassName,
    inputFieldClassName,
    formLabelClassName,
  } = formClassNames;

  const [editGroupDpMenuAnchor, setEditGroupDpMenuAnchor] = useState(null);
  const [groupData, setGroupData] = useState(data);
  const { chatDisplayPic, chatDisplayPicUrl, chatName } = groupData;
  const imgInput = useRef();

  useEffect(() => {
    getData({ ...groupData });
  }, [groupData]);

  // Click a button/icon upon 'Enter' or 'Space' keydown
  const clickOnKeydown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.target.click();
    }
  };

  const handleImgInputChange = (e) => {
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
    setGroupData({
      ...groupData,
      chatDisplayPic: image,
      chatDisplayPicUrl: URL.createObjectURL(image),
    });
  };

  const handleReset = (e) => {
    e.preventDefault();
    setGroupData({
      ...groupData,
      chatDisplayPic: null,
      chatDisplayPicUrl: DEFAULT_GROUP_DP,
    });
    imgInput.current.value = "";
  };

  const openEditGroupDpMenu = (e) => {
    setEditGroupDpMenuAnchor(e.target);
  };

  return (
    <div>
      {/* Select Display Pic */}
      <section className="newGroup d-flex position-relative mb-4">
        <img
          className="img-fluid d-flex mx-auto border border-2 border-primary rounded-circle mt-1"
          src={chatDisplayPicUrl}
          alt="displayPic"
        />
        <CustomTooltip title="Edit Group Display Pic" placement="right" arrow>
          <i
            id="editGroupDPTooltip"
            tabIndex={2}
            onKeyDown={clickOnKeydown}
            className={`selectPicIcon position-absolute p-2 d-flex ${disableIfLoading} justify-content-center align-items-center bg-success rounded-circle pointer`}
            onClick={openEditGroupDpMenu}
          >
            <Edit className="text-light fs-6" />
          </i>
        </CustomTooltip>
        {/* Edit/Delete profile pic menu */}
        <EditPicMenu
          anchor={editGroupDpMenuAnchor}
          setAnchor={setEditGroupDpMenuAnchor}
          selectProfilePic={() => imgInput.current.click()}
          openDeletePhotoConfirmDialog={handleReset}
          deletePhotoCondition={
            !chatDisplayPicUrl?.endsWith("group_mbuvht.png")
          }
        />
        <input
          type="file"
          accept=".png, .jpg, .jpeg .svg"
          onChange={handleImgInputChange}
          name="groupdp"
          id="editGroupDp"
          ref={imgInput}
          className={`d-none`}
          disabled={loading}
        />
      </section>
      {/* Group Name input */}
      <section className={`${formFieldClassName}`}>
        <label htmlFor="groupName" className={`${formLabelClassName}`}>
          Group Name <span className="required">*</span>
        </label>
        <input
          type="text"
          value={chatName}
          onChange={(e) => {
            setGroupData({ ...groupData, chatName: e.target.value });
          }}
          required
          autoFocus
          name="groupname"
          id="groupName"
          className={`${inputFieldClassName}`}
          disabled={loading}
          placeholder="Eg: The Avengers"
        />
      </section>
    </div>
  );
};

export default NewGroupBody;
