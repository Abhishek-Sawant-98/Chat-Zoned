import lottie from "lottie-web/build/player/lottie_light";
import React, { useEffect, forwardRef } from "react";

interface GifProps {
  className: string;
  style: React.CSSProperties;
  animationData: any;
}

const LottieAnimation = forwardRef<HTMLSpanElement, GifProps>(
  (props, gifRef) => {
    const { className, style, animationData } = props;

    useEffect(() => {
      lottie.loadAnimation({
        container: (gifRef as React.MutableRefObject<HTMLSpanElement>)?.current,
        animationData: animationData,
      });
    }, []);
    return <span ref={gifRef} className={className} style={style}></span>;
  }
);

export default LottieAnimation;
