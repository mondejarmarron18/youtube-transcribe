import axios from "axios";

export default axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
});

export const translateApi = axios.create({
  baseURL: "http://localhost:4000",
});
