// Reusable type declarations
export interface UserInterface {
  cloudinary_id: string;
  email: string;
  expiryTime: number;
  name: string;
  notifications: MessageType[];
  profilePic: string;
  token: string;
  _id: string;
}
export type falsyType = null | undefined;
export type UserType = UserInterface | falsyType;

export interface MessageInterface {
  chat: string;
  content: string;
  createdAt: string;
  fileUrl?: string | falsyType;
  file_id?: string | falsyType;
  file_name?: string | falsyType;
  sender: UserType;
  updatedAt?: string;
  __v?: number;
  _id: string;
}
export type MessageType = MessageInterface | falsyType;

export interface ChatInterface {
  chatDisplayPic: string | File | falsyType;
  chatDisplayPicUrl?: string | falsyType;
  chatName?: string;
  cloudinary_id: string;
  createdAt: string;
  groupAdmins?: UserType[];
  isGroupChat: boolean;
  lastMessage?: MessageType;
  updatedAt?: string;
  removedUser?: UserType;
  receiverEmail?: string | falsyType;
  users: UserType[];
  __v?: number;
  _id: string;
}
export type ChatType = ChatInterface | falsyType;

export type lazyComponent = React.LazyExoticComponent<() => JSX.Element>;

export interface AxiosOptions {
  loggedInUser?: UserType;
  formData?: boolean;
  blob?: boolean;
}

export interface AxiosConfig {
  headers: {
    "Content-Type": string;
    Authorization?: string;
  };
  responseType?: string;
}

// AppSlice types
export interface GroupInfoInterface {
  chatDisplayPic: string | File | falsyType;
  chatDisplayPicUrl: string | falsyType;
  chatName: string | falsyType;
  users: UserType[];
}
export type GroupInfo = GroupInfoInterface | falsyType;

export interface AppState {
  loggedInUser: UserType;
  selectedChat: ChatType;
  refresh: boolean;
  groupInfo: GroupInfo;
  fetchMsgs: boolean;
  deleteNotifsOfChat: string;
  clientSocket: any;
  isSocketConnected: boolean;
}

// ChildDialogSlice types
export interface ChildDialogMethods {
  setChildDialogBody: Function | falsyType;
  displayChildDialog: Function | falsyType;
  closeChildDialog: Function | falsyType;
}

export interface ChildDialogState {
  childDialogMethods: ChildDialogMethods;
}

// CustomDialogSlice types
export interface DialogData {
  isFullScreen?: boolean;
  isOpen: boolean;
  title: string;
  nolabel: string;
  yeslabel: string;
  loadingYeslabel: string;
  action: Function | falsyType;
}

export interface CustomDialogState {
  children?: ReactNode;
  dialogData: DialogData;
  showDialogActions: boolean;
  showDialogClose?: boolean;
  closeDialog?: Function;
}

// FormfieldSlice types
export interface FormfieldState {
  loading: boolean;
  disableIfLoading: string;
  formLabelClassName: string;
  formFieldClassName: string;
  inputFieldClassName: string;
  btnSubmitClassName: string;
  btnResetClassName: string;
}

// ToastSlice types
export interface ToastData {
  isOpen: boolean;
  title?: string;
  message: string;
  type: string;
  duration: number;
  position: string;
}

export interface ToastState {
  toastData: ToastData;
}

export interface AxiosErrorType {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export type ButtonEventHandler = MouseEventHandler<HTMLButtonElement>;

export interface AttachmentData {
  attachmentData: any;
  attachmentPreviewUrl: string | falsyType;
}

export interface MsgAttachmentProps {
  msgSent?: boolean;
  isEditMode: boolean;
  fileEditIcons: any;
  downloadingFileId?: string | falsyType;
  loadingMediaId?: string | falsyType;
  isPreview: boolean;
  fileData: any;
}
