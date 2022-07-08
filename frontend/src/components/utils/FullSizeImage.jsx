const FullSizeImage = ({ event, audioSrc, videoSrc }) => {
  const fileStyle = { width: "90vw", height: "82vh" };
  return (
    <div className="d-flex justify-content-center">
      {audioSrc ? (
        <audio style={fileStyle} controls>
          <source src={audioSrc} type="audio/mpeg"></source>
          <source src={audioSrc} type="audio/ogg"></source>
          <source src={audioSrc} type="audio/wav"></source>
          Your browser does not support the audio tag.
        </audio>
      ) : videoSrc ? (
        <video style={fileStyle} controls>
          <source src={videoSrc} type="video/mp4"></source>
          <source src={videoSrc} type="video/webm"></source>
          <source src={videoSrc} type="video/ogg"></source>
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={event.target?.src || "fullSizeImgSrc"}
          alt={event.target?.alt || "fullSizeImg"}
          className="img-fluid d-inline-block mx-auto"
          style={{ ...fileStyle, objectFit: "contain" }}
        />
      )}
    </div>
  );
};

export default FullSizeImage;
