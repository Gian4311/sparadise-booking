import React from "react";
import "../styles/EmployeeServiceMenu.css";
import "../styles/Sidebar.css";

import LoadingScreen from "../components/LoadingScreen";

import EmployeeSidebar from "../components/EmployeeSidebar";

const RoomMaintenance: React.FC = () => {
    return <>
        {/* <LoadingScreen></LoadingScreen> */}
        <div>
            
                <EmployeeSidebar></EmployeeSidebar>

                <div className="service-menu-main-content">
                    <label htmlFor="service-menu-main-content" className="service-menu-main-content-location">
                        Rooms & Chairs
                    </label>
                    <div className="room-maintenance">
                        <h2>Room Maintenance</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>12 December 2024</td>
                                    <td>10:30am</td>
                                    <td>4</td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td>22 December 2024</td>
                                    <td>1:30pm</td>
                                    <td>2</td>
                                </tr>
                            </tbody>
                        </table>
                        <button className="edit-btn">Edit</button>
                    </div>
                </div>
        </div>
    </>;
};

export default RoomMaintenance;
