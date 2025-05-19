import {
    AccountData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import AccountUtils from "../firebase/AccountUtils";
import {
    Auth,
    onAuthStateChanged
} from "firebase/auth";
import DateUtils from "../utils/DateUtils";
import { Link } from "react-router-dom";
import NotificationSymbol from "../images/Notification Symbol.png";
import SpaRadiseAuth from "../firebase/SpaRadiseAuth";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";
import SparadiseLogo from "../images/SpaRadise Logo.png";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface EmployeeSidePageData extends SpaRadisePageData {

    accountData: AccountData

}

export default function ClientNavBar( { pageData, reloadPageData }: {
    pageData: EmployeeSidePageData,
    reloadPageData(): void
} ): JSX.Element {

    const navigate = useNavigate();

    async function handleLogIn(): Promise< void > {

        await SpaRadiseAuth.signInGoogle();

    }

    async function loadAccountData(): Promise< void > {

        const email = SpaRadiseAuth.getEmail();
            if( !email ) return;
            // let accountData: AccountData | undefined =
            //     await AccountUtils.getAccountDataByEmail( email )
            // ;
            // if( !accountData ) {

            //     accountData = {
            //         lastName: "",
            //         firstName: "",
            //         middleName: null,
            //         sex: "male",
            //         birthDate: DateUtils.addTime( new Date(), { yr: -SpaRadiseEnv.MIN_AGE_LIMIT - 1 } ),
            //         email,
            //         contactNumber: "",
            //         contactNumberAlternate: null,
            //         accountType: "customer"
            //     }
            //     await AccountUtils.createAccount( accountData );

            // }

    }

    useEffect( () => {

        const auth: Auth = SpaRadiseAuth.getAuth();
        onAuthStateChanged( auth, user => {

            if( !user ) return;
            loadAccountData();

        } );

    }, [] );

    return (
        <div>
            <nav className="client-home-navbar">
                <div className="client-home-nav-left">
                    <img src={SparadiseLogo} alt="SpaRadise Logo" className="client-home-logo" />
                </div>

                <div className="client-home-nav-center">
                    <Link to="/" className="client-home-link">Home</Link>
                    <a href="/bookingList" className="client-home-link">Bookings</a>
                    <Link to="/clients/A6xoQYfymODeKJdp8bnT/account" className="client-home-link">Account</Link>
                    {
                        SpaRadiseAuth.isSignedIn() ? <button className="client-home-link">Log Out</button>
                        : <button className="client-home-link" onClick={ () => handleLogIn() }>Log In</button>
                    }
                    <Link to="/clients/A6xoQYfymODeKJdp8bnT/account" className="client-home-link">Account</Link>
                    
                </div>

                <div className="client-home-nav-right">
                    <img src={NotificationSymbol} alt="Notifications" className="client-home-icon" />
                </div>
            </nav>
        </div>);

}
