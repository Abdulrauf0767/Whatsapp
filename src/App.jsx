// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar';
import Account from './Components/Account';
import ChatBox from './Components/ChatBox';
import StatusBox from './Components/StatusBox';
import Phone  from './Components/Phone';

const App = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
      <div className='overflow-hidden w-full h-screen'>
        <Header />
        <div className='flex items-start h-[calc(100vh-60px)]'>
          <Sidebar isMobile={isMobile} />
          
          <Routes>
            <Route 
              path="/" 
              element={
                <>
                  <Account 
                    onChatSelect={(chat) => setSelectedChat(chat)} 
                    isMobile={isMobile} 
                  />
                  {!isMobile && selectedChat && (
                    <ChatBox 
                      selectedChat={selectedChat} 
                      onBack={() => setSelectedChat(null)} 
                      isMobile={isMobile} 
                    />
                  )}
                </>
              } 
            />
            <Route 
              path="/chat" 
              element={
                selectedChat ? (
                  <ChatBox 
                    selectedChat={selectedChat} 
                    onBack={() => setSelectedChat(null)} 
                    isMobile={isMobile} 
                  />
                ) : (
                  <Account 
                    onChatSelect={(chat) => setSelectedChat(chat)} 
                    isMobile={isMobile} 
                  />
                )
              } 
            />
            <Route path='/status' element = {<StatusBox/>} />
            <Route path='/phone' element = {<Phone/>} />
          </Routes>
        </div>
      </div>
  );
};

export default App;