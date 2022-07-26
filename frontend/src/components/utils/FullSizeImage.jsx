const FILE_STYLES = { width: "90vw", height: "82vh" };
const PLACEHOLDER_IMG = process.env.REACT_APP_PLACEHOLDER_IMG_URL;

const FullSizeImage = ({ event, audioSrc, videoSrc }) => {
  return (
    <div className="d-flex justify-content-center">
      {audioSrc ? (
        <audio src={audioSrc} style={FILE_STYLES} controls>
          Your browser does not support the audio tag.
        </audio>
      ) : videoSrc ? (
        <video src={videoSrc} style={FILE_STYLES} controls>
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={event.target?.src || PLACEHOLDER_IMG}
          alt={event.target?.alt || "fullSizeImg"}
          className="img-fluid d-inline-block mx-auto"
          style={{ ...FILE_STYLES, objectFit: "contain" }}
        />
      )}
    </div>
  );
};

export default FullSizeImage;
