import { KeyboardArrowDown } from "@mui/icons-material";
import { Avatar } from "@mui/material";
import { useSelector } from "react-redux";
import { selectAppState } from "../../store/slices/AppSlice";
import { truncateString } from "../../utils/appUtils";
import getCustomTooltip from "../utils/CustomTooltip";

const arrowStyles = { color: "#E6480C" };
const tooltipStyles = {
  maxWidth: 230,
  color: "#eee",
  fontFamily: "Trebuchet MS",
  fontSize: 17,
  borderRadius: 10,
  backgroundColor: "#E6480C",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const GroupMemberItem = ({ user, truncateValues }) => {
  const { loggedInUser } = useSelector(selectAppState);
  const { _id, name, email, profilePic } = user;
  const [max, index] = truncateValues;
  const isLoggedInUser = _id === loggedInUser?._id;

  return (
    <div
      data-user={_id}
      className={`groupMemberItem position-relative user-select-none d-flex text-light justify-content-start align-items-center px-3 ${
        !isLoggedInUser && "pointer"
      }`}
    >
      {user?.isGroupAdmin && (
        <span
          className={`adminBadge position-absolute fw-light badge rounded-3 bg-success`}
          style={{ cursor: "auto" }}
        >
          Admin
        </span>
      )}
      {!isLoggedInUser && (
        <span
          data-user={_id}
          className="memberSettingsIcon text-light position-absolute rounded-circle"
        >
          <KeyboardArrowDown data-user={_id} />
        </span>
      )}
      <CustomTooltip
        data-user={_id}
        title={`${isLoggedInUser ? "" : `${name} (${email})`}`}
        placement="top-start"
        arrow
      >
        <Avatar
          src={profilePic}
          alt={_id}
          data-user={_id}
          className={`listItemAvatar groupMemberAvatar`}
        />
      </CustomTooltip>
      <div
        data-user={_id}
        className="groupMemberData d-flex flex-column align-items-start px-2"
      >
        <p data-user={_id} className="groupMemberName fw-bold text-info">
          {isLoggedInUser ? "You" : truncateString(name, max, index)}
        </p>
        <p data-user={_id} className="groupMemberEmail">
          {truncateString(email, max, index)}
        </p>
      </div>
    </div>
  );
};

export default GroupMemberItem;
