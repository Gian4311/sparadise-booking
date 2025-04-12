import { Link } from "react-router-dom";
import SparadiseLogo from "../images/SpaRadise Logo.png";
import NotificationSymbol from "../images/Notification Symbol.png";
import SpaRadiseLogo from "../images/SpaRadise Logo.png";

export default function EmployeeSidebar(): JSX.Element {

    return (
        <div>
            {/* Navbar */}
            <nav className="client-home-navbar">
                <div className="client-home-nav-left">
                    <img src={SparadiseLogo} alt="SpaRadise Logo" className="client-home-logo" />
                </div>

                <div className="client-home-nav-center">
                    <Link to="/" className="client-home-link">Home</Link>
                    <a href="/bookingList" className="client-home-link">Bookings</a>
                    <Link to="/clients/A6xoQYfymODeKJdp8bnT/account" className="client-home-link">Account</Link>
                    <a href="#" className="client-home-link">Log-In</a>
                </div>

                <div className="client-home-nav-right">
                    <img src={NotificationSymbol} alt="Notifications" className="client-home-icon" />
                </div>
            </nav>
        </div>);

}
