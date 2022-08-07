import { useRef } from "react";
import { useSelector } from "react-redux";
import letsChatAnimData from "../animations/letsChatGif.json";
import { selectAppState } from "../store/slices/AppSlice";
import LottieAnimation from "./utils/LottieAnimation";

const WelcomeBanner = () => {
  const { loggedInUser } = useSelector(selectAppState);
  const letsChatGif = useRef(null);
  return (
    <div className="d-flex flex-column justify-content-start align-items-center h-100">
      <h2 className="mx-3 mt-1">
        Hello{" "}
        <span
          className="fw-bold"
          style={{ color: "#A798F2" }}
        >{`${loggedInUser?.name?.split(" ")[0]?.toUpperCase()}`}</span>{" "}
        👋
      </h2>
      <LottieAnimation
        ref={letsChatGif}
        className={"d-inline-block mt-3"}
        style={{ marginBottom: "50px", height: "50%" }}
        animationData={letsChatAnimData}
      />
      <p className="h4 mx-5" style={{ marginTop: "-20px", color: "#99C5EE" }}>
        Search or Click a Chat, Create a Group, or Search a User to start or
        open a chat.
      </p>
      <p className="h2" style={{ color: "#99C5EE" }}>
        Happy Chatting!😀
      </p>
    </div>
  );
};

export default WelcomeBanner;
