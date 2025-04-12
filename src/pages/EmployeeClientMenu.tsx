import React from 'react';
import '../styles/EmployeeServiceMenu.css';
import '../styles/Sidebar.css';

import SideBar from "../components/EmployeeSidebar";

const ServicePackageMenu: React.FC = () => {
  return (
    <div className="container">

    <SideBar></SideBar>

      <div className="service-menu-main-content">
        <label htmlFor="service-menu-main-content" className="service-menu-main-content-location">
          Clients
        </label>

        <div className="service-menu-form-section">
          <div className="service-stats">
            <div className="service-stat">2<br /><span>Clients</span></div>
            <div className="service-stat">1<br /><span>New clients this month</span></div>
          </div>

          <div className="controls">
            <input type="text" placeholder="Search clients" className="search" />
            <select className="filter-btn" id="filter-select" name="services-packages">
              <option>A - Z</option>
              <option>Z - A</option>
            </select>
            <button className="action-btn">+ Add new client</button>
          </div>

          <table className="services-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Sex</th>
                <th>Birthdate</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Cruz, Tom</td>
                <td>Male</td>
                <td>3 July 1962</td>
                <td>tomcruz@gmail.com</td>
              </tr>
              <tr>
                <td>2</td>
                <td>James, LeBron R.</td>
                <td>Male</td>
                <td>30 December 1984</td>
                <td>lebronjames@gmail.com</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServicePackageMenu;
