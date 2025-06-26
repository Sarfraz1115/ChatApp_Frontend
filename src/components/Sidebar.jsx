import React, { useEffect, useState } from 'react'
import { useChatStore } from '../Store/useChatStore';
import { useAuthStore } from '../Store/useAuthStore';
import SidebarSkeleton from './skeletons/SidebarSkeleton';
import { Users } from 'lucide-react';

const Sidebar = () => {
    const { getUsers, users, selectedUser, setSelectedUser, isUserLoading, unreadCounts } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const {typingUsers} = useChatStore();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);

    // Function to handle typing indicator
    useEffect(() => {

        useChatStore.getState().subscribeToTyping();
    }, []);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    // Filter users based on online status if showOnlineOnly is true
    // const filteredUsers = showOnlineOnly ? users.filter(user => onlineUsers.includes(user._id)) : users;
    let filteredUsers = showOnlineOnly 
    ? users.filter(user => onlineUsers.includes(user._id))
    : users.slice();

    // Sort users to show the selected user at the top
    filteredUsers.sort((a,b) => {
        const aonline = onlineUsers.includes(a._id);
        const bonline = onlineUsers.includes(b._id);
        if(aonline === bonline) return 0;

        return aonline ? -1 : 1;
    })



    if (isUserLoading) return <SidebarSkeleton />

    return (
        <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
            <div className='border-b border-base-300 w-full p-5'>
                <div className='flex items-center gap-2'>
                    <Users className='size-6' />
                    <span className='font-medium hidden lg:block'>Contacts</span>
                </div>
                {/* todo: Online filter toggle */}
                <div className="mt-3 flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={showOnlineOnly}
                            onChange={(e) => setShowOnlineOnly(e.target.checked)}
                            className="checkbox checkbox-sm"
                        />
                        <span className="text-sm">Show online only</span>
                    </label>
                    <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
                </div>
            </div>

            <div className='overflow-y-auto w-full py-3'>
                {filteredUsers.map((user) => (
                    <button
                        key={user._id}
                        onClick={() => setSelectedUser(user)}
                        className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}>
                        <div className="relative mx-auto lg:mx-0">
                            <img
                                src={user.profilepic || "/avatar.png"}
                                alt={user.name}
                                className="size-12 object-cover rounded-full" />
                            {onlineUsers.includes(user._id) && (
                                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                            )}


                            {/* Unread Messages  */}
                            {
                                unreadCounts[user._id] > 0 && (
                                    <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5'>
                                        {unreadCounts[user._id]}
                                    </span>
                                )
        }


                            {/* typing indicatore */}
                            {
                                typingUsers.map(String).includes(String(user._id)) && (
                                    <span className='absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs text-green-500'>typing...</span>
                                )
                            }

                        </div>

                        {/* User info - only visible on larger screens */}
                        <div className="hidden lg:block text-left min-w-0">
                            <div className="font-medium truncate">{user.fullName}</div>
                            <div className="text-sm text-zinc-400">
                                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                            </div>
                        </div>
                    </button>
                ))}

                {
                    filteredUsers.length === 0 && (
                        <div className='text-center text-zinc-500 py-4'>
                            No online Users
                        </div>
                    )
                }
            </div>
        </aside>
    )
}

export default Sidebar