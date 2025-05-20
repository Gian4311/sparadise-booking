import {
    AccountData,
    AccountDataMap,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import React from "react";
import "../styles/EmployeeEmployeeManagement.css";
import "../styles/EmployeeServiceManagement.css"
import "../styles/Sidebar.css";
import { useState } from "react";

import Sidebar from "../components/EmployeeSidebar";
import BackButton from "../images/back button.png";

interface EmployeeDetailsPageData extends SpaRadisePageData {

    accountData: AccountData,
    accountId?: documentId

}

const EmployeeDetailsPage: React.FC = () => {

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
        <div className="app-container">

            <Sidebar pageData={ pageData } reloadPageData={ reloadPageData }/>

            <div className="service-menu-main-content ">
                <label className="employee-management-location">
                    Employees - Cabangbang, R-Man Rey S.
                </label>

                <div className="employee-form-section">
                    <div className="employee-header">
                        <a href="javascript:history.back()" className="service-back-arrow" aria-label="Back">
                            <img src={BackButton} alt="Back" className="back-icon" />
                        </a>
                        <h1>Cabangbang, R-Man Rey S.</h1>
                    </div>

                    <form>
                        <div className="employee-form-row-group">
                            <div className="employee-form-row">
                                <label htmlFor="employee-lastname">Last Name</label>
                                <input type="text" id="employee-lastname" name="employee-lastname" defaultValue="Cabangbang" />
                            </div>
                            <div className="employee-form-row">
                                <label htmlFor="employee-firstname">First Name</label>
                                <input type="text" id="employee-firstname" name="employee-firstname" defaultValue="R-Man Rey" />
                            </div>
                            <div className="employee-form-row">
                                <label htmlFor="employee-middlename">Middle Name</label>
                                <input type="text" id="employee-middlename" name="employee-middlename" defaultValue="Sim" />
                            </div>
                        </div>

                        <div className="employee-form-row-group">
                            <div className="employee-form-row">
                                <label htmlFor="employee-sex">Sex</label>
                                <select id="employee-sex" name="employee-sex" defaultValue="Male">
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                            </div>
                            <div className="employee-form-row">
                                <label htmlFor="employee-birthdate">Birthdate</label>
                                <input type="date" id="employee-birthdate" name="employee-birthdate" />
                            </div>
                        </div>

                        <div className="employee-gap-row"></div>

                        <div className="employee-form-row-group">
                            <div className="employee-form-row">
                                <label htmlFor="employee-email">Email</label>
                                <input type="text" id="employee-email" name="employee-email" defaultValue="rmanrey26@gmail.com" />
                            </div>
                            <div className="employee-form-row">
                                <label htmlFor="employee-contact-number">Contact Number</label>
                                <input type="text" id="employee-contact-number" name="employee-contact-number" defaultValue="09123456789" />
                            </div>
                            <div className="employee-form-row">
                                <label htmlFor="employee-alter-contact-number">Alternate Contact Number</label>
                                <input type="text" id="employee-alter-contact-number" name="employee-alter-contact-number" defaultValue=" " />
                            </div>
                        </div>

                        <div className="employee-history">
                            <label className="employee-history-label">Booking History</label>
                            <div className="employee-history-scrollable">
                                <table className="employee-history-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Package/Services</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>2025-04-10</td>
                                            <td>Massage</td>
                                            <td>Finished</td>
                                        </tr>
                                        <tr>
                                            <td>2025-04-09</td>
                                            <td>Eyelash Extensions</td>
                                            <td>Reserved</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="employee-form-actions">
                            <button type="button" className="employee-delete-btn">Delete</button>
                            <button type="button" className="employee-cancel-btn">Cancel</button>
                            <button type="submit" className="employee-save-btn">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetailsPage;
