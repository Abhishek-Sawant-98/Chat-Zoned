import { CircularProgress } from "@mui/material";

const LoadingIndicator = ({ message, msgStyleClasses }) => {
  return (
    <div
      className="d-flex flex-column align-items-center position-absolute w-100 h-100"
      style={{
        top: "0%",
        left: "50%",
        transform: "translateX(-50%)",
        borderRadius: "20px",
      }}
    >
      <CircularProgress
        size={55}
        style={{ margin: "80px 0px 20px 0px", color: "lightblue" }}
      />
      <span className={msgStyleClasses}>{message}</span>
    </div>
  );
};

export default LoadingIndicator;
