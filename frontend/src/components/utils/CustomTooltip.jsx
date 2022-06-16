import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";

const getCustomTooltip = (arrowStyles, tooltipStyles) =>
  styled(({ className, ...props }) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: { ...arrowStyles },
    [`& .${tooltipClasses.tooltip}`]: { ...tooltipStyles },
  }));

export default getCustomTooltip;
