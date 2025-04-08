import "../styles/ClientIndex.css";
import SpaRadiseLogo from "../images/SpaRadise Logo.png";
import NotificationSymbol from "../images/Notification Symbol.png";
import Massage from "../images/massage.jpg";

const ClientIndex = () => {
    return (
        <div className="clientIndexBackgroundWrapper">
            <header className="clientIndex-header">
                <div className="clientIndex-logo">
                    <img src={SpaRadiseLogo} alt="SpaRadise Logo" />
                </div>
                <nav className="clientIndex-nav">
                    <ul className="clientIndex-navList">
                        <li className="clientIndex-navItem"><a href="/pages/ClientIndex" className="clientIndex-link clientIndex-linkActive">Home</a></li>
                        <li className="clientIndex-navItem"><a href="/pages/ClientBookingList" className="clientIndex-link">Bookings</a></li>
                        <li className="clientIndex-navItem"><a href="/pages/ClientAccount" className="clientIndex-link">Account</a></li>
                        <li className="clientIndex-navItem"><a href="#" className="clientIndex-link">Log-out</a></li>
                    </ul>
                    <div className="clientIndex-notification">
                        <a href="/pages/ClientNotification">
                            <img src={NotificationSymbol} alt="Notifications" />
                        </a>
                    </div>
                </nav>
            </header>

            <main>
                <section className="clientIndex-hero">
                    <div className="clientIndex-heroContent">
                        <h1 className="clientIndex-heading">Welcome to SpaRadise</h1>
                        <p className="clientIndex-subText">Beauty within your reach...</p>
                        <a href="/pages/ClientBookingCreation1" className="clientIndex-btn">Book Now</a>
                    </div>
                </section>
            </main>

            <section className="clientIndex-services">
                <h2 className="clientIndex-servicesHeading">Our Services</h2>
                <div className="clientIndex-servicesContainer">
                    {[
                        { title: "Lashes", desc: "Enhance your natural beauty with voluminous, long-lasting lash extensions.", img: Massage },
                        { title: "Brows", desc: "Define your brows with precision shaping for a flawless, natural look.", img: "massage.jpg" },
                        { title: "Massages", desc: "Relieve stress and tension with a soothing full-body massage experience.", img: "massage.jpg" },
                        { title: "Facials", desc: "Refresh your skin with a deeply hydrating facial tailored to your needs.", img: "facial.jpeg" },
                        { title: "Manicures", desc: "Pamper your hands with a rejuvenating manicure, including nail care and polish.", img: "manicure.jpg" },
                        { title: "Pedicures", desc: "Treat your feet to a luxurious pedicure that softens and beautifies.", img: "waxing.jpg" },
                        { title: "Waxing", desc: "Enjoy smooth, hair-free skin with our gentle and effective waxing treatments.", img: "waxing.jpg" },
                        { title: "Gluta Drip", desc: "Brighten and revitalize your skin with a rejuvenating Glutathione drip infusion.", img: "gluta.jpeg" }
                    ].map((service, index) => (
                        <div className="clientIndex-serviceCard" key={index} style={{ backgroundImage: `url(/images/${service.img})` }}>
                            <div className="clientIndex-serviceOverlay">
                                <h3>{service.title}</h3>
                                <p>{service.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="clientIndex-openingHours">
                <h2>Opening Hours</h2>
                <div className="clientIndex-hours">
                    <p className="clientIndex-hoursMain">9AM - 8PM</p>
                    <p className="clientIndex-hoursSub">Monday - Friday</p>
                    <br />
                    <p className="clientIndex-hoursMain">10AM - 6PM</p>
                    <p className="clientIndex-hoursSub">Saturday</p>
                    <br />
                    <p className="clientIndex-hoursMain">Closed on Sundays</p>
                </div>
                <p className="clientIndex-location">
                    <span className="clientIndex-locationIcon">🚪</span> Door 1, 3rd floor Joanna Grace Building, Brgy. Sto. Niño, Panabo City, Philippines
                </p>
            </section>

            <section className="clientIndex-contactUs">
                <h2>Contact Us</h2>
                <div className="clientIndex-contactLinks">
                    <a href="https://www.facebook.com/beyoutiful8" className="clientIndex-socialLink" target="_blank" rel="noopener noreferrer">
                        <span className="clientIndex-socialIcon">📱</span> Facebook
                    </a>
                    <p className="clientIndex-contactInfo">
                        <span className="clientIndex-socialIcon">📞</span> +63 945 627 9835
                    </p>
                    <p className="clientIndex-contactInfo">
                        <span className="clientIndex-socialIcon">📧</span> sparadise8@gmail.com
                    </p>
                </div>
            </section>
        </div>
    );
};

export default ClientIndex;