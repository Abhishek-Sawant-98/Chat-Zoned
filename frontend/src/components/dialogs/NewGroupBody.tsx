import { SetStateAction, useRef, useState } from "react";
import { Edit, KeyboardDoubleArrowLeft } from "@mui/icons-material";
import getCustomTooltip from "../utils/CustomTooltip";
import { getAxiosConfig, isImageFile, TWO_MB } from "../../utils/appUtils";
import EditPicMenu from "../menus/EditPicMenu";
import axios from "../../utils/axios";
import { Button, CircularProgress, DialogActions } from "@mui/material";
import { btnCustomStyle, btnHoverStyle } from "../utils/CustomDialog";
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
import {
  AxiosErrorType,
  ChangeEventHandler,
  ClickEventHandler,
  KeyboardEventHandler,
  ToastData,
  UserType,
} from "../../utils/AppTypes";
import { useAppDispatch, useAppSelector } from "../../store/storeHooks";
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
const DEFAULT_GROUP_DP = process.env.REACT_APP_DEFAULT_GROUP_DP;

interface Props {
  closeChildDialog: () => void;
}

const NewGroupBody = ({ closeChildDialog }: Props) => {
  const { loggedInUser, groupInfo, clientSocket, isSocketConnected } =
    useAppSelector(selectAppState);
  const {
    loading,
    disableIfLoading,
    formFieldClassName,
    inputFieldClassName,
    formLabelClassName,
  } = useAppSelector(selectFormfieldState);
  const dispatch = useAppDispatch();

  const { chatDisplayPicUrl, chatName } = groupInfo;
  const [editGroupDpMenuAnchor, setEditGroupDpMenuAnchor] =
    useState<HTMLElement | null>(null);
  const imgInput = useRef<HTMLInputElement | null>(null);

  // Click a button/icon upon 'Enter' or 'Space' keydown
  const clickOnKeydown: KeyboardEventHandler = (e) => {
    if (e.key === " " || e.key === "Enter") (e.target as HTMLElement)?.click();
  };

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

  // Create group chat
  const createGroupChat = async () => {
    if (!groupInfo) return;
    const { chatDisplayPic, chatName, users } = groupInfo;

    if (!chatName) return displayWarning("Please Enter a Group Name");

    if (users?.length < 2)
      return displayWarning("Please Add Atleast 2 Members");

    dispatch(setLoading(true));
    const config = getAxiosConfig({ loggedInUser, formData: true });
    try {
      const formData = new FormData();
      formData.append("displayPic", chatDisplayPic);
      formData.append("chatName", chatName);
      formData.append(
        "users",
        JSON.stringify(users?.map((user: UserType) => user?._id))
      );

      const { data } = await axios.post(
        "/api/chat/group",
        formData,
        config as AxiosRequestConfig
      );
      if (isSocketConnected) {
        clientSocket.emit("new_grp_created", {
          admin: loggedInUser,
          newGroup: data,
        });
      }
      dispatch(
        displayToast({
          message: "Group Created Successfully",
          type: "success",
          duration: 2000,
          position: "bottom-center",
        } as ToastData)
      );

      dispatch(setLoading(false));
      dispatch(toggleRefresh());
      closeChildDialog();
      // Close Parent Dialog as well
      dispatch(hideDialog());
    } catch (error) {
      dispatch(
        displayToast({
          title: "Couldn't Create Group",
          message:
            (error as AxiosErrorType).response?.data?.message ||
            (error as Error)?.message ||
            error,
          type: "error",
          duration: 5000,
          position: "top-center",
        } as ToastData)
      );
    }
  };

  const handleImgInputChange: ChangeEventHandler = (e) => {
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
    dispatch(
      setGroupInfo({
        ...groupInfo,
        chatDisplayPic: imageFile,
        chatDisplayPicUrl: URL.createObjectURL(imageFile),
      })
    );
  };

  const handleReset: ClickEventHandler = (e) => {
    e.preventDefault();
    dispatch(
      setGroupInfo({
        ...groupInfo,
        chatDisplayPic: null,
        chatDisplayPicUrl: DEFAULT_GROUP_DP,
      })
    );
    if (!imgInput?.current) return;
    imgInput.current.value = "";
  };

  const openEditGroupDpMenu: ClickEventHandler = (e) => {
    setEditGroupDpMenuAnchor(e.target as SetStateAction<HTMLElement | null>);
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
        <CustomTooltip
          title="Edit Group Display Pic"
          placement="top-start"
          arrow
        >
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
          anchor={editGroupDpMenuAnchor as HTMLElement}
          setAnchor={setEditGroupDpMenuAnchor}
          selectProfilePic={() => imgInput?.current?.click()}
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
          onKeyDown={(e) => {
            if (e.key === "Enter") createGroupChat();
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
