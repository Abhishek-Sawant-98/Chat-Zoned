import { useEffect, useState } from "react";
import { setChildDialogMethods } from "../../store/slices/ChildDialogSlice";
import { useAppDispatch } from "../../store/storeHooks";
import { DialogData } from "../../utils/AppTypes";
import CustomDialog from "./CustomDialog";

interface Props {
  showChildDialogActions: boolean;
  showChildDialogClose: boolean;
}

const ChildDialog = ({
  showChildDialogActions = true,
  showChildDialogClose = false,
}: Props) => {
  // Child Dialog config
  const [childDialogData, setChildDialogData] = useState<DialogData>({
    isOpen: false,
    title: "Child Dialog",
    nolabel: "NO",
    yeslabel: "YES",
    loadingYeslabel: "Updating...",
    action: () => {},
  });
  const [childDialogBody, setChildDialogBody] = useState<React.ReactNode>(
    <></>
  );
  const dispatch = useAppDispatch();

  const displayChildDialog = (options: DialogData) =>
    setChildDialogData({ ...options, isOpen: true });

  const closeChildDialog = () =>
    setChildDialogData({ ...childDialogData, isOpen: false });

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
