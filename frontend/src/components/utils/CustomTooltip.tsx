import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import { CustomTooltipType } from "../../utils/AppTypes";

const getCustomTooltip = (
  arrowStyles: React.CSSProperties,
  tooltipStyles: React.CSSProperties
): CustomTooltipType =>
  styled(({ className, children, title, placement, arrow }: TooltipProps) => (
    <Tooltip
      title={title}
      placement={placement}
      arrow={arrow}
      classes={{ popper: className || "" }}
    >
      {children}
    </Tooltip>
  ))(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: { ...arrowStyles },
    [`& .${tooltipClasses.tooltip}`]: { ...tooltipStyles },
  }));

export default getCustomTooltip;
