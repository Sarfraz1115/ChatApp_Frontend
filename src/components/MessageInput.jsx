import React, { useRef, useState } from 'react'
import { useChatStore } from '../Store/useChatStore';
import { Image, X, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../Store/useAuthStore';
import { Socket } from 'socket.io-client';

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagepreview, setimagepreivew] = useState(null);
  const fileInputRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const { sendMessage, messages, getSuggestions, selectedUser } = useChatStore();
  const {socket} = useAuthStore();
  const typingTimeoutRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setimagepreivew(reader.result);
    }
    reader.readAsDataURL(file);
  }


  const removeImage = () => {
    setimagepreivew(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagepreview) {
      toast.error("Please enter a message or select an image");
      return;
    }

    try {
      await sendMessage({ text: text.trim(), image: imagepreview, });
      // clear form
      setText("");
      setimagepreivew(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to sending message:", error);
      toast.error("Failed to send message");
    }
  }

  const handleSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      // use last 10 messages from both chats
      const recentMessages = messages.slice(-5);
      const result = await getSuggestions(recentMessages);
      setSuggestions(result);

    } catch (error) {
      toast.error("failed to get suggestions");
      console.error("Error fetching suggestions:", error);
    }
    setLoadingSuggestions(false);
  }

  const handleInputChange = (e) => {
    setText(e.target.value);
    if(socket && selectedUser){
      socket.emit("typing", {to: selectedUser._id});
    }
    // emit stoptyping after 2 or 3 seconds of inactivity
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if(socket && selectedUser){
        socket.emit("stopTyping", {to: selectedUser._id});
      }
    }, 1500);
  };



  return (
    <div className='p-4 w-full'>
      {imagepreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagepreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700" />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button">
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className='flex items-center gap-2'>
        <div className='flex-1 flex gap-2'>
          <input type="text"
            className='w-full input input-bordered rounded-lg input-sm sm:input-md'
            placeholder='Type a message...'
            value={text}
            onChange={handleInputChange} />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange} />

          <button type='button'
            className={`hidden sm:flex btn btn-circle ${imagepreview ? 'text-emerald-500' : 'text-zinc-400'}`}
            onClick={() => fileInputRef.current?.click()}>

            <Image size={20} />
          </button>
        </div>

        <button className='btn btn-sm btn-circle' onClick={handleSuggestions} title='Suggest reply'
          type='button' disabled={loadingSuggestions}>
          <Sparkles size={20} />
        </button>

        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagepreview}>
          <Send size={20} />
        </button>
      </form>
      {/* suggestions */}
      {loadingSuggestions && <div className='mt-2 text-sm text-gray-500'>Loading Suggestions</div>}
      {suggestions.length > 0 && (
        <div className='mt-2 flex flex-col gap-1'>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Suggestions</span>
            <button
              type="button"
              className="btn btn-xs btn-ghost text-red-500"
              onClick={() => setSuggestions([])}
              title="Clear suggestions"
            >
              <X size={16} />
            </button>
          </div>
          {suggestions.map((s, i) => (
            <button
              key={i}
              className='btn btn-xs btn-outline text-left'
              onClick={() => setText(s)}
              type='button'
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default MessageInput