import animationData from "../../animations/chat-gif.json";
import lottie from "lottie-web/build/player/lottie_light";
import { useEffect, useRef } from "react";

const AppGif = ({ className, style }) => {
  const appGif = useRef(null);

  useEffect(() => {
    lottie.loadAnimation({
      container: appGif.current,
      animationData: animationData,
    });
  }, []);
  return <span ref={appGif} className={className} style={style}></span>;
};

export default AppGif;
