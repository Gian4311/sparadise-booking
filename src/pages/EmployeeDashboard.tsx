import React from "react";
import "../styles/Dashboard.css";

import Sidebar from "../components/EmployeeSidebar";

const Dashboard: React.FC = () => {
    return (


        <div

        ><div>       <Sidebar></Sidebar> </div> <div className="dashboard-container">


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
                            <div className="dashboard-card-header">
                                <span className="card-title">Employees</span>
                                <span className="card-arrow">&rarr;</span>
                            </div>
                            <table className="dashboard-table" id="employees-table">
                                <thead>
                                    <tr><th>#</th><th>Name</th><th>Job</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>1</td><td>Apostol, Gian Tristian G.</td><td>Nail Technician</td></tr>
                                    <tr><td>2</td><td>Cabangbang, R-Man Rey S.</td><td>Eyelash Technician</td></tr>
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

                        <div className="dashboard-card" id="vouchers-card">
                            <div className="dashboard-card-header">
                                <span className="card-title">Rooms & Chairs</span>
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

                        <div className="dashboard-card" id="vouchers-card">
                            <div className="dashboard-card-header">
                                <span className="card-title">Commissions</span>
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
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
