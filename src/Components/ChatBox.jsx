import React, { useState, useRef, useEffect } from 'react';
import whatsappbg from '/Images/WhatsApp_bg.jpeg';
import rauf from "/Images/WhatsApp Image 2025-04-06 at 11.11.45_c0670282.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";

const ChatBox = ({ selectedChat, onBack, isMobile }) => {
  // State management
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatMessages');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Hello there!', sent: false, time: '10:30 AM', type: 'text' },
      { id: 2, text: 'Hi! How are you?', sent: true, time: '10:32 AM', type: 'text' }
    ];
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, messageId: null });
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState(null);
  const [fileToSend, setFileToSend] = useState(null);
  const [emoji, setEmoji] = useState([]);
  const [isEmojiVisible, setIsEmojiVisible] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiContainerRef = useRef(null);
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // Clean up
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current?.stop();
      }
      clearInterval(timerRef.current);
      if (currentlyPlayingAudio) {
        currentlyPlayingAudio.pause();
      }
    };
  }, [currentlyPlayingAudio]);

  // Handle click outside emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiContainerRef.current && !emojiContainerRef.current.contains(event.target)) {
        setIsEmojiVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle context menu
  const handleContextMenu = (e, messageId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      messageId
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  useEffect(() => {
    document.addEventListener('click', closeContextMenu);
    return () => document.removeEventListener('click', closeContextMenu);
  }, []);

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newMessage = {
          id: Date.now(),
          text: 'Voice message',
          audioUrl,
          sent: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'audio',
          duration: recordingTime,
          isPlaying: false
        };
        
        setMessages(prev => [...prev, newMessage]);
        setRecordingTime(0);
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: 'Thanks for your voice message!',
            sent: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text'
          }]);
        }, 1000);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Microphone access was denied. Please allow microphone access to record voice messages.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      clearInterval(timerRef.current);
      setIsRecording(false);
    }
  };

  // Audio playback functions
  const toggleAudioPlayback = (audioUrl, messageId) => {
    if (currentlyPlayingAudio) {
      currentlyPlayingAudio.pause();
      setCurrentlyPlayingAudio(null);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isPlaying: false } : msg
      ));
      
      if (currentlyPlayingAudio.src === audioUrl) {
        return; // Clicked on the currently playing audio, just stop it
      }
    }
    
    const audio = new Audio(audioUrl);
    audio.onended = () => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isPlaying: false } : msg
      ));
      setCurrentlyPlayingAudio(null);
    };
    
    audio.play();
    setCurrentlyPlayingAudio(audio);
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isPlaying: true } : msg
    ));
  };

  // Message functions
  const handleSendMessage = () => {
    if (message.trim() || fileToSend) {
      let newMessage;
      
      if (fileToSend) {
        // Handle file message
        const fileUrl = URL.createObjectURL(fileToSend);
        
        if (fileToSend.type.startsWith('image/')) {
          // For images, create an image message
          newMessage = {
            id: Date.now(),
            imageUrl: fileUrl,
            sent: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'image'
          };
        } else {
          // For other files, create a file message
          newMessage = {
            id: Date.now(),
            text: fileToSend.name,
            fileUrl,
            fileType: fileToSend.type,
            sent: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'file'
          };
        }
      } else {
        // Handle text message
        newMessage = {
          id: Date.now(),
          text: message,
          sent: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
        };
      }
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      setFileToSend(null);
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: fileToSend ? 'Thanks for the file!' : 'Thanks for your message!',
          sent: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
        }]);
      }, 1000);
    }
  };

  const deleteMessage = (id) => {
    const messageToDelete = messages.find(msg => msg.id === id);
    
    // Clean up resources
    if (messageToDelete?.type === 'audio' && messageToDelete.audioUrl) {
      URL.revokeObjectURL(messageToDelete.audioUrl);
    }
    if (messageToDelete?.type === 'file' && messageToDelete.fileUrl) {
      URL.revokeObjectURL(messageToDelete.fileUrl);
    }
    if (messageToDelete?.type === 'image' && messageToDelete.imageUrl) {
      URL.revokeObjectURL(messageToDelete.imageUrl);
    }
    
    // Stop audio if it's playing
    if (messageToDelete?.isPlaying && currentlyPlayingAudio) {
      currentlyPlayingAudio.pause();
      setCurrentlyPlayingAudio(null);
    }
    
    setMessages(prev => prev.filter(msg => msg.id !== id));
    closeContextMenu();
  };

  const clearAllMessages = () => {
    messages.forEach(msg => {
      if (msg.type === 'audio' && msg.audioUrl) {
        URL.revokeObjectURL(msg.audioUrl);
      }
      if (msg.type === 'file' && msg.fileUrl) {
        URL.revokeObjectURL(msg.fileUrl);
      }
      if (msg.type === 'image' && msg.imageUrl) {
        URL.revokeObjectURL(msg.imageUrl);
      }
    });
    setMessages([]);
  };

  // Emoji functions
  const fetchEmojis = async () => {
    try {
      const api_Key = 'ade42024bbec5f21940f73fb061e0afbdfd00359';
      const res = await fetch(`https://emoji-api.com/emojis?access_key=${api_Key}`);
      const data = await res.json();
      setEmoji(data);
    } catch (error) {
      console.error("Failed to fetch emojis", error);
    }
  };

  const toggleEmojiPicker = () => {
    if (!isEmojiVisible && emoji.length === 0) {
      fetchEmojis();
    }
    setIsEmojiVisible(prev => !prev);
  };

  const addEmoji = (emojiChar) => {
    setMessage(prev => prev + emojiChar);
  };

  // File handling functions
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileToSend(file);
  };

  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  // Helper functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? `${mins}m ` : ''}${secs}s`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (message.trim() || fileToSend)) handleSendMessage();
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('video/')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      );
    } else if (fileType === 'application/pdf') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
        </svg>
      );
    }
  };

  return (
    <div 
      className={`${isMobile ? 'w-full' : 'w-full'} h-[calc(100vh-60px)] bg-cover relative flex flex-col overflow-y-auto scrollbar-custom`} 
      style={{ backgroundImage: `url(${whatsappbg})`, backgroundSize: 'contain', backgroundPosition: 'center' }}
      ref={chatContainerRef}
    >

      {/* Mobile header */}
      {isMobile && (
        <div className='w-full h-14 bg-[#008069] flex items-center px-4'>
          <button onClick={onBack} className='text-white mr-4'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h2 className='text-white font-medium'>{selectedChat?.name || 'Chat'}</h2>
        </div>
      )}
      
      {/* Chat header */}
      <div className='w-full h-14 bg-white border-b flex items-center justify-between px-4'>
        <div className='flex items-center gap-x-4'>
          <div className='w-9 h-9 border rounded-full border-gray-300 overflow-hidden'>
            <img src={selectedChat?.avatar || rauf} className='w-9 h-9 rounded-full' alt="" />
          </div>
          <div className='flex items-start flex-col gap-y-[0.5px]'>
            <h3 className='font-[500] text-sm'>{selectedChat?.name || 'Abdul Rauf'}</h3>
            <p className='text-black opacity-60 text-xs'>{selectedChat?.username || 'rauf'}</p>
          </div>
        </div>
        <div className='flex items-center gap-x-5'>
          <div className='w-[100px] bg-gray-100 h-8 flex items-center justify-around rounded-lg'>
            <button>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </button>
            <hr className='w-5 h-8 rotate-90 opacity-50' />
            <button>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
            </button>
          </div>
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div className='flex-1 overflow-y-auto p-4 pb-16' ref={chatContainerRef}>
        <div className='flex flex-col gap-3'>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sent ? 'justify-end' : 'justify-start'} group`}
              onContextMenu={(e) => handleContextMenu(e, msg.id)}
            >
              <div className="relative max-w-[80%]">
                {msg.type === 'text' ? (
                  <div className={`rounded-lg px-4 py-3 ${msg.sent ? 'bg-[#d9fdd3]' : 'bg-white'}`}
                    style={{ 
                      minWidth: '200px',
                      maxWidth: '100%',
                      wordBreak: 'break-word'
                    }}
                  >
                    <p className='text-sm whitespace-pre-wrap'>
                      {msg.text}
                    </p>
                    <div className="flex justify-end items-center mt-1">
                      <span className='text-xs text-gray-500'>{msg.time}</span>
                    </div>
                  </div>
                ) : msg.type === 'audio' ? (
                  <div className={`rounded-lg px-4 py-3 ${msg.sent ? 'bg-[#d9fdd3]' : 'bg-white'}`}
                    style={{ minWidth: '200px' }}
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleAudioPlayback(msg.audioUrl, msg.id)}
                        className="p-2 rounded-full bg-[#25D366] text-white flex-shrink-0"
                      >
                        {msg.isPlaying ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 overflow-hidden">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-[#25D366] h-1.5 rounded-full" 
                            style={{ width: `${Math.min(100, (msg.duration / 60) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">{formatTime(msg.duration)}</span>
                          <span className='text-xs text-gray-500'>{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : msg.type === 'image' ? (
                  <div className={`rounded-lg overflow-hidden ${msg.sent ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
                    <div className="p-1">
                      <img 
                        src={msg.imageUrl} 
                        alt="Sent image" 
                        className="max-w-full max-h-60 rounded-lg"
                      />
                    </div>
                    <div className="px-2 pb-1 flex justify-end">
                      <span className='text-xs text-gray-500'>{msg.time}</span>
                    </div>
                  </div>
                ) : msg.type === 'file' ? (
                  <div className={`rounded-lg px-4 py-3 ${msg.sent ? 'bg-[#d9fdd3]' : 'bg-white'}`}
                    style={{ minWidth: '200px' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-500">
                        {getFileIcon(msg.fileType)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{msg.text}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">{msg.fileType.split('/')[1] || 'File'}</span>
                          <span className='text-xs text-gray-500'>{msg.time}</span>
                        </div>
                      </div>
                      <a 
                        href={msg.fileUrl} 
                        download={msg.text}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Context menu */}
      {contextMenu.visible && (
        <div 
          className="fixed bg-white shadow-lg rounded-md py-1 z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center"
            onClick={() => deleteMessage(contextMenu.messageId)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white p-4 rounded-lg flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <span>Recording</span>
          </div>
          <div className="text-lg font-medium">{formatTime(recordingTime)}</div>
          <button 
            onClick={stopRecording}
            className="ml-4 px-3 py-1 bg-red-500 text-white rounded"
          >
            Stop
          </button>
        </div>
      )}

      {/* Emoji picker */}
      {isEmojiVisible && (
        <div 
          ref={emojiContainerRef}
          className='absolute bottom-16 left-4 w-72 h-80 bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col z-50'
        >
          <div className='p-2 border-b border-gray-300 flex justify-between items-center'>
            <h3 className='font-medium'>Emojis</h3>
            <button 
              onClick={() => setIsEmojiVisible(false)}
              className='text-gray-500 hover:text-gray-700'
            >
              <FontAwesomeIcon icon={faXmarkCircle} />
            </button>
          </div>
          <div className='flex-1 overflow-y-auto p-2 grid grid-cols-8 gap-1'>
            {emoji.length > 0 ? (
              emoji.map((item) => (
                <button
                  key={item.slug}
                  className='text-2xl hover:bg-gray-100 rounded p-1'
                  onClick={() => addEmoji(item.character)}
                  title={item.slug}
                >
                  {item.character}
                </button>
              ))
            ) : (
              <div className='col-span-8 flex items-center justify-center h-full'>
                <p>Loading emojis...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input box */}
      <div className='w-full h-16 bg-white absolute bottom-0 flex items-center px-2 border-t'>
        {isRecording ? (
          <div className="w-full flex items-center justify-between bg-[#f0f2f5] rounded-lg px-3 py-2">
            <div className="flex-1 flex items-center gap-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 h-6 bg-gray-400 animate-wave"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.8s',
                      height: `${Math.random() * 12 + 4}px`
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">{formatTime(recordingTime)}</span>
            </div>
            <button onClick={stopRecording} className="text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ) : (
          <div className='w-full flex items-center justify-between bg-[#f0f2f5] rounded-lg px-3 py-2'>
            <div className='flex items-center gap-x-3'>
              <button 
                onClick={toggleEmojiPicker}
                className='text-gray-500 hover:text-gray-700'
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                </svg>
              </button>
              <button 
                onClick={openFileSelector}
                className='text-gray-500 hover:text-gray-700'
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                </svg>
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*, video/*, application/pdf"
              />
            </div>
            
            {fileToSend ? (
              <div className="flex-1 flex items-center gap-2 mx-2">
                {fileToSend.type.startsWith('image/') ? (
                  <div className="relative">
                    <img 
                      src={URL.createObjectURL(fileToSend)} 
                      alt="Preview" 
                      className="h-10 w-10 object-cover rounded" 
                    />
                    <button 
                      onClick={() => setFileToSend(null)}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    {getFileIcon(fileToSend.type)}
                    <span className="text-sm truncate">{fileToSend.name}</span>
                    <button 
                      onClick={() => setFileToSend(null)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='Type a message' 
                className='flex-1 bg-transparent outline-none text-sm px-4 py-2 mx-2 rounded-lg' 
              />
            )}
            
            {(message || fileToSend) ? (
              <button onClick={handleSendMessage} className='text-[#008069] hover:text-[#075e54]'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            ) : (
              <button onClick={startRecording} className={`text-gray-500 hover:text-gray-700 ${isRecording ? 'text-red-500' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Wave animation styles */}
      <style jsx>{`
        @keyframes wave {
          0%, 100% { height: 10px; }
          50% { height: 20px; }
        }
        .animate-wave {
          animation: wave 0.8s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default ChatBox;