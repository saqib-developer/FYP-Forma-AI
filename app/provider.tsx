'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { UserContext, UserDetail } from '@/context/UserContext'
import { SettingContext } from '@/context/SettingContext'
import { RefreshDataContext, RefreshDataProps } from '@/context/RefreshDataContext'
import { ChatbotContext } from '@/context/ChatbotContext'
import { ProjectType } from '@/types/types'
import { useUser } from '@clerk/nextjs'

interface ProviderProps {
  children: React.ReactNode;
}

function Provider({ children }: ProviderProps) {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [settingDetails, setSettingDetails] = useState<ProjectType | null>(null);
  const [refreshData, setRefreshData] = useState<RefreshDataProps | null>(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      CreateNewUser();
    } else if (isLoaded && !user) {
      setUserDetail(null);
    }
  }, [isLoaded, user]);

  const CreateNewUser = async () => {
    try {
      const res = await axios.post<UserDetail>('/api/user', {});
      setUserDetail(res.data);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <UserContext.Provider value={{ userDetail, setUserDetail }}>
      <SettingContext.Provider value={{ settingDetails, setSettingDetails }}>
        <RefreshDataContext.Provider value={{ refreshData, setRefreshData }}>
          <ChatbotContext.Provider value={{ isOpen: chatbotOpen, setIsOpen: setChatbotOpen }}>
            <div>{children}</div>
          </ChatbotContext.Provider>
        </RefreshDataContext.Provider>
      </SettingContext.Provider>
    </UserContext.Provider>
  );
}

export default Provider;