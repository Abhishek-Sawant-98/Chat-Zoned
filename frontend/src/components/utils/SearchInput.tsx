import { Clear, Search } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { forwardRef, LegacyRef, MutableRefObject, useState } from "react";
import { useSelector } from "react-redux";
import { selectFormfieldState } from "../../store/slices/FormfieldSlice";

interface Props {
  searchHandler: Function;
  autoFocus: boolean;
  placeholder: string;
  clearInput: Function;
}

type InputRef = MutableRefObject<HTMLInputElement>;

const SearchInput = forwardRef<HTMLInputElement, Props>((props, inputRef) => {
  const { searchHandler, autoFocus, placeholder, clearInput } = props;
  const { disableIfLoading, formFieldClassName, inputFieldClassName } =
    useSelector(selectFormfieldState);

  // To display/hide clear search (<Close />) icon when typing
  const [typing, setTyping] = useState(false);

  const onClearIconClick = () => {
    if (!inputRef || !(inputRef as InputRef).current) return;
    (inputRef as InputRef).current.value = "";
    setTyping(false); // Hide '<Close />' icon
    (inputRef as InputRef).current.focus();
    clearInput();
  };

  return (
    <section className={`${formFieldClassName} pt-3 pb-2 mx-1`}>
      {/* Input box */}
      <div className="input-group">
        <span
          className={`input-group-text ${disableIfLoading} bg-black bg-gradient border-secondary text-light rounded-pill rounded-end`}
        >
          <Search className="mx-0" style={{ marginTop: "3px" }} />
        </span>
        <input
          type="text"
          ref={inputRef as LegacyRef<HTMLInputElement>}
          onChange={(e) => {
            setTyping(Boolean(e.target.value.trim()));
            searchHandler(e);
          }}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={`${inputFieldClassName
            .replace("text-center", "text-start")
            .replace("pill", "0")} border-start-0 border-end-0 d-inline-block`}
          style={{ cursor: "auto", fontSize: "18px" }}
        />
        {/* Clear icon button */}
        <span
          className={`input-group-text ${disableIfLoading} bg-black bg-gradient border-secondary text-light rounded-pill rounded-start border-start-0`}
        >
          <IconButton
            onClick={onClearIconClick}
            className={`${typing ? "d-inline-block" : "d-none"}`}
            style={{
              padding: "0px 9px 3px 9px",
              margin: "-7px",
              color: "#999999",
            }}
            sx={{ ":hover": { backgroundColor: "#aaaaaa20" } }}
          >
            <Clear style={{ fontSize: "19px" }} />
          </IconButton>
        </span>
      </div>
    </section>
  );
});

export default SearchInput;
