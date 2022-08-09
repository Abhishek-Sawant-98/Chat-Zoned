import { Avatar } from "@mui/material";
import LottieAnimation from "../utils/LottieAnimation";
import typingAnimData from "../../animations/typing.json";
import { truncateString } from "../../utils/appUtils";
import { useRef } from "react";

const TypingIndicator = ({ typingUserName, typing, typingUser }) => {
  const typingGif = useRef(null);
  const userName = typingUserName || typingUser?.name;
  return (
    <span
      className={`typingIndicator ${
        typing ? "displayTyping" : "hideTyping"
      } d-flex pt-2 rounded-3 ps-2 ms-3`}
    >
      {!typingUserName && (
        <Avatar
          alt={typingUser?.name || "Receiver"}
          src={typingUser?.profilePic || "Receiver"}
          style={{ height: 30, width: 30 }}
        />
      )}
      <span className="ms-2">{` ${truncateString(
        userName?.toString()?.split(" ")[0] || "Receiver",
        12,
        9
      )} is typing`}</span>
      <LottieAnimation
        ref={typingGif}
        className={""}
        style={{ height: "30px", bottom: 0 }}
        animationData={typingAnimData}
      />
    </span>
  );
};

export default TypingIndicator;
