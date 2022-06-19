import lottie from "lottie-web/build/player/lottie_light";
import { useEffect, forwardRef } from "react";

const AppGif = forwardRef((props, gifRef) => {
  const { className, style, animationData } = props;

  useEffect(() => {
    lottie.loadAnimation({
      container: gifRef?.current,
      animationData: animationData,
    });
  }, []);
  return <div ref={gifRef} className={className} style={style}></div>;
});

export default AppGif;
