import { Visibility, VisibilityOff } from "@mui/icons-material";

const PasswordVisibilityToggle = ({
  disableIfLoading,
  showPassword,
  setShowPassword,
}) => {
  return (
    <span
      className={`input-group-text ${disableIfLoading} btn btn-outline-info rounded-pill rounded-start`}
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <VisibilityOff /> : <Visibility />}
    </span>
  );
};

export default PasswordVisibilityToggle;
