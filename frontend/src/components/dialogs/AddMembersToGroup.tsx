import { useEffect, useRef, useState } from "react";
import { Avatar, Chip } from "@mui/material";
import axios from "../../utils/axios";
import { debounce, getAxiosConfig, truncateString } from "../../utils/appUtils";
import UserListItem from "../utils/UserListItem";
import SearchInput from "../utils/SearchInput";
import NewGroupBody from "./NewGroupBody";
import ChildDialog from "../utils/ChildDialog";
import LoadingList from "../utils/LoadingList";
import { selectAppState, setGroupInfo } from "../../store/slices/AppSlice";
import { selectChildDialogState } from "../../store/slices/ChildDialogSlice";
import { displayToast } from "../../store/slices/ToastSlice";
import { setDialogAction } from "../../store/slices/CustomDialogSlice";
import { useAppDispatch, useAppSelector } from "../../store/storeHooks";
import { AxiosErrorType, ToastData, UserType } from "../../utils/AppTypes";
import { AxiosRequestConfig } from "axios";

interface Props {
  getAddedMembers?: ((addedMembers: UserType[]) => void) | null;
  forCreateGroup?: boolean;
}

const AddMembersToGroup = ({ getAddedMembers, forCreateGroup }: Props) => {
  const { loggedInUser, groupInfo } = useAppSelector(selectAppState);
  const { childDialogMethods } = useAppSelector(selectChildDialogState);
  const dispatch = useAppDispatch();

  const [groupData, setGroupData] = useState(groupInfo);
  const [fetching, setFetching] = useState(false);
  const groupMembers = groupData?.users as UserType[];
  const [isMemberSelected, setIsMemberSelected] = useState(false);
  const [addedMembers, setAddedMembers] = useState<UserType[]>([]);

  const searchUserInput = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const { setChildDialogBody, displayChildDialog, closeChildDialog } =
    childDialogMethods;
  const [showDialogActions, setShowDialogActions] = useState(true);
  const [showDialogClose, setShowDialogClose] = useState(false);

  useEffect(() => {
    setGroupData(groupInfo);
  }, [groupInfo]);

  // For 'create group chat'
  const openNewGroupDialog = () => {
    if (addedMembers?.length < 2) {
      return dispatch(
        displayToast({
          message: "Please Add Atleast 2 Members",
          type: "warning",
          duration: 3000,
          position: "top-center",
        } as ToastData)
      );
    }
    setShowDialogActions(false);
    setShowDialogClose(false);
    dispatch(setGroupInfo(groupData));
    if (!setChildDialogBody || !displayChildDialog) return;
    setChildDialogBody(<NewGroupBody closeChildDialog={closeChildDialog as () => void} />);
    displayChildDialog({
      title: "Create New Group",
    });
  };

  useEffect(() => {
    setSearchResults([]);
    setSearchQuery("");
  }, []);

  useEffect(() => {
    // For create group: [Next >>] button
    if (forCreateGroup) dispatch(setDialogAction(openNewGroupDialog));
  }, [groupData]);

  useEffect(() => {
    // For add more group members
    if (!forCreateGroup && getAddedMembers) getAddedMembers([...addedMembers]);
  }, [addedMembers]);

  const searchUsers = debounce(async (e: InputEvent) => {
    const query = (e.target as HTMLInputElement)?.value?.trim();
    setSearchQuery(query);
    if (!query) return setSearchResults([]);

    setFetching(true);
    if (isMemberSelected) setIsMemberSelected(false);

    const config = getAxiosConfig({ loggedInUser });
    try {
      const { data } = await axios.get(
        `/api/user?search=${query}`,
        config as AxiosRequestConfig
      );

      // Remove all the already added members from search results
      let membersNotAdded = [...data];
      groupMembers?.forEach((addedMember) => {
        membersNotAdded = membersNotAdded.filter(
          (m) => m._id !== addedMember?._id
        );
      });

      setFetching(false);
      setSearchResults(membersNotAdded);
    } catch (error) {
      dispatch(
        displayToast({
          title: "Couldn't Fetch Users",
          message:
            (error as AxiosErrorType).response?.data?.message ||
            (error as Error).message,
          type: "error",
          duration: 5000,
          position: "bottom-left",
        } as ToastData)
      );
      setFetching(false);
    }
  }, 800);

  const unselectUser = (user: UserType) => {
    if (!user) return;
    setGroupData({
      ...groupData,
      users: groupMembers?.filter((u: UserType) => u?._id !== user._id),
    });
    // Remove user from added member list
    setAddedMembers(addedMembers.filter((u: UserType) => u?._id !== user._id));
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
        {addedMembers?.map((user: UserType) => (
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
          if (!searchUserInput) return;
          searchUserInput.current?.focus();
        }}
      />
      {/* Search Results */}
      <section
        className="position-relative mx-auto mt-2 overflow-auto"
        style={{ flex: "1", marginBottom: "-10px" }}
      >
        <div
          // 'Event delegation'
          onClick={(e) => {
            const userId =
              (e.target as HTMLElement).dataset.user ||
              (e.target as HTMLImageElement).alt;
            if (!userId) return;

            if (!isMemberSelected) setIsMemberSelected(true);
            // Add selected user to tag list
            const selectedUser = searchResults.find(
              (u: UserType) => u?._id === userId
            );
            setGroupData({
              ...groupData,
              users: [...groupMembers, selectedUser],
            });
            // Add selected user to added member list
            setAddedMembers([
              ...(addedMembers as UserType[]),
              selectedUser as UserType,
            ]);
            // Remove selected user from search result list
            setSearchResults(
              searchResults.filter((u: UserType) => u?._id !== userId)
            );
          }}
        >
          {fetching ? (
            <LoadingList listOf="Member" dpRadius={"43px"} count={6} />
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <UserListItem
                key={(user as UserType)?._id}
                user={user}
                truncateValues={[21, 18]}
              />
            ))
          ) : (
            searchQuery &&
            !fetching && (
              <p className="text-light text-center fs-5 mt-3 mx-5">
                {isMemberSelected ? "No Other Users " : "No Results "}
                Found for '
                <span className="text-info">
                  {truncateString(searchQuery, 25, 22)}
                </span>
                '
              </p>
            )
          )}
        </div>
      </section>
      {/* Child dialog */}
      <ChildDialog
        showChildDialogActions={showDialogActions}
        showChildDialogClose={showDialogClose}
      />
    </div>
  );
};

export default AddMembersToGroup;
