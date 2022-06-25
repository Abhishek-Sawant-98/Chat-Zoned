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
import GroupMemberItem from "../utils/GroupMemberItem";

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

const ViewGroupMembers = ({ groupData }) => {
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

  const { users } = groupData;
  const filterMemberInput = useRef(null);
  const [filteredMembers, setFilteredMembers] = useState(users);

  // Debouncing filterMembers method to limit the no. of fn calls
  const filterMembers = debounce((e) => {
    const memberNameInput = e.target?.value?.toLowerCase().trim();
    if (!memberNameInput) {
      return setFilteredMembers(users);
    }
    setFilteredMembers(
      users?.filter(
        (user) =>
          user?.name?.toLowerCase().includes(memberNameInput) ||
          user?.email?.toLowerCase().includes(memberNameInput)
      )
    );
  }, 600);

  return (
    <div className="addGroupMembers d-flex flex-column">
      {/* Search Bar */}
      {users?.length > 0 && (
        <section className="searchChat" style={{ marginTop: "-15px" }}>
          <SearchInput
            ref={filterMemberInput}
            searchHandler={filterMembers}
            autoFocus={false}
            placeholder="Search Member"
            clearInput={() => setFilteredMembers(users)}
          />
        </section>
      )}
      {/* Member list */}
      <section className="chatList p-1 overflow-auto position-relative">
        {filteredMembers?.length > 0 ? (
          <div
            // 'Event delegation' (add only one event listener for
            // parent element instead of adding for each child element)
            onClick={(e) => {
              const userId = e.target.dataset.chat;
              if (userId) {
              }
            }}
          >
            {filteredMembers.map((member) => (
              <UserListItem
                key={member._id}
                user={member}
                truncateValues={[21, 18]}
              />
            ))}
          </div>
        ) : (
          <span className="d-inline-block w-100 text-center text-light h5 mt-4 mx-auto">
            No Members Found
          </span>
        )}
      </section>
    </div>
  );
};

export default ViewGroupMembers;
