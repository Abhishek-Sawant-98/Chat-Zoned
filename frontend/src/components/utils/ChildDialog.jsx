import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setChildDialogMethods } from "../../store/slices/ChildDialogSlice";
import CustomDialog from "./CustomDialog";

const ChildDialog = ({
  showChildDialogActions = true,
  showChildDialogClose = false,
}) => {
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
  const dispatch = useDispatch();
  const displayChildDialog = (options) =>
    setChildDialogData({ ...options, isOpen: true });

  const closeChildDialog = (data) =>
    setChildDialogData({ ...data, isOpen: false });

  useEffect(() => {
    dispatch(
      setChildDialogMethods({
        setChildDialogBody,
        displayChildDialog,
        closeChildDialog,
      })
    );
  }, [childDialogData]);

  return (
    <CustomDialog
      dialogData={childDialogData}
      closeDialog={closeChildDialog}
      showDialogActions={showChildDialogActions}
      showDialogClose={showChildDialogClose}
    >
      {childDialogBody}
    </CustomDialog>
  );
};

export default ChildDialog;
