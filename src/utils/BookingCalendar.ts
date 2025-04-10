import DateRange from "./DateRange";
import DateUtils from "./DateUtils";
import {
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

type timeSlotRowPosition = ( "single" | "up" | "down" );

interface CalendarRow {

    chairs: number,
    chairTimeSlotDataList: TimeSlotData[],
    rooms: number,
    roomTimeSlotDataList: TimeSlotData[]

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

interface TimeSlotData {

    clientId: documentId,
    serviceTransactionData: ServiceTransactionData,
    serviceTransactionId: string,
    rowPosition: timeSlotRowPosition

}

interface TimeSlotServiceEmployeeListKeyMap {

    [ timeSlotId: string ]: ServiceEmployeeListKeyMap

}

const DATE_RANGE_FORMAT = "hh:mm-hh:mm";

export default class BookingCalendar {

    private readonly timeSlotDataMap: { [ timeSlotId: string ]: CalendarRow } = {};

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
            { bookingFromDateTime, bookingToDateTime } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingFromDateTime, bookingToDateTime ),
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
            timeSlotDataList: TimeSlotData[] =
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
            { bookingFromDateTime, bookingToDateTime } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingFromDateTime, bookingToDateTime ),
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
                        bookingFromDateTime, bookingToDateTime, service: { id: serviceId }
                    },
                    serviceTransactionId
                } = timeSlotData,
                dateRange: DateRange = new DateRange( bookingFromDateTime, bookingToDateTime ),
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
            { bookingFromDateTime, bookingToDateTime } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingFromDateTime, bookingToDateTime ),
            timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT )
        ;
        if( !( timeSlotId in timeSlotDataMap ) ) return false;
        const
            { serviceDataMap } = this.pageData,
            { service: { id: serviceId } } = serviceTransactionData,
            { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ],
            { roomType } = serviceDataMap[ serviceId ],
            timeSlotDataList: TimeSlotData[] =
                ( roomType === "chair" ) ? chairTimeSlotDataList : roomTimeSlotDataList
            ,
            timeSlotIndex: number = this.indexOfServiceTransaction(
                serviceTransactionData, serviceTransactionId, rowPosition
            )
        ;
        timeSlotDataList.splice( timeSlotIndex, 1 );
        return true;

    }

    private getAvailableChairs( timeSlotId: string, clientIdIgnoreList: documentId[] = [] ): number {

        const
            clientMap: { [ clientId: documentId ]: undefined } = {},
            { chairs, chairTimeSlotDataList } = this.timeSlotDataMap[ timeSlotId ]
        ;
        for( let { clientId } of chairTimeSlotDataList )
            if( !clientIdIgnoreList.includes( clientId ) ) clientMap[ clientId ] = undefined;
        return ( chairs - ObjectUtils.keyLength( clientMap ) );

    }

    private getAvailableRooms( timeSlotId: string, clientIdIgnoreList: documentId[] = [] ): number {

        const
            clientMap: { [ clientId: documentId ]: undefined } = {},
            { rooms, roomTimeSlotDataList } = this.timeSlotDataMap[ timeSlotId ]
        ;
        for( let { clientId } of roomTimeSlotDataList )
            if( !clientIdIgnoreList.includes( clientId ) ) clientMap[ clientId ] = undefined;
        return ( rooms - ObjectUtils.keyLength( clientMap ) );

    }

    public getRowCount( serviceTransactionData: ServiceTransactionData ): number {

        let { bookingFromDateTime, bookingToDateTime } = serviceTransactionData;
        bookingFromDateTime = DateUtils.toFloorByMin( bookingFromDateTime, 30 );
        bookingToDateTime = DateUtils.toCeilByMin( bookingToDateTime, 30 );
        const minDiff: number = DateUtils.getMinDiff( bookingToDateTime, bookingFromDateTime );
        return ( minDiff / 30 );

    }

    private getServiceEmployeeKeyMap( dateRange: DateRange ): ServiceEmployeeListKeyMap {

        const
            { jobDataMap, jobServiceDataMap, serviceDataMap } = this.pageData,
            employeeLeaveDataMap = ObjectUtils.filter(
                this.pageData.employeeLeaveDataMap,
                ( employeeLeaveId, { fromDateTime, toDateTime } ) => dateRange.overlapsWith(
                    new DateRange( fromDateTime, toDateTime )
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
            { bookingFromDateTime, bookingToDateTime } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingFromDateTime, bookingToDateTime ),
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
                ].filter( ( { serviceTransactionId: serviceTransactionIdCompare } ) =>
                    ( serviceTransactionId !== serviceTransactionIdCompare )
                )
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
            { bookingFromDateTime, bookingToDateTime } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingFromDateTime, bookingToDateTime ),
            timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT ),
            { service: { id: serviceId } } = serviceTransactionData,
            serviceData = serviceDataMap[ serviceId ],
            { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ],
            timeSlotDataList: TimeSlotData[] = [ ...chairTimeSlotDataList, ...roomTimeSlotDataList ],
            compatibleTimeSlotDataList: TimeSlotData[] = []
        ;
        for( let timeSlotData of timeSlotDataList ) {

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
            { bookingFromDateTime, bookingToDateTime } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingFromDateTime, bookingToDateTime ),
            timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT )
        ;
        if( !( timeSlotId in timeSlotDataMap ) ) return false;
        const
            { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ],
            timeSlotDataList: TimeSlotData[] = [ ...chairTimeSlotDataList, ...roomTimeSlotDataList ]
        ;
        for( let { serviceTransactionId: serviceTransactionIdCompare } of timeSlotDataList )
            if( serviceTransactionId === serviceTransactionIdCompare ) return true;
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
            { bookingFromDateTime, bookingToDateTime } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingFromDateTime, bookingToDateTime ),
            timeSlotId: string = dateRange.toString( DATE_RANGE_FORMAT )
        ;
        if( !( timeSlotId in timeSlotDataMap ) ) return -1;
        const
            { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ],
            timeSlotDataList: TimeSlotData[] = [ ...chairTimeSlotDataList, ...roomTimeSlotDataList ]
        ;
        for(
            let timeSlotIndex: number = 0;
            timeSlotIndex < timeSlotDataList.length;
            timeSlotIndex++
        ) {

            const {
                serviceTransactionId: serviceTransactionIdCompare
            } = timeSlotDataList[ timeSlotIndex ];
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

        let { bookingFromDateTime, bookingToDateTime } = serviceTransactionData;
        bookingFromDateTime = DateUtils.toFloorByMin( bookingFromDateTime, 30 );
        bookingToDateTime = DateUtils.toCeilByMin( bookingToDateTime, 30 );
        const
            minDiff: number = DateUtils.getMinDiff( bookingToDateTime, bookingFromDateTime ),
            serviceTransactionDataList: ServiceTransactionData[] = []
        ;
        if( minDiff === 60 ) {

            const
                inBetween: Date = DateUtils.addTime( bookingFromDateTime, { min: 30 } ),
                serviceTransactionData1 = {
                    ...serviceTransactionData,
                    bookingFromDateTime,
                    bookingToDateTime: inBetween
                },
                serviceTransactionData2 = {
                    ...serviceTransactionData,
                    bookingFromDateTime: inBetween,
                    bookingToDateTime
                }
            ;
            serviceTransactionDataList.push( serviceTransactionData1, serviceTransactionData2 );

        } else if( minDiff === 30 )
            serviceTransactionDataList.push( {
                ...serviceTransactionData, bookingFromDateTime, bookingToDateTime
            } );
        return serviceTransactionDataList;

    }

}
