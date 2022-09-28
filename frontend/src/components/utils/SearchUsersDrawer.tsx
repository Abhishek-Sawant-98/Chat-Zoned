import { ChevronLeft } from "@mui/icons-material";
import { Drawer, IconButton } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import axios from "../../utils/axios";
import { debounce, getAxiosConfig, truncateString } from "../../utils/appUtils";
import UserListItem from "./UserListItem";
import LoadingList from "./LoadingList";
import SearchInput from "./SearchInput";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAppState,
  setDeleteNotifsOfChat,
  setFetchMsgs,
  setSelectedChat,
} from "../../store/slices/AppSlice";
import {
  selectFormfieldState,
  setLoading,
} from "../../store/slices/FormfieldSlice";
import { displayToast } from "../../store/slices/ToastSlice";
import {
  AxiosErrorType,
  ClickEventHandler,
  StateSetter,
  ToastData,
  UserType,
} from "../../utils/AppTypes";
import { useAppDispatch, useAppSelector } from "../../store/storeHooks";
import { AxiosRequestConfig } from "axios";

interface Props {
  isDrawerOpen: boolean;
  setIsDrawerOpen: StateSetter<boolean>;
}

const SearchUsersDrawer = ({ isDrawerOpen, setIsDrawerOpen }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const { loggedInUser } = useAppSelector(selectAppState);
  const { loading } = useAppSelector(selectFormfieldState);
  const dispatch = useAppDispatch();
  const searchUserInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDrawerOpen) {
      setSearchResults([]);
      dispatch(setLoading(false));
      setSearchQuery("");
    }
  }, [isDrawerOpen]);

  const handleClose = () => setIsDrawerOpen(false);

  // Debouncing fetchUsers method to limit the no. of API calls
  const searchUsers = debounce(async (e: InputEvent) => {
    const query = (e.target as HTMLInputElement)?.value?.trim();
    setSearchQuery(query);
    if (!query) return setSearchResults([]);

    dispatch(setLoading(true));
    const config = getAxiosConfig({ loggedInUser });
    try {
      const { data } = await axios.get(
        `/api/user?search=${query}`,
        config as AxiosRequestConfig
      );

      dispatch(setLoading(false));
      setSearchResults(data);
    } catch (error) {
      dispatch(
        displayToast({
          title: "Couldn't Fetch Users",
          message:
            (error as AxiosErrorType).response?.data?.message ||
            (error as Error).message,
          type: "error",
          duration: 5000,
          position: "bottom-left",
        } as ToastData)
      );
      dispatch(setLoading(false));
    }
  }, 800);

  // Create/Retreive chat when a user item is clicked
  const createOrRetrieveChat = async (userId: string) => {
    handleClose();
    dispatch(setLoading(true));
    const config = getAxiosConfig({ loggedInUser });
    try {
      const { data } = await axios.post(
        `/api/chat`,
        { userId },
        config as AxiosRequestConfig
      );

      dispatch(setLoading(false));
      dispatch(setSelectedChat(data));
      dispatch(setFetchMsgs(true));
      dispatch(setDeleteNotifsOfChat(data._id));
    } catch (error) {
      dispatch(
        displayToast({
          title: "Couldn't Create/Retrieve Chat",
          message:
            (error as AxiosErrorType).response?.data?.message ||
            (error as Error).message,
          type: "error",
          duration: 4000,
          position: "bottom-center",
        } as ToastData)
      );
      dispatch(setLoading(false));
    }
  };

  const onUserItemClick: ClickEventHandler = (e) => {
    const userId =
      (e.target as HTMLElement).dataset.user ||
      (e.target as HTMLImageElement).alt;
    if (!userId) return;
    createOrRetrieveChat(userId);
  };

  return (
    <>
      <Drawer
        PaperProps={{
          sx: {
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            backgroundImage: "linear-gradient(0deg,#222,#444)",
            padding: "10px",
            width: "350px",
          },
        }}
        anchor="left"
        open={isDrawerOpen}
        onClose={handleClose}
        transitionDuration={350}
      >
        <div className="d-flex justify-content-center">
          <span
            className="text-center mt-1 user-select-none text-light"
            style={{ marginTop: 0, fontSize: 27 }}
          >
            Search Users
            <IconButton
              onClick={handleClose}
              sx={{
                position: "absolute",
                right: 8,
                top: 5,
                color: "#999999",
                ":hover": { backgroundColor: "#aaaaaa20" },
              }}
            >
              <ChevronLeft className="text-light m-1" />
            </IconButton>
          </span>
        </div>
        {/* Search Bar */}
        <SearchInput
          ref={searchUserInput}
          searchHandler={searchUsers}
          autoFocus={true}
          placeholder="Search by Name or Email"
          clearInput={() => {
            setSearchQuery("");
            setSearchResults([]);
            searchUserInput?.current?.focus();
          }}
        />
        {/* Search Results */}
        <section
          className="position-relative mx-1 my-2 h-100"
          style={{ overflowY: "auto", overflowX: "hidden" }}
        >
          <div
            // 'Event delegation' (add only one event listener for
            // parent element instead of adding for each child element)
            onClick={onUserItemClick}
          >
            {loading ? (
              <LoadingList listOf="User" dpRadius={"42px"} count={8} />
            ) : searchResults.length > 0 ? (
              searchResults.map((user: UserType) => (
                <UserListItem
                  key={user?._id}
                  user={user}
                  truncateValues={[27, 24]}
                />
              ))
            ) : searchQuery && !loading ? (
              <p className="text-light text-center fs-5 mt-3 mx-5">
                No results found for '
                <span className="text-info">
                  {truncateString(searchQuery, 30, 26)}
                </span>
                '
              </p>
            ) : (
              <></>
            )}
          </div>
        </section>
      </Drawer>
    </>
  );
};

export default SearchUsersDrawer;
