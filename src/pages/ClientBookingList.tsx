import { useState } from "react";
import "../styles/ClientIndex.css";
import "../styles/ClientBookings.css";
import { NavLink } from "react-router-dom";
import NavBar from "../components/ClientNavBar";

export default function ClientBookingList(): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const accordionData = [
    {
      title: "Upcoming Bookings",
      content: (
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
      ),
    },
    {
      title: "Finished Bookings",
      content: <p>No finished bookings yet.</p>,
    },
    {
      title: "Cancelled Bookings",
      content: <p>No cancelled bookings.</p>,
    },
  ];

  return (
    <div>
      {/* <NavBar pageData={ pageData } reloadPageData={ reloadPageData }/> */}

      <main className="bookingList-container">
        <div className="bookingList-card">
          <div className="bookingList-header">
            <h1 className="bookingList-heading">Bookings</h1>
            <NavLink className="create-booking-btn" to="/clients/A6xoQYfymODeKJdp8bnT/bookings/new">
              Create Booking
            </NavLink>
          </div>

          <section className="accordion">
            {accordionData.map((item, index) => (
              <div key={index} className="accordion-item">
                <button
                  className="accordion-header"
                  onClick={() => toggleAccordion(index)}
                >
                  {item.title}
                  <span className="arrow-icon">{openIndex === index ? "▲" : "▼"}</span>
                </button>
                {openIndex === index && (
                  <div className="accordion-content">{item.content}</div>
                )}
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
