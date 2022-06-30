import { useEffect, useRef, useState } from "react";
import { AppState } from "../../context/ContextProvider";
import {} from "@mui/icons-material";
import { Avatar, Chip } from "@mui/material";
import axios from "../../utils/axios";
import { debounce, truncateString } from "../../utils/appUtils";
import UserListItem from "../utils/UserListItem";
import LoadingIndicator from "../utils/LoadingIndicator";
import SearchInput from "../utils/SearchInput";
import NewGroupBody from "./NewGroupBody";
import ChildDialog from "../utils/ChildDialog";

const AddMembersToGroup = ({ forCreateGroup, adding }) => {
  const {
    formClassNames,
    loggedInUser,
    displayToast,
    refresh,
    setRefresh,
    setDialogAction,
    childDialogMethods,
    getChildDialogMethods,
    groupInfo,
    setGroupInfo,
  } = AppState();
  const { setLoading } = formClassNames;
  const groupMembers = groupInfo?.users;
  const [fetching, setFetching] = useState(false);
  const [isMemberSelected, setIsMemberSelected] = useState(false);
  const [addedMembers, setAddedMembers] = useState(groupMembers || []);

  const searchUserInput = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { setChildDialogBody, displayChildDialog, closeChildDialog } =
    childDialogMethods;
  const [showDialogActions, setShowDialogActions] = useState(true);
  const [showDialogClose, setShowDialogClose] = useState(false);

  // For 'create group chat'
  const openNewGroupDialog = () => {
    if (addedMembers?.length < 2) {
      return displayToast({
        message: "Please Add Atleast 2 Members",
        type: "warning",
        duration: 3000,
        position: "top-center",
      });
    }
    setShowDialogActions(false);
    setShowDialogClose(false);
    setChildDialogBody(<NewGroupBody closeChildDialog={closeChildDialog} />);
    displayChildDialog({
      title: "Create New Group",
    });
  };

  useEffect(() => {
    // For create group: [Next >>] button
    if (forCreateGroup) setDialogAction(openNewGroupDialog);
  }, [groupInfo]);

  const searchUsers = debounce(async (e) => {
    const query = e.target?.value?.trim();
    setSearchQuery(query);
    if (!query) return setSearchResults([]);

    setFetching(true);
    if (isMemberSelected) setIsMemberSelected(false);

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

      setFetching(false);
      setSearchResults(membersNotAdded);
    } catch (error) {
      displayToast({
        title: "Couldn't Fetch Users",
        message: error.response?.data?.message || "Oops! Server Down",
        type: "error",
        duration: 5000,
        position: "bottom-left",
      });
      setFetching(false);
    }
  }, 800);

  useEffect(() => {
    setSearchResults([]);
    setSearchQuery("");
  }, []);

  const unselectUser = (user) => {
    if (!user) return;
    setGroupInfo({
      ...groupInfo,
      users: groupMembers.filter((u) => u._id !== user._id),
    });
    // Remove user from added member list
    setAddedMembers(addedMembers.filter((u) => u._id !== user._id));
    // Add removed user to search result list
    setSearchResults([user, ...searchResults]);
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
        {addedMembers?.map((user) => (
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
            onDelete={() => unselectUser(user)}
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
        {fetching && (
          <LoadingIndicator
            message={`${adding ? "Adding Members..." : "Fetching Users..."}`}
            msgStyleClasses={"text-light h3"}
          />
        )}
        <div
          // 'Event delegation' (add only one event listener for
          // parent element instead of adding for each child element)
          onClick={(e) => {
            const userId = e.target.dataset.user;
            if (!userId) return;

            if (!isMemberSelected) setIsMemberSelected(true);
            // Add selected user to tag list
            const selectedUser = searchResults.find((u) => u._id === userId);
            setGroupInfo({
              ...groupInfo,
              users: [...groupMembers, selectedUser],
            });
            // Add selected user to added member list
            setAddedMembers([...addedMembers, selectedUser]);
            // Remove selected user from search result list
            setSearchResults(searchResults.filter((u) => u._id !== userId));
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
              !fetching && (
                <p className="text-light text-center fs-5 mt-3 mx-5">
                  {isMemberSelected ? "No Other Users " : "No Results "}
                  Found for '
                  <span className="text-info">
                    {truncateString(searchQuery, 25, 22)}
                  </span>
                  '
                </p>
              )}
        </div>
      </section>
      {/* Child dialog */}
      <ChildDialog
        getChildDialogMethods={getChildDialogMethods}
        showChildDialogActions={showDialogActions}
        showChildDialogClose={showDialogClose}
      />
    </div>
  );
};

export default AddMembersToGroup;
