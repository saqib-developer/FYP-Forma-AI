import { createContext } from "react";

export interface ChatbotContextProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ChatbotContext = createContext<ChatbotContextProps>({} as ChatbotContextProps);