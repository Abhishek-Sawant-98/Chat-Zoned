import { Avatar } from "@mui/material";
import { truncateString } from "../../utils/appUtils";
import getCustomTooltip from "../utils/CustomTooltip";

const arrowStyles = { color: "#A30CA7" };
const tooltipStyles = {
  maxWidth: 250,
  color: "#eee",
  fontFamily: "Trebuchet MS",
  fontSize: 17,
  padding: "5px 12px",
  borderRadius: 5,
  backgroundColor: "#A30CA7",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const UserListItem = ({ user, truncateValues }) => {
  const { _id, name, email, profilePic } = user;
  const [max, index] = truncateValues;

  return (
    <div
      data-user={_id}
      className={`userListItem user-select-none d-flex text-light justify-content-start align-items-center pointer px-3`}
    >
      <CustomTooltip
        data-user={_id}
        title={`${name} (${email})`}
        placement="top-start"
        arrow
      >
        <Avatar
          src={profilePic}
          alt={_id}
          data-user={_id}
          className={`listItemAvatar userListAvatar`}
        />
      </CustomTooltip>
      <div
        data-user={_id}
        className="userListData d-flex flex-column align-items-start px-2"
      >
        <p data-user={_id} className="userListName fs-5 fw-bold text-info">
          {truncateString(name, max, index)}
        </p>
        <p data-user={_id} className="userListEmail fs-6">
          {truncateString(email, max, index)}
        </p>
      </div>
    </div>
  );
};

export default UserListItem;
