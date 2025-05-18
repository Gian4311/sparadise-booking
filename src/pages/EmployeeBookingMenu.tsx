import BookingDateInput from "../components/BookingDateInput";
import {
    BookingDataMap,
    ClientDataMap,
    EmployeeDataMap,
    EmployeeLeaveDataMap,
    JobDataMap,
    JobServiceDataMap,
    PackageDataMap,
    PackageMaintenanceData,
    ServiceDataMap,
    ServiceMaintenanceData,
    ServiceTransactionDataMap,
    ServiceTransactionEmployeeListKeyMap,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import BookingUtils from "../firebase/BookingUtils";
import ClientUtils from "../firebase/ClientUtils";
import DateRange from "../utils/DateRange";
import DayPlanner from "../components/DayPlanner";
import EmployeeLeaveUtils from "../firebase/EmployeeLeaveUtils";
import EmployeeSidebar from "../components/EmployeeSidebar";
import EmployeeUtils from "../firebase/EmployeeUtils";
import JobServiceUtils from "../firebase/JobServiceUtils";
import JobUtils from "../firebase/JobUtils";
import LoadingScreen from "../components/LoadingScreen";
import PackageMaintenanceUtils from "../firebase/PackageMaintenanceUtils";
import PackageUtils from "../firebase/PackageUtils";
import ServiceMaintenanceUtils from "../firebase/ServiceMaintenanceUtils";
import ServiceTransactionUtils from "../firebase/ServiceTransactionUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import {
    useEffect,
    useState
} from "react";
import { useParams } from "react-router-dom";

import "../styles/BookingCalendar.scss";
import "../styles/EmployeeBookingMenu.scss";
import "../styles/EmployeeServiceMenu.css";

interface EmployeeBookingMenuPageData extends SpaRadisePageData {

    bookingDataMap: BookingDataMap,
    bookingIdActive: string | undefined,
    clientDataMap: ClientDataMap,
    date: Date,
    employeeDataMap: EmployeeDataMap,
    employeeLeaveOfDayDataMap: EmployeeLeaveDataMap,
    jobDataMap: JobDataMap,
    jobServiceDataMap: JobServiceDataMap,
    maintenanceDataMap: { [documentId: documentId]: PackageMaintenanceData | ServiceMaintenanceData },
    packageDataMap: PackageDataMap,
    serviceDataMap: ServiceDataMap,
    serviceTransactionEmployeeListKeyMap: ServiceTransactionEmployeeListKeyMap,
    serviceTransactionOfDayDataMap: ServiceTransactionDataMap

}

export default function EmployeeBookingMenu(): JSX.Element {

    const
        dateParam = useParams().date,
        [pageData, setPageData] = useState<EmployeeBookingMenuPageData>({
            bookingDataMap: {},
            bookingIdActive: undefined,
            clientDataMap: {},
            date: dateParam ? new Date(dateParam) : new Date(),
            employeeDataMap: {},
            employeeLeaveOfDayDataMap: {},
            jobDataMap: {},
            jobServiceDataMap: {},
            maintenanceDataMap: {},
            loaded: false,
            packageDataMap: {},
            serviceDataMap: {},
            serviceTransactionEmployeeListKeyMap: {},
            serviceTransactionOfDayDataMap: {},
            updateMap: {}
        }),
        dayPlannerPageData = {
            ...pageData,
            employeeLeaveDataMap: pageData.employeeLeaveOfDayDataMap,
            serviceTransactionDefaultDataMap: pageData.serviceTransactionOfDayDataMap,
            serviceTransactionToAddDataMap: {} as ServiceTransactionDataMap
        }
        ;

    async function handleChangeDate(): Promise<void> {

        await loadMaintenanceData();
        await loadEmployeeData();
        pageData.serviceTransactionOfDayDataMap =
            await ServiceTransactionUtils.getServiceTransactionDataMapByDay(pageData.date, false)
            ;

    }

    async function loadBookingData(): Promise<void> {

        pageData.bookingDataMap = await BookingUtils.getBookingDataMapAll();

    }

    async function loadClientData(): Promise<void> {

        pageData.clientDataMap = await ClientUtils.getClientDataMapAll();

    }

    async function loadEmployeeData(): Promise<void> {

        const { date } = pageData;
        pageData.employeeDataMap = await EmployeeUtils.getEmployeeDataMapAll();
        pageData.employeeLeaveOfDayDataMap =
            await EmployeeLeaveUtils.getApprovedEmployeeLeaveDataMapByDay(date)
            ;

    }

    async function loadJobData(): Promise<void> {

        pageData.jobDataMap = await JobUtils.getJobDataMapAll();
        pageData.jobServiceDataMap = await JobServiceUtils.getJobServiceDataMapAll();

    }

    async function loadMaintenanceData(): Promise<void> {

        const
            { date } = pageData,
            packageMaintenanceDataMap =
                await PackageMaintenanceUtils.getPackageMaintenanceDataMapByDate(date)
            ,
            serviceMaintenanceDataMap =
                await ServiceMaintenanceUtils.getServiceMaintenanceDataMapByDate(date)
            ;
        pageData.maintenanceDataMap = { ...packageMaintenanceDataMap, ...serviceMaintenanceDataMap };

    }

    async function loadPageData(): Promise<void> {

        await loadServiceData();
        await loadJobData();
        await loadBookingData();
        await loadClientData();
        await handleChangeDate();
        pageData.loaded = true;
        reloadPageData();

    }

    async function loadServiceData(): Promise<void> {

        pageData.serviceDataMap = await ServiceUtils.getServiceDataMapAll();
        pageData.packageDataMap = await PackageUtils.getPackageDataMapAll();

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    useEffect(() => { loadPageData(); }, []);

    return <>
        <LoadingScreen loading={!pageData.loaded} />
        <EmployeeSidebar />
        <div className="service-menu-main-content">
            <label htmlFor="service-menu-main-content" className="service-menu-main-content-location">Bookings</label>
            <div className="service-menu-form-section">
                <div className="booking-management-date-input">
                    <label className="booking-management-date-input-label">Select date:</label> <BookingDateInput pageData={pageData} onChange={handleChangeDate} reloadPageData={reloadPageData} /></div>
                <DayPlanner dayPlannerMode="management" pageData={dayPlannerPageData} />
                <button onClick={() => console.log(pageData)}>Log page data</button>
            </div>
        </div>
        <main className="employee-booking-management-main-content">
        </main>
    </>;

}

function BookingManagement({ pageData, reloadPageData }: {
    pageData: EmployeeBookingMenuPageData,
    reloadPageData: () => void
}): JSX.Element {

    const
        {
            bookingIdActive, maintenanceDataMap, packageDataMap, serviceDataMap,
            serviceTransactionOfDayDataMap
        } = pageData,
        clientDataMap = { ...pageData.clientDataMap }
        ;
    for (let clientId in clientDataMap)
        if (clientDataMap[clientId].booking.id !== bookingIdActive)
            delete clientDataMap[clientId];
    const
        clientKeyArray = Object.keys(clientDataMap),
        [clientIdActive, setClientIdActive] = useState<documentId>(clientKeyArray[0])
        ;

    async function handleChangeClientActive(clientId: string): Promise<void> {

        setClientIdActive(clientId);
        reloadPageData();

    }

    return <>
        <div className="client-input">
            <label className="client-selection">Select Client:</label>
            <div className="clickable-bars" id="client-selection">
                {
                    clientKeyArray.map(clientId =>
                        <div
                            key={clientId}
                            className={`client-item ${(clientId === clientIdActive) ? 'active' : ''}`}
                            data-client={`client${clientId}`}
                            onClick={() => handleChangeClientActive(clientId)}
                        >
                            {clientDataMap[clientId].name}
                        </div>
                    )
                }
            </div>
            <div>
                {
                    Object.keys(serviceTransactionOfDayDataMap)
                        .filter(serviceTransactionId =>
                            serviceTransactionOfDayDataMap[serviceTransactionId].client.id
                            in clientDataMap
                        )
                        .map(serviceTransactionId => {

                            const
                                {
                                    bookingDateTimeEnd,
                                    bookingDateTimeStart,
                                    service: { id: serviceId }
                                } = serviceTransactionOfDayDataMap[serviceTransactionId],
                                packageId: string | undefined =
                                    serviceTransactionOfDayDataMap[serviceTransactionId].package?.id
                                ,
                                dateRange: DateRange = new DateRange(
                                    bookingDateTimeStart, bookingDateTimeEnd
                                ),
                                { name, description } = serviceDataMap[serviceId],
                                { price, status } = maintenanceDataMap[serviceId]
                                ;
                            if (status === "inactive") return undefined;

                            return (
                                <div className="service-scroll-item" key={serviceId}>
                                    <div className="service-price">₱{price}</div>
                                    <div className="service-name">{name}</div>
                                    <div>{packageId ? packageDataMap[packageId].name : ""}</div>

                                </div>
                            );
                        }
                        )
                }
            </div>
        </div>
    </>;

}
