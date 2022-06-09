import React, { useEffect, useState } from "react";
import axios from "../config/axios";
import { useNavigate, useLocation } from "react-router-dom";

const ChatsPage = () => {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const location = useLocation().pathname;
  const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

  useEffect(() => {
    const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

    // alert("Inside chatpage useeffect");
    // alert(location);
    // alert(JSON.stringify(loggedInUser));
    if (!loggedInUser) navigate('/');
  }, []);

  return <div className="h1 text-white mt-5">{`Welcome ${loggedInUser.name} 😀`}</div>;
};

export default ChatsPage;
