import { useRef, useState } from "react";
import { debounce } from "../../utils/appUtils";
import SearchInput from "../utils/SearchInput";
import GroupMemberItem from "../utils/GroupMemberItem";
import { AppState } from "../../context/ContextProvider";

const ViewGroupMembers = ({ groupData }) => {
  const { loggedInUser } = AppState();
  const { users, groupAdmins } = groupData;
  // LoggedInUser and Group Admins should be at the top
  const sortedMembers = [
    loggedInUser,
    ...groupAdmins?.filter((a) => a?._id !== loggedInUser?._id),
    ...users?.filter(
      (u) =>
        u?._id !== loggedInUser?._id &&
        groupAdmins?.some((a) => a?._id !== u?._id)
    ),
  ];
  const filterMemberInput = useRef(null);
  const [filteredMembers, setFilteredMembers] = useState(sortedMembers);

  // Debouncing filterMembers method to limit the no. of fn calls
  const filterMembers = debounce((e) => {
    const memberNameInput = e.target?.value?.toLowerCase().trim();
    if (!memberNameInput) {
      return setFilteredMembers(sortedMembers);
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
    <div
      className="addGroupMembers d-flex flex-column"
      style={{ height: "75vh" }}
    >
      {/* Search Bar */}
      <section className="searchChat" style={{ marginTop: "-15px" }}>
        <SearchInput
          ref={filterMemberInput}
          searchHandler={filterMembers}
          autoFocus={false}
          placeholder="Search Member"
          clearInput={() => setFilteredMembers(sortedMembers)}
        />
      </section>
      {/* Member list */}
      <section className="chatList p-1 overflow-auto position-relative">
        {filteredMembers?.length > 0 ? (
          <div
            // 'Event delegation' (add only one event listener for
            // parent element instead of adding for each child element)
            onClick={(e) => {
              const userId = e.target.dataset.user;
              if (userId) {
                console.log("member clicked");
                // Message x 
                // View x
                // Make group admin / dismiss as admin (only admin)
                // remove x (only admin)

              }
            }}
          >
            {filteredMembers.map((member) => {
              const isGroupAdmin = groupAdmins?.some(
                (admin) => admin?._id === member?._id
              );
              return (
                <GroupMemberItem
                  key={member._id}
                  user={{ ...member, isGroupAdmin }}
                  truncateValues={[21, 18]}
                />
              );
            })}
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
