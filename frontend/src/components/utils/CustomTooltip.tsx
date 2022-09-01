import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";

interface StyledProps {
  className: string;
  children: any;
  title: string;
  placement: any;
  arrow: boolean;
}

const getCustomTooltip = (arrowStyles: any, tooltipStyles: any) =>
  styled(
    ({ className, children, title, placement, arrow }: StyledProps): any => (
      <Tooltip
        title={title}
        placement={placement}
        arrow={arrow}
        classes={{ popper: className }}
      >
        {children}
      </Tooltip>
    )
  )(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: { ...arrowStyles },
    [`& .${tooltipClasses.tooltip}`]: { ...tooltipStyles },
  }));

export default getCustomTooltip;
