import ArrayUtils from "../utils/ArrayUtils";
import DateRange from "../utils/DateRange";
import DateUtils from "../utils/DateUtils";
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
    ServiceTransactionAvailabilityKeyMap,
    ServiceTransactionData,
    ServiceTransactionDataMap
} from "../firebase/SpaRadiseTypes";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import PersonUtils from "../utils/PersonUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";
import StringUtils from "../utils/StringUtils";
import {
    useEffect,
    useState
} from "react";

import "../styles/DayPlanner.scss";

type dayPlannerMode = "newBooking" | "management";

interface CalendarRow {

    chairs: number,
    chairTimeSlotDataList: ( TimeSlotData | undefined )[],
    rooms: number,
    roomTimeSlotDataList: ( TimeSlotData | undefined )[]

}

interface DayPlannerPageData extends SpaRadisePageData {

    date: Date,
    bookingDataMap: BookingDataMap,
    bookingIdActive: string | undefined,
    clientDataMap: ClientDataMap,
    employeeDataMap: EmployeeDataMap,
    employeeLeaveDataMap?: EmployeeLeaveDataMap,
    jobDataMap?: JobDataMap,
    jobServiceDataMap?: JobServiceDataMap,
    serviceDataMap: ServiceDataMap,
    serviceTransactionDefaultDataMap: ServiceTransactionDataMap,
    serviceTransactionToAddDataMap: ServiceTransactionDataMap

}

interface EmployeeAssignedIndexMap {

    [ employeeId: documentId ]: number

}

interface JobServiceKeyMap{
    
    [ jobId: documentId ]: { [ serviceId: documentId ]: documentId }

}

interface ServiceEmployeeListKeyMap {

    [ serviceId: documentId ]: documentId[]

}

interface ServiceTransactionEmployeeListKeyMap {

    [ serviceTransactionId: string ]: documentId[]

}

interface TimeSlotData {

    serviceTransactionData: ServiceTransactionData,
    serviceTransactionId: string,
    rowPosition: timeSlotRowPosition

}

interface TimeSlotDataMap {

    [ timeSlotId: string ]: CalendarRow

}

interface TimeSlotServiceEmployeeListKeyMap {

    [ timeSlotId: string ]: ServiceEmployeeListKeyMap

}

const DATE_RANGE_FORMAT = "hh:mm-hh:mm";

export default function DayPlanner( { dayPlannerMode, pageData, reloadPageData }: {
    dayPlannerMode: dayPlannerMode,
    pageData: DayPlannerPageData,
    reloadPageData: () => void
} ): JSX.Element {

    const
        [ timeSlotDataMap, setTimeSlotDataMap ] = useState< TimeSlotDataMap >( {} ),
        [ clientServiceTransactionAddedMap ] = useState< { [ clientId: documentId ]: {
            [ serviceTransactionId: documentId ]: boolean
        } } >( {} ),
        [
            serviceTransactionIdActive, setServiceTransactionIdActive
        ] = useState< documentId | undefined >( undefined ),
        [ serviceTransactionAvailabilityKeyMap ] =
            useState< ServiceTransactionAvailabilityKeyMap >( {} )
        ,
        isNewBookingMode: boolean = ( dayPlannerMode === "newBooking" )
    ;

    async function addServiceTransaction(
        serviceTransactionData: ServiceTransactionData,
        serviceTransactionId: documentId,
        rowPosition?: timeSlotRowPosition
    ): Promise< boolean > {

        if( !rowPosition ) {

            const serviceTransactionDataList = await preprocessServiceTransactionData(
                serviceTransactionData
            );
            switch( serviceTransactionDataList.length ) {
    
                case 2: return (
                    await addServiceTransaction(
                        serviceTransactionDataList[ 0 ], serviceTransactionId, "up"
                    ) && await addServiceTransaction(
                        serviceTransactionDataList[ 1 ], serviceTransactionId, "down"
                    )
                );
                
                case 0: return false;
    
                default:
                    serviceTransactionData = serviceTransactionDataList[ 0 ];
                    rowPosition = "single";
    
            }

        }
        const
            { bookingDateTimeStart, bookingDateTimeEnd } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingDateTimeStart, bookingDateTimeEnd ),
            timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT )
        ;
        if( !( timeSlotId in timeSlotDataMap ) ) return false;
        const
            { serviceDataMap } = pageData,
            { service: { id: serviceId } } = serviceTransactionData,
            { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ],
            timeSlotData: TimeSlotData = {
                serviceTransactionId, serviceTransactionData, rowPosition
            },
            { roomType } = serviceDataMap[ serviceId ],
            timeSlotDataList: ( TimeSlotData | undefined )[] =
                ( roomType === "chair" ) ? chairTimeSlotDataList
                : roomTimeSlotDataList
            ,
            added: boolean = Boolean( timeSlotDataList.find( timeSlotData => {

                if( !timeSlotData ) return false;
                return timeSlotData.serviceTransactionId === serviceTransactionId;

            } ) )
        ;
        if( !added ) timeSlotDataList.push( timeSlotData );
        return true;

    }

    async function canAddServiceTransactionData(
        serviceTransactionData: ServiceTransactionData,
        serviceTransactionId: documentId,
        rowPosition?: timeSlotRowPosition
    ): Promise< boolean > {

        // preprocessing
        if( !rowPosition ) {

            const serviceTransactionDataList = await preprocessServiceTransactionData(
                serviceTransactionData
            );
            switch( serviceTransactionDataList.length ) {
    
                case 2: return (
                    await canAddServiceTransactionData(
                        serviceTransactionDataList[ 1 ], serviceTransactionId, "down"
                    ) && await canAddServiceTransactionData(
                        serviceTransactionDataList[ 0 ], serviceTransactionId, "up"
                    )
                );
                
                case 0: return false;
    
                default:
                    serviceTransactionData = serviceTransactionDataList[ 0 ];
                    rowPosition = "single";
    
            }

        }

        // checking if time slot exists
        const
            { bookingDateTimeStart, bookingDateTimeEnd } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingDateTimeStart, bookingDateTimeEnd ),
            timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT )
        ;
        if( !( timeSlotId in timeSlotDataMap ) ) return false;
        
        // checking if there's available rooms/chairs
        if( !( await hasAvailableRoomType( serviceTransactionData, serviceTransactionId ) ) )
            return false;

        // checking if there is assignable employee
        const
            timeSlotData: TimeSlotData = {
                serviceTransactionId, serviceTransactionData, rowPosition
            },
            timeSlotDataConflictingList: TimeSlotData[] = [
                ...( await getTimeSlotDataConflictingList(
                    serviceTransactionData, serviceTransactionId
                ) ),
                timeSlotData
            ],
            serviceTransactionEmployeeListKeyMap: ServiceTransactionEmployeeListKeyMap = {},
            timeSlotServiceEmployeeListKeyMap: TimeSlotServiceEmployeeListKeyMap = {}
        ;
        for( let timeSlotData of timeSlotDataConflictingList ) {

            const
                {
                    serviceTransactionData: {
                        bookingDateTimeStart, bookingDateTimeEnd, service: { id: serviceId }
                    },
                    serviceTransactionId
                } = timeSlotData,
                dateRange: DateRange = new DateRange( bookingDateTimeStart, bookingDateTimeEnd ),
                timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT )
            ;
            if( !( timeSlotId in timeSlotServiceEmployeeListKeyMap ) )
                timeSlotServiceEmployeeListKeyMap[ timeSlotId ] =
                    await getServiceEmployeeKeyMap( dateRange )
                ;
            serviceTransactionEmployeeListKeyMap[ serviceTransactionId ] =
                ( serviceTransactionId in serviceTransactionEmployeeListKeyMap ) ?
                    StringUtils.arrayIntersection(
                        serviceTransactionEmployeeListKeyMap[ serviceTransactionId ],
                        timeSlotServiceEmployeeListKeyMap[ timeSlotId ][ serviceId ]
                    )
                : timeSlotServiceEmployeeListKeyMap[ timeSlotId ][ serviceId ]
            ;

        }
        const
            employeeAssignedIdList: number[] = timeSlotDataConflictingList.map( () => 0 ),
            employeeAssignedIndexMap: EmployeeAssignedIndexMap = {}
        ;
        for(
            let timeSlotIndex: number = 0;
            timeSlotIndex >= 0 && timeSlotIndex < timeSlotDataConflictingList.length;
            timeSlotIndex++
        ) {

            const
                { serviceTransactionId } = timeSlotDataConflictingList[ timeSlotIndex ],
                serviceEmployeeList = serviceTransactionEmployeeListKeyMap[ serviceTransactionId ]
            ;
            let
                oldEmployeeIndex: number = employeeAssignedIdList[ timeSlotIndex ],
                oldEmployeeId: string = serviceEmployeeList[ oldEmployeeIndex ],
                employeeIndex: number = oldEmployeeIndex,
                employeeId: string = ""
            ;
            for( ; employeeIndex < serviceEmployeeList.length; employeeIndex++ ) {

                employeeId = serviceEmployeeList[ employeeIndex ];
                if( !( employeeId in employeeAssignedIndexMap ) ) {

                    delete employeeAssignedIndexMap[ oldEmployeeId ];
                    employeeAssignedIndexMap[ employeeId ] = timeSlotIndex;
                    break;

                }

            }
            if( employeeIndex >= serviceEmployeeList.length ) {

                employeeAssignedIdList[ timeSlotIndex ] = 0;
                timeSlotIndex -= 2;

            }

        }
        return (
            timeSlotDataConflictingList.length === ObjectUtils.keyLength( employeeAssignedIndexMap )
        );

    }

    async function deleteServiceTransaction( serviceTransactionId: documentId ): Promise< void > {

        function filterNonServiceTransactionId( timeSlotData: TimeSlotData | undefined ): boolean {

            if( !timeSlotData ) return false;
            return timeSlotData.serviceTransactionId !== serviceTransactionId;

        }

        for( let timeSlotId in timeSlotDataMap ) {

            const { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ];
            timeSlotDataMap[ timeSlotId ] = {
                ...timeSlotDataMap[ timeSlotId ],
                chairTimeSlotDataList: chairTimeSlotDataList.filter( filterNonServiceTransactionId ),
                roomTimeSlotDataList: roomTimeSlotDataList.filter( filterNonServiceTransactionId )
            }

        }

    }

    function getArrangedTimeSlotDataMap(): TimeSlotDataMap {

        const
            {
                bookingDataMap, clientDataMap, serviceDataMap, serviceTransactionToAddDataMap
            } = pageData,
            timeSlotDataMapArranged: TimeSlotDataMap = {}
        ;
        let maxChairColumns: number = 0, maxRoomColumns: number = 0;

        function compareTimeSlotData(
            timeSlotData1: TimeSlotData | undefined,
            timeSlotData2: TimeSlotData | undefined
        ): number {

            if( !timeSlotData1 ) return 1;
            if( !timeSlotData2 ) return -1;
            const
                { id: clientId1 } = timeSlotData1.serviceTransactionData.client,
                { id: clientId2 } = timeSlotData2.serviceTransactionData.client,
                { id: bookingId1 } = clientDataMap[ clientId1 ].booking,
                { id: bookingId2 } = clientDataMap[ clientId2 ].booking,
                {
                    reservedDateTime: reservedDateTime1, canceledDateTime: canceledDateTime1
                } = bookingDataMap[ bookingId1 ],
                {
                    reservedDateTime: reservedDateTime2, canceledDateTime: canceledDateTime2
                } = bookingDataMap[ bookingId2 ],
                ms1: number = reservedDateTime1?.getTime() ?? 0,
                ms2: number = reservedDateTime2?.getTime() ?? 0
            ;
            if( canceledDateTime1 && !canceledDateTime2 ) return 1;
            if( ms1 > ms2 ) return 1;
            if( ms1 < ms2 ) return -1;
            const
                { name: clientName1 } = clientDataMap[ clientId1 ],
                { name: clientName2 } = clientDataMap[ clientId2 ]
            ;
            if( clientName1 > clientName2 ) return 1;
            if( clientName1 < clientName2 ) return -1;
            const
                { id: serviceId1 } = timeSlotData1.serviceTransactionData.service,
                { id: serviceId2 } = timeSlotData2.serviceTransactionData.service,
                { name: serviceName1 } = serviceDataMap[ serviceId1 ],
                { name: serviceName2 } = serviceDataMap[ serviceId2 ]
            ;
            if( serviceName1 > serviceName2 ) return 1;
            return -1;

        }

        function filterToAddTimeSlotData( timeSlotData: TimeSlotData | undefined ): boolean {

            if( !timeSlotData ) return false;
            return timeSlotData.serviceTransactionId in serviceTransactionToAddDataMap;

        }

        for( let timeSlotId in timeSlotDataMap ) {

            const calendarRow: CalendarRow = { ...timeSlotDataMap[ timeSlotId ] };
            let
                chairTimeSlotDataList = [ ...calendarRow.chairTimeSlotDataList ],
                roomTimeSlotDataList = [ ...calendarRow.roomTimeSlotDataList ]
            ;
            if( isNewBookingMode ) {

                chairTimeSlotDataList = chairTimeSlotDataList.filter( filterToAddTimeSlotData );
                roomTimeSlotDataList = roomTimeSlotDataList.filter( filterToAddTimeSlotData );

            }
            chairTimeSlotDataList.sort( compareTimeSlotData );
            roomTimeSlotDataList.sort( compareTimeSlotData );
            const
                { length: chairColumns } = calendarRow.chairTimeSlotDataList,
                { length: roomColumns } = calendarRow.roomTimeSlotDataList
            ;
            maxChairColumns = Math.max( maxChairColumns, chairColumns );
            maxRoomColumns = Math.max( maxRoomColumns, roomColumns );
            timeSlotDataMapArranged[ timeSlotId ] = calendarRow;

        }

        function rearrangeTable( mode: roomType ): void {

            const isChair: boolean = ( mode === "chair" );
            let maxColumns: number = isChair ? maxChairColumns : maxRoomColumns;
            for( let column: number = 0; column < maxColumns; column++ ) {

                for( let timeSlotId in timeSlotDataMapArranged ) {
    
                    const
                        {
                            chairTimeSlotDataList, roomTimeSlotDataList
                        } = timeSlotDataMapArranged[ timeSlotId ],
                        timeSlotDataList = isChair ? chairTimeSlotDataList : roomTimeSlotDataList,
                        timeSlotData = timeSlotDataList[ column ]
                    ;
                    if( !timeSlotData ) continue;
                    const {
                        rowPosition, serviceTransactionId, serviceTransactionData
                    } = timeSlotData;
                    if( rowPosition === "single" ) continue;
                    const
                        { bookingDateTimeStart, bookingDateTimeEnd } = serviceTransactionData,
                        dateRangeMatch: DateRange = new DateRange(
                            bookingDateTimeStart, bookingDateTimeEnd
                        ).addTime( {
                            min: 30 * ( rowPosition === "up" ? 1 : -1 )
                        } ),
                        timeSlotMatchId: string = dateRangeMatch.toString( DATE_RANGE_FORMAT ),
                        {
                            chairTimeSlotDataList: matchChairTimeSlotDataList,
                            roomTimeSlotDataList: matchRoomTimeSlotDataList
                        } = timeSlotDataMapArranged[ timeSlotMatchId ],
                        matchTimeSlotDataList =
                            isChair ? matchChairTimeSlotDataList : matchRoomTimeSlotDataList
                    ;
                    let matchColumn: number = column;
                    for( ; matchColumn < matchTimeSlotDataList.length; matchColumn++ ) {
    
                        const timeSlotData = matchTimeSlotDataList[ matchColumn ];
                        if( !timeSlotData ) continue;
                        const { serviceTransactionId: serviceTransactionIdCompare } = timeSlotData;
                        if( serviceTransactionId === serviceTransactionIdCompare ) break;
    
                    }
                    const arrayAdd: number = matchColumn - column;
                    if( !arrayAdd ) continue;
                    timeSlotDataList.splice(
                        column, 0, ...ArrayUtils.createEmptyArray( arrayAdd )
                    );
                    maxColumns = Math.max( maxColumns, timeSlotDataList.length );
    
                }
    
            }

        }

        rearrangeTable( "chair" );
        rearrangeTable( "room" );
        return timeSlotDataMapArranged;

    }

    function getAvailableChairs(
        timeSlotId: string, clientIdIgnoreList: documentId[] = []
    ): number {
    
        const
            clientMap: { [ clientId: documentId ]: undefined } = {},
            { chairs, chairTimeSlotDataList } = timeSlotDataMap[ timeSlotId ]
        ;
        for( let timeSlotData of chairTimeSlotDataList ) {

            if( !timeSlotData ) continue;
            const { id: clientId } = timeSlotData.serviceTransactionData.client;
            if( !clientIdIgnoreList.includes( clientId ) ) clientMap[ clientId ] = undefined;

        }
        return ( chairs - ObjectUtils.keyLength( clientMap ) );

    }

    function getAvailableRooms(
        timeSlotId: string, clientIdIgnoreList: documentId[] = []
    ): number {

        const
            clientMap: { [ clientId: documentId ]: undefined } = {},
            { rooms, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ]
        ;
        for( let timeSlotData of roomTimeSlotDataList ){

            if( !timeSlotData ) continue;
            const { id: clientId } = timeSlotData.serviceTransactionData.client;
            if( !clientIdIgnoreList.includes( clientId ) ) clientMap[ clientId ] = undefined;

        }
        return ( rooms - ObjectUtils.keyLength( clientMap ) );

    }

    async function getServiceEmployeeKeyMap(
        dateRange: DateRange
    ): Promise< ServiceEmployeeListKeyMap > {
    
        const
            { jobDataMap, jobServiceDataMap, serviceDataMap } = pageData
        ;
        let { employeeDataMap, employeeLeaveDataMap } = pageData;
        if( !employeeLeaveDataMap ) throw new Error( `Employee leave data map is not given!` );
        if( !jobDataMap ) throw new Error( `Job data map is not given!` );
        if( !jobServiceDataMap ) throw new Error( `Job service data map is not given!` );
        const
            employeeOnLeaveIdMap: { [ employeeId: string ]: undefined } = {},
            serviceEmployeeKeyMap: ServiceEmployeeListKeyMap = {}
        ;
        employeeLeaveDataMap = ObjectUtils.filter(
            employeeLeaveDataMap,
            ( employeeLeaveId, { dateTimeStart, dateTimeEnd } ) => dateRange.overlapsWith(
                new DateRange( dateTimeStart, dateTimeEnd )
            )
        )
        for( let employeeLeaveId in employeeLeaveDataMap ) {

            const { employee: { id: employeeId } } = employeeLeaveDataMap[ employeeLeaveId ];
            employeeOnLeaveIdMap[ employeeId ] = undefined;

        }
        employeeDataMap = ObjectUtils.filter(
            employeeDataMap, employeeId => !( employeeId in employeeOnLeaveIdMap )
        );
        const jobServiceKeyMap: JobServiceKeyMap = {};
        for( let jobId in jobDataMap ) jobServiceKeyMap[ jobId ] = {};
        for( let jobServiceId in jobServiceDataMap ) {

            const {
                job: { id: jobId }, service: { id: serviceId }
            } = jobServiceDataMap[ jobServiceId ];
            jobServiceKeyMap[ jobId ][ serviceId ] = jobServiceId;

        }
        for( let serviceId in serviceDataMap ) serviceEmployeeKeyMap[ serviceId ] = [];
        for( let employeeId in employeeDataMap ) {

            const { job: { id: jobId } } = employeeDataMap[ employeeId ];
            for( let serviceId in jobServiceKeyMap[ jobId ] )
                serviceEmployeeKeyMap[ serviceId ].push( employeeId );

        }
        return serviceEmployeeKeyMap;

    }

    function getDateRangeFromTimeSlotId( timeSlotId: string ): DateRange {

        const
            { date } = pageData,
            [ hr1, min1, hr2, min2 ] =
                timeSlotId.replace( `-`, `:` ).split( `:` ).map( value => +value )
            ,
            start: Date = DateUtils.setTime( date, { hr: hr1, min: min1 } ),
            end: Date = DateUtils.setTime( date, { hr: hr2, min: min2 } )
        ;
        return new DateRange( start, end );

    }

    function getDateRangeOfDay(): DateRange | null {

        let { date } = pageData, minDateTime: Date, maxDateTime: Date;
        switch( date.getDay() ) {

            case 0: return null;
            case 6:
                minDateTime = DateUtils.setTime( date, { hr: 10, min: 0 } );
                maxDateTime = DateUtils.setTime( date, { hr: 18, min: 0 } );
                break;
            default:
                minDateTime = DateUtils.setTime( date, { hr: 9, min: 0 } );
                maxDateTime = DateUtils.setTime( date, { hr: 20, min: 0 } );

        }
        return new DateRange( minDateTime, maxDateTime );

    }

    async function getTimeSlotDataConflictingList(
        serviceTransactionData: ServiceTransactionData,
        serviceTransactionId: documentId
    ): Promise< TimeSlotData[] > {

        const
            { bookingDateTimeStart, bookingDateTimeEnd } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingDateTimeStart, bookingDateTimeEnd ),
            timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT ),
            timeSlotIdList: string[] = [ timeSlotId ],
            timeSlotDataList: TimeSlotData[] = []
        ;
        for( let index: number = 0; index < timeSlotIdList.length; index++ ) {

            const
                timeSlotId: string = timeSlotIdList[ index ],
                { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ],
                timeSlotIdAbove: string | undefined = getTimeSlotIdAbove( timeSlotId ),
                timeSlotIdBelow: string | undefined = getTimeSlotIdBelow( timeSlotId ),
                rowTimeSlotDataList: TimeSlotData[] = [
                    ...chairTimeSlotDataList, ...roomTimeSlotDataList
                ].filter( timeSlotData => {

                    if( !timeSlotData ) return false;
                    const { serviceTransactionId: serviceTransactionIdCompare } = timeSlotData;
                    return ( serviceTransactionId !== serviceTransactionIdCompare );

                } ) as TimeSlotData[]
            ;
            timeSlotDataList.push( ...rowTimeSlotDataList );
            let
                mightConflictWithAbove: boolean = false, 
                mightConflictWithBelow: boolean = false
            ;
            for( let { rowPosition } of rowTimeSlotDataList ) {

                switch( rowPosition ) {
    
                    case "down":
                        if( mightConflictWithAbove ) break;
                        if( timeSlotIdAbove && !timeSlotIdList.includes( timeSlotIdAbove ) )
                        mightConflictWithAbove = true;
                        break;
                    
                    case "up":
                        if( mightConflictWithBelow ) break;
                        if( timeSlotIdBelow && !timeSlotIdList.includes( timeSlotIdBelow ) )
                        mightConflictWithBelow = true;
                        break;
    
                }
                if( mightConflictWithAbove && mightConflictWithBelow ) break;
    
            }
            if( timeSlotIdAbove && mightConflictWithAbove ) timeSlotIdList.push( timeSlotIdAbove );
            if( timeSlotIdBelow && mightConflictWithBelow ) timeSlotIdList.push( timeSlotIdBelow );

        }
        return timeSlotDataList;

    }

    function getTimeSlotIdAbove( timeSlotId: string ): string | undefined {

        const
            dateRange: DateRange = getDateRangeFromTimeSlotId( timeSlotId ).addTime( { min: -30 } ),
            timeSlotIdAbove: string = dateRange.toString( DATE_RANGE_FORMAT ),
            exists: boolean = timeSlotIdAbove in timeSlotDataMap
        ;
        return exists ? timeSlotIdAbove : undefined;

    }

    function getTimeSlotIdBelow( timeSlotId: string ): string | undefined {

        const
            dateRange: DateRange = getDateRangeFromTimeSlotId( timeSlotId ).addTime( { min: 30 } ),
            timeSlotIdBelow: string = dateRange.toString( DATE_RANGE_FORMAT ),
            exists: boolean = timeSlotIdBelow in timeSlotDataMap
        ;
        return exists ? timeSlotIdBelow : undefined;

    }

    async function getIndexOfServiceTransaction(
        serviceTransactionData: ServiceTransactionData,
        serviceTransactionId: documentId,
        rowPosition: timeSlotRowPosition
    ): Promise< number > {

        const serviceTransactionDataList = await preprocessServiceTransactionData(
            serviceTransactionData
        );
        switch( serviceTransactionDataList.length ) {

            case 2:
                if( rowPosition === "down" ) serviceTransactionData = serviceTransactionDataList[ 1 ];
                break;
            
            case 0: return -1;

            default: serviceTransactionData = serviceTransactionDataList[ 0 ];

        }
        const
            { bookingDateTimeStart, bookingDateTimeEnd } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingDateTimeStart, bookingDateTimeEnd ),
            timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT )
        ;
        if( !( timeSlotId in timeSlotDataMap ) ) return -1;
        const
            { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ],
            timeSlotDataList: ( TimeSlotData | undefined )[] = [
                ...chairTimeSlotDataList, ...roomTimeSlotDataList
            ]
        ;
        for(
            let timeSlotIndex: number = 0;
            timeSlotIndex < timeSlotDataList.length;
            timeSlotIndex++
        ) {

            const timeSlotData = timeSlotDataList[ timeSlotIndex ];
            if( !timeSlotData ) continue;
            const { serviceTransactionId: serviceTransactionIdCompare } = timeSlotData;
            if( serviceTransactionId === serviceTransactionIdCompare ) return timeSlotIndex;

        }
        return -1;

    }

    async function handleAddToTimeSlot( timeSlotId: string ): Promise< void > {

        if( !serviceTransactionIdActive ) return;
        await deleteServiceTransaction( serviceTransactionIdActive );
        const { serviceDataMap, serviceTransactionToAddDataMap } = pageData;
        let serviceTransactionData = serviceTransactionToAddDataMap[ serviceTransactionIdActive ];
        const
            { id: serviceId } = serviceTransactionData.service,
            { durationMin } = serviceDataMap[ serviceId ],
            DURATION_ADD = { min: 30 }
        ;
        let dateRange: DateRange = getDateRangeFromTimeSlotId( timeSlotId );
        if( durationMin > 30 ) dateRange = dateRange.addEnd( DURATION_ADD );
        serviceTransactionData.bookingDateTimeStart = dateRange.getStart();
        serviceTransactionData.bookingDateTimeEnd = dateRange.getEnd();
        setServiceTransactionIdActive( undefined );
        await loadServiceTransactionToAddData();
        reloadTimeSlotDataMap();

    }

    async function handleChangeServiceTransactionIdActive(
        serviceTransactionIdActive: documentId
    ): Promise< void > {

        setServiceTransactionIdActive( serviceTransactionIdActive );
        reloadTimeSlotDataMap();

    }

    async function hasAvailableRoomType(
        serviceTransactionData: ServiceTransactionData,
        serviceTransactionId: documentId
    ): Promise< boolean > {

        const
            { serviceDataMap } = pageData,
            {
                bookingDateTimeStart, bookingDateTimeEnd, client: { id: clientId }
            } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingDateTimeStart, bookingDateTimeEnd ),
            timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT ),
            { service: { id: serviceId } } = serviceTransactionData,
            serviceData = serviceDataMap[ serviceId ],
            { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ],
            timeSlotDataList: ( TimeSlotData | undefined )[] = [
                ...chairTimeSlotDataList, ...roomTimeSlotDataList
            ],
            compatibleTimeSlotDataList: TimeSlotData[] = []
        ;
        for( let timeSlotData of timeSlotDataList ) {

            if( !timeSlotData ) continue;
            const {
                serviceTransactionId: serviceTransactionIdCompare,
                serviceTransactionData: { client: { id: clientIdCompare } }
            } = timeSlotData;
            if( clientId !== clientIdCompare || serviceTransactionId === serviceTransactionIdCompare )
                continue;
            compatibleTimeSlotDataList.push( timeSlotData );
            if( compatibleTimeSlotDataList.length >= 2 ) return false;

        }
        if( compatibleTimeSlotDataList.length === 1 ) {

            const
                { serviceTransactionData: {
                    service: { id: serviceId }
                } } = compatibleTimeSlotDataList[ 0 ],
                serviceDataCompare = serviceDataMap[ serviceId ]
            ;
            return ServiceUtils.areCompatibleServiceData( serviceData, serviceDataCompare );

        }
        const
            { roomType } = serviceDataMap[ serviceId ],
            roomTypeAvailableCount: number = (
                ( roomType === "chair" ) ? getAvailableChairs( timeSlotId, [ clientId ] )
                : getAvailableRooms( timeSlotId, [ clientId ] )
            )
        ;
        return ( roomTypeAvailableCount > 0 );

    }

    async function hasServiceTransaction(
        serviceTransactionData: ServiceTransactionData,
        serviceTransactionId: documentId
    ): Promise< boolean > {

        const serviceTransactionDataList = await preprocessServiceTransactionData(
            serviceTransactionData
        );
        switch( serviceTransactionDataList.length ) {

            case 2: return (
                await hasServiceTransaction( serviceTransactionDataList[ 1 ], serviceTransactionId )
                && await hasServiceTransaction( serviceTransactionDataList[ 0 ], serviceTransactionId )
            );
            
            case 0: return false;

            default: serviceTransactionData = serviceTransactionDataList[ 0 ];

        }
        const
            { bookingDateTimeStart, bookingDateTimeEnd } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingDateTimeStart, bookingDateTimeEnd ),
            timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT )
        ;
        if( !( timeSlotId in timeSlotDataMap ) ) return false;
        const
            { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ],
            timeSlotDataList: ( TimeSlotData | undefined )[] = [
                ...chairTimeSlotDataList, ...roomTimeSlotDataList
            ]
        ;
        for( let timeSlotData of timeSlotDataList ) {

            if( !timeSlotData ) continue;
            const { serviceTransactionId: serviceTransactionIdCompare } = timeSlotData;
            if( serviceTransactionId === serviceTransactionIdCompare ) return true;

        }
        return false;

    }

    function hasUpServiceTransaction(
        serviceTransactionId: documentId,
        timeSlotId: string
    ): boolean {

        if( !( timeSlotId in timeSlotDataMap ) ) return false;
        const
            { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ],
            timeSlotDataList: ( TimeSlotData | undefined )[] = [
                ...chairTimeSlotDataList, ...roomTimeSlotDataList
            ]
        ;
        for( let timeSlotData of timeSlotDataList ) {

            if( !timeSlotData ) continue;
            const { serviceTransactionId: serviceTransactionIdCompare, rowPosition } = timeSlotData;
            if( rowPosition === "down" ) continue;
            if( serviceTransactionId === serviceTransactionIdCompare ) return true;

        }
        return false;

    }

    async function handleChangeDate(): Promise< void > {

        await loadTimeSlotIdList();
        await loadCapacityData();
        await loadServiceTransactionDefaultData();

    }

    async function loadCapacityData(): Promise< void > {

        // initial
        for( let timeSlotId in timeSlotDataMap ) {

            const calendarRow = timeSlotDataMap[ timeSlotId ];
            calendarRow.chairs = 5;
            calendarRow.rooms = 5;

        }

    }

    async function loadComponentData(): Promise< void > {

        await handleChangeDate();
        await loadServiceTransactionToAddData();
        reloadTimeSlotDataMap();

    }

    async function loadServiceTransactionToAddData(): Promise< void > {

        ObjectUtils.clear( clientServiceTransactionAddedMap );
        ObjectUtils.clear( serviceTransactionAvailabilityKeyMap );
        const
            { date, serviceDataMap, serviceTransactionToAddDataMap } = pageData,
            serviceTransactionSameDayDataMap: ServiceTransactionDataMap = {},
            serviceTransactionOtherDayDataMap: ServiceTransactionDataMap = {}
        ;

        for( let serviceTransactionId in serviceTransactionToAddDataMap ) {

            const
                serviceTransactionData = serviceTransactionToAddDataMap[ serviceTransactionId ],
                {
                    bookingDateTimeEnd, bookingDateTimeStart, client: { id: clientId }
                } = serviceTransactionData
            ;
            if( !( clientId in clientServiceTransactionAddedMap ) )
                clientServiceTransactionAddedMap[ clientId ] = {};
            clientServiceTransactionAddedMap[ clientId ][ serviceTransactionId ] = false;
            if( !bookingDateTimeEnd || !bookingDateTimeStart )
                continue;
            else if(
                DateUtils.areSameByDay( date, bookingDateTimeStart )
                && DateUtils.areSameByDay( date, bookingDateTimeEnd )
            ) {
                serviceTransactionSameDayDataMap[ serviceTransactionId ] = serviceTransactionData;
                clientServiceTransactionAddedMap[ clientId ][ serviceTransactionId ] = true;
                await addServiceTransaction( serviceTransactionData, serviceTransactionId );
            } else
                serviceTransactionOtherDayDataMap[ serviceTransactionId ] = serviceTransactionData;

        }

        for( let serviceTransactionId in serviceTransactionSameDayDataMap ) {

            const
                serviceTransactionData = serviceTransactionSameDayDataMap[ serviceTransactionId ],
                { client: { id: clientId } } = serviceTransactionData
            ;
            clientServiceTransactionAddedMap[ clientId ][ serviceTransactionId ] = true;

        }

        for( let serviceTransactionId in serviceTransactionToAddDataMap ) {

            const
                serviceTransactionData = serviceTransactionToAddDataMap[ serviceTransactionId ],
                { id: serviceId } = serviceTransactionData.service,
                { durationMin } = serviceDataMap[ serviceId ],
                DURATION_ADD = { min: 30 }
            ;
            serviceTransactionAvailabilityKeyMap[ serviceTransactionId ] = {};
            for( let timeSlotId in timeSlotDataMap ) {

                let dateRange: DateRange = getDateRangeFromTimeSlotId( timeSlotId );
                if( durationMin > 30 ) dateRange = dateRange.addEnd( DURATION_ADD );
                
                const serviceTransactionDataOption: ServiceTransactionData = {
                    ...serviceTransactionData,
                    bookingDateTimeStart: dateRange.getStart(),
                    bookingDateTimeEnd: dateRange.getEnd()
                };
                serviceTransactionAvailabilityKeyMap[ serviceTransactionId ][ timeSlotId ] =
                    await hasServiceTransaction(
                        serviceTransactionDataOption, serviceTransactionId
                    ) || await canAddServiceTransactionData(
                        serviceTransactionDataOption, serviceTransactionId
                    )
                ;

            }
        
        }

        for( let serviceTransactionId in serviceTransactionOtherDayDataMap ) {

            const
                serviceTransactionData = serviceTransactionToAddDataMap[ serviceTransactionId ],
                { client: { id: clientId } } = serviceTransactionData
            ;
            let { bookingDateTimeEnd, bookingDateTimeStart } = serviceTransactionData;
            const dateRange: DateRange = new DateRange( bookingDateTimeStart, bookingDateTimeEnd );
            if( dateRange.getDifferenceMin() > 30 ) dateRange.addTime( { min: -30 } );
            const timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT );
            if( serviceTransactionAvailabilityKeyMap[ serviceTransactionId ][ timeSlotId ] ) {

                const timeData: TimeData = {
                    yr: date.getFullYear(),
                    mon: date.getMonth(),
                    day: date.getDate()
                };
                serviceTransactionData.bookingDateTimeStart = DateUtils.setTime(
                    bookingDateTimeStart, timeData
                );
                serviceTransactionData.bookingDateTimeEnd = DateUtils.setTime(
                    bookingDateTimeEnd, timeData
                );
                clientServiceTransactionAddedMap[ clientId ][ serviceTransactionId ] = true;

            } else {

                serviceTransactionData.bookingDateTimeStart = null as unknown as Date;
                serviceTransactionData.bookingDateTimeEnd = null as unknown as Date;
                clientServiceTransactionAddedMap[ clientId ][ serviceTransactionId ] = false;
                deleteServiceTransaction( serviceTransactionId );

            }

        }

    }

    async function loadServiceTransactionDefaultData(): Promise< void > {

        const { serviceTransactionDefaultDataMap } = pageData;
        for( let serviceTransactionId in serviceTransactionDefaultDataMap ) {

            const serviceTransactionData = serviceTransactionDefaultDataMap[ serviceTransactionId ];
            await addServiceTransaction( serviceTransactionData, serviceTransactionId );

        }

    }

    async function loadTimeSlotIdList(): Promise< void > {
    
        ObjectUtils.clear( timeSlotDataMap );
        const dateRange = getDateRangeOfDay();
        if( !dateRange ) return;
        const
            minDateTime = dateRange.getStart(),
            maxDateTime = dateRange.getEnd()
        ;
        const TIME_ADD = { min: 30 };
        let date = minDateTime;
        while( date < maxDateTime ) {

            const
                end: Date = DateUtils.addTime( date, TIME_ADD ),
                dateRange: DateRange = new DateRange( date, end ),
                timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT );
            ;
            timeSlotDataMap[ timeSlotId ] = {
                chairs: 0, chairTimeSlotDataList: [],
                rooms: 0, roomTimeSlotDataList: []
            };
            date = end;

        }

    }

    async function preprocessServiceTransactionData(
        serviceTransactionData: ServiceTransactionData
    ): Promise< ServiceTransactionData[] > {

        let { bookingDateTimeStart, bookingDateTimeEnd } = serviceTransactionData;
        bookingDateTimeStart = DateUtils.toFloorByMin( bookingDateTimeStart, 30 );
        bookingDateTimeEnd = DateUtils.toCeilByMin( bookingDateTimeEnd, 30 );
        const
            minDiff: number = DateUtils.getMinDiff( bookingDateTimeEnd, bookingDateTimeStart ),
            serviceTransactionDataList: ServiceTransactionData[] = []
        ;
        if( minDiff === 60 ) {

            const
                inBetween: Date = DateUtils.addTime( bookingDateTimeStart, { min: 30 } ),
                serviceTransactionData1 = {
                    ...serviceTransactionData,
                    bookingDateTimeStart,
                    bookingDateTimeEnd: inBetween
                },
                serviceTransactionData2 = {
                    ...serviceTransactionData,
                    bookingDateTimeStart: inBetween,
                    bookingDateTimeEnd
                }
            ;
            serviceTransactionDataList.push( serviceTransactionData1, serviceTransactionData2 );

        } else if( minDiff === 30 )
            serviceTransactionDataList.push( {
                ...serviceTransactionData, bookingDateTimeStart, bookingDateTimeEnd
            } );
        return serviceTransactionDataList;

    }

    function reloadTimeSlotDataMap(): void {

        setTimeSlotDataMap( { ...timeSlotDataMap } );

    }

    useEffect( () => { loadComponentData(); }, [ pageData ]);

    const timeSlotDataMapArranged = getArrangedTimeSlotDataMap();
    let chairColumns: number = 0, roomColumns: number = 0;
    if( !isNewBookingMode ) for( let timeSlotId in timeSlotDataMap ) {

        const { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ];
        chairColumns = Math.max( chairColumns, chairTimeSlotDataList.length );
        roomColumns = Math.max( roomColumns, roomTimeSlotDataList.length );

    }

    return <>
        <table className="dayPlanner">
            <thead><tr>
                <td></td>
                {
                    !isNewBookingMode ? <>
                        <td colSpan={ roomColumns + 1 }>ROOMS</td>
                        <td colSpan={ chairColumns + 1 }>CHAIRS</td>
                    </> : <>
                        <td colSpan={ roomColumns + chairColumns + 2 }>DAY PLANNER</td>
                    </>
                }
            </tr></thead>
            <tbody>{
                Object.keys( timeSlotDataMapArranged ).map( ( timeSlotId, index ) => {

                    const
                        { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMapArranged[ timeSlotId ],
                        emptyChairTimeSlotList: undefined[] = [],
                        emptyRoomTimeSlotList: undefined[] = []
                    ;
                    let timeMark: string | undefined = undefined;
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
                    if( NumberUtils.isEven( index ) ) {

                        const
                            [ hr, min ] =
                                timeSlotId.replace( `-`, `:` ).split( `:` ).map( value => +value )
                            ,
                            timeData: TimeData = { hr, min }
                        ;
                        timeMark = DateUtils.toString(
                            DateUtils.setTime( pageData.date, timeData ), "h AM"
                        )

                    }

                    return <tr key={ timeSlotId }>
                        <td className="time-mark">{ timeMark }</td>
                        {
                            roomTimeSlotDataList.map( ( timeSlotData, index ) => {

                                if( !timeSlotData ) return undefined;
                                const
                                    {
                                        rowPosition, serviceTransactionId, serviceTransactionData,
                                        serviceTransactionData: {
                                            client: { id: clientId },
                                            service: { id: serviceId }
                                        }
                                    } = timeSlotData,
                                    { booking: { id: bookingId } } = pageData.clientDataMap[ clientId ],
                                    {
                                        activeDateTime, finishedDateTime, canceledDateTime
                                    } = pageData.bookingDataMap[ bookingId ],
                                    className: string =
                                        canceledDateTime ? "canceled"
                                        : finishedDateTime ? "finished"
                                        : activeDateTime ? "active"
                                        : "reserved"
                                ;
                                if( rowPosition === "down" ) return undefined;
                                return <TimeSlot
                                    className={ ( !isNewBookingMode || serviceTransactionIdActive !== serviceTransactionId ) ? className : `move` }
                                    clientData={ pageData.clientDataMap[ clientId ] }
                                    columnIndex={ index }
                                    dayPlannerMode={ dayPlannerMode }
                                    // employee
                                    key={ serviceTransactionId }
                                    rowPosition={ rowPosition }
                                    serviceData={ pageData.serviceDataMap[ serviceId ] }
                                    serviceTransactionId={ serviceTransactionId }
                                    serviceTransactionIdActive={ serviceTransactionIdActive }
                                    serviceTransactionData={ serviceTransactionData }
                                    onClick={ () => handleChangeServiceTransactionIdActive(
                                        serviceTransactionId
                                    ) }
                                    reloadPageData={ reloadPageData }
                                />;

                            } )
                        }
                        {
                            !isNewBookingMode ? <td className="time-slot room-info"><div>{ getAvailableRooms( timeSlotId ) } rooms available</div></td>
                            : undefined
                        }
                        {
                            emptyRoomTimeSlotList.map( ( _, index ) => <td className="time-slot" key={ index }></td> )
                        }
                        {
                            chairTimeSlotDataList.map( ( timeSlotData, index ) => {

                                if( !timeSlotData ) return undefined;
                                const
                                    {
                                        rowPosition, serviceTransactionId, serviceTransactionData,
                                        serviceTransactionData: {
                                            client: { id: clientId },
                                            service: { id: serviceId }
                                        }
                                    } = timeSlotData,
                                    { booking: { id: bookingId } } = pageData.clientDataMap[ clientId ],
                                    {
                                        activeDateTime, finishedDateTime, canceledDateTime
                                    } = pageData.bookingDataMap[ bookingId ],
                                    className: string =
                                        canceledDateTime ? "canceled"
                                        : finishedDateTime ? "finished"
                                        : activeDateTime ? "active"
                                        : "reserved"
                                ;
                                if( rowPosition === "down" ) return undefined;
                                return <TimeSlot
                                    className={ ( !isNewBookingMode || serviceTransactionIdActive !== serviceTransactionId ) ? className : `move` }
                                    clientData={ pageData.clientDataMap[ clientId ] }
                                    columnIndex={ roomColumns + index + 1 }
                                    dayPlannerMode={ dayPlannerMode }
                                    // employee
                                    key={ serviceTransactionId }
                                    rowPosition={ rowPosition }
                                    serviceData={ pageData.serviceDataMap[ serviceId ] }
                                    serviceTransactionId={ serviceTransactionId }
                                    serviceTransactionIdActive={ serviceTransactionIdActive }
                                    serviceTransactionData={ serviceTransactionData }
                                    onClick={ () => handleChangeServiceTransactionIdActive(
                                        serviceTransactionId
                                    ) }
                                    reloadPageData={ reloadPageData }
                                />;

                            } )
                        }
                        {
                            !isNewBookingMode ? <td className="time-slot room-info"><div>{ getAvailableChairs( timeSlotId ) } chairs available</div></td>
                            : undefined
                        }
                        {
                            emptyChairTimeSlotList.map( ( _, index ) => <td className="time-slot" key={ index }></td> )
                        }
                        {
                            (   
                                !isNewBookingMode
                                || serviceTransactionIdActive === undefined
                                || hasUpServiceTransaction( serviceTransactionIdActive, timeSlotId )
                            ) ? undefined
                            : ( serviceTransactionAvailabilityKeyMap[ serviceTransactionIdActive ][ timeSlotId ] ) ?
                                <td className="time-slot addition" onClick={ () => handleAddToTimeSlot( timeSlotId ) }>
                                    <div>+</div>
                                </td>
                            : <td className="time-slot not-available">Not available</td>
                        }
                    </tr>;

                } )
            }</tbody>
            <tfoot><tr><td>
                {   
                    ArrayUtils.createEmptyArray(
                        Math.ceil( ObjectUtils.keyLength( timeSlotDataMap ) / 2 )
                    ).map( ( _, index ) => <div
                        className="grid-line horizontal"
                        key={ index }
                        style={ { bottom: ( 180 + 180 * index ) + `px` } }
                    ></div> )
                    
                }
                <div className="grid-line vertical" style={ { left: `86px` } }></div>
                {
                    !isNewBookingMode ? <div className="grid-line vertical" style={ {
                        left: ( 248 + 162 * roomColumns ) + `px`
                    } }></div> : undefined
                }
                
            </td></tr></tfoot>
        </table>
        {
            isNewBookingMode ? <table className="serviceTransactionManager"><tbody>{
                Object.keys( clientServiceTransactionAddedMap ).sort(
                    ( clientId1, clientId2 ) => {
    
                        const
                            { clientDataMap } = pageData,
                            { name: name1 } = clientDataMap[ clientId1 ],
                            { name: name2 } = clientDataMap[ clientId2 ]
                        ;
                        return StringUtils.compare( name1, name2 );
    
                    }
                ).map( clientId => {
                    
                    return <tr key={ clientId }>
                        <td>
                            { pageData.clientDataMap[ clientId ].name }
                        </td>
                        <td>{
                            Object
                                .keys( clientServiceTransactionAddedMap[ clientId ] )
                                .sort( ( serviceTransactionId1, serviceTransactionId2 ) => {
    
                                    const
                                        { serviceDataMap } = pageData,
                                        { id: serviceId1 } = pageData.serviceTransactionToAddDataMap[
                                            serviceTransactionId1
                                        ].service,
                                        { id: serviceId2 } = pageData.serviceTransactionToAddDataMap[
                                            serviceTransactionId2
                                        ].service,
                                        { name: name1 } = serviceDataMap[ serviceId1 ],
                                        { name: name2 } = serviceDataMap[ serviceId2 ]
                                    ;
                                    return StringUtils.compare( name1, name2 );
    
                                } ).map( serviceTransactionId => {
    
                                    const
                                        { serviceDataMap } = pageData,
                                        { id: serviceId } = pageData.serviceTransactionToAddDataMap[
                                            serviceTransactionId
                                        ].service,
                                        { name } = serviceDataMap[ serviceId ]
                                    ;
                                    return <button
                                        className="inactive"
                                        key={ serviceTransactionId }
                                        type="button"
                                        onClick={ () => handleChangeServiceTransactionIdActive(
                                            serviceTransactionId
                                        ) }
                                    >{ name }</button>
    
                                } )
                        }</td>
                    </tr>;
    
                } )
            }</tbody></table> : undefined
        }
    </>;

}

function TimeSlot( {
    className, clientData, columnIndex, employeeData, dayPlannerMode, rowPosition, serviceData,
    serviceTransactionId, serviceTransactionIdActive,
    onClick, reloadPageData
}: {
    className: string,
    clientData: ClientData,
    columnIndex: number,
    dayPlannerMode: dayPlannerMode,
    employeeData?: EmployeeData,
    rowPosition: timeSlotRowPosition,
    serviceData: ServiceData,
    serviceTransactionData: ServiceTransactionData,
    serviceTransactionId: string,
    serviceTransactionIdActive: string | undefined,
    onClick?: () => Promise< void > | void,
    reloadPageData: () => void
} ): JSX.Element {

    const isNewBookingMode: boolean = ( dayPlannerMode === "newBooking" );

    async function handleTimeSlotClick(): Promise< void > {

        if( onClick ) await onClick();


    }

    className = `time-slot ${ className }`;
    const employeeName: string = employeeData ? PersonUtils.format( employeeData, "f mi l" ) : "(Unassigned)";
    return <td
        className={ className }
        rowSpan={ ( rowPosition === "up" ) ? 2 : undefined }
        onClick={ handleTimeSlotClick }
    >
        <div>{ clientData.name }</div>
        <div>{ serviceData.name }</div>
        {
            !isNewBookingMode ? <div>{ employeeName }</div> : undefined
        }
        {
            ( !isNewBookingMode && serviceTransactionId === serviceTransactionIdActive ) ? <>
                wdwdw
            </> : undefined
        }
    </td>;

}
