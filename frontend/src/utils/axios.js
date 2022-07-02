import axios from "axios";

export default axios.create({
  baseURL: "https://chat-zoned.herokuapp.com",
});
