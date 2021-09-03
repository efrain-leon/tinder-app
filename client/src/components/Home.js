import React, { useState, useMemo, useEffect } from "react";
import TinderCard from 'react-tinder-card';
import axios from "axios";

import NavBar from './NabBar';
import AppConstants from "../constants/app.constants";
import api from '../services/api';

const images = [62, 83, 466, 965, 982, 1043, 738].map((n) => {return {id: n, name: n, url: `https://picsum.photos/id/${n}/900/500`}});

const Home = () => {
  return (
    <div className="container">
      <NavBar />
      <div className='cardContainer card-image'>
        {images.map((image, index) =>
        <div>
          <img key={index} src={image.url} height="300" width="200" className="img-container"/>
          <div>
            <div>Likes: 1</div>
            <div>Dislikes: 2</div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Home;