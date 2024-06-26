import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';

const Post = ({ _id, title, summary, cover, createdAt, author }) => {
  const currentDate = moment(createdAt).format('MMMM Do YYYY, h:mm:ss a');
  
  return (
    <div className="grid-container">

<div className="post">
      <div className="image">
          <img src={`${process.env.REACT_APP_BACKEND_URL}/${cover}`} alt="" />
      </div>
      <div className="texts">
          <h2>{title}</h2>
        <p className="info">
          <a className="author">@{author?.username}</a>
          <time>{currentDate}</time>
        </p>
        <p className="summary">{summary}</p>
      </div>
      
    </div>

    </div>
   
  );
};

export default Post;
