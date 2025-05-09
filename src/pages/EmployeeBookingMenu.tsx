import ArrayUtils from "../utils/ArrayUtils";
import BookingCalendar from "../utils/BookingCalendar";
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
                ( pageData.subpageIndex === 0 ) ? <BookingCalendarMenu pageData={ pageData }/>
                : ( pageData.subpageIndex === 1 ) ? <BookingManagement pageData={ pageData } reloadPageData={ reloadPageData }/>
                : <div>None</div>
            }
            <button onClick={ () => console.log( pageData ) }>Log page data</button>
        </main>
    </>;

}

function BookingCalendarMenu( { pageData }: {
    pageData: EmployeeBookingMenuPageData
} ): JSX.Element {

    const dayPlannerPageData = {
        ...pageData,
        employeeLeaveDataMap: pageData.employeeLeaveOfDayDataMap,
        serviceTransactionDefaultDataMap: pageData.serviceTransactionOfDayDataMap,
        serviceTransactionToAddDataMap: {} as ServiceTransactionDataMap
    }

    return <DayPlanner dayPlannerMode="management" pageData={ dayPlannerPageData }/>

    // if( !pageData.bookingCalendar ) return <></>;
    // const
    //     { bookingCalendar, bookingDataMap, clientDataMap, serviceDataMap } = pageData,
    //     timeSlotDataMap = pageData.bookingCalendar.getArrangedTimeSlotDataMap(
    //         pageData.bookingDataMap,
    //         pageData.clientDataMap
    //     )
    // ;
    // let chairColumns: number = 0, roomColumns: number = 0;
    // for( let timeSlotId in timeSlotDataMap ) {

    //     const { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ];
    //     chairColumns = Math.max( chairColumns, chairTimeSlotDataList.length );
    //     roomColumns = Math.max( roomColumns, roomTimeSlotDataList.length );

    // }

    // return <>
    //     <table className="bookingCalendar">
    //         <thead><tr>
    //             <td></td>
    //             <td colSpan={ roomColumns + 1 }>ROOMS</td>
    //             <td colSpan={ chairColumns + 1 }>CHAIRS</td>
    //         </tr></thead>
    //         <tbody>{
    //             Object.keys( timeSlotDataMap ).map( ( timeSlotId, index ) => {

    //                 const
    //                     { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ],
    //                     emptyChairTimeSlotList: undefined[] = [],
    //                     emptyRoomTimeSlotList: undefined[] = []
    //                 ;
    //                 let timeMark: string | undefined = undefined;
    //                 for(
    //                     let index: number = 0;
    //                     index < ( chairColumns - chairTimeSlotDataList.length );
    //                     index++
    //                 ) emptyChairTimeSlotList.push( undefined );
    //                 for(
    //                     let index: number = 0;
    //                     index < ( roomColumns - roomTimeSlotDataList.length );
    //                     index++
    //                 ) emptyRoomTimeSlotList.push( undefined );
    //                 if( NumberUtils.isEven( index ) ) {

    //                     const
    //                         [ hr, min ] =
    //                             timeSlotId.replace( `-`, `:` ).split( `:` ).map( value => +value )
    //                         ,
    //                         timeData: TimeData = { hr, min }
    //                     ;
    //                     timeMark = DateUtils.toString(
    //                         DateUtils.setTime( pageData.date, timeData ), "h AM"
    //                     )

    //                 }

    //                 return <tr key={ timeSlotId }>
    //                     <td className="time-mark">{ timeMark }</td>
    //                     {
    //                         roomTimeSlotDataList.map( timeSlotData => {

    //                             if( !timeSlotData ) return undefined;
    //                             const
    //                                 {
    //                                     clientId, rowPosition, serviceTransactionId,
    //                                     serviceTransactionData,
    //                                     serviceTransactionData: { service: { id: serviceId } }
    //                                 } = timeSlotData,
    //                                 { booking: { id: bookingId } } = clientDataMap[ clientId ],
    //                                 {
    //                                     activeDateTime, finishedDateTime, canceledDateTime
    //                                 } = bookingDataMap[ bookingId ],
    //                                 className: string =
    //                                     canceledDateTime ? "canceled"
    //                                     : finishedDateTime ? "finished"
    //                                     : activeDateTime ? "active"
    //                                     : "reserved"
    //                             ;
    //                             if( rowPosition === "down" ) return undefined;
    //                             return <TimeSlot
    //                                 className={ className }
    //                                 clientData={ clientDataMap[ clientId ] }
    //                                 // employee
    //                                 key={ serviceTransactionId }
    //                                 rowPosition={ rowPosition }
    //                                 serviceData={ serviceDataMap[ serviceId ] }
    //                                 serviceTransactionData={ serviceTransactionData }
    //                             />;

    //                         } )
    //                     }
    //                     <td className="time-slot room-info"><div>{ bookingCalendar.getAvailableRooms( timeSlotId ) } rooms available</div></td>
    //                     {
    //                        emptyRoomTimeSlotList.map( ( _, index ) => <td className="time-slot" key={ index }></td> )
    //                     }
    //                     {
    //                         chairTimeSlotDataList.map( timeSlotData => {

    //                             if( !timeSlotData ) return undefined;
    //                             const
    //                                 {
    //                                     clientId, rowPosition, serviceTransactionId,
    //                                     serviceTransactionData,
    //                                     serviceTransactionData: { service: { id: serviceId } }
    //                                 } = timeSlotData,
    //                                 { booking: { id: bookingId } } = clientDataMap[ clientId ],
    //                                 {
    //                                     activeDateTime, finishedDateTime, canceledDateTime
    //                                 } = bookingDataMap[ bookingId ],
    //                                 className: string =
    //                                     canceledDateTime ? "canceled"
    //                                     : finishedDateTime ? "finished"
    //                                     : activeDateTime ? "active"
    //                                     : "reserved"
    //                             ;
    //                             if( rowPosition === "down" ) return undefined;
    //                             return <TimeSlot
    //                                 className={ className }
    //                                 clientData={ clientDataMap[ clientId ] }
    //                                 // employee
    //                                 key={ serviceTransactionId }
    //                                 rowPosition={ rowPosition }
    //                                 serviceData={ serviceDataMap[ serviceId ] }
    //                                 serviceTransactionData={ serviceTransactionData }
    //                             />;

    //                         } )
    //                     }
    //                     <td className="time-slot room-info"><div>{ bookingCalendar.getAvailableChairs( timeSlotId ) } chairs available</div></td>
    //                     {
    //                         emptyChairTimeSlotList.map( ( _, index ) => <td className="time-slot" key={ index }></td> )
    //                     }
    //                 </tr>;

    //             } )
    //         }</tbody>
    //         <tfoot><tr><td>
    //             {   
    //                 ArrayUtils.createEmptyArray(
    //                     Math.ceil( ObjectUtils.keyLength( timeSlotDataMap ) / 2 )
    //                 ).map( ( _, index ) => <div
    //                     className="grid-line horizontal"
    //                     key={ index }
    //                     style={ { bottom: ( 180 + 180 * index ) + `px` } }
    //                 ></div> )
                    
    //             }
    //             <div className="grid-line vertical" style={ { left: `86px` } }></div>
    //             <div className="grid-line vertical" style={ { left: ( 248 + 162 * roomColumns ) + `px` } }></div>
    //         </td></tr></tfoot>
    //     </table>
        
    // </>;

}

function BookingManagement( { pageData, reloadPageData }: {
    pageData: EmployeeBookingMenuPageData,
    reloadPageData: () => void
} ): JSX.Element {


    return <></>

}

// function TimeSlot( {
//     className, clientData, employeeData, rowPosition, serviceData
// }: {
//     className: string,
//     clientData: ClientData,
//     employeeData?: EmployeeData,
//     rowPosition: timeSlotRowPosition,
//     serviceData: ServiceData,
//     serviceTransactionData: ServiceTransactionData
// } ): JSX.Element {

//     className = `time-slot ${ className }`;
//     const employeeName: string = employeeData ? PersonUtils.format( employeeData, "f mi l" ) : "-";
//     return <td className={ className } rowSpan={ ( rowPosition === "up" ) ? 2 : undefined }>
//         <div>{ clientData.name }</div>
//         <div>{ serviceData.name }</div>
//         <div>{ employeeName }</div>
//     </td>;

// }
