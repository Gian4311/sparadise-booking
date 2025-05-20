import {
    AccountData,
    SpaRadisePageData
  } from "../firebase/SpaRadiseTypes";
import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import Sidebar from "../components/EmployeeSidebar";
import EmployeeUtils from "../firebase/EmployeeUtils";
import JobUtils from "../firebase/JobUtils";
import { EmployeeDataMap, JobDataMap } from "../firebase/SpaRadiseTypes";
import PersonUtils from "../utils/PersonUtils";
import PackageUtils from "../firebase/PackageUtils";
import ServiceUtils from "../firebase/ServiceUtils";

import LoadingScreen
    from "../components/LoadingScreen";
import { Link } from "react-router-dom";

interface EmployeeDisplay {
    name: string;
    job: string;
}

interface EmployeeDashboardPageData extends SpaRadisePageData {

    accountData: AccountData,
    accountId?: documentId

}

const Dashboard: React.FC = () => {

    const
        [ pageData, setPageData ] = useState< EmployeeDashboardPageData >( {
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
        } ),
        [employeeList, setEmployeeList] = useState<EmployeeDisplay[]>([])
    ;

    function reloadPageData(): void {

        setPageData( { ...pageData } );
  
    }

    useEffect(() => {
        async function loadEmployees(): Promise<void> {
            const employeeDataMap: EmployeeDataMap = await EmployeeUtils.getEmployeeDataMapAll();
            const jobDataMap: JobDataMap = await JobUtils.getJobDataMapAll();

            const sortedEmployeeIds = Object.keys(employeeDataMap).sort((a, b) =>
                PersonUtils.toString(employeeDataMap[a], "f mi l").localeCompare(
                    PersonUtils.toString(employeeDataMap[b], "f mi l")
                )
            );

            const firstFive = sortedEmployeeIds.slice(0, 5).map((id) => {
                const employee = employeeDataMap[id];
                const job = jobDataMap[employee.job.id]?.name ?? "Unknown";

                return {
                    name: PersonUtils.toString(employee, "f mi l"),
                    job: job
                };
            });

            setEmployeeList(firstFive);
        }

        loadEmployees();
    }, []);

    return <>
        {/* <LoadingScreen loading={ pageD}></LoadingScreen> */}
        <div>
            <div>
                <Sidebar pageData={ pageData } reloadPageData={ reloadPageData }/>
            </div>
            <div className="dashboard-container">
                <main className="dashboard-main-content" id="main-content-area">
                    <h1 className="dashboard-title">Dashboard</h1>

                    <section className="dashboard-top-section" id="top-section">
                        <div className="dashboard-schedule-box" id="schedule-box">
                            <div className="dashboard-schedule-header" id="schedule-date">
                                December 8, 2025
                            </div>
                            <div className="dashboard-appointment-details" id="appointment-details">
                                <div className="appointment-label">#</div>
                                <div className="appointment-label">Client/s</div>
                                <div className="appointment-label">Time</div>
                                <div className="appointment-label">Status</div>
                                <div className="appointment-value">1</div>
                                <div className="appointment-value">Tom Cruz</div>
                                <div className="appointment-value">09:00 - 09:30</div>
                                <div className="appointment-value">On-going</div>
                            </div>
                        </div>

                        <div className="dashboard-stats-panel" id="stats-panel">
                            <div className="dashboard-stat-box" id="stat-today">
                                <strong className="stat-number">1</strong>
                                <span className="stat-label">Bookings today</span>
                            </div>
                            <div className="dashboard-stat-box" id="stat-week">
                                <strong className="stat-number">6</strong>
                                <span className="stat-label">Bookings this week</span>
                            </div>
                            <div className="dashboard-stat-box" id="stat-month">
                                <strong className="stat-number">18</strong>
                                <span className="stat-label">Bookings this month</span>
                            </div>
                        </div>
                    </section>

                    <section className="dashboard-grid-section" id="grid-section">
                        <div className="dashboard-card" id="employees-card">
                            <Link to="/management/employees/menu">
                                <div className="dashboard-card-header">
                                    <span className="card-title">Employees</span>
                                    <span className="card-arrow">&rarr;</span>
                                </div>
                            </Link>
                            <table className="dashboard-table" id="employees-table">
                                <thead>
                                    <tr><th>#</th><th>Name</th><th>Job</th></tr>
                                </thead>
                                <tbody>
                                    {employeeList.map((emp, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{emp.name}</td>
                                            <td>{emp.job}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td></td>
                                        <td>...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="dashboard-card" id="clients-card">
                            <div className="dashboard-card-header">
                                <span className="card-title">Clients</span>
                                <span className="card-arrow">&rarr;</span>
                            </div>
                            <table className="dashboard-table" id="clients-table">
                                <thead>
                                    <tr><th>#</th><th>Name</th><th>Email</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>1</td><td>Cruz, Tom</td><td>tomcruz@gmail.com</td></tr>
                                    <tr><td>2</td><td>James, LeBron R.</td><td>lebronjames@gmail.com</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="dashboard-card" id="services-card">
                            <div className="dashboard-card-header">
                                <span className="card-title">Services & Packages</span>
                                <span className="card-arrow">&rarr;</span>
                            </div>
                            <table className="dashboard-table" id="services-table">
                                <thead>
                                    <tr><th>#</th><th>Name</th><th>Price</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>1</td><td>December Promo</td><td>₱700</td></tr>
                                    <tr><td>2</td><td>Full Eyelash Extensions</td><td>₱400</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="dashboard-card" id="vouchers-card">
                            <div className="dashboard-card-header">
                                <span className="card-title">Vouchers</span>
                                <span className="card-arrow">&rarr;</span>
                            </div>
                            <table className="dashboard-table" id="vouchers-table">
                                <thead>
                                    <tr><th>#</th><th>Name</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>1</td><td>Christmas Promo Voucher</td></tr>
                                    <tr><td>2</td><td>New Year's Day 2025 Massage Voucher</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="dashboard-card" id="rooms-chairs-card">
                            <div className="dashboard-card-header">
                                <span className="card-title">Rooms & Chairs</span>
                                <span className="card-arrow">&rarr;</span>
                            </div>
                            <table className="dashboard-table" id="rooms-chairs-table">
                                <thead>
                                    <tr><th>#</th><th>Name</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>1</td><td>Room 1</td></tr>
                                    <tr><td>2</td><td>Room 2</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="dashboard-card" id="commissions-card">
                            <div className="dashboard-card-header">
                                <span className="card-title">Commissions</span>
                                <span className="card-arrow">&rarr;</span>
                            </div>
                            <table className="dashboard-table" id="commissions-table">
                                <thead>
                                    <tr><th>#</th><th>Name</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>1</td><td>Christmas Promo Voucher</td></tr>
                                    <tr><td>2</td><td>New Year's Day 2025 Massage Voucher</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </div>
       </>;
};

export default Dashboard;
