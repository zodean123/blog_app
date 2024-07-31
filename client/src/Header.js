import { Link } from "react-router-dom";
import { useContext, useEffect } from "react";
import { UserContext } from "./UserContext";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);

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
          {username ? (
            <>
              <Link to="/create">Create new post</Link>
              <a onClick={logout}>Logout @{username}</a>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
    </div>
  );
}
