import {
    AccountData,
    AccountDataMap,
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

interface ClientNavBarPageData extends SpaRadisePageData {

    accountData: AccountData,
    accountId?: string

}

export default function ClientNavBar( { pageData, reloadPageData }: {
    pageData: ClientNavBarPageData,
    reloadPageData(): void
} ): JSX.Element {

    const navigate = useNavigate();

    async function handleLogIn(): Promise< void > {

        await SpaRadiseAuth.signInGoogle();

    }

    async function handleLogOut(): Promise< void > {

        await SpaRadiseAuth.signOutGoogle();
        pageData.accountId = undefined;
        reloadPageData();

    }

    async function loadAccountData(): Promise< void > {

        const email = SpaRadiseAuth.getEmail();
        if( !email ) return;
        const accountDataMap: AccountDataMap =
            await AccountUtils.getAccountDataByEmail( email )
        ;
        let accountData: AccountData | undefined = undefined;
        for( let accountId in accountDataMap ) {

            accountData = accountDataMap[ accountId ];
            pageData.accountId = accountId;

        }
        if( accountData ) {

            pageData.accountData = accountData;
            reloadPageData();
            return;

        }
        accountData = {
            lastName: "",
            firstName: "",
            middleName: null,
            sex: "male",
            birthDate: DateUtils.addTime( new Date(), { yr: -SpaRadiseEnv.MIN_AGE_LIMIT - 1 } ),
            email,
            contactNumber: "",
            contactNumberAlternate: null,
            accountType: "customer"
        }
        const { id: accountId } = await AccountUtils.createAccount( accountData );
        navigate( `clients/${ accountId }/account` );

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
                    {
                        !pageData.accountId ? undefined
                        : ( pageData.accountData.accountType === "customer" ) ? <a href="/bookingList" className="client-home-link">Bookings</a>
                        : <Link to={ `/management/dashboard` } className="client-home-link">Manage</Link>
                    }
                    {
                        pageData.accountId ? <Link to={ `/clients/${ pageData.accountId }/account` } className="client-home-link">Account</Link>
                        : undefined
                    }
                    {
                        SpaRadiseAuth.isSignedIn() ? <button className="client-home-link" onClick={ () => handleLogOut() }>Log Out</button>
                        : <button className="client-home-link" onClick={ () => handleLogIn() }>Log In</button>
                    }
                </div>

                <div className="client-home-nav-right">
                    {/* <img src={NotificationSymbol} alt="Notifications" className="client-home-icon" /> */}
                </div>
            </nav>
        </div>);

}
