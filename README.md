<div align="center">

# `Chat-Zoned` MERN-Chat-App

> #### This is a [**Progressive Web App**](https://medium.com/swlh/converting-existing-react-app-to-pwa-3c7e4e773db3) built using [`MERN Stack`](https://www.mongodb.com/mern-stack), which is primarily used for `Real-time Online Chatting` (similar to Whatsapp or MS Teams). Being a PWA, this app can be installed natively on mobile and desktop devices🔥. It allows a user to perform the following major operations:-

</div>

- Register/Login/Logout/search registered users
- Create one-to-one chats, group chats
- Send/edit/delete text messages
- Add/Edit/Delete/Download files (document/image/gif/audio/video) in messages
- Group Chat features (for all group members) 
  - View group members
  - Edit group display pic/group name 
  - Exit group
- Group Chat features (only for group admins)
  - Add/remove members 
  - Make/dismiss group admin 
  - Delete group 
- Edit profile pic/profile name
- Change profile password

<div align="center">

## Deployed Links 👇

### Heroku  👉 <https://chat-zoned.herokuapp.com> 🚀
### Railway  👉 <https://chat-zoned.up.railway.app> 🚀

</div>

## Working Demo 👇

https://user-images.githubusercontent.com/66935206/184427042-8fef5d36-73b0-4be8-9645-9a349436b6ba.mp4

## Cool Features 😎

- All frequently used [pure functions](https://www.geeksforgeeks.org/pure-functions-in-javascript/#:~:text=A%20Pure%20Function%20is%20a,depends%20on%20its%20input%20arguments.) are [memoized](https://www.freecodecamp.org/news/understanding-memoize-in-javascript-51d07d19430e/) to improve app performance.
- [Debouncing](https://www.freecodecamp.org/news/javascript-debounce-example/) has been implemented for every search box in the app to improve app performance.
- [Event Delegation](https://www.geeksforgeeks.org/event-delegation-in-javascript/) has been implemented for every parent element containing an item list (messages list, user list, group member list, chat list, notification list etc.) to improve app performance.
- [Promise.all()](https://dmitripavlutin.com/promise-all/) has been used for `concurrent execution` of `independent async operations` wherever necessary (eg. concurrently deleting all group chat messages upon group chat delete), to improve app performance.
- [Code splitting](https://reactjs.org/docs/code-splitting.html) (lazy loading) has been implemented to load either homepage or chatpage based on user logged-in status.
- `Loading Skeletons` and `Circular Spinners` are displayed for all async (time consuming) API calls, for better UX.
- [Sockets](https://socket.io/) have been used not just for real-time messaging, but also for `real-time message updates` (editing/deleting message), `real-time group updates` like creating a new group, updating group name/display pic, adding/ removing members, making/dismissing group admins, exiting/deleting group etc.
- `Typing Indicators` (similar to MS Teams app) have also been implemented using sockets.
- `Real-time notifications` also implemented using sockets. Most important, all the notifications are `PERSISTED` (saved) in MongoDB, so even if a user is offline/logged out, he/she will see all the notifications after logging in.
- All new message notifications are `grouped by chat` in the UI, and the respective chat specific notification counts are displayed on each chat (similar to Whatsapp).
- The notification count after every new message delete, is `updated in real-time` for ALL OTHER USERS of that chat.
- [Emoji picker](https://www.npmjs.com/package/emoji-picker-react) has been added to new message input box, to conveniently allow the user to select all native emojis of his/her device.
- `Enter` key can be used for submitting udpated profile name/group name, or for sending a new message.
- `Shift + Enter` key can be used for adding a new line in message text content.
- The sent/updated message `PRESERVES the formatting` of the message text content.
- Edit message feature is similar to 'MS Teams edit message feature', where you can modify text content, add/remove/change attached files of that message, discard updated draft etc.
- `File preview` is displayed whenever you add/change an attachment, before sending and updating a message.
- User Passwords are `encrypted` before storing/updating them in MongoDB, using [bcryptjs](https://www.npmjs.com/package/bcryptjs), to improve security.
- User [Authorization](https://auth0.com/intro-to-iam/what-is-authorization/) is carried out by an [express middleware](https://expressjs.com/en/guide/using-middleware.html#middleware.router) using [JWT package](https://www.npmjs.com/package/jsonwebtoken), before performing ANY chatpage specific operation.
- Every user login session expires after 15 days.

## Tools Used 🛠️

### Frontend :-
- [React](https://reactjs.org/) for reusable, stateful UI components
- [Redux Toolkit](https://redux.js.org/tutorials/quick-start) for Global State Management
- [Sass](https://sass-lang.com/) for custom styling, responsive design
- [Bootstrap5](https://getbootstrap.com/) for quick styling, responsive design
- [Material UI](https://mui.com/) for dialogs, menus, alerts, toasts, tooltips, drawers, circular spinners, skeletons, chips, icons etc.
- [Lottie Files](https://lottiefiles.com/) for Animations
- [Emoji Picker](https://www.npmjs.com/package/emoji-picker-react) for adding emojis to text messages
- [Socket.io-client](https://www.npmjs.com/package/socket.io-client) for client-side socket setup and event handling
- [Axios](https://www.npmjs.com/package/axios) as an HTTP client for API calls

### Backend :-
- [Nodejs](https://nodejs.org/en/) as Backend JS Runtime
- [Express](https://expressjs.com/) as Backend Nodejs Framework
- [MongoDB](https://mongodb.com/) as Database
- [Mongoose](https://www.npmjs.com/package/mongoose) for Object Data Modeling Tool for MongoDB
- [Json Web Token](https://www.npmjs.com/package/jsonwebtoken) for User Authorization
- [Bcryptjs](https://www.npmjs.com/package/bcryptjs) for User Password Encryption and verification
- [Cloudinary package](https://www.npmjs.com/package/cloudinary) for uploading/deleting images to [cloudinary](https://cloudinary.com/)
- [AWS SDK Package](https://www.npmjs.com/package/aws-sdk) for downloading/deleting non-image files to [AWS S3](https://aws.amazon.com/s3/)
- [Multer](https://www.npmjs.com/package/multer) for uploading images temporarily to server for uploading to cloudinary 
- [Multer S3](https://www.npmjs.com/package/multer-s3) for uploading non-image files to AWS S3
- [Socket.io](https://www.npmjs.com/package/socket.io) for server-side socket setup and event handling

## Steps to Run Project Locally 💻

```bash
#Clone this repo to your local machine
git clone https://github.com/Abhishek-Sawant-98/Chat-Zoned.git

# Go to project root folder
cd Chat-Zoned
```
- Create `.env` file in root project folder and add the following environment variables (`KEY = VALUE`) 

|        **KEY**        |                                 **VALUE**                                |
|:---------------------:|:------------------------------------------------------------------------:|
|          PORT         |                        YOUR_PREFERRED_PORT_NUMBER                        |
|      MONGODB_URI      |                             YOUR_MONGODB_URI                             |
| CLOUDINARY_CLOUD_NAME |                        YOUR_CLOUDINARY_CLOUD_NAME                        |
|   CLOUDINARY_API_KEY  |                          YOUR_CLOUDINARY_API_KEY                         |
| CLOUDINARY_API_SECRET |                        YOUR_CLOUDINARY_API_SECRET                        |
|    DEFAULT_GROUP_DP   |                         YOUR_PREFERRED_IMAGE_URL                         |
|    DEFAULT_USER_DP    |                         YOUR_PREFERRED_IMAGE_URL                         |
|       JWT_SECRET      |                         YOUR_PREFERRED_JWT_SECRET                        |
|        NODE_ENV       | 'development' (While Developing)<br>or<br>'production' (While Deploying) |
|    S3_ACCESS_KEY_ID   |                         YOUR_AWS_S3_ACCESS_KEY_ID                        |
|  S3_SECRET_ACCESS_KEY |                       YOUR_AWS_S3_SECRET_ACCESS_KEY                      |
|       S3_REGION       |                         YOUR_AWS_S3_BUCKET_REGION                        |
|       S3_BUCKET       |                          YOUR_AWS_S3_BUCKET_NAME                         |

- Get `MongoDB URI` by creating a MongoDB cluster from [here](https://www.mongodb.com/)
- Get `cloudinary` related secret keys from [here](https://cloudinary.com/documentation/how_to_integrate_cloudinary)
- Get `AWS S3` related secret keys from [here](https://docs.aws.amazon.com/powershell/latest/userguide/pstools-appendix-sign-up.html)
- Next, create another `.env` file in `frontend` folder and add the following environment variables (`KEY = VALUE`) 

|            **KEY**            |                                                          **VALUE**                                                          |
|:-----------------------------:|:---------------------------------------------------------------------------------------------------------------------------:|
|   REACT_APP_SERVER_BASE_URL   | http://localhost:YOUR_PORT_NUMBER <br>(Local Development)<br>or<br>https://YOUR_DEPLOYED_SERVER_URL <br>(During Deployment) |
|   REACT_APP_DEFAULT_USER_DP   |                                                   YOUR_PREFERRED_IMAGE_URL                                                  |
|   REACT_APP_DEFAULT_GROUP_DP  |                                                   YOUR_PREFERRED_IMAGE_URL                                                  |
| REACT_APP_PLACEHOLDER_IMG_URL |                                                   YOUR_PREFERRED_IMAGE_URL                                                  |
| REACT_APP_CLOUDINARY_BASE_URL |                                                  https://res.cloudinary.com                                                 |

### Run backend
```sh
# install dependencies (in root project folder)
npm install
# serve at localhost:YOUR_PORT_NUMBER
npm start
# serve with hot reload at localhost:YOUR_PORT_NUMBER
npm run dev
```

### Run frontend
```sh
# Go to 'frontend' folder
cd frontend
# install dependencies
npm install
# serve at localhost:3000 with hot reload
npm start
# build for production
npm run build
```

- Finally, deploy it using [Heroku](https://dashboard.heroku.com/) or [Railway](https://railway.app/). Don't forget to add all the above mentioned environment variables while deploying.

## License

[MIT](LICENSE) © Abhishek Sawant

---

<div align="center">

### If you liked this app, show some ❤️ by starring 🌟 the repository 🙂

</div>

