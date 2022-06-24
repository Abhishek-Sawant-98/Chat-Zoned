import { useEffect, useRef, useState } from "react";
import { AppState } from "../../context/ContextProvider";
import {} from "@mui/icons-material";
import { Avatar, Button, Chip, DialogActions, IconButton } from "@mui/material";
import CustomDialog from "../utils/CustomDialog";
import axios from "../../utils/axios";
import {
  debounce,
  DEFAULT_GROUP_DP,
  truncateString,
} from "../../utils/appUtils";
import UserListItem from "../utils/UserListItem";
import LoadingIndicator from "../utils/LoadingIndicator";
import SearchInput from "../utils/SearchInput";
import NewGroupBody from "./NewGroupBody";
import ChildDialog from "../utils/ChildDialog";

const AddMembersToGroup = ({ groupInfo, getUsersToBeAdded }) => {
  const {
    formClassNames,
    loggedInUser,
    displayToast,
    refresh,
    setRefresh,
    setDialogAction,
    childDialogMethods,
    getChildDialogMethods,
  } = AppState();
  const { loading, setLoading } = formClassNames;

  // 'groupData' prop is passed while adding members to group
  // from 'group info' dialog
  const [addedMembers, setAddedMembers] = useState(groupInfo?.users || []);

  const searchUserInput = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [groupChatData, setGroupChatData] = useState({
    chatDisplayPic: null,
    chatDisplayPicUrl: DEFAULT_GROUP_DP,
    chatName: "",
    users: [],
  });
  const { users } = groupChatData;
  const { setChildDialogBody, displayChildDialog } = childDialogMethods;

  useEffect(() => {
    if (groupInfo) {
      getUsersToBeAdded({ ...users });
    } else {
      setDialogAction(openNewGroupDialog);
    }
  }, [groupChatData]);

  useEffect(() => {
    setSearchResults([...addedMembers]);
  }, [addedMembers]);

  // Create group chat
  const createGroupChat = async () => {
    const { chatDisplayPic, chatName, users } = groupChatData;

    if (!chatName) {
      return displayToast({
        message: "Please Enter a Group Name",
        type: "warning",
        duration: 3000,
        position: "top-center",
      });
    }
    if (users.length < 2) {
      return displayToast({
        message: "Please Add Atleast 2 Members",
        type: "warning",
        duration: 3000,
        position: "top-center",
      });
    }

    setLoading(true);
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
      formData.append("users", JSON.stringify(users.map((user) => user._id)));

      await axios.post("/api/chat/group", formData, config);

      displayToast({
        message: "Group Created Successfully",
        type: "success",
        duration: 2000,
        position: "bottom-center",
      });

      setLoading(false);
      setRefresh(!refresh);
      return "createdGroup";
    } catch (error) {
      displayToast({
        title: "Couldn't Create Group",
        message: error.response?.data?.message || "Oops! Server Down",
        type: "error",
        duration: 5000,
        position: "top-center",
      });
      setLoading(false);
    }
  };

  const getUpdatedGroupData = (updatedData) => {
    setGroupChatData(updatedData);
  };

  const openNewGroupDialog = () => {
    if (users.length < 2) {
      return displayToast({
        message: "Please Add Atleast 2 Members",
        type: "warning",
        duration: 3000,
        position: "top-center",
      });
    }
    setChildDialogBody(
      <NewGroupBody data={groupChatData} getData={getUpdatedGroupData} />
    );
    displayChildDialog({
      title: "Create New Group",
      nolabel: "Back",
      yeslabel: "Create Group",
      loadingYeslabel: "Creating Group...",
      action: createGroupChat,
    });
  };

  const searchUsers = debounce(async (e) => {
    const query = e.target?.value?.trim();
    setSearchQuery(query);
    if (!query) return setSearchResults([]);

    setLoading(true);

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loggedInUser.token}`,
      },
    };
    try {
      const { data } = await axios.get(`/api/user?search=${query}`, config);

      // Remove all the already added members from search results
      let membersNotAdded = [...data];
      addedMembers.forEach((addedMember) => {
        membersNotAdded = membersNotAdded.filter(
          (m) => m._id !== addedMember._id
        );
      });

      setLoading(false);
      setSearchResults(membersNotAdded);
    } catch (error) {
      displayToast({
        title: "Couldn't Fetch Users",
        message: error.response?.data?.message || "Oops! Server Down",
        type: "error",
        duration: 5000,
        position: "bottom-left",
      });
      setLoading(false);
    }
  }, 800);

  useEffect(() => {
    setSearchResults([]);
    setLoading(false);
    setSearchQuery("");
    setGroupChatData({
      chatDisplayPic: null,
      chatDisplayPicUrl: DEFAULT_GROUP_DP,
      chatName: "",
      users: [],
    });
  }, []);

  const unselectUser = (userId) => {
    setGroupChatData({
      ...groupChatData,
      users: users.filter((u) => u._id !== userId),
    });
    setAddedMembers(addedMembers.filter((u) => u._id !== userId));
    setSearchResults(searchResults);
  };

  return (
    <div className="addGroupMembers d-flex flex-column">
      {/* Selected Users tag list */}
      <section
        className="mx-auto px-3 py-2 overflow-auto d-flex flex-wrap"
        style={{
          flex: "0.33",
          borderRadius: "15px",
          backgroundColor: "#303030",
        }}
      >
        {users?.map((user) => (
          <Chip
            key={user?._id}
            className="userChip text-light bg-success rounded-pill fs-6"
            avatar={
              <Avatar
                className="userChipAvatar"
                alt={user?.name}
                src={user?.profilePic}
              />
            }
            label={truncateString(user?.name?.split(" ")[0], 12, 8)}
            onDelete={() => unselectUser(user?._id)}
          />
        ))}
      </section>
      {/* Search Bar */}
      <SearchInput
        ref={searchUserInput}
        searchHandler={searchUsers}
        autoFocus={true}
        placeholder="Search Members"
        clearInput={() => {
          setSearchQuery("");
          setSearchResults([]);
          searchUserInput.current.focus();
        }}
      />
      {/* Search Results */}
      <section
        className="position-relative mx-auto mt-2 overflow-auto"
        style={{ flex: "1", marginBottom: "-10px" }}
      >
        {loading && (
          <LoadingIndicator
            message={"Fetching Users..."}
            msgStyleClasses={"text-light h3"}
          />
        )}
        <div
          // 'Event delegation' (add only one event listener for
          // parent element instead of adding for each child element)
          onClick={(e) => {
            const userId = e.target.dataset.user;
            if (!userId) return;

            if (users.find((u) => u._id === userId)) {
              return displayToast({
                message: "Member Already Added",
                type: "warning",
                duration: 1500,
                position: "top-center",
              });
            }
            // Add selected user to tag list
            const selectedUser = searchResults.find((u) => u._id === userId);
            setGroupChatData({
              ...groupChatData,
              users: [...users, selectedUser],
            });
            setAddedMembers([...addedMembers, selectedUser]);
          }}
        >
          {searchResults.length > 0
            ? searchResults.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  truncateValues={[21, 18]}
                />
              ))
            : searchQuery &&
              !loading && (
                <p className="text-light text-center fs-5 mt-3 mx-5">
                  No results found for '
                  <span className="text-info">
                    {truncateString(searchQuery, 25, 22)}
                  </span>
                  '
                </p>
              )}
        </div>
      </section>
      {/* Child confirmation dialog */}
      <ChildDialog getChildDialogMethods={getChildDialogMethods} />
    </div>
  );
};

export default AddMembersToGroup;
