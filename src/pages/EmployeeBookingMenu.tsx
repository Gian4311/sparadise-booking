import ArrayUtils from "../utils/ArrayUtils";
import BookingCalendar from "../utils/BookingCalendar";
import BookingDateInput from "../components/BookingDateInput";
import {
    BookingDataMap,
    ClientData,
    ClientDataMap,
    EmployeeData,
    EmployeeDataMap,
    EmployeeLeaveDataMap,
    JobDataMap,
    JobServiceDataMap,
    PackageDataMap,
    PackageMaintenanceData,
    ServiceData,
    ServiceDataMap,
    ServiceMaintenanceData,
    ServiceTransactionData,
    ServiceTransactionDataMap,
    ServiceTransactionEmployeeListKeyMap,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import BookingUtils from "../firebase/BookingUtils";
import ClientUtils from "../firebase/ClientUtils";
import DateRange from "../utils/DateRange";
import DateUtils from "../utils/DateUtils";
import DayPlanner from "../components/DayPlanner";
import EmployeeLeaveUtils from "../firebase/EmployeeLeaveUtils";
import EmployeeSidebar from "../components/EmployeeSidebar";
import EmployeeUtils from "../firebase/EmployeeUtils";
import JobServiceUtils from "../firebase/JobServiceUtils";
import JobUtils from "../firebase/JobUtils";
import LoadingScreen from "../components/LoadingScreen";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import PackageMaintenanceUtils from "../firebase/PackageMaintenanceUtils";
import PackageUtils from "../firebase/PackageUtils";
import PersonUtils from "../utils/PersonUtils";
import ServiceMaintenanceUtils from "../firebase/ServiceMaintenanceUtils";
import ServiceTransactionUtils from "../firebase/ServiceTransactionUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import {
    useEffect,
    useState
} from "react";

import "../styles/BookingCalendar.scss";
import "../styles/EmployeeBookingMenu.scss";

interface EmployeeBookingMenuPageData extends SpaRadisePageData {

    bookingCalendar: BookingCalendar,
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
    serviceTransactionOfDayDataMap: ServiceTransactionDataMap,
    subpageIndex: number

}

export default function EmployeeBookingMenu(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< EmployeeBookingMenuPageData >( {
            bookingCalendar: null as unknown as BookingCalendar,
            bookingDataMap: {},
            bookingIdActive: undefined,
            clientDataMap: {},
            date: new Date( "05-10-2025" ),
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
            subpageIndex: 0,
            updateMap: {}
        } )
    ;

    async function handleChangeDate(): Promise< void > {

        await loadMaintenanceData();
        await loadEmployeeData();
        await loadBookingCalendar();

    }

    async function loadBookingCalendar(): Promise< void > {
        
        const { date } = pageData;
        pageData.serviceTransactionOfDayDataMap =
            await ServiceTransactionUtils.getServiceTransactionDataMapByDay( date )
        ;
        const
            { employeeLeaveOfDayDataMap, serviceTransactionOfDayDataMap } = pageData,
            bookingCalendarPageData = {
                ...pageData,
                employeeLeaveDataMap: employeeLeaveOfDayDataMap,
                serviceTransactionDataMap: serviceTransactionOfDayDataMap
            }
        ;
        pageData.bookingCalendar = new BookingCalendar( bookingCalendarPageData );

    }

    async function loadBookingData(): Promise< void > {

        pageData.bookingDataMap = await BookingUtils.getBookingDataMapAll();

    }

    async function loadClientData(): Promise< void > {

        pageData.clientDataMap = await ClientUtils.getClientDataMapAll();

    }

    async function loadEmployeeData(): Promise<void> {
    
        const { date } = pageData;
        pageData.employeeDataMap = await EmployeeUtils.getEmployeeDataMapAll();
        pageData.employeeLeaveOfDayDataMap =
            await EmployeeLeaveUtils.getApprovedEmployeeLeaveDataMapByDay(date)
        ;

    }

    async function loadJobData(): Promise< void > {
    
        pageData.jobDataMap = await JobUtils.getJobDataMapAll();
        pageData.jobServiceDataMap = await JobServiceUtils.getJobServiceDataMapAll();

    }

    async function loadMaintenanceData(): Promise<void> {
    
        const
            { date } = pageData,
            packageMaintenanceDataMap =
                await PackageMaintenanceUtils.getPackageMaintenanceDataMapByDate( date )
            ,
            serviceMaintenanceDataMap =
                await ServiceMaintenanceUtils.getServiceMaintenanceDataMapByDate( date )
        ;
        pageData.maintenanceDataMap = { ...packageMaintenanceDataMap, ...serviceMaintenanceDataMap };

    }

    async function loadPageData(): Promise< void > {
        
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

    useEffect( () => { loadPageData(); }, [] );

    return <>
        <LoadingScreen loading={ !pageData.loaded }/>
        <EmployeeSidebar/>
        <main className="employee-booking-management-main-content">
            {
                ( pageData.subpageIndex === 0 ) ? <BookingCalendarMenu pageData={ pageData } handleChangeDate={ handleChangeDate } reloadPageData={ reloadPageData }/>
                : ( pageData.subpageIndex === 1 ) ? <BookingManagement pageData={ pageData } reloadPageData={ reloadPageData }/>
                : <div>None</div>
            }
            <button onClick={ () => console.log( pageData ) }>Log page data</button>
        </main>
    </>;

}

function BookingCalendarMenu( { pageData, handleChangeDate, reloadPageData }: {
    pageData: EmployeeBookingMenuPageData,
    handleChangeDate: () => Promise< void >,
    reloadPageData: () => void
} ): JSX.Element {

    const
        dayPlannerPageData = {
            ...pageData,
            employeeLeaveDataMap: pageData.employeeLeaveOfDayDataMap,
            serviceTransactionDefaultDataMap: pageData.serviceTransactionOfDayDataMap,
            serviceTransactionToAddDataMap: {} as ServiceTransactionDataMap
        },
        { clientDataMap, serviceTransactionDefaultDataMap } = dayPlannerPageData
    ;

    function handleEditBooking( serviceTransactionId: documentId ): void {

        pageData.subpageIndex = 1;
        const
            { id: clientId } = serviceTransactionDefaultDataMap[ serviceTransactionId ].client,
            { id: bookingId } = clientDataMap[ clientId ].booking
        ;
        pageData.bookingIdActive = bookingId;
        reloadPageData();

    }

    return <>
        <BookingDateInput pageData={ pageData } onChange={ handleChangeDate } reloadPageData={ reloadPageData }/>
        <DayPlanner dayPlannerMode="management" pageData={ dayPlannerPageData }/>
    </>;

}

function BookingManagement( { pageData, reloadPageData }: {
    pageData: EmployeeBookingMenuPageData,
    reloadPageData: () => void
} ): JSX.Element {

    const
        {
            bookingIdActive, maintenanceDataMap, packageDataMap, serviceDataMap,
            serviceTransactionOfDayDataMap
        } = pageData,
        clientDataMap = { ...pageData.clientDataMap }
    ;
    for( let clientId in clientDataMap )
        if( clientDataMap[ clientId ].booking.id !== bookingIdActive )
            delete clientDataMap[ clientId ];
    const
        clientKeyArray = Object.keys( clientDataMap ),
        [ clientIdActive, setClientIdActive ] = useState< documentId >( clientKeyArray[ 0 ] )
    ;

    async function handleChangeClientActive( clientId: string ): Promise<void> {

        setClientIdActive( clientId );
        reloadPageData();

    }

    async function previousPage(): Promise< void > {

        pageData.subpageIndex--;
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
                    Object.keys( serviceTransactionOfDayDataMap )
                        .filter( serviceTransactionId =>
                            serviceTransactionOfDayDataMap[ serviceTransactionId ].client.id
                            in clientDataMap
                        )
                        .map( serviceTransactionId => {

                            const
                                {
                                    bookingDateTimeEnd,
                                    bookingDateTimeStart,
                                    service: { id: serviceId }
                                } = serviceTransactionOfDayDataMap[ serviceTransactionId ],
                                packageId: string | undefined =
                                    serviceTransactionOfDayDataMap[ serviceTransactionId ].package?.id
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
                                    <div>{ packageId ? packageDataMap[ packageId ].name : "" }</div>
                                    
                                </div>
                            );
                        }
                        )
                }
            </div>
        </div>
        <button type="button" onClick={ previousPage }>Back</button>
    </>;

}
