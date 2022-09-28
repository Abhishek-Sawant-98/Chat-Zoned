import { useEffect, useState } from "react";
import { selectFormfieldState } from "../../store/slices/FormfieldSlice";
import { useAppSelector } from "../../store/storeHooks";
import { ChangeEventHandler } from "../../utils/AppTypes";

interface Props {
  originalName: string;
  getUpdatedName: Function;
  placeholder: string;
}

const EditNameBody = ({ originalName, getUpdatedName, placeholder }: Props) => {
  const { loading, formFieldClassName, inputFieldClassName } =
    useAppSelector(selectFormfieldState);
  const [name, setName] = useState(originalName);

  const onChangeHandler: ChangeEventHandler = (e) =>
    setName(e.target.value);

  const onKeyDownHandler: React.KeyboardEventHandler<HTMLInputElement> = (
    e
  ) => {
    if (e.key === "Enter") {
      // Submit updated group name
      getUpdatedName(name, { submitUpdatedName: true });
    }
  };

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
        onChange={onChangeHandler}
        onKeyDown={onKeyDownHandler}
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
