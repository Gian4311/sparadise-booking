import {
    ChangeEvent,
    useEffect,
    useState
} from "react";
import { Link } from "react-router-dom";
import ObjectUtils from "../utils/ObjectUtils";
import {
    PackageDataMap,
    PackageMaintenanceData,
    ServiceDataMap,
    ServiceMaintenanceData
} from "../firebase/SpaRadiseTypes";
import PackageMaintenanceUtils from "../firebase/PackageMaintenanceUtils";
import PackageUtils from "../firebase/PackageUtils";
import ServiceMaintenanceUtils from "../firebase/ServiceMaintenanceUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";
import StringUtils from "../utils/StringUtils";
import { useNavigate } from "react-router-dom";
import EmployeeSidebar from "../components/EmployeeSidebar";

import "../styles/EmployeeServiceMenu.css";
import "../styles/Sidebar.css";

import SpaRadiseLogo from "../images/SpaRadise Logo.png";

type rowType = "package" | "service";
type showMode = "all" | rowType;
type sortMode = "ascending" | "descending";

interface ServicePackageMenuPageData extends SpaRadisePageData {

    maintenanceDataMap: { [documentId: documentId]: PackageMaintenanceData | ServiceMaintenanceData },
    packageDataMap: PackageDataMap,
    rowTypeMap: { [documentId: documentId]: rowType },
    serviceDataMap: ServiceDataMap

}

export default function ServicePackageMenu(): JSX.Element {

    const
        [pageData, setPageData] = useState<ServicePackageMenuPageData>({
            loaded: false,
            maintenanceDataMap: {},
            packageDataMap: {},
            rowTypeMap: {},
            serviceDataMap: {},
            updateMap: {}
        }),
        { maintenanceDataMap, packageDataMap, rowTypeMap, serviceDataMap } = pageData,
        [search, setSearch] = useState<string>(""),
        [showMode, setShowMode] = useState<showMode>( "all" ),
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

        pageData.packageDataMap = await PackageUtils.getPackageDataMapAll();
        pageData.serviceDataMap = await ServiceUtils.getServiceDataMapAll();
        const { packageDataMap, rowTypeMap, serviceDataMap } = pageData;
        for (let packageId in packageDataMap) rowTypeMap[packageId] = "package";
        for (let serviceId in serviceDataMap) rowTypeMap[serviceId] = "service";
        const date: Date = new Date();
        const
            packageMaintenanceDataMap =
                await PackageMaintenanceUtils.getPackageMaintenanceDataMapByDate(date)
            ,
            serviceMaintenanceDataMap =
                await ServiceMaintenanceUtils.getServiceMaintenanceDataMapByDate(date)
            ;
        pageData.maintenanceDataMap = { ...packageMaintenanceDataMap, ...serviceMaintenanceDataMap };
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

    function validateActiveServiceOrPackage(keyName: string): boolean {

        return (maintenanceDataMap[keyName].status === "active");

    }

    useEffect(() => { loadPageData(); }, []);

    return <>
        <div>
        <EmployeeSidebar/>

            <div className="service-menu-main-content">
                <label htmlFor="service-menu-main-content" className="service-menu-main-content-location">Services & Packages
                </label>
                <div className="service-menu-form-section">
                    <div className="service-stats">
                        <div className="service-stat">{ObjectUtils.keyLength(rowTypeMap)}<br></br><span>Services & Packages</span></div>

                        <div className="service-stat">{ObjectUtils.keyLength(serviceDataMap)}<br></br><span>Services</span></div>

                        <div className="service-stat">{
                            ObjectUtils.keyLength(ObjectUtils.filter(
                                serviceDataMap, validateActiveServiceOrPackage
                            ))
                        }<br></br><span>Active Services</span></div>

                        <div className="service-stat"> {ObjectUtils.keyLength(packageDataMap)}<br></br><span>Packages</span></div>

                        <div className="service-stat"> {ObjectUtils.keyLength(ObjectUtils.filter(packageDataMap, validateActiveServiceOrPackage))}<br></br><span>Active Packages</span></div>

                    </div>

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
                            <Link to="/management/services/new"><button className="action-btn" type="button">+ Add new service</button></Link>
                            <Link to="/management/packages/new"><button className="action-btn" type="button">+ Add new package</button></Link>
                    </div>
                    <table className="services-table">
                        <thead><tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Commission</th>
                        </tr></thead>
                        <tbody>{
                            Object.keys(rowTypeMap).sort((documentId1, documentId2) => StringUtils.compare(
                                getDataMap(documentId1)[documentId1].name,
                                getDataMap(documentId2)[documentId2].name,
                                (sortMode === "ascending")
                            )
                            ).map((documentId, index) => {

                                const
                                    rowType: rowType = rowTypeMap[documentId],
                                    maintenanceData = maintenanceDataMap[documentId],
                                    count: string = (index + 1).toString(),
                                    { name } = getDataMap(documentId)[documentId],
                                    rowTypeName = (rowType === "package") ? "Package" : "Service",
                                    price = `₱${maintenanceData.price}`,
                                    statusName = (maintenanceData.status === "active") ? "Active" : "Inactive",
                                    commissionPercentage = (rowType === "service") ? `${maintenanceData.commissionPercentage as number}%` : `-`,
                                    show: boolean = (
                                        (showMode === "all" || showMode === rowType)
                                        && StringUtils.has(
                                            `${count}\t${name}\t${rowTypeName}\t${price}\t${statusName}\t${commissionPercentage}`
                                            , search
                                        )
                                    )
                                    ;
                                return show ? <tr key={documentId} onClick={ () => navigate( `/management/${ rowType }s/${ documentId }` ) }>
                                    <td>{count}</td>
                                    <td>{name}</td>
                                    <td>{rowTypeName}</td>
                                    <td>{price}</td>
                                    <td>{statusName}</td>
                                    <td>{commissionPercentage}</td>
                                </tr> : undefined;

                            })
                        }</tbody>
                    </table>
                    <button type="button" onClick={() => console.log(pageData)}>Log Page Data</button>
                </div>
            </div>
        </div>
    </>;

}
