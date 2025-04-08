import React from 'react';
import '../styles/ClientHomePage.css';
import SparadiseLogo from "../images/SpaRadise Logo.png";
import NotificationSymbol from "../images/Notification Symbol.png";
import Background from "../images/indexbackground.jpg";

export default function ClientHomePage() {
  return ( <div className="client-home-container">

      {/* Navbar */}
      <nav className="client-home-navbar">
        <div className="client-home-nav-left">
          <img src={SparadiseLogo} alt="SpaRadise Logo" className="client-home-logo" />
        </div>

        <div className="client-home-nav-center">
          <a href="#" className="client-home-link">Home</a>
          <a href="#" className="client-home-link">Bookings</a>
          <a href="#" className="client-home-link">Account</a>
          <a href="#" className="client-home-link">Log-In</a>
        </div>

        <div className="client-home-nav-right">
          <img src={NotificationSymbol} alt="Notifications" className="client-home-icon" />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="client-home-hero">
        <img
          src={Background}
          alt="Spa Background"
          className="client-home-hero-img"
        />

        <div className="client-home-hero-overlay">
          <h1 className="client-home-title">Welcome to SpaRadise</h1>
          <p className="client-home-subtitle">Beauty within your reach...</p>
          <button className="client-home-button">Book Now</button>
        </div>
      </div>

      {/* Services Section */}
      <div className="services-section">
        <h2 className="section-title">Our Services</h2>
        <div className="services-container">
          {/* Add your services here, each with an image, title, and description */}
          <div className="service-item">
            <img src="path_to_image" alt="Service 1" className="service-image" />
            <h3 className="service-title">Service 1</h3>
            <p className="service-description">Description of service 1</p>
          </div>
          {/* Repeat similar blocks for more services */}
        </div>
      </div>

      {/* Opening Hours Section */}
      <div className="hours-section">
        <h2 className="section-title">Opening Hours</h2>
        <ul>
          <li>9AM - 8PM (Monday - Friday)</li>
          <li>10AM - 6PM (Saturday)</li>
          <li>Closed on Sundays</li>
        </ul>
      </div>

      {/* Contact Us Section */}
      <div className="contact-section">
        <h2 className="section-title">Contact Us</h2>
        <p>📱 Facebook</p>
        <p>📞 +63 945 627 9835</p>
        <p>📧 sparadise8@gmail.com</p>
      </div>

    </div>
  );
}
