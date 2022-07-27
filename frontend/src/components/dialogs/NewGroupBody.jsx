import { useRef, useState } from "react";
import { Edit, KeyboardDoubleArrowLeft } from "@mui/icons-material";
import getCustomTooltip from "../utils/CustomTooltip";
import { isImageFile, TWO_MB } from "../../utils/appUtils";
import EditPicMenu from "../menus/EditPicMenu";
import axios from "../../utils/axios";
import { Button, CircularProgress, DialogActions } from "@mui/material";
import { btnCustomStyle, btnHoverStyle } from "../utils/CustomDialog";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAppState,
  setGroupInfo,
  toggleRefresh,
} from "../../store/slices/AppSlice";
import {
  selectFormfieldState,
  setLoading,
} from "../../store/slices/FormfieldSlice";
import { displayToast } from "../../store/slices/ToastSlice";
import { hideDialog } from "../../store/slices/CustomDialogSlice";

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
const DEFAULT_GROUP_DP = process.env.REACT_APP_DEFAULT_GROUP_DP;

const NewGroupBody = ({ closeChildDialog }) => {
  const { loggedInUser, refresh, groupInfo } = useSelector(selectAppState);
  const {
    loading,
    disableIfLoading,
    formFieldClassName,
    inputFieldClassName,
    formLabelClassName,
  } = useSelector(selectFormfieldState);
  const dispatch = useDispatch();

  const { chatDisplayPicUrl, chatName } = groupInfo;
  const [editGroupDpMenuAnchor, setEditGroupDpMenuAnchor] = useState(null);
  const imgInput = useRef();

  // Click a button/icon upon 'Enter' or 'Space' keydown
  const clickOnKeydown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.target.click();
    }
  };

  // Create group chat
  const createGroupChat = async () => {
    if (!groupInfo) return;
    const { chatDisplayPic, chatName, users } = groupInfo;

    if (!chatName) {
      return dispatch(
        displayToast({
          message: "Please Enter a Group Name",
          type: "warning",
          duration: 3000,
          position: "top-center",
        })
      );
    }
    if (users?.length < 2) {
      return dispatch(
        displayToast({
          message: "Please Add Atleast 2 Members",
          type: "warning",
          duration: 3000,
          position: "top-center",
        })
      );
    }

    dispatch(setLoading(true));
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${loggedInUser.token}`,
      },
    };
    try {
      const formData = new FormData();
      formData.append("displayPic", chatDisplayPic);
      formData.append("chatName", chatName);
      formData.append("users", JSON.stringify(users?.map((user) => user?._id)));

      await axios.post("/api/chat/group", formData, config);

      dispatch(
        displayToast({
          message: "Group Created Successfully",
          type: "success",
          duration: 2000,
          position: "bottom-center",
        })
      );

      dispatch(setLoading(false));
      dispatch(toggleRefresh(!refresh));
      closeChildDialog();
      // Close Parent Dialog as well
      dispatch(hideDialog());
    } catch (error) {
      dispatch(
        displayToast({
          title: "Couldn't Create Group",
          message: error.response?.data?.message || error.message,
          type: "error",
          duration: 5000,
          position: "top-center",
        })
      );
    }
  };

  const handleImgInputChange = (e) => {
    const image = e.target.files[0];
    if (!image) return;

    if (!isImageFile(image.name)) {
      return dispatch(
        displayToast({
          title: "Invalid Image File",
          message: "Please Select an Image File (png/jpg/jpeg/svg/webp)",
          type: "warning",
          duration: 5000,
          position: "bottom-center",
        })
      );
    }

    if (image.size >= TWO_MB) {
      imgInput.current.value = "";
      return dispatch(
        displayToast({
          message: "Please Select an Image Smaller than 2 MB",
          type: "warning",
          duration: 4000,
          position: "top-center",
        })
      );
    }
    dispatch(
      setGroupInfo({
        ...groupInfo,
        chatDisplayPic: image,
        chatDisplayPicUrl: URL.createObjectURL(image),
      })
    );
  };

  const handleReset = (e) => {
    e.preventDefault();
    dispatch(
      setGroupInfo({
        ...groupInfo,
        chatDisplayPic: null,
        chatDisplayPicUrl: DEFAULT_GROUP_DP,
      })
    );
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
          accept="image/*"
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
            dispatch(setGroupInfo({ ...groupInfo, chatName: e.target.value }));
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
      <DialogActions className="mt-3" style={{ marginBottom: "-17px" }}>
        <Button
          sx={btnHoverStyle}
          disabled={loading}
          style={btnCustomStyle}
          onClick={closeChildDialog}
        >
          <span>
            <KeyboardDoubleArrowLeft
              className="btnArrowIcons"
              style={{
                margin: "0px 5px 2px 0px",
              }}
            />
            Back
          </span>
        </Button>
        <Button
          sx={btnHoverStyle}
          disabled={loading}
          style={btnCustomStyle}
          onClick={createGroupChat}
        >
          {loading ? (
            <>
              <CircularProgress size={25} style={{ marginRight: "10px" }} />
              <span>Creating...</span>
            </>
          ) : (
            <>Create Group</>
          )}
        </Button>
      </DialogActions>
    </div>
  );
};

export default NewGroupBody;
