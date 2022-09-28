import { useEffect, useState } from "react";
import { selectFormfieldState } from "../../store/slices/FormfieldSlice";
import { useAppSelector } from "../../store/storeHooks";
import { ChangeEventHandler, EditPwdData, EditPwdDataOptions, KeyboardEventHandler } from "../../utils/AppTypes";
import PasswordVisibilityToggle from "../utils/PasswordVisibilityToggle";

interface Props {
  getUpdatedState: (data: EditPwdData, options?: EditPwdDataOptions) => void;
}

const ChangePasswordBody = ({ getUpdatedState }: Props) => {
  const {
    loading,
    disableIfLoading,
    formLabelClassName,
    formFieldClassName,
    inputFieldClassName,
  } = useAppSelector(selectFormfieldState);

  const [showPassword, setShowPassword] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState<EditPwdData>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const { currentPassword, newPassword, confirmNewPassword } =
    changePasswordData;

  const handleChangeFor =
    (prop: string): ChangeEventHandler =>
    (e) => {
      setChangePasswordData({
        ...changePasswordData,
        [prop]: e.target?.value,
      });
    };

  useEffect(() => {
    // Return updated state to profile settings menu
    getUpdatedState(changePasswordData);
  }, [changePasswordData]);

  const onEnterKeyDown: KeyboardEventHandler = (e) => {
    if (e.key === "Enter") {
      // Submit updated password data
      getUpdatedState(changePasswordData, { submitUpdatedPassword: true });
    }
  };

  return (
    <>
      {/* Current Password input */}
      <section
        className={`dialogField ${formFieldClassName} mb-2 mt-3 col-md-6 order-md-2`}
      >
        <label htmlFor="current_password" className={`${formLabelClassName}`}>
          Current Password <span className="required">*</span>
        </label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            value={currentPassword}
            onChange={handleChangeFor("currentPassword")}
            onKeyDown={onEnterKeyDown}
            required
            autoFocus
            name="currentPassword"
            id="current_password"
            className={`${inputFieldClassName} rounded-end`}
            disabled={loading}
            placeholder="Used While Signing In"
          />
          <PasswordVisibilityToggle
            disableIfLoading={disableIfLoading}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        </div>
      </section>
      {/* New Password input */}
      <section
        className={`dialogField ${formFieldClassName} mb-2 col-md-6 order-md-2`}
      >
        <label htmlFor="new_password" className={`${formLabelClassName}`}>
          New Password <span className="required">*</span>
        </label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={handleChangeFor("newPassword")}
            onKeyDown={onEnterKeyDown}
            required
            name="newPassword"
            id="new_password"
            className={`${inputFieldClassName} rounded-end`}
            disabled={loading}
            placeholder="Different from Current"
          />
          <PasswordVisibilityToggle
            disableIfLoading={disableIfLoading}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        </div>
      </section>
      {/* Confirm New Password input */}
      <section
        className={`dialogField ${formFieldClassName} mb-2 col-md-6 order-md-2`}
      >
        <label
          htmlFor="confirm_new_password"
          className={`${formLabelClassName}`}
        >
          Confirm New Password <span className="required">*</span>
        </label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            value={confirmNewPassword}
            onChange={handleChangeFor("confirmNewPassword")}
            onKeyDown={onEnterKeyDown}
            required
            name="confirmNewPassword"
            id="confirm_new_password"
            className={`${inputFieldClassName} rounded-end`}
            disabled={loading}
            placeholder="Exactly as Above"
          />
          <PasswordVisibilityToggle
            disableIfLoading={disableIfLoading}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        </div>
      </section>
    </>
  );
};

export default ChangePasswordBody;
