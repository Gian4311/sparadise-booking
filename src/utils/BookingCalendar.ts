import ArrayUtils from "./ArrayUtils";
import DateRange from "./DateRange";
import DateUtils from "./DateUtils";
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
import ObjectUtils from "./ObjectUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import StringUtils from "./StringUtils";

interface CalendarRow {

    chairs: number,
    chairTimeSlotDataList: ( TimeSlotData | undefined )[],
    rooms: number,
    roomTimeSlotDataList: ( TimeSlotData | undefined )[]

}

interface BookingCalendarPageData {

    date: Date,
    employeeDataMap: EmployeeDataMap,
    employeeLeaveDataMap: EmployeeLeaveDataMap,
    jobDataMap: JobDataMap,
    jobServiceDataMap: JobServiceDataMap,
    serviceDataMap: ServiceDataMap,
    serviceTransactionDataMap: ServiceTransactionDataMap

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

interface ServiceTransactionIncludedMap {

    [ serviceTransactionId: documentId ]: number

}

interface TimeSlotData {

    clientId: documentId,
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

export default class BookingCalendar {

    private readonly timeSlotDataMap: TimeSlotDataMap = {};

    constructor(
        private readonly pageData: BookingCalendarPageData
    ) {

        this.loadTimeSlotIdList();
        this.loadCapacityData();
        this.loadServiceTransactionData();

    }

    public addServiceTransaction(
        serviceTransactionData: ServiceTransactionData,
        serviceTransactionId: documentId,
        clientId: documentId,
        rowPosition?: timeSlotRowPosition
    ): boolean {

        if( !rowPosition ) {

            const serviceTransactionDataList = this.preprocessServiceTransactionData(
                serviceTransactionData
            );
            switch( serviceTransactionDataList.length ) {
    
                case 2: return (
                    this.addServiceTransaction(
                        serviceTransactionDataList[ 0 ], serviceTransactionId, clientId, "up"
                    ) && this.addServiceTransaction(
                        serviceTransactionDataList[ 1 ], serviceTransactionId, clientId, "down"
                    )
                );
                
                case 0: return false;
    
                default:
                    serviceTransactionData = serviceTransactionDataList[ 0 ];
                    rowPosition = "single";
    
            }

        }
        const
            { timeSlotDataMap } = this,
            { bookingDateTimeStart, bookingDateTimeEnd } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingDateTimeStart, bookingDateTimeEnd ),
            timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT )
        ;
        if( !( timeSlotId in timeSlotDataMap ) ) return false;
        const
            { serviceDataMap } = this.pageData,
            { service: { id: serviceId } } = serviceTransactionData,
            { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ],
            timeSlotData: TimeSlotData = {
                clientId, serviceTransactionId, serviceTransactionData, rowPosition
            },
            { roomType } = serviceDataMap[ serviceId ],
            timeSlotDataList: ( TimeSlotData | undefined )[] =
                ( roomType === "chair" ) ? chairTimeSlotDataList
                : roomTimeSlotDataList
        ;
        timeSlotDataList.push( timeSlotData );
        return true;

    }

    public canAddServiceTransactionData(
        serviceTransactionData: ServiceTransactionData,
        serviceTransactionId: documentId,
        clientId: documentId,
        rowPosition?: timeSlotRowPosition
    ): boolean {

        // preprocessing
        if( !rowPosition ) {

            const serviceTransactionDataList = this.preprocessServiceTransactionData(
                serviceTransactionData
            );
            switch( serviceTransactionDataList.length ) {
    
                case 2: return (
                    this.canAddServiceTransactionData(
                        serviceTransactionDataList[ 1 ], serviceTransactionId, clientId, "down"
                    ) && this.canAddServiceTransactionData(
                        serviceTransactionDataList[ 0 ], serviceTransactionId, clientId, "up"
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
            { timeSlotDataMap } = this,
            { bookingDateTimeStart, bookingDateTimeEnd } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingDateTimeStart, bookingDateTimeEnd ),
            timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT )
        ;
        if( !( timeSlotId in timeSlotDataMap ) ) return false;

        // checking if there's available rooms/chairs
        if( !this.hasAvailableRoomType( serviceTransactionData, serviceTransactionId, clientId ) )
            return false;

        // checking if there is assignable employee
        const
            timeSlotData: TimeSlotData = {
                clientId, serviceTransactionId, serviceTransactionData, rowPosition
            },
            timeSlotDataConflictingList: TimeSlotData[] = [
                ...this.getTimeSlotDataConflictingList(
                    serviceTransactionData, serviceTransactionId
                ),
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
                    this.getServiceEmployeeKeyMap( dateRange )
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

    public deleteServiceTransaction(
        serviceTransactionData: ServiceTransactionData,
        serviceTransactionId: documentId,
        clientId: documentId,
        rowPosition?: timeSlotRowPosition
    ): boolean {

        if( !rowPosition ) {

            const serviceTransactionDataList = this.preprocessServiceTransactionData(
                serviceTransactionData
            );
            switch( serviceTransactionDataList.length ) {
    
                case 2: return (
                    this.deleteServiceTransaction(
                        serviceTransactionDataList[ 0 ], serviceTransactionId, clientId, "up"
                    ) && this.deleteServiceTransaction(
                        serviceTransactionDataList[ 1 ], serviceTransactionId, clientId, "down"
                    )
                );
                
                case 0: return false;
    
                default:
                    serviceTransactionData = serviceTransactionDataList[ 0 ];
                    rowPosition = "single";
    
            }

        }
        const
            { timeSlotDataMap } = this,
            { bookingDateTimeStart, bookingDateTimeEnd } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingDateTimeStart, bookingDateTimeEnd ),
            timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT )
        ;
        if( !( timeSlotId in timeSlotDataMap ) ) return false;
        const
            { serviceDataMap } = this.pageData,
            { service: { id: serviceId } } = serviceTransactionData,
            { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ],
            { roomType } = serviceDataMap[ serviceId ],
            timeSlotDataList: ( TimeSlotData | undefined )[] =
                ( roomType === "chair" ) ? chairTimeSlotDataList : roomTimeSlotDataList
            ,
            timeSlotIndex: number = this.indexOfServiceTransaction(
                serviceTransactionData, serviceTransactionId, rowPosition
            )
        ;
        timeSlotDataList.splice( timeSlotIndex, 1 );
        return true;

    }

    public getArrangedTimeSlotDataMap(
        bookingDataMap: BookingDataMap, clientDataMap: ClientDataMap
    ): TimeSlotDataMap {

        const
            { serviceDataMap } = this.pageData,
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
                { clientId: clientId1 } = timeSlotData1,
                { clientId: clientId2 } = timeSlotData2,
                { id: bookingId1 } = clientDataMap[ clientId1 ].booking,
                { id: bookingId2 } = clientDataMap[ clientId2 ].booking,
                { reservedDateTime: reservedDateTime1 } = bookingDataMap[ bookingId1 ],
                { reservedDateTime: reservedDateTime2 } = bookingDataMap[ bookingId2 ],
                ms1 = reservedDateTime1.getTime(),
                ms2 = reservedDateTime2.getTime()
            ;
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

        for( let timeSlotId in this.timeSlotDataMap ) {

            const calendarRow: CalendarRow = { ...this.timeSlotDataMap[ timeSlotId ] };
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

    public getAvailableChairs( timeSlotId: string, clientIdIgnoreList: documentId[] = [] ): number {

        const
            clientMap: { [ clientId: documentId ]: undefined } = {},
            { chairs, chairTimeSlotDataList } = this.timeSlotDataMap[ timeSlotId ]
        ;
        for( let timeSlotData of chairTimeSlotDataList ) {

            if( !timeSlotData ) continue;
            const { clientId } = timeSlotData;
            if( !clientIdIgnoreList.includes( clientId ) ) clientMap[ clientId ] = undefined;

        }
        return ( chairs - ObjectUtils.keyLength( clientMap ) );

    }

    public getAvailableRooms( timeSlotId: string, clientIdIgnoreList: documentId[] = [] ): number {

        const
            clientMap: { [ clientId: documentId ]: undefined } = {},
            { rooms, roomTimeSlotDataList } = this.timeSlotDataMap[ timeSlotId ]
        ;
        for( let timeSlotData of roomTimeSlotDataList ){

            if( !timeSlotData ) continue;
            const { clientId } = timeSlotData;
            if( !clientIdIgnoreList.includes( clientId ) ) clientMap[ clientId ] = undefined;

        }
        return ( rooms - ObjectUtils.keyLength( clientMap ) );

    }

    public getRowCount( serviceTransactionData: ServiceTransactionData ): number {

        let { bookingDateTimeStart, bookingDateTimeEnd } = serviceTransactionData;
        bookingDateTimeStart = DateUtils.toFloorByMin( bookingDateTimeStart, 30 );
        bookingDateTimeEnd = DateUtils.toCeilByMin( bookingDateTimeEnd, 30 );
        const minDiff: number = DateUtils.getMinDiff( bookingDateTimeEnd, bookingDateTimeStart );
        return ( minDiff / 30 );

    }

    private getServiceEmployeeKeyMap( dateRange: DateRange ): ServiceEmployeeListKeyMap {

        const
            { jobDataMap, jobServiceDataMap, serviceDataMap } = this.pageData,
            employeeLeaveDataMap = ObjectUtils.filter(
                this.pageData.employeeLeaveDataMap,
                ( employeeLeaveId, { dateTimeStart, dateTimeEnd } ) => dateRange.overlapsWith(
                    new DateRange( dateTimeStart, dateTimeEnd )
                )
            ),
            employeeOnLeaveIdMap: { [ employeeId: string ]: undefined } = {},
            serviceEmployeeKeyMap: ServiceEmployeeListKeyMap = {}
        ;
        for( let employeeLeaveId in employeeLeaveDataMap ) {

            const { employee: { id: employeeId } } = employeeLeaveDataMap[ employeeLeaveId ];
            employeeOnLeaveIdMap[ employeeId ] = undefined;

        }
        const
            employeeDataMap: EmployeeDataMap = ObjectUtils.filter(
                this.pageData.employeeDataMap,
                employeeId => !( employeeId in employeeOnLeaveIdMap )
            ),
            jobServiceKeyMap: JobServiceKeyMap = {}
        ;
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

    private getTimeSlotDataConflictingList(
        serviceTransactionData: ServiceTransactionData,
        serviceTransactionId: documentId
    ): TimeSlotData[] {

        const
            { timeSlotDataMap } = this,
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
                timeSlotIdAbove: string | undefined = this.getTimeSlotIdAbove( timeSlotId ),
                timeSlotIdBelow: string | undefined = this.getTimeSlotIdBelow( timeSlotId ),
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

    private getTimeSlotIdAbove( timeSlotId: string ): string | undefined {

        
        const { timeSlotDataMap } = this;
        if( !( timeSlotId in timeSlotDataMap ) ) return;
        const
            [ hr1, min1, hr2, min2 ] =
                timeSlotId.replace( "-", ":" ).split( ":" ).map( value => +value )
            ,
            date1: Date = DateUtils.setTime( new Date(), { hr: hr1, min: min1 - 30 } ),
            date2: Date = DateUtils.setTime( new Date(), { hr: hr2, min: min2 - 30 } ),
            dateRange: DateRange = new DateRange( date1, date2 )
        ;
        return dateRange.toString( DATE_RANGE_FORMAT );

    }

    private getTimeSlotIdBelow( timeSlotId: string ): string | undefined {

        
        const { timeSlotDataMap } = this;
        if( !( timeSlotId in timeSlotDataMap ) ) return;
        const
            [ hr1, min1, hr2, min2 ] =
                timeSlotId.replace( "-", ":" ).split( ":" ).map( value => +value )
            ,
            date1: Date = DateUtils.setTime( new Date(), { hr: hr1, min: min1 + 30 } ),
            date2: Date = DateUtils.setTime( new Date(), { hr: hr2, min: min2 + 30 } ),
            dateRange: DateRange = new DateRange( date1, date2 )
        ;
        return dateRange.toString( DATE_RANGE_FORMAT );

    }

    private hasAvailableRoomType(
        serviceTransactionData: ServiceTransactionData,
        serviceTransactionId: documentId,
        clientId: documentId
    ): boolean {

        const
            { timeSlotDataMap, pageData: { serviceDataMap } } = this,
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
                clientId: clientIdCompare
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
            roomTypeAvailableCount: number =
                ( roomType === "chair" ) ? this.getAvailableChairs( timeSlotId, [ clientId ] )
                : this.getAvailableRooms( timeSlotId, [ clientId ] )
        ;
        return ( roomTypeAvailableCount > 0 );

    }

    public hasServiceTransaction(
        serviceTransactionData: ServiceTransactionData,
        serviceTransactionId: documentId
    ): boolean {

        const serviceTransactionDataList = this.preprocessServiceTransactionData(
            serviceTransactionData
        );
        switch( serviceTransactionDataList.length ) {

            case 2: return (
                this.hasServiceTransaction( serviceTransactionDataList[ 1 ], serviceTransactionId )
                && this.hasServiceTransaction( serviceTransactionDataList[ 0 ], serviceTransactionId )
            );
            
            case 0: return false;

            default: serviceTransactionData = serviceTransactionDataList[ 0 ];

        }
        const
            { timeSlotDataMap } = this,
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

    public indexOfServiceTransaction(
        serviceTransactionData: ServiceTransactionData,
        serviceTransactionId: documentId,
        rowPosition: timeSlotRowPosition
    ): number {

        const serviceTransactionDataList = this.preprocessServiceTransactionData(
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
            { timeSlotDataMap } = this,
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

    public isSaturday(): boolean {

        return this.pageData.date.getDay() === 6;

    }

    public isSunday(): boolean {

        return this.pageData.date.getDay() === 0;

    }

    public isWeekday(): boolean {

        const weekDayIndex: number = this.pageData.date.getDay();
        return ( weekDayIndex > 0 && weekDayIndex < 6 );

    }

    private loadCapacityData(): void {

        // initial
        const { timeSlotDataMap } = this;
        for( let timeSlotId in timeSlotDataMap ) {

            const calendarRow = timeSlotDataMap[ timeSlotId ];
            calendarRow.chairs = 5;
            calendarRow.rooms = 5;

        }

    }

    private loadServiceTransactionData(): void {

        const { serviceTransactionDataMap } = this.pageData;
        for( let serviceTransactionId in serviceTransactionDataMap ) {

            const
                serviceTransactionData = serviceTransactionDataMap[ serviceTransactionId ],
                { client: { id: clientId } } = serviceTransactionData
            ;
            this.addServiceTransaction(
                serviceTransactionData, serviceTransactionId, clientId
            );

        }

    }

    private loadTimeSlotIdList(): void {

        let { date } = this.pageData, minDateTime: Date, maxDateTime: Date;
        switch( date.getDay() ) {

            case 0: return;
            case 6:
                minDateTime = DateUtils.setTime( date, { hr: 10, min: 0 } );
                maxDateTime = DateUtils.setTime( date, { hr: 18, min: 0 } );
                break;
            default:
                minDateTime = DateUtils.setTime( date, { hr: 9, min: 0 } );
                maxDateTime = DateUtils.setTime( date, { hr: 20, min: 0 } );

        }
        const { timeSlotDataMap } = this, TIME_ADD = { min: 30 };
        date = minDateTime;
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

    private preprocessServiceTransactionData(
        serviceTransactionData: ServiceTransactionData
    ): ServiceTransactionData[] {

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

}
