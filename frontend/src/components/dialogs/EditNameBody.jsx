import { AppState } from "../../context/ContextProvider";

const EditNameBody = ({ placeholder }) => {
  const { formClassNames, groupInfo, setGroupInfo } = AppState();
  const { loading, formFieldClassName, inputFieldClassName } = formClassNames;

  return (
    <section
      className={`${formFieldClassName} mx-auto`}
      style={{ width: "clamp(250px, 60vw, 360px)" }}
    >
      <input
        type="text"
        value={groupInfo?.chatName}
        onChange={(e) =>
          setGroupInfo({ ...groupInfo, chatName: e.target.value })
        }
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
