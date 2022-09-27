import { Avatar } from "@mui/material";
import LottieAnimation from "./LottieAnimation";
import typingAnimData from "../../animations/typing.json";
import { useRef } from "react";

interface Props {
  typingChatUser: string;
  showAvatar: boolean;
}

const TypingIndicator = ({ typingChatUser, showAvatar }: Props) => {
  const typingGif = useRef<HTMLSpanElement>(null);
  const typingUserData = typingChatUser?.toString().split("---") || [];
  const typingUserName = typingUserData[1] || "";
  const isGroupChat = typingUserData[3] === "true";
  return (
    <span
      className={`typingIndicator ${
        typingChatUser ? "displayTyping" : "hideTyping"
      } 
      d-flex pt-2 rounded-3 ps-2 ms-3`}
    >
      {showAvatar && (
        <Avatar
          alt={typingUserName || "Receiver"}
          src={typingUserData[2] || "Receiver"}
          style={{ height: 30, width: 30 }}
        />
      )}
      <span className="ms-2">
        {typingUserName && isGroupChat ? `${typingUserName} is ` : ""}typing
      </span>
      <LottieAnimation
        ref={typingGif}
        className={""}
        style={{ height: 30, bottom: 0 }}
        animationData={typingAnimData}
      />
    </span>
  );
};

export default TypingIndicator;
