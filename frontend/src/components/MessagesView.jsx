import { useEffect, useRef, useState } from "react";
import { Avatar, IconButton } from "@mui/material";
import { AppState } from "../context/ContextProvider";
import { getOneOnOneChatReceiver } from "../utils/appUtils";
import { ArrowBack, Close } from "@mui/icons-material";
import getCustomTooltip from "./utils/CustomTooltip";
import animationData from "../animations/letsChatGif.json";
import LottieAnimation from "./utils/LottieAnimation";
import axios from "../utils/axios";

const arrowStyles = {
  color: "#777",
};
const tooltipStyles = {
  maxWidth: 250,
  color: "#eee",
  fontFamily: "Mirza",
  fontSize: 16,
  backgroundColor: "#777",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const MessagesView = () => {
  const letsChatGif = useRef(null);

  const {
    formClassNames,
    selectedChat,
    loggedInUser,
    displayToast,
    setSelectedChat,
  } = AppState();

  const {
    loading,
    setLoading,
    disableIfLoading,
    formFieldClassName,
    inputFieldClassName,
  } = formClassNames;

  const closeChat = () => setSelectedChat(null);
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    setLoading(true);

    const config = {
      headers: {
        Authorization: `Bearer ${loggedInUser.token}`,
      },
    };

    try {
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);
      console.log("Messages : ", data);
    } catch (error) {
      displayToast({
        title: "Couldn't Fetch Messages",
        message: error.response?.data?.message || "Oops! Server Down",
        type: "error",
        duration: 5000,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChat) fetchMessages();
  }, [selectedChat]);

  return (
    <div
      className={`chatpageDiv chatpageView messagesView col text-light ms-2 ms-md-0 ${
        selectedChat ? "d-flex" : "d-none d-md-flex"
      } flex-column p-2`}
    >
      {selectedChat ? (
        <>
          <section className="messagesHeader d-flex justify-content-start position-relative w-100 fw-bold fs-4 bg-info bg-opacity-10 py-2">
            <CustomTooltip title="Go Back" placement="bottom-start" arrow>
              <span>
                <IconButton
                  onClick={closeChat}
                  className={`d-flex d-md-none ms-3`}
                  disabled={loading}
                  sx={{
                    color: "#999999",
                    ":hover": {
                      backgroundColor: "#aaaaaa20",
                    },
                  }}
                >
                  <ArrowBack />
                </IconButton>
              </span>
            </CustomTooltip>
            <CustomTooltip
              title={
                selectedChat?.isGroupChat ? "View/Edit Group" : "View Profile"
              }
              placement="bottom-start"
              arrow
            >
              <span>
                <Avatar
                  src={
                    getOneOnOneChatReceiver(loggedInUser, selectedChat?.users)
                      ?.profilePic || ""
                  }
                  alt={"receiverAvatar"}
                  className="pointer ms-2 ms-md-4"
                  onClick={() => {
                    alert("View profile");
                  }}
                  disabled={loading}
                />
              </span>
            </CustomTooltip>

            <span className="ms-3">
              {selectedChat?.isGroupChat
                ? selectedChat.chatName
                : getOneOnOneChatReceiver(loggedInUser, selectedChat?.users)
                    ?.name}
            </span>

            <CustomTooltip title="Close Chat" placement="bottom-end" arrow>
              <span>
                <IconButton
                  onClick={closeChat}
                  disabled={loading}
                  className="d-none d-md-flex"
                  sx={{
                    position: "absolute",
                    right: 15,
                    top: 8,
                    color: "#999999",
                    ":hover": {
                      backgroundColor: "#aaaaaa20",
                    },
                  }}
                >
                  <Close />
                </IconButton>
              </span>
            </CustomTooltip>
          </section>
          <section className="messageBody m-1 p-2">
            <div className="d-flex flex-column justify-content-around">
              {/* Messages list */}
              <div className="messages">messages</div>

              {/* New Message Input */}
              <div className="input-group mt-5">
                {/* <span
            className={`input-group-text ${disableIfLoading} bg-black bg-gradient border-secondary text-light rounded-pill rounded-end border-end-0`}
          >
            <Search className="ms-1" />
          </span> */}
                {/* <input
              type="text"
              onChange={null}
              autoFocus
              placeholder="Type a message..."
              id="newMsgInput"
              className={`${inputFieldClassName.replace(
                "text-center",
                "text-start"
              )} border-start-0 rounded-start d-inline-block`}
              style={{ cursor: "auto", fontSize: "17px" }}
            /> */}
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="d-flex flex-column justify-content-start align-items-center h-100">
          <h2 className="mx-3">
            Hello{" "}
            <span
              className="fw-bold"
              style={{ color: "#A798F2" }}
            >{`${loggedInUser?.name?.toUpperCase()}`}</span>{" "}
            👋
          </h2>
          <LottieAnimation
            ref={letsChatGif}
            className={"d-inline-block mt-4"}
            style={{ marginBottom: "50px", height: "50%" }}
            animationData={animationData}
          />
          <h4 className="mx-5" style={{ marginTop: "-20px", color: "#99C5EE" }}>
            Click a Chat, Search a User, or Create a Group to start or open a
            chat.
          </h4>
          <h2 style={{ color: "#99C5EE" }}>Happy Chatting!😀</h2>
        </div>
      )}
    </div>
  );
};

export default MessagesView;
