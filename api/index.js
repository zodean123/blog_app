const express = require('express');
const app = express();
const cors = require('cors');
const User = require("./models/user.js");
const Post = require('./models/Post.js');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const PORT = 4000;
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleWare = multer({ dest: 'uploads/' });
const fs = require('fs');
const salt = bcrypt.genSaltSync(10);
const secret = 'asdfasdgouhfgjhaslfjasdf';

require('dotenv').config();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb+srv://dipanmallick7085:dipanb660b6@cluster0.8oejhss.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

app.get("/", (req, res) => {
  res.send("Backend is Running.");
});

// Registration and Login Routes (unchanged)

// Update Post Route
app.put('/post/update', uploadMiddleWare.single('file'), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = `${path}.${ext}`;
    fs.renameSync(path, newPath);
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header must be provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token must be provided' });
  }

  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });

    const { id, title, summary, content } = req.body;

    try {
      const postDoc = await Post.findById(id);

      if (!postDoc) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);

      if (!isAuthor) {
        return res.status(403).json({ error: 'You are not the author' });
      }

      await postDoc.updateOne({
        title,
        summary,
        content,
        cover: newPath ? newPath : postDoc.cover,
      });

      return res.json(postDoc);
    } catch (error) {
      console.error('Error updating post:', error);
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  });
});

// Delete Post Route
app.delete('/post/:id', async (req, res) => {
  const { id } = req.params;

  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header must be provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token must be provided' });
  }

  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const postDoc = await Post.findById(id);

      if (!postDoc) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);

      if (!isAuthor) {
        return res.status(403).json({ error: 'You are not the author' });
      }

      await postDoc.deleteOne();

      return res.json({ message: 'Post deleted successfully', redirect: '/' });
    } catch (error) {
      console.error('Error deleting post:', error);
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  });
});

// Other Routes (unchanged)

app.listen(PORT, () => {
  console.log(`Connection is live at port no. ${PORT}`);
  console.log(process.env.FRONTEND_URL);
});
