import React from 'react';
import './LandingPage.css';
import logo from './weather-dashboard-logo.png'; // Adjust the path as needed

const LandingPage = () => (
  <div className="landing-page">
    <div className="left-side">
      <div className="logo"></div>
    </div>
    <div className="right-side">
      <img src={logo} alt="Weather Dashboard Logo" className="logo-image" />
      <div className="login-form">
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button>Login</button>
      </div>
      <a href={`${process.env.REACT_APP_API_BASE_URL}/auth/google`} className="google-signin-btn">Sign in with Google</a>
    </div>
    <footer className="footer">
      &copy; 2024 MyWeatherApp. All rights reserved.
    </footer>
  </div>
);

export default LandingPage;
