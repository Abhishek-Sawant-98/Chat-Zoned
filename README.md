# `Chat-Zoned` MERN-Chat-App

> This is a [**Progressive Web App**](https://medium.com/swlh/converting-existing-react-app-to-pwa-3c7e4e773db3) built using [`MERN Stack`](https://www.mongodb.com/mern-stack), which is primarily used for Real-time Online Chatting (similar to Whatsapp). This app allows a user to perform the following major operations:-

- Register/Login/Logout/search registered users
- Create one-to-one chats, group chats
- Send/edit/delete text messages
- Add/Edit/Delete files (document/image/gif/audio/video) in messages
- View group chat members (any group member can)
- Add/remove group members (only group admins can)
- Make/dismiss group admin (only admins can)
- Exit group chat (any member can)
- Delete group chat (only admins can)
- Edit group display pic/group name (any member can)
- Edit profile pic/profile name
- Change profile password

> Deployed App 👉 <https://chat-zoned.herokuapp.com> 🚀 (it can be installed natively on mobile and desktop devices).

## Tools Used (Frontend)

- [React](https://reactjs.org/) for reusable, stateful UI components
- [Redux Toolkit](https://redux.js.org/tutorials/quick-start) for Global State Management
- [Sass](https://sass-lang.com/) for custom styling, responsive design
- [Bootstrap5](https://getbootstrap.com/) for quick styling, responsive design
- [Material UI](https://mui.com/) for dialogs, menus, alerts, toasts, tooltips, drawers, circular spinners, skeletons, chips, icons etc.
- [Lottie Files](https://lottiefiles.com/) for Animations
- [Emoji Picker](https://www.npmjs.com/package/emoji-picker-react) for adding emojis to text messages
- [Socket.io-client](https://www.npmjs.com/package/socket.io-client) for client-side socket setup and event handling
- [Axios](https://www.npmjs.com/package/axios) for API calls

## Tools Used (Backend)

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

## Steps to Run Project Locally

- Install backend dependencies: run `npm install` in root project folder
- Install frontend dependencies: run `cd frontend` (to go to **frontend** folder) and then run `npm install`
- Create **.env** file in root project folder and add the following key value pairs (`KEY = VALUE`)

<table>
  <tr>
    <th>KEY</th>
    <th>VALUE</th>
  </tr>
  <tr align="center">
    <td>PORT</td>
    <td>YOUR_PREFERRED_PORT_NUMBER</td>
  </tr>
  <tr align="center">
    <td>MONGODB_URI</td>
    <td>YOUR_MONGODB_URI</td>
  </tr>
  <tr align="center">
    <td>CLOUDINARY_CLOUD_NAME</td>
    <td>YOUR_CLOUDINARY_CLOUD_NAME</td>
  </tr>
  <tr align="center">
    <td>CLOUDINARY_API_KEY</td>
    <td>YOUR_CLOUDINARY_API_KEY</td>
  </tr>
  <tr align="center">
    <td>CLOUDINARY_API_SECRET</td>
    <td>YOUR_CLOUDINARY_API_SECRET</td>
  </tr>
  <tr align="center">
    <td>DEFAULT_GROUP_DP</td>
    <td>YOUR_PREFERRED_IMAGE_URL</td>
  </tr>
  <tr align="center">
    <td>DEFAULT_USER_DP</td>
    <td>YOUR_PREFERRED_IMAGE_URL</td>
  </tr>
  <tr align="center">
    <td>JWT_SECRET</td>
    <td>YOUR_PREFERRED_JWT_SECRET</td>
  </tr>
  <tr align="center">
    <td>NODE_ENV</td>
    <td>'development' (While developing)<br>or<br>'production' (While deploying)</td>
  </tr>
  <tr align="center">
    <td>S3_ACCESS_KEY_ID</td>
    <td>YOUR_AWS_S3_ACCESS_KEY_ID</td>
  </tr>
  <tr align="center">
    <td>S3_SECRET_ACCESS_KEY</td>
    <td>YOUR_AWS_S3_SECRET_ACCESS_KEY</td>
  </tr>
  <tr align="center">
    <td>S3_REGION</td>
    <td>YOUR_AWS_S3_BUCKET_REGION</td>
  </tr>
  <tr align="center">
    <td>S3_BUCKET</td>
    <td>YOUR_AWS_S3_BUCKET_NAME</td>
  </tr>
</table>

- Get `cloudinary` related secret keys from [here](https://cloudinary.com/documentation/how_to_integrate_cloudinary)
- Get `AWS S3` related secret keys from [here](https://docs.aws.amazon.com/powershell/latest/userguide/pstools-appendix-sign-up.html)
- Next, create another **.env** file in **frontend** folder and add the following key value pairs (`KEY = VALUE`)

<table>
  <tr>
    <th>KEY</th>
    <th>VALUE</th>
  </tr>
  <tr align="center">
    <td>REACT_APP_SERVER_BASE_URL</td>
    <td>http://localhost:YOUR_PORT_NUMBER (Local Development)<br>or<br>https://YOUR_DEPLOYED_SERVER_URL (During Deployment)</td>
  </tr>
  <tr align="center">
    <td>REACT_APP_DEFAULT_USER_DP</td>
    <td>YOUR_PREFERRED_IMAGE_URL</td>
  </tr>
  <tr align="center">
    <td>REACT_APP_DEFAULT_GROUP_DP</td>
    <td>YOUR_PREFERRED_IMAGE_URL</td>
  </tr>
  <tr align="center">
    <td>REACT_APP_PLACEHOLDER_IMG_URL</td>
    <td>YOUR_PREFERRED_IMAGE_URL</td>
  </tr>
  <tr align="center">
    <td>REACT_APP_CLOUDINARY_BASE_URL</td>
    <td>https://res.cloudinary.com</td>
  </tr>
</table>

- Run server in development mode: `npm run dev` in root project folder
- Run frontend app in development mode: `cd frontend` => `npm start`
- Build frontend project for production: `cd frontend` => `npm run build`
