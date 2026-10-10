import { ProjectType } from "@/types/types";
import { createContext } from "react";

export interface SettingContextProps {
  settingDetails: ProjectType | null;
  setSettingDetails: React.Dispatch<React.SetStateAction<ProjectType | null>>;
}

export const SettingContext = createContext<SettingContextProps>({} as SettingContextProps);