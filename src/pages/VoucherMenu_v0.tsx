import { Link } from "react-router-dom";
import { AccountData, VoucherDataMap } from "../firebase/SpaRadiseTypes";
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
import StringUtils from "../utils/StringUtils";
import "../styles/EmployeeServiceManagement.css";
import "../styles/Sidebar.css";
import EmployeeSidebar from "../components/EmployeeSidebar";
import SpaRadiseLogo from "../images/SpaRadise Logo.png";
import { documentId } from "firebase/firestore/lite";
import LoadingScreen from "../components/LoadingScreen";

type rowType = "package" | "service";
type showMode = "all" | rowType;
type sortMode = "ascending" | "descending";

interface VoucherMenuPageData extends SpaRadisePageData {

    accountData: AccountData,
    accountId?: documentId,
    voucherDataMap: VoucherDataMap,
    rowTypeMap: { [documentId: documentId]: rowType },
    packageDataMap: PackageDataMap,
    serviceDataMap: ServiceDataMap

}

export default function VoucherMenu(): JSX.Element {

    const
        [pageData, setPageData] = useState<VoucherMenuPageData>({
            accountData: {} as unknown as AccountData,
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
            <EmployeeSidebar pageData={pageData} reloadPageData={reloadPageData} />
            <LoadingScreen loading={!pageData.loaded}></LoadingScreen>

            <div className="service-menu-main-content">
                <label htmlFor="service-menu-main-content" className="service-menu-main-content-location">Vouchers
                </label>
                <div className="service-menu-form-section">

                    <div className="controls">
                        <input placeholder="Search vouchers" className="search" value={search} onChange={event => handleChangeSearch(event)} />
                        <button className="filter-btn" type="button" value={sortMode} onClick={toggleSortMode}>{
                            (sortMode === "ascending") ? "A - Z" : "Z - A"
                        }</button>
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
                        <tbody>
                            {
                                Object.keys(voucherDataMap)
                                    .sort((voucherId1, voucherId2) =>
                                        StringUtils.compare(
                                            voucherDataMap[voucherId1].name,
                                            voucherDataMap[voucherId2].name,
                                            sortMode === "ascending"
                                        )
                                    )
                                    .map((voucherId, index) => {
                                        const voucherData = voucherDataMap[voucherId];
                                        const { name, code, percentage, amount } = voucherData;
                                        const count = (index + 1).toString();
                                        const show = StringUtils.has(`${count}\t${name}`, search);

                                        // Determine type symbol and value
                                        const type = percentage != null ? "%" : amount != null ? "₱" : "—";
                                        const value = percentage != null ? percentage : amount != null ? amount : "—";

                                        return show ? (
                                            <tr key={voucherId} onClick={() => navigate(`/management/vouchers/${voucherId}`)}>
                                                <td>{count}</td>
                                                <td>{name}</td>
                                                <td>{code}</td>
                                                <td>{type}</td>
                                                <td>{value}</td>
                                            </tr>
                                        ) : null;
                                    })
                            }
                        </tbody>




                    </table>
                </div>

            </div>
        </div>
    </>;

}
