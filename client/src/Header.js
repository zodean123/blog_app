import {Link} from "react-router-dom";
import {useContext, useEffect} from "react";
import {UserContext} from "./UserContext";

export default function Header() {
  const {setUserInfo,userInfo} = useContext(UserContext);
  useEffect(() => {
    fetch(process.env.REACT_APP_BACKEND_URL + '/profile', {
      credentials: 'include',
    }).then(response => {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  function logout() {
    fetch(process.env.REACT_APP_BACKEND_URL + '/logout', {
      credentials: 'include',
      method: 'POST',
    });
    setUserInfo(null);
  }

  const username = userInfo?.username;

  return (
    <div className="navbar">
    <header>
      <Link to="/" className="logo">MyBlog</Link>
      <nav>
        {username && (
          <>
            <Link to="/create">Create new post</Link>
            <a onClick = {logout}>Logout@{username}</a>
          </>
        )}
        {!username && (
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