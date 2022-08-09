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
  // Each memoized fn has its own separate cache
  const cachedResults = {};

  return (...args) => {
    // To generate a unique key for each input args array
    const argsKey = JSON.stringify(args);
    // console.log(
    //   cachedResults[argsKey] ? "Retrieving from cache..." : "Calculating..."
    // );

    // Retrieve result from cache if present, else calculate
    const result = cachedResults[argsKey] || func(...args);

    // If result isn't saved in cache, save it for later use
    if (!cachedResults[argsKey]) cachedResults[argsKey] = result;

    return result;
  };
};

// Truncate a sentence/string
export const truncateString = memoize((str, limit, index) => {
  if (!str || !limit || !index) return "";
  return str.length > limit ? `${str.substring(0, index)}...` : str;
});

export const getOneToOneChatReceiver = memoize((loggedInUser, chatUsers) => {
  if (!chatUsers?.length || !loggedInUser) return;
  return loggedInUser._id !== chatUsers[0]._id ? chatUsers[0] : chatUsers[1];
});

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

// Impure function, so can't memoize
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

export const parseInnerHTML = (innerHTML) => {
  return (
    innerHTML
      ?.replaceAll("<br>", "")
      .replaceAll("&nbsp;", " ")
      .replaceAll("<div>", "")
      .replaceAll("</div>", "")
      .trim() || ""
  );
};

export const setCaretPosition = (node) => {
  node?.focus();
  const lastTextNode = node?.lastChild;
  if (!lastTextNode) return;
  const caret = lastTextNode.data?.length || 0;
  const range = document.createRange();
  range.setStart(lastTextNode, caret);
  range.setEnd(lastTextNode, caret);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
};

export const getAxiosConfig = (options) => {
  if (!options) return;
  const { loggedInUser, formData, blob } = options;
  const config = {
    headers: {
      "Content-Type": formData ? "multipart/form-data" : "application/json",
    },
  };
  if (blob) config.responseType = "blob";
  if (loggedInUser)
    config.headers.Authorization = `Bearer ${loggedInUser.token}`;

  return config;
};

// In bytes
export const ONE_KB = 1024;
export const ONE_MB = 1048576;
export const TWO_MB = 2097152;
export const FIVE_MB = 5242880;

export const getFileSizeString = memoize((fileSize) => {
  return !fileSize
    ? ""
    : fileSize > ONE_MB
    ? (fileSize / ONE_MB).toFixed(1) + " MB"
    : fileSize > ONE_KB
    ? (fileSize / ONE_KB).toFixed(0) + " KB"
    : fileSize + " B";
});

export const isImageFile = memoize((filename) =>
  /(\.png|\.jpg|\.jpeg|\.svg|\.webp)$/.test(filename)
);

export const isImageOrGifFile = memoize((filename) =>
  /(\.png|\.jpg|\.jpeg|\.svg|\.gif|\.webp)$/.test(filename)
);
