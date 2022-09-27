import { AxiosConfig, AxiosOptions, UserType } from "./AppTypes";

// Convert a normal function to a 'debounced' function
export const debounce = function (
  func: Function,
  delay: number = 500,
  context?: any
) {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};

// Optimization method to cache and retrieve the results
// of pure functions, instead of recalculating again
export const memoize = function (func: Function) {
  // Each memoized fn has its own separate cache
  const cachedResults: any = {};

  return (...args: any[]) => {
    // To generate a unique key for each input args array
    const argsKey = JSON.stringify(args);
    // console.log(
    //   cachedResults[argsKey] ? "Retrieving from cache..." : "Calculating..."
    // );

    // Retrieve result from cache if present, else calculate
    const result: any = cachedResults[argsKey] || func(...args);

    // If result isn't saved in cache, save it for later use
    if (!cachedResults[argsKey]) cachedResults[argsKey] = result;

    return result;
  };
};

// Truncate a sentence/string
export const truncateString = memoize(
  (
    str: string | null,
    limit: number | null,
    index: number | null
  ) => {
    if (!str || !limit || !index) return "";
    return str.length > limit ? `${str.substring(0, index)}...` : str;
  }
);

// Truncate each word of a sentence/string
export const truncateWords = (
  sentence: string | null,
  limit: number | null,
  index: number | null
) => {
  if (!sentence || !limit || !index) return "";
  const words = sentence.split(" ");
  return words
    .map((word) =>
      word.length > limit ? `${word.substring(0, index)}...` : word
    )
    .join(" ");
};

export const getOneToOneChatReceiver = memoize(
  (loggedInUser: UserType, chatUsers: UserType[]) => {
    if (!chatUsers?.length || !loggedInUser) return;
    return loggedInUser._id !== chatUsers[0]?._id ? chatUsers[0] : chatUsers[1];
  }
);

export const msgTimeStringOf = memoize((msgDate: Date) => {
  if (!msgDate) return "";
  let hours = msgDate.getHours();
  let minutes = msgDate.getMinutes();
  const am_or_pm = hours >= 12 ? " pm" : " am";
  hours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours}:${minutes < 10 ? "0" : ""}${minutes}${am_or_pm}`;
});

export const dateStringOf = memoize((date: Date) => {
  return date
    ? `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
    : "";
});

// Impure function, so can't memoize
export const msgDateStringOf = (currDate: Date) => {
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

export const parseInnerHTML = (innerHTML: string) => {
  return (
    innerHTML
      ?.replaceAll("<br>", "")
      .replaceAll("&nbsp;", " ")
      .replaceAll("<div>", "")
      .replaceAll("</div>", "")
      .trim() || ""
  );
};

export const setCaretPosition = (node: HTMLElement) => {
  node?.focus();
  const lastTextNode: ChildNode | null = node?.lastChild;
  if (!lastTextNode) return;
  console.log("lastTextNode", lastTextNode);
  const caret = lastTextNode.textContent?.length || 0;
  const range = document.createRange();
  range.setStart(lastTextNode, caret);
  range.setEnd(lastTextNode, caret);
  const sel: Selection | null = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
};

export const getAxiosConfig = (options: AxiosOptions) => {
  if (!options) return;
  const { loggedInUser, formData, blob } = options;
  const config: AxiosConfig = {
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

export const getFileSizeString = memoize((fileSize: number) => {
  return !fileSize
    ? ""
    : fileSize > ONE_MB
    ? (fileSize / ONE_MB).toFixed(1) + " MB"
    : fileSize > ONE_KB
    ? (fileSize / ONE_KB).toFixed(0) + " KB"
    : fileSize + " B";
});

export const isImageFile = memoize((filename: string) =>
  /(\.png|\.jpg|\.jpeg|\.svg|\.webp)$/.test(filename)
);

export const isImageOrGifFile = memoize((filename: string) =>
  /(\.png|\.jpg|\.jpeg|\.svg|\.gif|\.webp)$/.test(filename)
);
