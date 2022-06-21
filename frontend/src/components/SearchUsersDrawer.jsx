import { ChevronLeft, Close, Search } from "@mui/icons-material";
import { CircularProgress, Drawer, IconButton } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { AppState } from "../context/ContextProvider";
import axios from "../utils/axios";
import { debounce, truncateString } from "../utils/appUtils";
import UserListItem from "./utils/UserListItem";
import LoadingIndicator from "./utils/LoadingIndicator";
import SearchInput from "./utils/SearchInput";

const SearchUsersDrawer = ({ isDrawerOpen, setIsDrawerOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { formClassNames, loggedInUser, displayToast, setSelectedChat } =
    AppState();
  const searchUserInput = useRef(null);

  const {
    loading,
    setLoading,
    disableIfLoading,
    formFieldClassName,
    inputFieldClassName,
  } = formClassNames;

  useEffect(() => {
    if (isDrawerOpen) {
      setSearchResults([]);
      setLoading(false);
      setSearchQuery("");
    }
  }, [isDrawerOpen]);

  const handleClose = () => {
    setIsDrawerOpen(false);
  };

  // Debouncing fetchUsers method to limit the no. of API calls
  const searchUsers = debounce(async (e) => {
    const query = e.target?.value?.trim();
    setSearchQuery(query);
    if (!query) return setSearchResults([]);

    setLoading(true);

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loggedInUser.token}`,
      },
    };

    try {
      const { data } = await axios.get(`/api/user?search=${query}`, config);

      setLoading(false);
      setSearchResults(data);
    } catch (error) {
      displayToast({
        title: "Couldn't Fetch Users",
        message: error.response?.data?.message || "Oops! Server Down",
        type: "error",
        duration: 5000,
        position: "bottom-left",
      });
      setLoading(false);
    }
  }, 800);

  // Create/Retreive chat when a user item is clicked
  const createOrRetrieveChat = async (userId) => {
    handleClose();
    setLoading(true);

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loggedInUser.token}`,
      },
    };

    try {
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      setLoading(false);
      setSelectedChat(data);
    } catch (error) {
      displayToast({
        title: "Create/Retrieve Chat Failed",
        message: error.response?.data?.message || "Oops! Server Down",
        type: "error",
        duration: 5000,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Drawer
        PaperProps={{
          sx: {
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            backgroundColor: "#4d4d4d",
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
            className="text-center h2 user-select-none text-light"
            style={{ marginTop: "0px" }}
          >
            Search Users
            <IconButton
              onClick={handleClose}
              sx={{
                position: "absolute",
                right: 8,
                top: 5,
                color: "#999999",
                ":hover": {
                  backgroundColor: "#aaaaaa20",
                },
              }}
            >
              <ChevronLeft className="text-light m-1" />
            </IconButton>
          </span>
        </div>
        {/* Search Bar */}
        {/* <section className={`${formFieldClassName} pt-3 pb-2 mx-1`}>
          <div className="input-group">
            <span
              className={`input-group-text ${disableIfLoading} bg-black bg-gradient border-secondary text-light rounded-pill rounded-end`}
            >
              <Search className="ms-1 mt-1" />
            </span>
            <input
              type="text"
              ref={searchUserInput}
              onChange={searchUsers}
              autoFocus
              placeholder="Search by Name or Email"
              id="searchUsersInput"
              className={`${inputFieldClassName
                .replace("text-center", "text-start")
                .replace(
                  "pill",
                  "0"
                )} border-start-0 border-end-0 d-inline-block`}
              style={{ cursor: "auto", fontSize: "20px" }}
            />
            <span
              className={`input-group-text ${disableIfLoading} bg-black bg-gradient border-secondary text-light rounded-pill rounded-start border-start-0`}
            >
              <IconButton
                onClick={() => {
                  searchUserInput.current.value = "";
                  setSearchResults([]);
                }}
                className={`${
                  searchUserInput.current?.value ? "d-inline-block" : "d-none"
                }`}
                style={{
                  padding: "0px 9px 2px 9px",
                  margin: "-7px",
                  color: "#999999",
                }}
                sx={{
                  ":hover": {
                    backgroundColor: "#aaaaaa20",
                  },
                }}
              >
                <Close style={{ fontSize: "19px" }} />
              </IconButton>
            </span>
          </div>
        </section> */}
        <SearchInput
          ref={searchUserInput}
          searchHandler={searchUsers}
          autoFocus={true}
          placeholder="Search by Name or Email"
          clearInput={() => {
            setSearchQuery("");
            setSearchResults([]);
            searchUserInput.current.focus();
          }}
        />
        {/* Search Results */}
        <section
          className="position-relative mx-1 my-2 h-100"
          style={{ overflowY: "auto", overflowX: "hidden" }}
        >
          {loading && (
            <LoadingIndicator
              message={"Fetching Users..."}
              msgStyleClasses={"text-light h2"}
            />
          )}
          <div
            // 'Event delegation' (add only one event listener for
            // parent element instead of adding for each child element)
            onClick={(e) => {
              const userId = e.target.dataset.user;
              if (userId) createOrRetrieveChat(userId);
            }}
          >
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <UserListItem key={user._id} user={user} />
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
