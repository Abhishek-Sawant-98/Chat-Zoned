import { useEffect, useState } from "react";
import { AppState } from "../../context/ContextProvider";

const EditNameBody = ({ getUpdatedName, placeholder }) => {
  const { formClassNames, groupInfo } = AppState();
  const { loading, formFieldClassName, inputFieldClassName } = formClassNames;
  const [name, setName] = useState(groupInfo?.chatName);

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
