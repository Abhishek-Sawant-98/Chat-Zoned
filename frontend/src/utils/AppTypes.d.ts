import { StyledComponent } from "@emotion/styled";
import { TooltipProps } from "@mui/material";
import { SetStateAction } from "react";

// Reusable type declarations
export interface UserInterface {
  cloudinary_id: string;
  email: string;
  expiryTime: number;
  name: string;
  notifications: MessageType[];
  isGroupAdmin?: boolean;
  profilePic: string;
  token: string;
  _id: string;
}
export type UserType = UserInterface | null;

export interface ChatInterface {
  chatDisplayPic: string | File | null;
  chatDisplayPicUrl?: string | null;
  chatName?: string;
  cloudinary_id?: string;
  createdAt?: string;
  groupAdmins?: UserType[];
  isGroupChat?: boolean;
  lastMessage?: MessageType;
  updatedAt?: string;
  removedUser?: UserType;
  receiverEmail?: string | null;
  users: UserType[];
  __v?: number;
  _id?: string;
}
export type ChatType = ChatInterface | null;

export interface MessageInterface {
  chat: ChatType | string;
  content: string;
  createdAt: string;
  fileUrl?: string | null;
  file_id?: string | null;
  file_name?: string | null;
  sender: UserType;
  updatedAt?: string;
  sent?: boolean;
  __v?: number;
  _id: string;
}
export type MessageType = MessageInterface | null;

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
  setChildDialogBody: ((node: React.ReactNode) => void) | null;
  displayChildDialog: ((options: DialogData) => void) | null;
  closeChildDialog: (() => void) | null;
}

export interface ChildDialogState {
  childDialogMethods: ChildDialogMethods;
}

// CustomDialogSlice types
export interface DialogData {
  isFullScreen?: boolean;
  isOpen?: boolean;
  title: string;
  nolabel?: string;
  yeslabel?: string;
  loadingYeslabel?: string;
  action?: Function | null;
}

export interface CustomDialogState {
  children?: ReactNode;
  dialogData: DialogData;
  showDialogActions: boolean;
  showDialogClose?: boolean;
  closeDialog?: (() => void) | null;
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

export interface EditPwdData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ProfileData {
  memberProfilePic?: string;
  memberName?: string;
  memberEmail?: string;
}

export interface EditPwdDataOptions {
  submitUpdatedPassword: boolean;
}

// Event handlers
export type ClickEventHandler = React.MouseEventHandler<HTMLElement>;
export type ChangeEventHandler = React.ChangeEventHandler<HTMLInputElement>;
export type KeyboardEventHandler = React.KeyboardEventHandler<HTMLElement>;

export type DialogBodySetter = (node: React.ReactNode) => void;
export type InputRef = MutableRefObject<HTMLInputElement>;
export type SpanRef = MutableRefObject<HTMLSpanElement>;
export type StateSetter<T> = Dispatch<SetStateAction<T>>;
export type AnchorSetter = StateSetter<HTMLElement | null>;
export type ErrorType = AxiosErrorType | Error | string;

export type CustomTooltipType = StyledComponent<TooltipProps, {}, {}>;

export interface FileMetaData {
  name: string;
  type: string;
  size: number;
}

export interface AttachmentData {
  attachment: File | string | FileMetaData;
  attachmentPreviewUrl: string | null;
  content?: string;
  mediaDuration?: string;
}

export interface FileData {
  fileName: string | null;
  isAudio: boolean;
}

export interface AttachmentFileData {
  msgId?: string;
  fileUrl: string;
  file_id: string;
  file_name: string;
  size?: number;
}

export interface MsgAttachmentProps {
  msgSent?: boolean;
  isEditMode: boolean;
  fileEditIcons: React.ReactNode;
  downloadingFileId?: string | null;
  loadingMediaId?: string | null;
  isPreview: boolean;
  fileData: FileData | AttachmentFileData;
}
