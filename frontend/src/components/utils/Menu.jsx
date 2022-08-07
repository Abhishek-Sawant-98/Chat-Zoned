import { Menu as MuiMenu } from "@mui/material";

export const menuPaperProps = {
  elevation: 0,
  sx: {
    overflow: "auto",
    maxHeight: 250,
    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
    borderRadius: 2,
    backgroundColor: "#404040",
    mt: 1,
  },
};

export const menuItemProps = {
  ":hover": { backgroundColor: "#505050" },
  color: "#e0e0e0",
  fontSize: "19px",
};

export const menuIconProps = { color: "lightblue" };

const Menu = ({
  children,
  menuAnchor,
  setMenuAnchor,
  transformOrigin,
  anchorOrigin,
}) => {
  const isMenuOpen = Boolean(menuAnchor);
  const closeMenu = () => setMenuAnchor(null);

  return (
    <MuiMenu
      anchorEl={menuAnchor}
      open={isMenuOpen}
      onClose={closeMenu}
      onClick={closeMenu}
      PaperProps={menuPaperProps}
      transformOrigin={transformOrigin}
      anchorOrigin={anchorOrigin}
    >
      {children}
    </MuiMenu>
  );
};

export default Menu;
