import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:4000/api', 
    timeout: 10000, // Set a timeout of 10 seconds  
    withCredentials: true, //send cookies with requests
});