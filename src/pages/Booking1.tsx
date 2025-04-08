import React from "react";
import SpaRadiseLogo from "../images/SpaRadise Logo.png";
import NotificationSymbol from "../images/Notification Symbol.png";
import "../styles/ClientIndex.css";
import "../styles/ClientBookingCreation.css";

const ClientBookingCreation = () => {
  return (
    <div>
      {/* <header className="clientIndex-header">
        <div className="clientIndex-logo">
          <img src={SpaRadiseLogo} alt="SpaRadise Logo" />
        </div>
        <nav className="clientIndex-nav">
          <ul className="clientIndex-navList">
            <li className="clientIndex-navItem">
              <a href="../pages/ClientIndex.html" className="clientIndex-link">
                Home
              </a>
            </li>
            <li className="clientIndex-navItem">
              <a
                href="../pages/ClientBookingList.html"
                className="clientIndex-link clientIndex-linkActive"
              >
                Bookings
              </a>
            </li>
            <li className="clientIndex-navItem">
              <a href="../pages/ClientAccount.html" className="clientIndex-link">
                Account
              </a>
            </li>
            <li className="clientIndex-navItem">
              <a href="#" className="clientIndex-link">
                Log-out
              </a>
            </li>
          </ul>
          <div className="clientIndex-notification">
            <a href="../pages/ClientNotification.html">
              <img src={NotificationSymbol} alt="Notifications" />
            </a>
          </div>
        </nav>
      </header> */} 

      <main className="booking-container">
        <section className="booking-form">
          <h1 className="booking-title">Who are the Clients?</h1>

          <div className="client-row">
            <div className="client-input">
              <label htmlFor="client-name" className="input-label">
                Name
              </label>
              <input
                type="text"
                id="client-name"
                className="input-field"
                defaultValue="Tom Cruz"
              />
            </div>
            <div className="client-input">
              <label htmlFor="client-birthdate" className="input-label">
                Birth Date
              </label>
              <input
                type="date"
                id="client-birthdate"
                className="input-field"
                defaultValue="1990-08-01"
              />
            </div>
          </div>

          <div className="client-row">
            <div className="client-input">
              <input
                type="text"
                id="new-client-name"
                className="input-field"
                placeholder="Input name here..."
              />
            </div>
            <div className="client-input">
              <input
                type="date"
                id="new-client-birthdate"
                className="input-field"
                placeholder="mm/dd/yy"
              />
            </div>
          </div>

          <button className="add-client-btn">Add Another Client +</button>

          <div className="action-buttons">
            <button onClick={() => window.history.back()} className="back-btn">
              Back
            </button>
            <a href="../pages/ClientBookingCreation2.html">
              <button className="proceed-btn">Proceed (1/4)</button>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ClientBookingCreation;
