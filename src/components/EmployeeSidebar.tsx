import { NavLink } from "react-router-dom";
import SpaRadiseLogo from "../images/SpaRadise Logo.png";

export default function EmployeeSidebar(): JSX.Element {
    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <img src={SpaRadiseLogo} alt="SpaRadise Logo" />
            </div>
            <ul className="sidebar-menu">
                <li>
                    <NavLink 
                        to="/management/dashboard" 
                        className={({ isActive }) => isActive ? "active" : ""}
                    >
                        Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/management/bookings/menu" 
                        className={({ isActive }) => isActive ? "active" : ""}
                    >
                        Bookings
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/management/clients/menu" 
                        className={({ isActive }) =>
                            (window.location.pathname.startsWith("/management/clients"))  ? "active" : ""
                        }                    >
                        Clients
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/management/employees/menu" 
                        className={({ isActive }) =>
                            window.location.pathname.startsWith("/management/employee") ? "active" : ""
                        }
                    >
                        Employees
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/management/servicesAndPackages/menu" 
                        className={({ isActive }) =>
                            window.location.pathname.startsWith("/management/services") || (window.location.pathname.startsWith("/management/packages"))  ? "active" : ""
                        }      
                    >
                        Services & Packages
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/management/vouchers/menu" 
                        className={({ isActive }) =>
                            window.location.pathname.startsWith("/management/vouchers") ? "active" : ""
                        }
                    >
                        Vouchers
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/management/roomsAndChairs" 
                        className={({ isActive }) =>
                            window.location.pathname.startsWith("/management/roomsAndChairs") ? "active" : ""
                        }
                    >
                        Rooms & Chairs
                    </NavLink>
                </li>
                <li><a href="#">Log Out</a></li>
            </ul>
        </div>
    );
}
