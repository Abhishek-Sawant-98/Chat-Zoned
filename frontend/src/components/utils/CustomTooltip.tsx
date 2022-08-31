import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";

interface StyledProps {
  className: string;
}

const getCustomTooltip = (arrowStyles: any, tooltipStyles: any) =>
  styled<React.JSXElementConstructor<StyledProps>>(
    ({ className, ...props }): any => (
      <Tooltip
        title="CustomTooltip"
        {...props}
        arrow
        classes={{ popper: className }}
      >
        <></>
      </Tooltip>
    )
  )(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: { ...arrowStyles },
    [`& .${tooltipClasses.tooltip}`]: { ...tooltipStyles },
  }));

export default getCustomTooltip;
