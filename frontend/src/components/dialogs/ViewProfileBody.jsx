import { getOneToOneChatReceiver, truncateString } from "../../utils/appUtils";
import getCustomTooltip from "../utils/CustomTooltip";
import { useSelector } from "react-redux";
import { selectAppState } from "../../store/slices/AppSlice";
import { selectChildDialogState } from "../../store/slices/ChildDialogSlice";
import FullSizeImage from "../utils/FullSizeImage";
import { useState } from "react";
import ChildDialog from "../utils/ChildDialog";

const arrowStyles = { color: "#111" };
const tooltipStyles = {
  maxWidth: 250,
  color: "#eee",
  fontFamily: "Trebuchet MS",
  fontSize: 17,
  padding: "5px 10px",
  border: "1px solid #333",
  backgroundColor: "#111",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const ViewProfileBody = ({ memberProfilePic, memberName, memberEmail }) => {
  const { loggedInUser, selectedChat } = useSelector(selectAppState);
  let name, email, profilePic;
  const { childDialogMethods } = useSelector(selectChildDialogState);
  const { setChildDialogBody, displayChildDialog } = childDialogMethods;

  const [showDialogActions, setShowDialogActions] = useState(true);
  const [showDialogClose, setShowDialogClose] = useState(false);

  if (memberProfilePic && memberName && memberEmail) {
    name = memberName;
    email = memberEmail;
    profilePic = memberProfilePic;
  } else {
    const receiver = getOneToOneChatReceiver(loggedInUser, selectedChat?.users);
    name = receiver?.name;
    email = receiver?.email;
    profilePic = receiver?.profilePic;
  }

  const displayFullSizeImage = (e) => {
    setShowDialogActions(false);
    setShowDialogClose(true);
    setChildDialogBody(<FullSizeImage event={e} />);
    displayChildDialog({
      isFullScreen: true,
      title: e.target?.alt || "Profile Pic",
    });
  };

  return (
    <>
      {/* View Profile Pic */}
      <section className="dialogField d-flex position-relative mb-4">
        <CustomTooltip title="View Profile Pic" placement="top" arrow>
          <img
            className="img-fluid pointer d-flex mx-auto border border-2 border-primary rounded-circle mt-1"
            id="view_profilePic"
            onClick={displayFullSizeImage}
            src={profilePic}
            alt={name}
          />
        </CustomTooltip>
      </section>
      {/* View Name */}
      <section className={`dialogField text-center mb-2`}>
        <div className="input-group" style={{ marginTop: "-15px" }}>
          <CustomTooltip
            title={name?.length > 20 ? name : ""}
            placement="top"
            arrow
          >
            <div
              className="w-100 h1 fw-bold mx-4 text-info"
              style={{ fontSize: "32px" }}
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
          title={email?.length > 20 ? email : ""}
          placement="bottom"
          arrow
        >
          <span className="fs-4" style={{ color: "lightblue" }}>
            {truncateString(email, 25, 21)}
          </span>
        </CustomTooltip>
      </section>

      {/* Child dialog */}
      <ChildDialog
        showChildDialogActions={showDialogActions}
        showChildDialogClose={showDialogClose}
      />
    </>
  );
};

export default ViewProfileBody;
