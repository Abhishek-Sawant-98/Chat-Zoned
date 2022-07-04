import { useEffect, useRef, useState } from "react";
import { debounce } from "../../utils/appUtils";
import SearchInput from "../utils/SearchInput";
import GroupMemberItem from "../utils/GroupMemberItem";
import { AppState } from "../../context/ContextProvider";
import MemberOptionsMenu from "../menus/MemberOptionsMenu";
import ChildDialog from "../utils/ChildDialog";

const ViewGroupMembers = () => {
  const { loggedInUser, childDialogMethods, getChildDialogMethods, groupInfo } =
    AppState();
  const [showDialogActions, setShowDialogActions] = useState(true);
  const [showDialogClose, setShowDialogClose] = useState(false);
  const groupMembers = groupInfo?.users;
  const admins = groupInfo?.groupAdmins;
  const [clickedMember, setClickedMember] = useState(null);
  const [memberOptionsMenuAnchor, setMemberOptionsMenuAnchor] = useState(null);
  // LoggedInUser and Group Admins should be at the top
  const sortMembers = () => {
    return [
      loggedInUser,
      ...admins?.filter((a) => a?._id !== loggedInUser?._id),
      ...groupMembers?.filter(
        (u) =>
          u?._id !== loggedInUser?._id &&
          admins?.every((a) => a?._id !== u?._id)
      ),
    ].map((member) => {
      return {
        ...member,
        isGroupAdmin: admins?.some((a) => a?._id === member?._id),
      };
    });
  };

  // Update the member list whenever groupInfo is updated
  useEffect(() => {
    setFilteredMembers(sortMembers());
  }, [groupInfo]);

  const filterMemberInput = useRef(null);
  const [filteredMembers, setFilteredMembers] = useState(sortMembers());

  // Debouncing filterMembers method to limit the no. of fn calls
  const filterMembers = debounce((e) => {
    const memberNameInput = e.target?.value?.toLowerCase().trim();
    if (!memberNameInput) {
      return setFilteredMembers(sortMembers());
    }
    setFilteredMembers(
      filteredMembers?.filter(
        (user) =>
          user?.name?.toLowerCase().includes(memberNameInput) ||
          user?.email?.toLowerCase().includes(memberNameInput)
      )
    );
  }, 600);

  const openMemberOptionsMenu = (e) => {
    setMemberOptionsMenuAnchor(e.target);
  };

  return (
    <div
      className="addGroupMembers d-flex flex-column"
      style={{ height: "75vh" }}
    >
      {/* Member Count */}
      <p className="h3 text-center text-light" style={{ marginTop: "5px" }}>
        {`${groupMembers?.length} Member${groupMembers?.length > 1 ? "s" : ""}`}
      </p>
      {/* Search Bar */}
      <section className="searchChat" style={{ marginTop: "-15px" }}>
        <SearchInput
          ref={filterMemberInput}
          searchHandler={filterMembers}
          autoFocus={false}
          placeholder="Search Member"
          clearInput={() => setFilteredMembers(sortMembers())}
        />
      </section>
      {/* Member list */}
      <section className="chatList p-1 overflow-auto position-relative">
        {filteredMembers?.length > 0 ? (
          <div
            // 'Event delegation' (add only one event listener for
            // parent element instead of adding for each child element)
            onClick={(e) => {
              const userId = e.target?.dataset?.user;
              if (userId) {
                // Don't display member options menu for loggedInUser
                if (loggedInUser?._id === userId) return;

                setClickedMember(
                  filteredMembers?.find((m) => m?._id === userId)
                );
                openMemberOptionsMenu(e);
              }
            }}
          >
            {filteredMembers.map((member) => (
              <GroupMemberItem
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
      <MemberOptionsMenu
        anchor={memberOptionsMenuAnchor}
        setAnchor={setMemberOptionsMenuAnchor}
        clickedMember={clickedMember}
        setShowDialogActions={setShowDialogActions}
        setShowDialogClose={setShowDialogClose}
        childDialogMethods={childDialogMethods}
      />
      {/* Child dialog */}
      <ChildDialog
        getChildDialogMethods={getChildDialogMethods}
        showChildDialogActions={showDialogActions}
        showChildDialogClose={showDialogClose}
      />
    </div>
  );
};

export default ViewGroupMembers;
