import { ChevronLeft, Search } from "@mui/icons-material";
import { CircularProgress, Drawer, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { AppState } from "../context/ContextProvider";
import axios from "../utils/axios";
import { debounce, truncateString } from "../utils/appUtils";
import UserListItem from "./utils/UserListItem";

const SearchUsersDrawer = ({ isDrawerOpen, setIsDrawerOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

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
  const debouncedFetchUsers = debounce(async (e) => {
    const query = e.target.value.trim();
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
      console.log(data);
    } catch (error) {
      displayToast({
        title: "Couldn't Fetch Users",
        message: error.response?.data?.message || "Oops! Something Went Wrong",
        type: "error",
        duration: 5000,
        position: "top-right",
      });
      setLoading(false);
    }
  }, 800);

  const { formClassNames, loggedInUser, displayToast } = AppState();

  const {
    loading,
    setLoading,
    disableIfLoading,
    formFieldClassName,
    inputFieldClassName,
  } = formClassNames;

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
        <section className={`${formFieldClassName} pt-3 pb-2 mx-1`}>
          <div className="input-group">
            <span
              className={`input-group-text ${disableIfLoading} bg-black bg-gradient border-secondary text-light rounded-pill rounded-end`}
            >
              <Search className="ms-1" />
            </span>
            <input
              type="text"
              onChange={debouncedFetchUsers}
              autoFocus
              placeholder="Search by Name or Email"
              id="searchUsersInput"
              className={`${inputFieldClassName.replace(
                "text-center",
                "text-start"
              )} border-start-0 rounded-start d-inline-block`}
              style={{ cursor: "auto", fontSize: "19px" }}
            />
          </div>
        </section>
        <section
          className="searchResultSkeleton position-relative mx-1 my-2"
          style={{ overflowY: "auto", overflowX: "hidden" }}
        >
          {loading ? (
            <div
              className="d-flex flex-column align-items-center position-absolute w-100"
              style={{
                zIndex: "2",
                top: "0%",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <CircularProgress
                size={75}
                style={{ margin: "30px 0px", color: "lightblue" }}
              />
              <span style={{ marginBottom: "45px" }} className="text-light h1">
                {" Fetching Users..."}
              </span>
            </div>
          ) : (
            <>
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <UserListItem key={user._id} user={user} />
                ))
              ) : searchQuery ? (
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
            </>
          )}
        </section>
      </Drawer>
    </>
  );
};

export default SearchUsersDrawer;
