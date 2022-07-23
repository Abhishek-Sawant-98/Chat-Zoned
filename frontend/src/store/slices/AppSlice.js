import { createSlice } from "@reduxjs/toolkit";

// User and Chat States
const AppSlice = createSlice({
  name: "AppState",
  initialState: {
    loggedInUser: null,
    selectedChat: null,
    refresh: false,
    groupInfo: {
      chatDisplayPic: null,
      chatDisplayPicUrl: process.env.REACT_APP_DEFAULT_GROUP_DP,
      chatName: "",
      users: [],
    },
    clientSocket: null,
    isSocketConnected: false,
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
    setClientSocket: (state, action) => {
      state.clientSocket = action.payload;
    },
    setSocketConnected: (state, action) => {
      state.isSocketConnected = action.payload;
    },
  },
});

export const {
  setLoggedInUser,
  setSelectedChat,
  toggleRefresh,
  setGroupInfo,
  setClientSocket,
  setSocketConnected,
} = AppSlice.actions;

export const selectAppState = (state) => state.AppData;

export default AppSlice.reducer;
