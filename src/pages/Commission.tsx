import React from "react";
import "../styles/CommisionPage.css";
import "../styles/Sidebar.css";
import LoadingScreen from "../components/LoadingScreen";
import EmployeeSidebar from "../components/EmployeeSidebar";
const CommissionPage: React.FC = () => {
    return (

        <div>
            {/* <LoadingScreen ></LoadingScreen> */}
            <EmployeeSidebar></EmployeeSidebar>
            <div className="commission-menu-container">
                <div className="calendar-header">
                    <button id="prev-btn">&#8592;</button>
                    <span id="date-range">02 DECEMBER 2024 - 16 DECEMBER 2024</span>
                    <button id="next-btn">&#8594;</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Amount</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Cabangbang, R-Man</td>
                            <td>₱200</td>
                            <td><button className="expand-btn">Expand</button></td>
                        </tr>
                        <tr>
                            <td>Apostol, Gian</td>
                            <td>₱250</td>
                            <td><button className="expand-btn">Expand</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CommissionPage;
