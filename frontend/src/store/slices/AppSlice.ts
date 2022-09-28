import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppState, ChatType, UserType } from "../../utils/AppTypes";
import type { RootState } from "../store";

const initialState: AppState = {
  loggedInUser: null,
  selectedChat: null,
  refresh: false,
  groupInfo: {
    chatDisplayPic: null,
    chatDisplayPicUrl: process.env.REACT_APP_DEFAULT_GROUP_DP,
    chatName: "",
    users: [],
  },
  fetchMsgs: false,
  deleteNotifsOfChat: "",
  clientSocket: null,
  isSocketConnected: false,
};

// User and Chat States
const AppSlice = createSlice({
  name: "AppState",
  initialState,
  reducers: {
    setLoggedInUser: (state, action: PayloadAction<UserType>) => {
      state.loggedInUser = action.payload;
    },
    setSelectedChat: (state, action: PayloadAction<ChatType>) => {
      state.selectedChat = action.payload;
    },
    toggleRefresh: (state) => {
      state.refresh = !state.refresh;
    },
    setGroupInfo: (state, action: PayloadAction<ChatType>) => {
      state.groupInfo = action.payload;
    },
    setFetchMsgs: (state, action: PayloadAction<boolean>) => {
      state.fetchMsgs = action.payload;
    },
    setDeleteNotifsOfChat: (state, action: PayloadAction<string>) => {
      state.deleteNotifsOfChat = action.payload;
    },
    setClientSocket: (state, action: PayloadAction<Object | null>) => {
      state.clientSocket = action.payload;
    },
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.isSocketConnected = action.payload;
    },
  },
});

export const {
  setLoggedInUser,
  setSelectedChat,
  toggleRefresh,
  setGroupInfo,
  setFetchMsgs,
  setDeleteNotifsOfChat,
  setClientSocket,
  setSocketConnected,
} = AppSlice.actions;

export const selectAppState = (state: RootState) => state.AppData;

export default AppSlice.reducer;
