import {
    AccountData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import React from 'react';
import { Link } from "react-router-dom";
import { NavLink } from 'react-router-dom';
import '../styles/ClientHomePage.css';
import SparadiseLogo from "../images/SpaRadise Logo.png";
import NotificationSymbol from "../images/Notification Symbol.png";
import Background from "../images/indexbackground.jpg";
import LoadingScreen from '../components/LoadingScreen';
import PopupModal from "../components/PopupModal";
import {
    useEffect,
    useState
} from "react";

import Massage from "../images/massage.jpg";
import Facials from "../images/facial.jpeg";
import Lashes from "../images/lashes.jpg";
import Brows from "../images/brows.jpg";
import Manicure from "../images/manicure.jpg";
import Pedicure from "../images/pedcure.jpg";
import Waxing from "../images/waxing.jpg";
import Gluta from "../images/gluta.jpeg";

import NavBar from "../components/ClientNavBar";

interface ClientHomePageData extends SpaRadisePageData {

    accountData: AccountData,
    accountId?: documentId

}

export default function ClientHomePage() {

    const
        [ pageData, setPageData ] = useState< ClientHomePageData >( {
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
        } )
    ;

    async function handleNoAccount(): Promise< void > {

        pageData.popupData = {
            children: "An account logged in is required to book.",
            popupMode: "yesOnly",
            yesText: "OK"
        }
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    return <>
        <PopupModal pageData={ pageData } reloadPageData={ reloadPageData }/>
        <div className="client-home-container">

            <NavBar pageData={ pageData } reloadPageData={ reloadPageData }/>


            {/* Hero Section */}
            <div className="client-home-hero">
                <img
                    src={Background}
                    alt="Spa Background"
                    className="client-home-hero-img"
                />

                <div className="client-home-hero-overlay">
                    <h1 className="client-home-title">Welcome to SpaRadise</h1>
                    <p className="client-home-subtitle">Beauty within your reach...</p>

                    {
                        pageData.accountId ? <Link to={ `/clients/${ pageData.accountId }/bookings/new` }>
                            <button className="client-home-button">Book Now</button>
                        </Link> : <button className="client-home-button" onClick={ () => handleNoAccount() }>Book Now</button>
                    }
                </div>
            </div>

            {/* Services Section */}
            <div className="services-section">
                <h2 className="section-title">Our Services</h2>
                <div className="services-container">
                    {/* Add your services here, each with an image, title, and description */}
                    <div className="service-item">
                        <img src={Massage} alt="Massage" className="service-image" />
                        <h3 className="service-title">Massage</h3>
                        <p className="service-description">Relieve stress and tension with a soothing full-body massage experience.</p>
                    </div>
                    <div className="service-item">
                        <img src={Facials} alt="Facial" className="service-image" />
                        <h3 className="service-title">Facial</h3>
                        <p className="service-description">Relieve stress and tension with a soothing full-body massage experience.</p>
                    </div>
                    <div className="service-item">
                        <img src={Lashes} alt="Lashes" className="service-image" />
                        <h3 className="service-title">Lashes</h3>
                        <p className="service-description">Enhance your natural beauty with voluminous, long-lasting lash extensions.</p>
                    </div>
                    <div className="service-item">
                        <img src={Brows} alt="Brows" className="service-image" />
                        <h3 className="service-title">Brows</h3>
                        <p className="service-description">Define your brows with precision shaping for a flawless, natural look.</p>
                    </div>
                    <div className="service-item">
                        <img src={Manicure} alt="Manicure" className="service-image" />
                        <h3 className="service-title">Manicure</h3>
                        <p className="service-description">Pamper your hands with a rejuvenating manicure, including nail care and polish.</p>
                    </div>
                    <div className="service-item">
                        <img src={Pedicure} alt="Pedicure" className="service-image" />
                        <h3 className="service-title">Pedicure</h3>
                        <p className="service-description">Treat your feet to a luxurious pedicure that softens and beautifies.</p>
                    </div>
                    <div className="service-item">
                        <img src={Waxing} alt="Waxing" className="service-image" />
                        <h3 className="service-title">Waxing</h3>
                        <p className="service-description">Enjoy smooth, hair-free skin with our gentle and effective waxing treatments.</p>
                    </div>
                    <div className="service-item">
                        <img src={Gluta} alt="Gluta Drip" className="service-image" />
                        <h3 className="service-title">Gluta Drip</h3>
                        <p className="service-description">Brighten and revitalize your skin with a rejuvenating Glutathione drip infusion.</p>
                    </div>
                </div>
            </div>

            {/* Opening Hours Section */}
            <div className="hours-section">
                <h2 className="section-title">Opening Hours</h2>
                <ul>
                    <li>9AM - 8PM (Monday - Friday)</li>
                    <li>10AM - 6PM (Saturday)</li>
                    <li>Closed on Sundays</li>
                </ul>
            </div>

            {/* Contact Us Section */}
            <div className="contact-section">
                <h2 className="section-title">Contact Us</h2>
                <p>
                    📱 <a href="https://www.facebook.com/your-facebook-page" target="_blank" rel="noopener noreferrer">Facebook</a>
                </p>
                <p>
                    📞 <a href="tel:+639456279835">+63 945 627 9835</a>
                </p>
                <p>
                    📧 <a href="mailto:sparadise8@gmail.com">sparadise8@gmail.com</a>
                </p>
                <br />
                <p>
                    📍 <a href="https://www.google.com/maps?q=Door+1,+3rd+floor+Joanna+Grace+Building,+Brgy.+Sto.+Niño,+Panabo+City,+Philippines" target="_blank" rel="noopener noreferrer">
                        Door 1, 3rd floor Joanna Grace Building, Brgy. Sto. Niño, Panabo City, Philippines
                    </a>
                </p>
            </div>


        </div>
    </>;
}
