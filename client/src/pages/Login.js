import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  async function login(ev) {
    ev.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const userInfo = await response.json();
        setUserInfo(userInfo);
        localStorage.setItem('token', userInfo.token); // Save token
        setRedirect(true);
      } else {
        const errorData = await response.json();
        setModalMessage(errorData.message || 'Wrong credentials, please try again!');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      setModalMessage('An unexpected error occurred.');
      setShowModal(true);
    }
  }

  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <div className="login-form">
      <form className="login" onSubmit={login}>
        <h1>Login</h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={username}
          onChange={ev => setUsername(ev.target.value)}
        />
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={ev => setPassword(ev.target.value)}
        />
        <button type="submit">Login</button>
      </form>

      {showModal && (
        <div className="modal" style={modalStyle}>
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <p>{modalMessage}</p>
          </div>
        </div>
      )}
    </div>
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
    top: 10px;
    right: 10px;
    cursor: pointer;
    font-size: 24px;
    color: red;
    transition: 0.2s ease-in-out;
  }

  .close:hover {
    color: #000;
    transform: scale(1.5);
  }
`;

const styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(modalAppearAnimation));
document.head.appendChild(styleElement);
