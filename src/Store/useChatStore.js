import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';
import { encryptMessage } from "../lib/encryption";
const SECRET_KEY = "my_secret_key_123";



export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    typingUsers: [],


    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.respond?.data?.message);
        }
        finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        }
        finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            // const encryptedtext = encryptMessage(messageData.text);
            // const encryptedData = {...messageData, text: encryptedtext};
            let dataToSend = { ...messageData };
            if (messageData.text && messageData.text.trim() !== "") {
                dataToSend.text = encryptMessage(messageData.text);
            } else {
                // Remove text field if empty, or set as empty string
                delete dataToSend.text;
                // Or: dataToSend.text = "";
            }
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, dataToSend);
            set({ messages: [...messages, res.data] })
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;
            set({
                messages: [...get().messages, newMessage],
            });
        });
    },


    unsubcribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    getSuggestions: async (recentMessages) => {
        try {
            const res = await axiosInstance.post("/messages/suggestions", { recentMessages });
            return res.data;
        } catch (error) {
            toast.error(error.response.data.message);
            console.error("Error fetching suggestions:", error);
            return [];
        }
    },

    subscribeToTyping : () => {
        // const {selectedUser} = get();
        // if(!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        if(!socket) return;
        
        socket.on("typing", ({from}) => {
            console.log("recieved typing form", from);
            
            set((state) => ({
                typingUsers: [...new Set([...state.typingUsers, from])]
            }));
        });

        socket.on("stopTyping", ({from}) => {
            console.log("recieved stop typing from", from);
            set((state) => ({
                typingUsers: state.typingUsers.filter((id) => id !== from)
            }));
        });
    },


    setSelectedUser: (selectedUser) => set({ selectedUser }),


}))