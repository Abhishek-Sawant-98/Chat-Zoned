import lottie from "lottie-web/build/player/lottie_light";
import React, { useEffect, forwardRef } from "react";

interface GifProps {
  className: string;
  style: React.CSSProperties;
  animationData: any;
}

const AppGif = forwardRef<HTMLDivElement, GifProps>((props, gifRef) => {
  const { className, style, animationData } = props;

  useEffect(() => {
    lottie.loadAnimation({
      container: (gifRef as React.MutableRefObject<HTMLDivElement>)?.current,
      animationData: animationData,
    });
  }, []);
  return <div ref={gifRef} className={className} style={style}></div>;
});

export default AppGif;
