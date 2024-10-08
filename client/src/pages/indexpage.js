import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import Post from '../Post';

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/post`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(posts => setPosts(posts))
      .catch(error => console.error('Error fetching posts:', error));
  }, []);

  async function handleDelete(id, authorId) {
    // console.log(userInfo);
    // console.log(authorId);
    if (String(userInfo.id).trim() !== String(authorId).trim()) {
      console.log('Condition executed because ids do not match');
      setShowModal(true);
      return;
    }
  
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/post/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userInfo.token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    });
  
    if (response.ok) {
      setPosts(posts.filter(post => post._id !== id));
    } else {
      const errorData = await response.json();
      console.error("Error deleting post:", errorData.error);
      setModalMessage(errorData.error || 'Error deleting post');
      setShowModal(true);
    }
  }
  

  return (
    <>
      <h1>All Posts</h1>
      {posts.length > 0 && posts.map(post => (
        <div key={post._id}>
          <Post {...post} />
          <div className="indexbtn">
            <button className="ViewPost" onClick={() => navigate(`/post/${post._id}`)}>View Post</button>
            <button className="DeletePost" onClick={() => handleDelete(post._id, post.author._id)}>Delete Post</button>
          </div>
        </div>
      ))}

      {showModal && (
        <div className="modal" style={modalStyle}>
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <p>Either not logged in or you are not the author!!</p>
          </div>
        </div>
      )}
    </>
  );
}

const modalStyle = {
  display: 'block',
  position: 'fixed',
  zIndex: '1',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%) scale(0)',
  backgroundColor: '#fff',
  padding: '40px',
  borderRadius: '20px',
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
  maxWidth: '500px',
  width: '80%',
  animation: 'modalAppear 0.3s ease-out forwards',
};

const modalAppearAnimation = `
  @keyframes modalAppear {
    0% {
      transform: translate(-50%, -50%) scale(0);
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
    }
  }

  .modal-content {
    position: relative;
  }

  .close {
    position: absolute;
    bottom: 20px;
    right: 20px;
    cursor: pointer;
    font-size: 24px;
    color: red;
    transition:.2s ease-in-out;
  }

  .close:hover {
    color: #000;
    transform:scale(1.5)
  }
`;

const styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(modalAppearAnimation));
document.head.appendChild(styleElement);
