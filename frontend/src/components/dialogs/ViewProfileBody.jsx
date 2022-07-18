import { getOneOnOneChatReceiver, truncateString } from "../../utils/appUtils";
import getCustomTooltip from "../utils/CustomTooltip";
import { useSelector } from "react-redux";
import { selectAppState } from "../../redux/slices/AppSlice";
const arrowStyles = {
  color: "#111",
};
const tooltipStyles = {
  maxWidth: 250,
  color: "#eee",
  fontFamily: "Mirza",
  fontSize: 17,
  border: "1px solid #333",
  backgroundColor: "#111",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const ViewProfileBody = ({ memberProfilePic, memberName, memberEmail }) => {
  const { loggedInUser, selectedChat } = useSelector(selectAppState);
  let name, email, profilePic;

  if (memberProfilePic && memberName && memberEmail) {
    name = memberName;
    email = memberEmail;
    profilePic = memberProfilePic;
  } else {
    const receiver = getOneOnOneChatReceiver(loggedInUser, selectedChat?.users);
    name = receiver?.name;
    email = receiver?.email;
    profilePic = receiver?.profilePic;
  }

  return (
    <>
      {/* View Profile Pic */}
      <section className="dialogField d-flex position-relative mb-4">
        <img
          className="img-fluid d-flex mx-auto border border-2 border-primary rounded-circle mt-1"
          id="view_profilePic"
          src={profilePic}
          alt={name}
        />
      </section>
      {/* View Name */}
      <section className={`dialogField text-center mb-2`}>
        <div className="input-group" style={{ marginTop: "-15px" }}>
          <CustomTooltip
            title={name?.length > 24 ? name : ""}
            placement="top"
            arrow
          >
            <div
              className="w-100 h1 fw-bold mx-4 text-info"
              style={{ fontSize: "35px" }}
            >
              {truncateString(name, 25, 21)}
            </div>
          </CustomTooltip>
        </div>
      </section>
      {/* View Email */}
      <section
        className={`dialogField text-center mb-2`}
        style={{ marginTop: "-10px" }}
      >
        <CustomTooltip
          title={email?.length > 24 ? email : ""}
          placement="bottom"
          arrow
        >
          <span className="h4" style={{ color: "lightblue" }}>
            {truncateString(email, 25, 21)}
          </span>
        </CustomTooltip>
      </section>
    </>
  );
};

export default ViewProfileBody;
