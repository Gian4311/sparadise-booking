import React from "react";
import "../styles/EmployeeServiceMenu.css";
import "../styles/Sidebar.css";

import LoadingScreen from "../components/LoadingScreen";

import EmployeeSidebar from "../components/EmployeeSidebar";

const RoomMaintenance: React.FC = () => {
    return <>
        {/* <LoadingScreen></LoadingScreen> */}
        <div>

            {/* <EmployeeSidebar/> */}
            <div className="service-menu-main-content">
                <label htmlFor="service-menu-main-content" className="service-menu-main-content-location">
                    Rooms & Chairs
                </label>
                <div className="service-menu-form-section">
                    <table className="services-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date last modified</th>
                                <th>Rooms</th>
                                <th>Chairs</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>22 December 2024</td>
                                <td>4</td>
                                <td>-</td>
                                <td><button className="rooms-edit-btn">Edit</button></td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>22 December 2024</td>
                                <td>-</td>
                                <td>6</td>
                                <td><button className="rooms-edit-btn">Edit</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </>;
};

export default RoomMaintenance;
