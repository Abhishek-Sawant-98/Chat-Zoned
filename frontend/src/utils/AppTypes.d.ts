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
  chatDisplayPic: string;
  cloudinary_id: string;
  createdAt: string;
  groupAdmins?: UserType[];
  isGroupChat: boolean;
  lastMessage?: MessageType;
  updatedAt?: string;
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
export interface GroupInfo {
  chatDisplayPic: string | falsyType;
  chatDisplayPicUrl: string | falsyType;
  chatName: string;
  users: UserType[];
}

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
  isOpen: boolean;
  title: string;
  nolabel: string;
  yeslabel: string;
  loadingYeslabel: string;
  action: Function | falsyType;
}

export interface CustomDialogState {
  dialogData: DialogData;
  showDialogActions: boolean;
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
  title: string;
  message: string;
  type: string;
  duration: number;
  position: string;
}

export interface ToastState {
  toastData: ToastData;
}
