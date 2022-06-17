import { Avatar } from "@mui/material";
import { useState } from "react";
import { AppState } from "../../context/ContextProvider";
import { truncateString } from "../../utils/appUtils";
import axios from "../../utils/axios";
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

const UserListItem = ({ user, handleClose, listeners }) => {
  const { loggedInUser, displayToast, formClassNames, setSelectedChat } =
    AppState();
  const { loading, setLoading } = formClassNames;
  const { _id, name, email, profilePic } = user;
  const [userHovered, setUserHovered] = useState(false);
  const [userClicked, setUserClicked] = useState(false);

  const createOrRetrieveChat = async () => {
    handleClose();
    setLoading(true);

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loggedInUser.token}`,
      },
    };

    try {
      const { data } = await axios.post(`/api/chat`, { userId: _id }, config);

      setLoading(false);
      setSelectedChat(data);
      console.log("Selected Chat : ", data);
    } catch (error) {
      displayToast({
        title: "Create/Retrieve Chat Failed",
        message: error.response?.data?.message || "Oops! Something Went Wrong",
        type: "error",
        duration: 5000,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <div
      className={`userListItem user-select-none w-100 d-flex text-light ${
        userClicked ? "bg-success" : userHovered ? "bg-dark" : "bg-black"
      } justify-content-start bg-opacity-75 align-items-center pointer px-3`}
      onClick={createOrRetrieveChat}
      onMouseEnter={() => setUserHovered(true)}
      onMouseLeave={() => setUserHovered(false)}
      onMouseDown={() => setUserClicked(true)}
      onMouseUp={() => setUserClicked(false)}
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
