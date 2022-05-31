import React, { useEffect, useState } from "react";
import axios from "axios";

const ChatsPage = () => {
  const [chats, setChats] = useState([]);

  const fetchChats = async () => {
    const { data } = await axios.get("/api/chats");
    setChats(data);
  };

  const onChatClick = (e) => {
    console.log(`Hello ${JSON.parse(e.target.innerText)[0].name}`);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div onClick={onChatClick} style={{ cursor: "pointer" }}>
      {chats.map((chat) => (
        <h4 key={chat._id}>{JSON.stringify(chat.users)}</h4>
      ))}
    </div>
  );
};

export default ChatsPage;
