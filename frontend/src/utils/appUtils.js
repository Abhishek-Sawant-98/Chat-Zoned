// Convert a normal function to a 'debounced' function
export const debounce = (func, delay = 500) => {
  let timer;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// Truncate a sentence/string
export const truncateString = (str, limit, index) => {
  if (!str || !limit || !index) return;
  return str.length > limit ? `${str.substring(0, index)}...` : str;
};

// Truncate each word of a sentence/string
export const truncateWords = (sentence, limit, index) => {
  if (!sentence || !limit || !index) return "";
  const words = sentence.split(" ");
  return words
    .map((word) =>
      word.length > limit ? `${word.substring(0, index)}...` : word
    )
    .join(" ");
};

export const getOneOnOneChatReceiver = (loggedInUser, chatUsers) => {
  if (!chatUsers?.length || !loggedInUser) return;
  return loggedInUser._id !== chatUsers[0]._id ? chatUsers[0] : chatUsers[1];
};

export const DEFAULT_USER_DP =
  "https://res.cloudinary.com/abhi-sawant/image/upload/v1653670527/user_dqzjdz.png";

export const DEFAULT_GROUP_DP =
  "https://res.cloudinary.com/abhi-sawant/image/upload/v1654599490/group_mbuvht.png";
