import { Visibility, VisibilityOff } from "@mui/icons-material";
import { ClickEventHandler, StateSetter } from "../../utils/AppTypes";

interface Props {
  disableIfLoading: string;
  showPassword: boolean;
  setShowPassword: StateSetter<boolean>;
}

const PasswordVisibilityToggle = ({
  disableIfLoading,
  showPassword,
  setShowPassword,
}: Props) => {
  const toggleVisibility: ClickEventHandler = () => setShowPassword(!showPassword);

  return (
    <span
      className={`input-group-text ${disableIfLoading} btn btn-outline-info rounded-pill rounded-start`}
      onClick={toggleVisibility}
    >
      {showPassword ? <VisibilityOff /> : <Visibility />}
    </span>
  );
};

export default PasswordVisibilityToggle;
