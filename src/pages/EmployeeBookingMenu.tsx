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
    ServiceData,
    ServiceDataMap,
    ServiceMaintenanceData,
    ServiceTransactionData,
    ServiceTransactionDataMap,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import BookingUtils from "../firebase/BookingUtils";
import ClientUtils from "../firebase/ClientUtils";
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
    serviceDataMap: ServiceDataMap,
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
            loaded: false,
            serviceDataMap: {},
            serviceTransactionOfDayDataMap: {},
            subpageIndex: 0,
            updateMap: {}
        } )
    ;

    async function handleChangeDate(): Promise< void > {

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

    const dayPlannerPageData = {
        ...pageData,
        employeeLeaveDataMap: pageData.employeeLeaveOfDayDataMap,
        serviceTransactionDefaultDataMap: pageData.serviceTransactionOfDayDataMap,
        serviceTransactionToAddDataMap: {} as ServiceTransactionDataMap
    }

    return <>
        <BookingDateInput pageData={ pageData } onChange={ handleChangeDate } reloadPageData={ reloadPageData }/>
        <DayPlanner dayPlannerMode="management" pageData={ dayPlannerPageData } reloadPageData={ reloadPageData }/>
    </>;

}

function BookingManagement( { pageData, reloadPageData }: {
    pageData: EmployeeBookingMenuPageData,
    reloadPageData: () => void
} ): JSX.Element {


    return <></>

}
