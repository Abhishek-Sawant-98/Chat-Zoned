import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectFormfieldState } from "../../store/slices/FormfieldSlice";

const EditNameBody = ({ originalName, getUpdatedName, placeholder }) => {
  const { loading, formFieldClassName, inputFieldClassName } =
    useSelector(selectFormfieldState);
  const [name, setName] = useState(originalName);

  useEffect(() => {
    getUpdatedName(name);
  }, [name]);

  return (
    <section
      className={`${formFieldClassName} mx-auto`}
      style={{ width: "clamp(250px, 60vw, 360px)" }}
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            // Submit updated group name
            getUpdatedName(name, { submitUpdatedName: true });
          }
        }}
        name="editname"
        autoFocus
        className={`${inputFieldClassName} mt-1`}
        disabled={loading}
        placeholder={placeholder}
      />
    </section>
  );
};

export default EditNameBody;
