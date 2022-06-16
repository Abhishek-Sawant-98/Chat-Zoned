import { Skeleton } from "@mui/material";
import React from "react";

const RectangularSkeleton = ({ count }) => {
  const skeletonStyle = {
    height: "60px",
    backgroundColor: "#888888",
    borderRadius: "10px",
  };

  return (
    <div className="row gy-3">
      {[...Array(count)].map((e, i) => (
        <Skeleton key={i} variant="rectangular" style={skeletonStyle} />
      ))}
    </div>
  );
};

export default RectangularSkeleton;
