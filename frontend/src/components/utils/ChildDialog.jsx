import { useEffect, useState } from "react";
import CustomDialog from "./CustomDialog";

const ChildDialog = ({ getChildDialogMethods }) => {
  // Child Dialog config
  const [childDialogData, setChildDialogData] = useState({
    isOpen: false,
    title: "Child Dialog",
    nolabel: "NO",
    yeslabel: "YES",
    loadingYeslabel: "Updating...",
    action: () => {},
  });
  const [childDialogBody, setChildDialogBody] = useState(<></>);

  const displayChildDialog = (options) => {
    setChildDialogData({ ...options, isOpen: true });
  };
  const closeChildDialog = () => {
    setChildDialogData({ ...childDialogData, isOpen: false });
  };

  useEffect(() => {
    getChildDialogMethods({
      setChildDialogBody,
      displayChildDialog,
      closeChildDialog,
    });
  }, []);

  return (
    <CustomDialog
      dialogData={childDialogData}
      handleDialogClose={closeChildDialog}
      showDialogActions={true}
      showDialogClose={false}
    >
      {childDialogBody}
    </CustomDialog>
  );
};

export default ChildDialog;
