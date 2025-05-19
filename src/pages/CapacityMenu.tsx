import { AccountData, CapacityDataMap } from "../firebase/SpaRadiseTypes";
import CapacityUtils from "../firebase/CapacityUtils";
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
import DateUtils from "../utils/DateUtils";

type sortMode = "ascending" | "descending";

interface CapacityMenuPageData extends SpaRadisePageData {

    accountData: AccountData,
    accountId?: documentId,
    capacityDataMap: CapacityDataMap

}

export default function CapacityMenu(): JSX.Element {

    const
        [pageData, setPageData] = useState<CapacityMenuPageData>({
            accountData: {} as unknown as AccountData,
            capacityDataMap: {},
            loaded: false,
            updateMap: {}
        }),
        { capacityDataMap } = pageData,
        [search, setSearch] = useState<string>(""),
        [sortMode, setSortMode] = useState<sortMode>("ascending"),
        navigate = useNavigate()
    ;

    async function loadPageData(): Promise<void> {

        pageData.capacityDataMap = await CapacityUtils.getCapacityDataMapAll();
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
                <label htmlFor="service-menu-main-content" className="service-menu-main-content-location">Capacitys</label>
                <div className="service-menu-form-section">
                    <div className="service-stats">
                        <div className="service-stat">{ObjectUtils.keyLength( capacityDataMap )}<br></br><span>Total History</span></div>
                    </div>
                    <div className="controls">
                        <input placeholder="Search services or packages" className="search" value={search} onChange={event => handleChangeSearch(event)} />
                        <button className="filter-btn" type="button" value={sortMode} onClick={toggleSortMode}>{
                            (sortMode === "ascending") ? "New to Old" : "Old to New"
                        }</button>
                        <Link to="/management/capacities/new"><button className="action-btn" type="button">+ Add new</button></Link>
                    </div>
                    <table className="services-table">
                        <thead><tr>
                            <th>#</th>
                            <th>Rooms</th>
                            <th>Chairs</th>
                            <th>Date & Time</th>
                        </tr></thead>
                        <tbody>{
                            Object.keys( capacityDataMap ).map((documentId, index) => {

                                const
                                    count: string = (index + 1).toString(),
                                    { roomCount, chairCount, datetime } = capacityDataMap[documentId],
                                    show: boolean = StringUtils.has(
                                        `${count}`
                                        , search
                                    )
                                ;
                                return show ? <tr key={documentId} onClick={() => navigate(`/management/capacities/${documentId}`)}>
                                    <td>{count}</td>
                                    <td>{ roomCount }</td>
                                    <td>{ chairCount }</td>
                                    <td>{ datetime ? DateUtils.toString( datetime, "Mmmm dd, yyyy - hh:mm a.m." ) : undefined }</td>
                                </tr> : undefined;

                            })
                        }</tbody>
                    </table>
                </div>
            </div>
        </div>
        <Link to="/management/capacities/new">
            <h1>New</h1>
        </Link>
    </>;

}
