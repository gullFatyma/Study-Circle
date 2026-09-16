# StudyCircle 🎓

StudyCircle is a full-stack student collaboration platform where students can request notes, share learning resources, post public replies, and communicate privately in real time.

It provides a clean and responsive interface designed for easy academic collaboration.

## ✨ Main Features

* Secure signup and login
* JWT-based authentication
* Post requests for notes or academic help
* Filter requests by subject
* Add public replies visible to everyone
* Send private messages to the request owner
* Real-time private chat using Socket.IO
* Unread message notifications
* Sent and read message status
* Search conversations
* Upload PDF, Word and image files
* Cloudinary file storage
* Responsive desktop and mobile design
* Premium terracotta and ivory interface

## 💬 Public and Private Replies

Students can select one of two reply types:

### Public Reply

A public reply is visible to everyone viewing the request. It is useful for answers, helpful links and general information.

### Private Reply

A private reply starts a conversation between the student and the request owner. Both users can continue chatting from the Messages section.

## 🔔 Real-Time Messaging

StudyCircle uses Socket.IO to provide:

* Instant private messages
* Real-time unread notifications
* Unread counts for each conversation
* Sent and read receipts
* Automatic updates without refreshing the page

## 📎 File Sharing

Students can attach study material while replying or chatting.

Supported file types:

* PDF
* DOC
* DOCX
* JPG
* JPEG
* PNG

Files are uploaded securely to Cloudinary.

## 🛠️ Technologies Used

### Frontend

* React
* Vite
* React Router
* Axios
* Socket.IO Client
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Socket.IO
* Multer
* Cloudinary

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd Study_circle
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Create the Backend Environment File

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Never upload the `.env` file to GitHub.

### 4. Start the Backend

```bash
npm run dev
```

The backend will run at:

```text
http://localhost:5000
```

### 5. Install Frontend Dependencies

Open another terminal:

```bash
cd client
npm install
```

### 6. Start the Frontend

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

## 📖 How StudyCircle Works

1. A student creates an account or logs in.
2. The student posts a request for notes or academic help.
3. Other students can view and filter available requests.
4. A student can send a public reply or start a private conversation.
5. Private messages appear instantly through Socket.IO.
6. Shared files are uploaded to Cloudinary.
7. Messages are marked as read when the conversation is opened.

## 🔐 Security

StudyCircle includes:

* Password hashing with bcrypt
* JWT-protected backend routes
* Authenticated Socket.IO connections
* Private conversation authorization
* File type and size validation
* Environment variables for sensitive credentials

## 📱 Responsive Design

The interface works across:

* Desktop computers
* Laptops
* Tablets
* Mobile devices

The mobile messaging screen provides a focused chat experience with responsive navigation and conversation controls.

## 🌱 Future Improvements

* Online and offline user status
* Typing indicators
* Message deletion
* Profile image upload
* Password reset
* Email verification
* Request categories
* Dark theme

## 👩‍💻 Author

Developed by **Gull Fatima**

Built as a MERN stack project to make student collaboration simple, organized and helpful.

---

⭐ If you find this project useful, consider giving the repository a star.
