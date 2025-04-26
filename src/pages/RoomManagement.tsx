import "../styles/EmployeeServiceManagement.css";
import EmployeeSidebar from "../components/EmployeeSidebar";
import BackButton from "../images/back button.png";
import FormDateInput from "../components/FormDateInput";
import FormTextInput from "../components/FormTextInput";

export default function EmployeeServiceDetail() {
  return (
    <div className="page-wrapper">
      <EmployeeSidebar />

      <div className="service-main-content">
        <label htmlFor="service-main-content" className="service-management-location">
          Rooms & Chairs - Rooms
        </label>

        <div className="service-form-section">
          <div className="service-header">
            <a href="#" className="service-back-arrow" aria-label="Back">
              <img src={BackButton} alt="Back" className="back-icon" />
            </a>
            <h1>Rooms</h1>
          </div>

          <form>
            {/* Group 1: Basic Details */}
            <div className="service-form-row-group">
              <div className="service-form-row">
                <label htmlFor="room-capacity">Capacity</label>
                <input
                  type="number"
                  id="room-capacity"
                  name="room-capacity"
                  min="1" max="4"
                  readOnly
                />
              </div>
              <div className="service-form-row">
                <label htmlFor="service-room-type">Date</label>
                <input name="service-room-type" readOnly>
                  
                </input>
              </div>
            </div>

            {/* Group 5: Maintenance */}
            <div className="service-maintenance">
              <label htmlFor="service-maintenance" className="service-maintenance-label">
                Service Maintenance:
              </label>

              <div className="service-form-row-group">
                <div className="service-form-row">
                  <label htmlFor="service-status">Status</label>
                  <select id="service-status" name="service-status" defaultValue="Active">
                    <option value="Active">Active</option>
                  </select>
                </div>
                <div className="service-form-row">
                  <label htmlFor="service-price">Price (₱)</label>
                  <input
                    type="number"
                    id="service-price"
                    name="service-price"
                    defaultValue={400}
                  />
                </div>
                <div className="service-form-row">
                  <label htmlFor="service-commission">Commission</label>
                  <input
                    type="number"
                    id="service-commission"
                    name="service-commission"
                    defaultValue={25}
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Service History Table */}
          <div className="service-history">
            <h2 className="service-history-label">Service History</h2>
            <table className="service-history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Commission (%)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>12 December 2024</td>
                  <td>₱350</td>
                  <td>25%</td>
                  <td>Active</td>
                  <td><button className="service-maintenance-delete-btn">Delete</button></td>
                </tr>
                <tr>
                  <td>26 December 2024</td>
                  <td>₱400</td>
                  <td>25%</td>
                  <td>Active</td>
                  <td><button className="service-maintenance-delete-btn">Delete</button></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Form Actions */}
          <div className="service-form-actions">
            <button className="service-delete-btn">Delete</button>
            <button className="service-cancel-btn">Cancel</button>
            <button className="service-save-btn">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
