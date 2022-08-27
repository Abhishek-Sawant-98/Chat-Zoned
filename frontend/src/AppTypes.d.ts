export interface UserInterface {
  cloudinary_id: string;
  email: string;
  expiryTime: number;
  name: string;
  notifications: Object[];
  profilePic: string;
  token: string;
  _id: string;
};

export type UserType = UserInterface | null | undefined;

export type lazyComponent = React.LazyExoticComponent<() => JSX.Element>;
