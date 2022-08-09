import { GroupAdd, Search } from "@mui/icons-material";

const GettingStarted = () => {
  const iconWrapperStyles = "text-light border d-inline-block rounded-pill";

  return (
    <div
      className="w-75 mt-4 mx-auto"
      style={{ color: "lightblue", fontSize: 18 }}
    >
      <p>
        Click on{" "}
        <span className={`${iconWrapperStyles} px-2`}>
          <Search />
        </span>{" "}
        button at the top left, to search users by name or email, and then click
        on a user to start a one-to-one chat.
      </p>
      <p>
        You can also click on{" "}
        <span
          className={`${iconWrapperStyles}`}
          style={{ padding: "0px 10px 3px 13px" }}
        >
          <GroupAdd />
        </span>{" "}
        button to search users and create a group chat.
      </p>
      <p style={{ color: "#F2AFEC" }}>
        If you're not sure what to search, enter{" "}
        <span className={`${iconWrapperStyles} bg-secondary border-0 px-2`}>
          .
        </span>{" "}
        in search box to list all users.
      </p>
    </div>
  );
};

export default GettingStarted;
