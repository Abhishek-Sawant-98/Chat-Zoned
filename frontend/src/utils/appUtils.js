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

// Optimization method to cache and retrieve the results
// of pure functions, instead of recalculating again
export const memoize = (func) => {
  const cachedResults = {};

  return (...args) => {
    // To generate a unique key for each input args array
    const argsKey = JSON.stringify(...args);

    // For the 1st time, calculate and cache the new result
    if (!cachedResults[argsKey]) {
      cachedResults[argsKey] = func(...args);
    }
    // Else retrieve and return the old cached result
    return cachedResults[argsKey];
  };
};

// Truncate a sentence/string
export const truncateString = memoize((str, limit, index) => {
  if (!str || !limit || !index) return "";
  return str.length > limit ? `${str.substring(0, index)}...` : str;
});

// Can't memoize as it's an impure function
export const getOneOnOneChatReceiver = (loggedInUser, chatUsers) => {
  if (!chatUsers?.length || !loggedInUser) return;
  return loggedInUser._id !== chatUsers[0]._id ? chatUsers[0] : chatUsers[1];
};

export const msgTimeStringOf = memoize((msgDate) => {
  if (!msgDate) return "";
  let hours = msgDate.getHours();
  let minutes = msgDate.getMinutes();
  const am_or_pm = hours >= 12 ? " pm" : " am";
  hours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours}:${minutes < 10 ? "0" : ""}${minutes}${am_or_pm}`;
});

export const dateStringOf = memoize((date) => {
  return date
    ? `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
    : "";
});

// Impure function
export const msgDateStringOf = (currDate) => {
  if (!currDate) return "";
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const today = new Date();
  const yesterday = new Date(
    today.setTime(today.getTime() - 24 * 60 * 60 * 1000)
  );

  return dateStringOf(currDate) === dateStringOf(new Date())
    ? "Today"
    : dateStringOf(currDate) === dateStringOf(yesterday)
    ? "Yesterday"
    : `${currDate.getDate()} ${
        months[currDate.getMonth()]
      } ${currDate.getFullYear()}`;
};

// In bytes
export const ONE_KB = 1024;
export const ONE_MB = 1048576;
export const TWO_MB = 2097152;
export const FIVE_MB = 5242880;

export const isImageFile = (filename) =>
  /(\.png|\.jpg|\.jpeg|\.svg|\.webp)$/.test(filename);

export const isImageOrGifFile = (filename) =>
  /(\.png|\.jpg|\.jpeg|\.svg|\.gif|\.webp)$/.test(filename);
