import { Avatar } from "@mui/material";
import { useState } from "react";
import { truncateString } from "../../utils/appUtils";
import getCustomTooltip from "../utils/CustomTooltip";

const arrowStyles = {
  color: "#E6480C",
};
const tooltipStyles = {
  maxWidth: 230,
  color: "#eee",
  fontFamily: "Mirza",
  fontSize: 17,
  borderRadius: 10,
  backgroundColor: "#E6480C",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const UserListItem = ({ user }) => {
  const { _id, name, email, profilePic } = user;
  const [userHovered, setUserHovered] = useState(false);

  return (
    <div
      className={`userListItem user-select-none w-100 d-flex text-light ${
        userHovered ? "bg-dark" : "bg-black"
      } justify-content-start bg-opacity-75 align-items-center pointer px-3`}
      onClick={() => {
        alert(JSON.stringify(user));
      }}
      onMouseEnter={() => setUserHovered(true)}
      onMouseLeave={() => setUserHovered(false)}
    >
      <CustomTooltip title={`${name} (${email})`} placement="top-start" arrow>
        <Avatar src={profilePic} className={`userListAvatar`} />
      </CustomTooltip>
      <div className="userListData d-flex flex-column align-items-start px-2">
        <p className="userListName fs-4 fw-bold text-warning">
          {truncateString(name, 23, 20)}
        </p>
        <p className="userListEmail">
          <span className="fw-bold text-info">Email: </span>
          {truncateString(email, 24, 20)}
        </p>
      </div>
    </div>
  );
};

export default UserListItem;
