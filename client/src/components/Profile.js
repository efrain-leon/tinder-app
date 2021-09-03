import React from "react";
import AuthService from "../services/auth.service";

import Header from "./Header";

const Profile = () => {
  const currentUser = AuthService.getCurrentUser();

  return (
    <div className="container">
      <Header />
      
      <header className="jumbotron">
        <h3>
          <strong>{currentUser.name}</strong> Profile
        </h3>
      </header>
      <p>
        <strong>Id:</strong> {currentUser._id}
      </p>
      <p>
        <strong>Name:</strong> {currentUser.name}
      </p>
      <p>
        <strong>Surname:</strong> {currentUser.surname}
      </p>
      <p>
        <strong>Email:</strong> {currentUser.email}
      </p>
      <strong>Authorities:</strong>
      <ul>
        {currentUser.roles &&
          currentUser.roles.map((role, index) => <li key={index}>{role}</li>)}
      </ul>
    </div>
  );
};

export default Profile;