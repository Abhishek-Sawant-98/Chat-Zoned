import { Skeleton } from "@mui/material";

const LoadingMsgs = ({ count }) => {
  const skeletonStyle = { backgroundColor: "#777" };
  return (
    <>
      {[...Array(count)].map((e, i) => (
        <div
          key={`loadingMsg${i}`}
          className={`loadingMsg d-flex flex-column align-items-${
            i % 2 ? "start" : "end"
          } mb-2 mx-4`}
        >
          <Skeleton
            variant="rectangular"
            className={`loadingSender col-3 mb-1`}
            style={skeletonStyle}
          />
          <Skeleton
            variant="rectangular"
            className={`loadingContent col-5`}
            style={skeletonStyle}
          />
        </div>
      ))}
    </>
  );
};

export default LoadingMsgs;
