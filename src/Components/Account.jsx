// Account.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import dp from "/Images/WhatsApp Image 2025-04-06 at 11.11.45_c0670282.jpg";
import nature from "/Images/images.jpeg";

const Account = ({ onChatSelect, isMobile }) => {
  const navigate = useNavigate();

  const handleChatClick = (chat) => {
    onChatSelect(chat);
    if (isMobile) {
      navigate('/chat');
    }
  };

  return (
    <div className={`${isMobile ? 'w-full' : 'w-[400px]'} h-[calc(100vh-60px)] border border-gray-200`}>
      <div className='w-[90%] justify-self-center flex flex-col gap-y-3 items-start'>
        <div className='flex items-center justify-between w-full h-20 m-0 p-0'>
          <h2 className='font-medium text-xl w-[60%]'>Chats</h2>
          <div className='w-[30%] flex items-center justify-between'>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </span>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </span>
          </div>
        </div>
        <div className='w-full h-20 relative'>
          <label htmlFor="search"></label>
          <input type="search" name="search" id="search" placeholder='Search or start a new chat' className='text-sm h-8 w-full border-[1px] rounded-sm shadow-2xs shadow-green-300 pl-8' />
          <span className='absolute top-2 left-2'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </span>
        </div>
        <div className='w-full h-screen overflow-hidden overflow-y-auto flex flex-col items-start gap-y-3'>
          <div 
            className='w-full flex p-2 rounded-sm bg-[#ebedf0d3] items-center h-16 justify-between cursor-pointer'
            onClick={() => handleChatClick({
              id: 1,
              name: "Abdul Rauf",
              username: "rauf",
              avatar: nature
            })}
          >
            <div className='w-full h-20 flex items-center gap-x-4'>
              <div className='w-[40px] h-[40px] flex items-center justify-center border border-gray-600 rounded-full'>
                <img src={nature} alt="dp" className='w-[39px] h-[39px] rounded-full object-cover' />
              </div>
              <div className='flex flex-col gap-x-1 items-start'>
                <h3 className='font-[500] text-sm'>Abdul Rauf</h3>
                <p></p>
              </div>
            </div>
            <p className='text-xs text-gray-600'>Today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;