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
import { NavLink } from "react-router-dom";
import SpaRadiseAuth from "../firebase/SpaRadiseAuth";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";
import SpaRadiseLogo from "../images/SpaRadise Logo.png";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface EmployeeSidebarPageData extends SpaRadisePageData {

    accountData: AccountData,
    accountId?: string

}

export default function EmployeeSidebar( { pageData, reloadPageData }: {
    pageData: EmployeeSidebarPageData,
    reloadPageData(): void
} ): JSX.Element {

    const navigate = useNavigate();

    async function handleLogIn(): Promise< void > {
    
        await SpaRadiseAuth.signInGoogle();

    }

    async function handleLogOut(): Promise< void > {

        await SpaRadiseAuth.signOutGoogle();
        pageData.accountId = undefined;
        navigate( `/` );
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
        if( !accountData || accountData.accountType === "customer" ) return;
        pageData.accountData = accountData;
        reloadPageData();

    }

    useEffect( () => {
    
        const auth: Auth = SpaRadiseAuth.getAuth();
        onAuthStateChanged( auth, user => {

            if( !user ) return;
            loadAccountData();

        } );

    }, [] );

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <img src={SpaRadiseLogo} alt="SpaRadise Logo" />
            </div>
            <ul className="sidebar-menu">
                <li>
                    <NavLink 
                        to="/management/dashboard" 
                        className={({ isActive }) => isActive ? "active" : ""}
                    >
                        Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/management/bookings/menu" 
                        className={({ isActive }) => isActive ? "active" : ""}
                    >
                        Bookings
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/management/accounts/menu" 
                        className={({ isActive }) =>
                            (window.location.pathname.startsWith("/management/accounts"))  ? "active" : ""
                        }                    >
                        Clients
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/management/employees/menu" 
                        className={({ isActive }) =>
                            window.location.pathname.startsWith("/management/employee") ? "active" : ""
                        }
                    >
                        Employees
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/management/jobs/menu" 
                        className={({ isActive }) =>
                            window.location.pathname.startsWith("/management/jobs") ? "active" : ""
                        }
                    >
                        Jobs
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/management/employeeLeaves/menu" 
                        className={({ isActive }) =>
                            window.location.pathname.startsWith("/management/employeeLeaves") ? "active" : ""
                        }
                    >
                        Leaves
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/management/capacities/menu" 
                        className={({ isActive }) =>
                            window.location.pathname.startsWith("/management/capacities/menu") ? "active" : ""
                        }
                    >
                        Rooms & Chairs
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/management/servicesAndPackages/menu" 
                        className={({ isActive }) =>
                            window.location.pathname.startsWith("/management/services") || (window.location.pathname.startsWith("/management/packages"))  ? "active" : ""
                        }      
                    >
                        Services & Packages
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/management/vouchers/menu" 
                        className={({ isActive }) =>
                            window.location.pathname.startsWith("/management/vouchers") ? "active" : ""
                        }
                    >
                        Vouchers
                    </NavLink>
                </li>
                <li>{
                    SpaRadiseAuth.isSignedIn() ? <button className="client-home-link" onClick={ () => handleLogOut() }>Log Out</button>
                    : <button className="client-home-link" onClick={ () => handleLogIn() }>Log In</button>
                }</li>
            </ul>
        </div>
    );
}
