import { Link } from "react-router-dom";
import { VoucherDataMap } from "../firebase/SpaRadiseTypes";
import VoucherUtils from "../firebase/VoucherUtils";
import { SpaRadisePageData, PackageDataMap, ServiceDataMap } from "../firebase/SpaRadiseTypes";
import { useNavigate } from "react-router-dom";
import {
    useEffect,
    useState,
    ChangeEvent
} from "react";
import PackageUtils from "../firebase/PackageUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import "../styles/EmployeeServiceManagement.css";
import "../styles/Sidebar.css";
import EmployeeSidebar from "../components/EmployeeSidebar";

import SpaRadiseLogo from "../images/SpaRadise Logo.png";

type rowType = "package" | "service";
type showMode = "all" | rowType;
type sortMode = "ascending" | "descending";

interface VoucherMenuPageData extends SpaRadisePageData {

    voucherDataMap: VoucherDataMap,
    rowTypeMap: { [documentId: documentId]: rowType },
    packageDataMap: PackageDataMap,
    serviceDataMap: ServiceDataMap

}

export default function VoucherMenu(): JSX.Element {

    const
        [pageData, setPageData] = useState<VoucherMenuPageData>({
            loaded: false,
            voucherDataMap: {},
            packageDataMap: {},
            serviceDataMap: {},
            updateMap: {},
            rowTypeMap: {}
        }),
        { voucherDataMap, rowTypeMap, packageDataMap, serviceDataMap } = pageData,

        [search, setSearch] = useState<string>(""),
        [showMode, setShowMode] = useState<showMode>("all"),
        [sortMode, setSortMode] = useState<sortMode>("ascending"),
        navigate = useNavigate()
        ;

    function getDataMap(documentId: string): PackageDataMap | ServiceDataMap {

        switch (rowTypeMap[documentId]) {

            case "package": return packageDataMap;
            case "service": return serviceDataMap;

        }

    }

    function handleChangeSearch(event: ChangeEvent<HTMLInputElement>): void {

        const { value } = event.target;
        setSearch(value);

    }

    function handleChangeShowMode(event: ChangeEvent<HTMLSelectElement>): void {

        const newShowMode: showMode = event.target.value as showMode;
        setShowMode(newShowMode);

    }

    async function loadPageData(): Promise<void> {

        pageData.voucherDataMap = await VoucherUtils.getVoucherDataMapAll();
        pageData.loaded = true;

        pageData.packageDataMap = await PackageUtils.getPackageDataMapAll();
        pageData.serviceDataMap = await ServiceUtils.getServiceDataMapAll();
        const { packageDataMap, rowTypeMap, serviceDataMap } = pageData;
        for (let packageId in packageDataMap) rowTypeMap[packageId] = "package";
        for (let serviceId in serviceDataMap) rowTypeMap[serviceId] = "service";
        pageData.loaded = true;
        reloadPageData();

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
        <div>
            <EmployeeSidebar />
            <div className="sidebar">
                <div className="sidebar-logo">
                    <img src={SpaRadiseLogo} alt="SpaRadise Logo" />
                </div>
                <ul className="sidebar-menu">
                    <li><Link to="../management/dashboard" >Dashboard</Link></li>
                    <li><Link to="../management/bookings/menu" >Bookings</Link></li>
                    <li><Link to="../management/clients/menu" >Clients</Link></li>
                    <li><Link to="/management/employees/menu" >Employees</Link></li>
                    <li><Link to="../management/servicesAndPackages/menu">Services & Packages</Link></li>
                    <li><Link to="../management/vouchers/menu" className="active"  >Vouchers</Link></li>
                    <li><Link to="../management/roomsAndChairs/menu" >Rooms & Chairs</Link></li>
                    <li><Link to="../management/commissions/menu" >Commissions</Link></li>
                    <li><a href="#">Log Out</a></li>
                </ul>
            </div>

            <div className="service-menu-main-content">
                <label htmlFor="service-menu-main-content" className="service-menu-main-content-location">Vouchers
                </label>
                <div className="service-menu-form-section">

                    <div className="controls">
                        <input placeholder="Search services or packages" className="search" value={search} onChange={event => handleChangeSearch(event)} />
                        <button className="filter-btn" type="button" value={sortMode} onClick={toggleSortMode}>{
                            (sortMode === "ascending") ? "A - Z" : "Z - A"
                        }</button>
                        <select className="filter-btn" id="filter-select" value={showMode} onChange={event => handleChangeShowMode(event)}>
                            <option value="">Show All</option>
                            <option value="service">Services only</option>
                            <option value="package">Packages only</option>
                        </select>
                        <Link to="/management/vouchers/new"><button className="action-btn" type="button">+ Add new Voucher</button></Link>
                    </div>
                    <table className="services-table">
                        <thead><tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Type</th>
                            <th>Amount</th>
                        </tr></thead>
                        <tbody>                        {

                            voucherDataMap ? Object.keys(voucherDataMap).map((voucherId, index) => {

                                const voucherData = pageData.voucherDataMap[voucherId];
                                return <Link key={index} to={"/management/vouchers/" + voucherId}>
                                    <h1>{voucherData.name}</h1>
                                </Link>

                            }) : undefined

                        }

                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    </>;

}
