interface Props {
  children: React.ReactNode;
}

const MenuItemText = ({ children }: Props) => {
  return <span style={{ marginBottom: "3px" }}>{children}</span>;
};

export default MenuItemText;
