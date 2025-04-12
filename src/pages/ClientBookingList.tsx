import "../styles/ClientIndex.css";
import "../styles/ClientBookings.css";
import SpaRadiseLogo from "../images/SpaRadise Logo.png";
import NotificationSymbol from "../images/Notification Symbol.png";
import { NavLink } from "react-router-dom";
import { Navigate } from "react-router-dom";
import NavBar from "../components/ClientNavBar";

export default function ClientBookingList(): JSX.Element {
  return (
    <div>

        <NavBar></NavBar>

      <main className="bookingList-container">
        <div className="bookingList-card">
          <div className="bookingList-header">
            <h1 className="bookingList-heading">Bookings</h1>
            <NavLink className="create-booking-btn" to="/clients/A6xoQYfymODeKJdp8bnT/bookings/new">Create Booking</NavLink>
          </div>

          <section className="accordion">
            <div className="accordion-item">
              <button className="accordion-header">
                Upcoming Bookings
                <span className="arrow-icon">▼</span>
              </button>
              <div className="accordion-content" style={{ display: "block" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Packages/Services</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>14 December 2024 - Saturday</td>
                      <td>Full Eyelash Extensions</td>
                      <td>3:00PM</td>
                      <td>Confirmed</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="accordion-item">
              <button className="accordion-header">
                Finished Bookings
                <span className="arrow-icon">▼</span>
              </button>
              <div className="accordion-content" style={{ display: "block" }}>
                <p>No finished bookings yet.</p>
              </div>
            </div>

            <div className="accordion-item">
              <button className="accordion-header">
                Cancelled Bookings
                <span className="arrow-icon">▼</span>
              </button>
              <div className="accordion-content" style={{ display: "block" }}>
                <p>No cancelled bookings.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
