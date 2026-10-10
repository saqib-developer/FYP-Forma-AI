import { createContext } from "react";

export interface RefreshDataProps {
  method: string;
  date: number;
}

export interface RefreshDataContextProps {
  refreshData: RefreshDataProps | null;
  setRefreshData: React.Dispatch<React.SetStateAction<RefreshDataProps | null>>;
}

export const RefreshDataContext = createContext<RefreshDataContextProps>({} as RefreshDataContextProps);