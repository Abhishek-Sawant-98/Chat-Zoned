const FILE_STYLES = { width: "90vw", height: "82vh", borderRadius: 10 };
const PLACEHOLDER_IMG = process.env.REACT_APP_PLACEHOLDER_IMG_URL as string;

interface Props {
  event: React.MouseEvent;
  audioSrc?: string;
  videoSrc?: string;
}

const FullSizeImage = ({ event, audioSrc, videoSrc }: Props) => {
  return (
    <div className="d-flex justify-content-center align-items-center h-100">
      {Boolean(audioSrc) ? (
        <audio
          src={audioSrc}
          style={{ width: "clamp(300px, 70%, 600px)" }}
          autoPlay
          controls
        >
          Your browser does not support audio tag.
        </audio>
      ) : Boolean(videoSrc) ? (
        <video src={videoSrc} style={FILE_STYLES} autoPlay controls>
          Your browser does not support video tag.
        </video>
      ) : (
        <img
          src={(event?.target as HTMLImageElement)?.src || PLACEHOLDER_IMG}
          alt={(event?.target as HTMLImageElement)?.alt || "fullSizeImg"}
          className="img-fluid d-inline-block mx-auto"
          style={{ ...FILE_STYLES, objectFit: "contain" }}
        />
      )}
    </div>
  );
};

export default FullSizeImage;
