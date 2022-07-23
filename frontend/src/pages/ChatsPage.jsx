import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatpageHeader from "../components/ChatpageHeader";
import CustomDialog from "../components/utils/CustomDialog";
import ChatListView from "../components/ChatListView";
import MessagesView from "../components/MessagesView";
import { useDispatch, useSelector } from "react-redux";
import { displayToast } from "../store/slices/ToastSlice";
import {
  selectAppState,
  setLoggedInUser,
  setSelectedChat,
} from "../store/slices/AppSlice";
import {
  hideDialog,
  selectCustomDialogState,
} from "../store/slices/CustomDialogSlice";

const ChatsPage = () => {
  const { loggedInUser } = useSelector(selectAppState);
  const { dialogData, showDialogActions } = useSelector(
    selectCustomDialogState
  );

  const dispatch = useDispatch();

  const navigate = useNavigate();
  const [fetchMsgs, setFetchMsgs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [dialogBody, setDialogBody] = useState(<></>);

  useEffect(() => {
    // Session storage persists data even after page refresh, unlike state
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) return navigate("/");

    if (Date.now() >= parseInt(user.expiryTime)) {
      navigate("/");
      return dispatch(
        displayToast({
          title: "Session Expired",
          message: "Please Login Again",
          type: "info",
          duration: 4000,
          position: "bottom-center",
        })
      );
    }

    dispatch(setLoggedInUser(user));
    dispatch(hideDialog());
    dispatch(setSelectedChat(null));
  }, []);

  return (
    <>
      {loggedInUser && (
        <div className={`chatpage`}>
          {/* Header component */}
          <ChatpageHeader
            setFetchMsgs={setFetchMsgs}
            setDialogBody={setDialogBody}
          />

          <section className={`row g-1`}>
            {/* Chat List component */}
            <ChatListView
              loadingMsgs={loadingMsgs}
              setFetchMsgs={setFetchMsgs}
              setDialogBody={setDialogBody}
            />

            {/* Chat Messages component */}
            <MessagesView
              loadingMsgs={loadingMsgs}
              setLoadingMsgs={setLoadingMsgs}
              fetchMsgs={fetchMsgs}
              setFetchMsgs={setFetchMsgs}
              setDialogBody={setDialogBody}
            />
          </section>

          {/* Alert dialog */}
          <CustomDialog
            dialogData={dialogData}
            showDialogActions={showDialogActions}
            showDialogClose={true}
          >
            {dialogBody}
          </CustomDialog>
        </div>
      )}
    </>
  );
};

export default ChatsPage;
