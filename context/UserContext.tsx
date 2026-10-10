import { createContext } from "react";

export interface UserDetail {
  id: number;
  name: string;
  email: string;
  credits: number | null;
}

export interface UserContextProps {
  userDetail: UserDetail | null;
  setUserDetail: React.Dispatch<React.SetStateAction<UserDetail | null>>;
}

export const UserContext = createContext<UserContextProps>({
  userDetail: null,
  setUserDetail: () => {},
});