import axios from 'axios';

export const axiosInstance = axios.create({
    // baseURL: 'http://localhost:3000/api',
    baseURL: 'https://chatapp-backend-x2cy.onrender.com/api',
    withCredentials: true,
})