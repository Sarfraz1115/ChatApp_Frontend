import React from 'react'
import { useChatStore } from '../Store/useChatStore'
import { useEffect } from 'react';
import ChatHeader from './ChatHeader'
import MessageInput from './MessageInput'
import MessageSkeleton from './skeletons/MessageSkeleton'
import { useAuthStore } from '../Store/useAuthStore';
import { formatMessageTime } from '../lib/utils';
import {decryptMessage} from '../lib/encryption';
import { useRef } from 'react';


const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubcribeFromMessages } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndref = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubcribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubcribeFromMessages]);

  useEffect(() => {
    if (messageEndref.current && messages) {
      messageEndref.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className='flex-1 flex flex-col overflow-auto'>
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    )
  }





  return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader />

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message) => {
          const decryptedtext = message.text ? decryptMessage(message.text) : '';
          return (
            <div key={message.id} className={`chat ${message.senderId === authUser._id ? 'chat-end' : 'chat-start'}`}
              ref={messageEndref}>
              <div className='chat-image avatar'>
                <div className='size-10 rounded-full border'>
                  <img src={message.senderId === authUser._id ? authUser.profilepic || "/avatar.png" : selectedUser.profilepic || "/avatar.png"}
                    alt="profile pic" />
                </div>
              </div>

              <div className='chat-header mb-1'>
                <time className='text-xs opacity-50 ml-1'>
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              <div className='chat-bubble flex flex-col'>
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{decryptedtext}</p>}
              </div>
            </div>
          )
        })}

      </div>


      <MessageInput />

    </div>
  )
}

export default ChatContainer