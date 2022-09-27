import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";

interface StyledProps {
  className: string;
  children: React.ReactElement<any, any>;
  title: string;
  placement: any;
  arrow: boolean;
}

const getCustomTooltip = (
  arrowStyles: React.CSSProperties,
  tooltipStyles: React.CSSProperties
) =>
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
