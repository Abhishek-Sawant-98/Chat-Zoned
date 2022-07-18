import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_GROUP_DP } from "../../utils/appUtils.js";

// User and Chat States
const AppSlice = createSlice({
  name: "AppState",
  initialState: {
    loggedInUser: null,
    selectedChat: null,
    refresh: false,
    groupInfo: {
      chatDisplayPic: null,
      chatDisplayPicUrl: DEFAULT_GROUP_DP,
      chatName: "",
      users: [],
    },
  },
  reducers: {
    setLoggedInUser: (state, action) => {
      state.loggedInUser = action.payload;
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
    toggleRefresh: (state) => {
      state.refresh = !state.refresh;
    },
    setGroupInfo: (state, action) => {
      state.groupInfo = action.payload;
    },
  },
});

export const { setLoggedInUser, setSelectedChat, toggleRefresh, setGroupInfo } =
  AppSlice.actions;

export const selectAppState = (state) => state.AppData;

export default AppSlice.reducer;
