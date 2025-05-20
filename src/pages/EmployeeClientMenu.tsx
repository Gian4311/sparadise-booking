import {
  AccountData,
  SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import React from 'react';
import '../styles/EmployeeServiceMenu.css';
import '../styles/Sidebar.css';
import { NavLink } from 'react-router-dom';
import { useState } from "react";

import SideBar from "../components/EmployeeSidebar";

interface EmployeeDetailsPageData extends SpaRadisePageData {

    accountData: AccountData,
    accountId?: documentId

}

const ServicePackageMenu: React.FC = () => {

  const
      [ pageData, setPageData ] = useState< EmployeeDetailsPageData >( {
          accountData: {
              lastName: null as unknown as string,
              firstName: null as unknown as string,
              middleName: null,
              sex: null as unknown as sex,
              birthDate: null as unknown as Date,
              email: null as unknown as string,
              contactNumber: null as unknown as string,
              contactNumberAlternate: null,
              accountType: null as unknown as accountType
          },
          loaded: true,
          updateMap: {}
      } )
  ;

  function reloadPageData(): void {

      setPageData( { ...pageData } );

  }

  return (
    <div className="container">

      <SideBar pageData={ pageData } reloadPageData={ reloadPageData }/>

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
            <NavLink to="/management/clients"> <button className="action-btn">+ Add new client</button></NavLink>
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
