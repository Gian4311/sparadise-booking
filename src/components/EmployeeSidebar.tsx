import { Link } from "react-router-dom";

import SpaRadiseLogo from "../images/SpaRadise Logo.png";

export default function EmployeeSidebar(): JSX.Element {

    return <div className="sidebar">
        <div className="sidebar-logo">
            <img src={SpaRadiseLogo} alt="SpaRadise Logo" />
        </div>
        <ul className="sidebar-menu">
            <li><Link to="/management/dashboard" >Dashboard</Link></li>
            <li><Link to="/management/bookings/menu" >Bookings</Link></li>
            <li><Link to="/management/clients/menu" >Clients</Link></li>
            <li><Link to="/management/employees/menu" >Employees</Link></li>
            <li><Link to="/management/servicesAndPackages/menu"className="active" >Services & Packages</Link></li>
            <li><Link to="/management/vouchers/menu" >Vouchers</Link></li>
            <li><Link to="/management/roomsAndChairs/menu" >Rooms & Chairs</Link></li>
            <li><Link to="/management/commissions/menu" >Commissions</Link></li>
            <li><a href="#">Log Out</a></li>
        </ul>
    </div>;
    
}
