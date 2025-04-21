import React from "react";
import "../styles/CommisionPage1.css";
import "../styles/Sidebar.css";

import LoadingWrapper from "../components/LoadingWrapper";
import EmployeeSidebar from "../components/EmployeeSidebar";

const CommissionDetailsPage: React.FC = () => {
    return <>
        {/* <LoadingWrapper></LoadingWrapper> */}
        <div>
        

            <EmployeeSidebar></EmployeeSidebar>

            <div className="commission-container">
                <div className="calendar-header">
                    <button id="prev-btn">&#8592;</button>
                    <span id="date-range">02 DECEMBER 2024 - 16 DECEMBER 2024</span>
                    <button id="next-btn">&#8594;</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Service</th>
                            <th>Commission</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>12 December 2024</td>
                            <td>9am-10am</td>
                            <td>FootSpa</td>
                            <td>₱350</td>
                        </tr>
                        <tr>
                            <td>26 December 2024</td>
                            <td>1pm-2pm</td>
                            <td>FootSpa</td>
                            <td>₱250</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </>;
};

export default CommissionDetailsPage;
