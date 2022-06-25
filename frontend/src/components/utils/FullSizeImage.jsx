const FullSizeImage = ({ event }) => {
  return (
    <div className="d-flex justify-content-center">
      <img
        src={event.target?.src || "fullSizeImgSrc"}
        alt={event.target?.alt || "fullSizeImg"}
        className="img-fluid d-inline-block mx-auto"
        style={{ width: "75vmin", height: "75vmin", objectFit: "contain" }}
      />
    </div>
  );
};

export default FullSizeImage;
