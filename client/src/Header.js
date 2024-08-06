import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(process.env.REACT_APP_BACKEND_URL + '/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(userInfo => {
          setUserInfo(userInfo);
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
        });
    }
  }, [setUserInfo]);

  function logout() {
    localStorage.removeItem('token'); // Remove the token from local storage
    fetch(process.env.REACT_APP_BACKEND_URL + '/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setUserInfo(null);
  }

  const username = userInfo?.username;

  return (
    <div className="navbar">
      <header>
        <Link to="/" className="logo">MyBlog</Link>
        <nav>
          <div className={`menu ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </div>
          <div className={`menu-items ${menuOpen ? 'open' : ''}`}>
            {username ? (
              <>
                <Link to="/create" className="button">Create new post</Link>
                <button onClick={logout} className="button">Logout @{username}</button>
              </>
            ) : (
              <>
                <Link to="/login" className="button">Login</Link>
                <Link to="/register" className="button">Register</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <style>{navbarStyle}</style>
    </div>
  );
}

const navbarStyle = `
  .navbar {
    width: 100%;
    background-color: #333;
    overflow: auto;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
  }

  .logo {
    color: white;
    font-size: 24px;
    text-decoration: none;
  }

  nav {
    position: relative;
  }

  .menu {
    display: none;
    font-size: 24px;
    color: white;
    cursor: pointer;
  }

  .menu-items {
    display: flex;
    gap: 10px;
  }

  .button {
    background-color: #007BFF; /* Blue */
    border: none;
    color: white;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s ease, transform 0.3s ease;
  }

  .button:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }

  /* Responsive adjustments for medium devices */
  @media (max-width: 900px) {
    .button {
      padding: 8px 16px;
      font-size: 14px;
    }

    header {
      padding: 8px 16px;
    }

    .logo {
      font-size: 20px;
    }
  }

  /* Responsive adjustments for phone devices */
  @media (max-width: 600px) {
    header {
      flex-direction: column;
      align-items: center;
    }

    .logo {
      margin-bottom: 10px;
      text-align: center;
    }

    nav {
      width: 100%;
      text-align: center;
    }

    .menu {
      display: block;
    }

    .menu-items {
      display: none;
      flex-direction: column;
      align-items: center;
    }

    .menu-items.open {
      display: flex;
    }

    .button {
      width: 100%;
      text-align: center;
      font-size: 18px;
      padding: 15px;
      margin-bottom: 10px;
    }
  }
`;
