import { useEffect, useState } from "react";
import { AppState } from "../../context/ContextProvider";

const EditNameBody = ({ getUpdatedName }) => {
  const { formClassNames, loggedInUser } = AppState();
  const { loading, formFieldClassName, inputFieldClassName } = formClassNames;
  const [name, setName] = useState(loggedInUser?.name);

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
        name="username"
        id="editName"
        autoFocus
        className={`${inputFieldClassName} mt-1`}
        disabled={loading}
        placeholder="Enter New Name"
      />
    </section>
  );
};

export default EditNameBody;