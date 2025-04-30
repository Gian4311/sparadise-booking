import ArrayUtils from "../utils/ArrayUtils";
import DateRange from "../utils/DateRange";
import DateUtils from "../utils/DateUtils";
import {
    BookingDataMap,
    ClientDataMap,
    EmployeeDataMap,
    EmployeeLeaveDataMap,
    JobDataMap,
    JobServiceDataMap,
    ServiceDataMap,
    ServiceTransactionData,
    ServiceTransactionDataMap
} from "../firebase/SpaRadiseTypes";
import ObjectUtils from "../utils/ObjectUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import StringUtils from "../utils/StringUtils";
import {
    useEffect,
    useState
} from "react";

interface CalendarRow {

    chairs: number,
    chairTimeSlotDataList: ( TimeSlotData | undefined )[],
    rooms: number,
    roomTimeSlotDataList: ( TimeSlotData | undefined )[]

}

interface DayPlannerPageData {

    date: Date,
    employeeDataMap: EmployeeDataMap,
    employeeLeaveDataMap?: EmployeeLeaveDataMap,
    jobDataMap?: JobDataMap,
    jobServiceDataMap?: JobServiceDataMap,
    serviceDataMap: ServiceDataMap,
    serviceTransactionAvailabilityKeyMap: ServiceTransactionAvailabilityKeyMap,
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

interface ServiceTransactionAvailabilityKeyMap {

    [ serviceTransactionId: documentId ]: {

        [ timeSlotId: string ]: boolean

    }

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

export default function DayPlanner( {
    pageData
}: {
    pageData: DayPlannerPageData
} ): JSX.Element {

    const
        [ date, setDate ] = useState< Date >( new Date( 0 ) ),
        [ timeSlotDataMap, setTimeSlotDataMap ] = useState< TimeSlotDataMap >( {} )
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
        ;
        timeSlotDataList.push( timeSlotData );
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
            {
                bookingDateTimeStart, bookingDateTimeEnd, client: { id: clientId }
            } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingDateTimeStart, bookingDateTimeEnd ),
            timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT )
        ;
        if( !( timeSlotId in timeSlotDataMap ) ) return false;

        // checking if there's available rooms/chairs
        if( !( await hasAvailableRoomType( serviceTransactionData, serviceTransactionId, clientId ) ) )
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

    async function deleteServiceTransaction(
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
                    await deleteServiceTransaction(
                        serviceTransactionDataList[ 0 ], serviceTransactionId, "up"
                    ) && await deleteServiceTransaction(
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
            { roomType } = serviceDataMap[ serviceId ],
            timeSlotDataList: ( TimeSlotData | undefined )[] =
                ( roomType === "chair" ) ? chairTimeSlotDataList : roomTimeSlotDataList
            ,
            timeSlotIndex: number = await getIndexOfServiceTransaction(
                serviceTransactionData, serviceTransactionId, rowPosition
            )
        ;
        timeSlotDataList.splice( timeSlotIndex, 1 );
        return true;

    }

    function getArrangedTimeSlotDataMap(
        bookingDataMap: BookingDataMap, clientDataMap: ClientDataMap
    ): TimeSlotDataMap {

        const
            { serviceDataMap } = pageData,
            timeSlotDataMap: TimeSlotDataMap = {}
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
                ms1 = reservedDateTime1.getTime(),
                ms2 = reservedDateTime2.getTime()
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

        for( let timeSlotId in timeSlotDataMap ) {

            const calendarRow: CalendarRow = { ...timeSlotDataMap[ timeSlotId ] };
            calendarRow.chairTimeSlotDataList = [ ...calendarRow.chairTimeSlotDataList.sort(
                compareTimeSlotData
            ) ];
            calendarRow.roomTimeSlotDataList = [ ...calendarRow.roomTimeSlotDataList.sort(
                compareTimeSlotData
            ) ];
            const
                { length: chairColumns } = calendarRow.chairTimeSlotDataList,
                { length: roomColumns } = calendarRow.roomTimeSlotDataList
            ;
            maxChairColumns = Math.max( maxChairColumns, chairColumns );
            maxRoomColumns = Math.max( maxRoomColumns, roomColumns );
            timeSlotDataMap[ timeSlotId ] = calendarRow;

        }

        function rearrangeTable( mode: roomType ): void {

            const isChair: boolean = ( mode === "chair" );
            let maxColumns: number = isChair ? maxChairColumns : maxRoomColumns;
            for( let column: number = 0; column < maxColumns; column++ ) {

                for( let timeSlotId in timeSlotDataMap ) {
    
                    const
                        {
                            chairTimeSlotDataList, roomTimeSlotDataList
                        } = timeSlotDataMap[ timeSlotId ],
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
                        } = timeSlotDataMap[ timeSlotMatchId ],
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
        return timeSlotDataMap;

    }

    async function getAvailableChairs(
        timeSlotId: string, clientIdIgnoreList: documentId[] = []
    ): Promise< number > {
    
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

    async function getAvailableRooms(
        timeSlotId: string, clientIdIgnoreList: documentId[] = []
    ): Promise< number > {

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
            timeSlotIdBelow: string = dateRange.toString( DATE_RANGE_FORMAT ),
            exists: boolean = timeSlotIdBelow in timeSlotDataMap
        ;
        return exists ? timeSlotIdBelow : undefined;

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

    async function hasAvailableRoomType(
        serviceTransactionData: ServiceTransactionData,
        serviceTransactionId: documentId,
        clientId: documentId
    ): Promise< boolean > {

        const
            { serviceDataMap } = pageData,
            { bookingDateTimeStart, bookingDateTimeEnd } = serviceTransactionData,
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
            roomTypeAvailableCount: number = await(
                ( roomType === "chair" ) ? getAvailableChairs( timeSlotId, [ clientId ] )
                : getAvailableRooms( timeSlotId, [ clientId ] )
            )
        ;
        return ( roomTypeAvailableCount > 0 );

    }

    async function handleChangeDate(): Promise< void > {

        await loadTimeSlotIdList();
        await loadCapacityData();
        await loadServiceTransactionDefaultData();
        await loadServiceTransactionToAddData();

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

        const newDate: Date = pageData.date;
        if( DateUtils.areSameByDay( date, newDate ) ) return;
        setDate( newDate );
        await handleChangeDate();
        reloadComponentData();

    }

    async function loadServiceTransactionToAddData(): Promise< void > {

        pageData.serviceTransactionAvailabilityKeyMap = {};
        const { serviceTransactionAvailabilityKeyMap, serviceTransactionToAddDataMap } = pageData;
        for( let serviceTransactionId in serviceTransactionToAddDataMap ) {

            serviceTransactionAvailabilityKeyMap[ serviceTransactionId ] = {};
            const serviceTransactionAvailabilityData =
                serviceTransactionAvailabilityKeyMap[ serviceTransactionId ]
            ;
            for( let timeSlotId in timeSlotDataMap ) {

                const dateRange: DateRange = getDateRangeFromTimeSlotId( timeSlotId );


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

    function reloadComponentData(): void { setTimeSlotDataMap( { ...timeSlotDataMap } ); }

    useEffect( () => { loadComponentData(); }, [ pageData ]);

    return <></>;

}
