import BookingCalendar from "../utils/BookingCalendar";
import {
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
import ClientUtils from "../firebase/ClientUtils";
import EmployeeLeaveUtils from "../firebase/EmployeeLeaveUtils";
import EmployeeSidebar from "../components/EmployeeSidebar";
import EmployeeUtils from "../firebase/EmployeeUtils";
import JobServiceUtils from "../firebase/JobServiceUtils";
import JobUtils from "../firebase/JobUtils";
import LoadingScreen from "../components/LoadingScreen";
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

import "../styles/EmployeeBookingManagement.scss";

interface EmployeeBookingManagementPageData extends SpaRadisePageData {

    bookingCalendar: BookingCalendar,
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

export default function EmployeeBookingManagement(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< EmployeeBookingManagementPageData >( {
            bookingCalendar: null as unknown as BookingCalendar,
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

        const { date } = pageData;
        await loadEmployeeData();
        pageData.serviceTransactionOfDayDataMap =
            await ServiceTransactionUtils.getServiceTransactionDataMapByDay(
                date
            )
        ;
        await loadBookingCalendar();

    }

    async function loadBookingCalendar(): Promise< void > {
    
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

    async function loadPageData(): Promise< void > {
        
        await loadServiceData();
        await loadJobData();
        await loadClientData();
        await handleChangeDate();
        pageData.loaded = true;
        reloadPageData();

    }

    async function loadJobData(): Promise< void > {
    
        pageData.jobDataMap = await JobUtils.getJobDataMapAll();
        pageData.jobServiceDataMap = await JobServiceUtils.getJobServiceDataMapAll();

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
                : <div>None</div>
            }
            <button onClick={ () => console.log( pageData ) }>Log page data</button>
        </main>
    </>;

}

function BookingCalendarMenu( { pageData, reloadPageData }: {
    pageData: EmployeeBookingManagementPageData,
    handleChangeDate: ( date: Date ) => Promise< void >,
    reloadPageData: () => void
} ): JSX.Element {

    if( !pageData.bookingCalendar ) return <></>;
    const
        { bookingCalendar, clientDataMap, serviceDataMap, serviceTransactionOfDayDataMap } = pageData,
        timeSlotDataMap = pageData.bookingCalendar.getArrangedTimeSlotDataMap()
    ;
    let chairColumns: number = 0, roomColumns: number = 0;
    for( let timeSlotId in timeSlotDataMap ) {

        const { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ];
        chairColumns = Math.max( chairColumns, chairTimeSlotDataList.length );
        roomColumns = Math.max( roomColumns, roomTimeSlotDataList.length );

    }

    return <>
        <table>
            <thead><tr>
                <td></td>
                <td colSpan={ roomColumns + 1 }>ROOMS</td>
                <td colSpan={ chairColumns + 1 }>CHAIRS</td>
            </tr></thead>
            <tbody>{
                Object.keys( timeSlotDataMap ).map( timeSlotId => {

                    const
                        { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ],
                        emptyChairTimeSlotList: undefined[] = [],
                        emptyRoomTimeSlotList: undefined[] = []
                    ;
                    for(
                        let index: number = 0;
                        index < ( chairColumns - chairTimeSlotDataList.length );
                        index++
                    ) emptyChairTimeSlotList.push( undefined );
                    for(
                        let index: number = 0;
                        index < ( roomColumns - roomTimeSlotDataList.length );
                        index++
                    ) emptyRoomTimeSlotList.push( undefined );

                    return <tr key={ timeSlotId }>
                        <td>{ timeSlotId }</td>
                        {
                            roomTimeSlotDataList.map( ( {
                                clientId, rowPosition, serviceTransactionId, serviceTransactionData,
                                serviceTransactionData: { service: { id: serviceId } }
                            } ) => {

                                if( rowPosition === "down" ) return undefined;
                                return <TimeSlot
                                    clientData={ clientDataMap[ clientId ] }
                                    // employee
                                    key={ serviceTransactionId }
                                    rowPosition={ rowPosition }
                                    serviceData={ serviceDataMap[ serviceId ] }
                                    serviceTransactionData={ serviceTransactionData }
                                />;

                            } )
                        }
                        <td>{ bookingCalendar.getAvailableRooms( timeSlotId ) } rooms left</td>
                        {
                           emptyRoomTimeSlotList.map( ( _, index ) => <td key={ index }></td> )
                        }
                        {
                            chairTimeSlotDataList.map( ( {
                                clientId, rowPosition, serviceTransactionId, serviceTransactionData,
                                serviceTransactionData: { service: { id: serviceId } }
                            } ) => {

                                if( rowPosition === "down" ) return undefined;
                                return <TimeSlot
                                    clientData={ clientDataMap[ clientId ] }
                                    // employee
                                    key={ serviceTransactionId }
                                    rowPosition={ rowPosition }
                                    serviceData={ serviceDataMap[ serviceId ] }
                                    serviceTransactionData={ serviceTransactionData }
                                />;

                            } )
                        }
                        <td>{ bookingCalendar.getAvailableChairs( timeSlotId ) } chairs left</td>
                        {
                            emptyChairTimeSlotList.map( ( _, index ) => <td key={ index }></td> )
                        }
                    </tr>;

                } )
            }</tbody>
        </table>
        
    </>;

}

function TimeSlot( {
    clientData, employeeData, rowPosition, serviceData
}: {
    clientData: ClientData,
    employeeData?: EmployeeData,
    rowPosition: timeSlotRowPosition,
    serviceData: ServiceData,
    serviceTransactionData: ServiceTransactionData
} ): JSX.Element {

    const employeeName: string = employeeData ? PersonUtils.format( employeeData, "f mi l" ) : "-";
    return <td rowSpan={ ( rowPosition === "up" ) ? 2 : undefined }>
        { clientData.name }
        <br/>
        { serviceData.name }
        <br/>
        { employeeName }
    </td>;

}
