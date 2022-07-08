import axios from "axios";

export default axios.create({
  // baseURL: "https://chat-zoned.herokuapp.com",
  baseURL: "http://localhost:5000",
});
