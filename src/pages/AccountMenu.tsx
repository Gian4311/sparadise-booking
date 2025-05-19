import { AccountData, AccountDataMap } from "../firebase/SpaRadiseTypes";
import AccountUtils from "../firebase/AccountUtils";
import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";
import {
    useEffect,
    useState
} from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";
import "../styles/EmployeeServiceMenu.css";
import LoadingScreen from "../components/LoadingScreen";
import { Link, useNavigate } from "react-router-dom";
import { ChangeEvent } from "react";
import StringUtils from "../utils/StringUtils";
import ObjectUtils from "../utils/ObjectUtils";
import PersonUtils from "../utils/PersonUtils";

type sortMode = "ascending" | "descending";

interface AccountMenuPageData extends SpaRadisePageData {

    accountData: AccountData,
    accountId?: documentId,
    accountDataMap: AccountDataMap

}

export default function AccountMenu(): JSX.Element {

    const
        [pageData, setPageData] = useState<AccountMenuPageData>({
            accountData: {} as unknown as AccountData,
            accountDataMap: {},
            loaded: false,
            updateMap: {}
        }),
        { accountDataMap } = pageData,
        [search, setSearch] = useState<string>(""),
        [sortMode, setSortMode] = useState<sortMode>("ascending"),
        navigate = useNavigate()
    ;

    async function loadPageData(): Promise<void> {

        pageData.accountDataMap = await AccountUtils.getAccountDataMapAll();
        pageData.loaded = true;
        reloadPageData();

    }

    function handleChangeSearch(event: ChangeEvent<HTMLInputElement>): void {
    
        const { value } = event.target;
        setSearch(value);

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    function toggleSortMode(): void {

        const newSortMode: sortMode = (sortMode === "ascending") ? "descending" : "ascending";
        setSortMode(newSortMode);

    }

    useEffect(() => { loadPageData(); }, []);

    return <>
        <EmployeeSidebar pageData={ pageData } reloadPageData={ reloadPageData }/>
        <LoadingScreen loading={!pageData.loaded}></LoadingScreen>
        <div>
            
            <div className="service-menu-main-content">
                <label htmlFor="service-menu-main-content" className="service-menu-main-content-location">Accounts</label>
                <div className="service-menu-form-section">
                    <div className="service-stats">
                        <div className="service-stat">{ObjectUtils.keyLength( accountDataMap )}<br></br><span>Total Accounts</span></div>
                    </div>
                    <div className="controls">
                        <input placeholder="Search accounts" className="search" value={search} onChange={event => handleChangeSearch(event)} />
                        <button className="filter-btn" type="button" value={sortMode} onClick={toggleSortMode}>{
                            (sortMode === "ascending") ? "A - Z" : "Z - A"
                        }</button>
                        <Link to="/management/accounts/new"><button className="action-btn" type="button">+ Add new</button></Link>
                    </div>
                    <table className="services-table">
                        <thead><tr>
                            <th>#</th>
                            <th>Email</th>
                            <th>Name</th>
                            <th>Account Type</th>
                        </tr></thead>
                        <tbody>{
                            Object.keys( accountDataMap ).sort((documentId1, documentId2) => {

                                const
                                    { lastName: lastName1, firstName: firstName1, middleName: middleName1 } = accountDataMap[documentId1],
                                    { lastName: lastName2, firstName: firstName2, middleName: middleName2 } = accountDataMap[documentId2],
                                    name1 = `${ lastName1 }\t${ firstName1 }\t${ middleName1 ? middleName1 : "" }`,
                                    name2 = `${ lastName2 }\t${ firstName2 }\t${ middleName2 ? middleName2 : "" }`
                                ;
                                return StringUtils.compare(
                                    name1, name2,
                                    (sortMode === "ascending")
                                )

                            }).map((documentId, index) => {

                                const
                                    count: string = (index + 1).toString(),
                                    accountData = accountDataMap[documentId],
                                    show: boolean = StringUtils.has(
                                        `${count}\t${accountData.email}\t${PersonUtils.toString( accountData, "f mi l" )}`
                                        , search
                                    )
                                ;
                                return show ? <tr key={documentId} onClick={() => navigate(`/management/accounts/${documentId}`)}>
                                    <td>{count}</td>
                                    <td>{ accountData.email }</td>
                                    <td>{ PersonUtils.toString( accountData, "f mi l" ) }</td>
                                    <td>{ accountData.accountType === "customer" ? "Customer" : "Manager" }</td>
                                </tr> : undefined;

                            })
                        }</tbody>
                    </table>
                </div>
            </div>
        </div>
    </>;

}
