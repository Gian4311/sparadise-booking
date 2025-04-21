import React from "react";
import { Link } from "react-router-dom";
import "../styles/ClientAccount.css";
import "../styles/ClientIndex.css";
import Logo from "../images/SpaRadise Logo.png";
import NotificationSymbol from "../images/Notification Symbol.png";
import NavBar from "../components/ClientNavBar";

const ClientAccount: React.FC = () => {
    return (
        <div>
            <NavBar />

            <main>
                <div className="notification-container">
                    <div className="notification-card">
                        <div className="notification-header">
                            <strong>Booking Reserved</strong>
                            <span className="notification-time">9:05AM</span>
                        </div>
                        <p>
                            Your <strong>Full Eyelash Extension</strong> is reserved for{" "}
                            <strong>December 14, 2024, at 3:00 PM.</strong>
                        </p>
                    </div>

                    <div className="notification-card">
                        <div className="notification-header">
                            <strong>Booking Confirmed</strong>
                            <span className="notification-time">8:03PM</span>
                        </div>
                        <p>
                            Your <strong>Full Eyelash Extension</strong> is confirmed for{" "}
                            <strong>December 14, 2024, at 3:00 PM.</strong>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClientAccount;
