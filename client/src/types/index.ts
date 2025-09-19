export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
}

export interface IAuthState {
  user: IUser | null;
  isLoading: boolean;
  error: string | null;
}
