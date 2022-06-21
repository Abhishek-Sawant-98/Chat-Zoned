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
        <img
          src={profilePic}
          alt={_id}
          data-user={_id}
          className={`img-fluid userListAvatar rounded-circle`}
        />
      </CustomTooltip>
      <div
        data-user={_id}
        className="userListData d-flex flex-column align-items-start px-2"
      >
        <p data-user={_id} className="userListName fs-4 fw-bold text-warning">
          {truncateString(name, 23, 20)}
        </p>
        <p data-user={_id} className="userListEmail">
          <span data-user={_id} className="userList fw-bold text-info">
            {"Email: "}
          </span>
          {truncateString(email, 24, 20)}
        </p>
      </div>
    </div>
  );
};

export default UserListItem;
