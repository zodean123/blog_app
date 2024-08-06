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

console.log('Frontend URL:', process.env.FRONTEND_URL);

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

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(user);
    console.log(user);
  } catch (err) {
    res.status(400).json(err);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      return res.status(400).json({ message: 'User not found' });
    }

    const passok = bcrypt.compareSync(password, userDoc.password);
    if (passok) {
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
        if (err) throw err;
        res.json({
          id: userDoc._id,
          username,
          token
        });
      });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/profile', (req, res) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header must be provided' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token must be provided' });
  }

  jwt.verify(token, secret, (err, info) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.json(info);
  });
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleWare.single('file'), async (req, res) => {
  try {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header must be provided' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token must be provided' });
    }

    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }

      const { title, summary, content } = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: info.id,
      });
      res.json(postDoc);
    });
  } catch (err) {
    console.error('Error in /post route:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/post', async (req, res) => {
  try {
    const posts = await Post.find(); // Fetch all posts from the database
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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


app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
});

app.listen(PORT, () => {
  console.log(`Connection is live at port no. ${PORT}`);
  console.log(process.env.FRONTEND_URL);
});
