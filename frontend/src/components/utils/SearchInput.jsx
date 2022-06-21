import { Close, Search } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { forwardRef, useState } from "react";
import { AppState } from "../../context/ContextProvider";

const SearchInput = forwardRef((props, inputRef) => {
  const { formClassNames } = AppState();
  const { searchHandler, autoFocus, placeholder, clearInput } = props;

  const { disableIfLoading, formFieldClassName, inputFieldClassName } =
    formClassNames;
  // To display/hide clear search (<Close />) icon when typing
  const [typing, setTyping] = useState(false);

  return (
    <section className={`${formFieldClassName} pt-3 pb-2 mx-1`}>
      <div className="input-group">
        <span
          className={`input-group-text ${disableIfLoading} bg-black bg-gradient border-secondary text-light rounded-pill rounded-end`}
        >
          <Search className="ms-1" style={{ marginTop: "3px" }} />
        </span>
        <input
          type="text"
          ref={inputRef}
          onChange={(e) => {
            setTyping(Boolean(e.target.value.trim()));
            searchHandler(e);
          }}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={`${inputFieldClassName
            .replace("text-center", "text-start")
            .replace("pill", "0")} border-start-0 border-end-0 d-inline-block`}
          style={{ cursor: "auto", fontSize: "19px" }}
        />
        <span
          className={`input-group-text ${disableIfLoading} bg-black bg-gradient border-secondary text-light rounded-pill rounded-start border-start-0`}
        >
          <IconButton
            onClick={() => {
              inputRef.current.value = "";
              setTyping(false); // Hide '<Close />' icon
              inputRef.current.focus();
              clearInput();
            }}
            className={`${typing ? "d-inline-block" : "d-none"}`}
            style={{
              padding: "0px 9px 3px 9px",
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
    </section>
  );
});

export default SearchInput;
