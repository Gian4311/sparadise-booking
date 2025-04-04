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

interface TimeSlotData {

    clientId: documentId,
    serviceTransactionData: ServiceTransactionData,
    serviceTransactionId: string,

}

const DATE_RANGE_FORMAT = "hh:mm-hh:mm";

export default class BookingCalendar {

    // private readonly serviceEmployeeKeyMap: ServiceEmployeeKeyMap = {};
    private readonly timeSlotDataMap: { [ timeSlotId: string ]: CalendarRow } = {};

    constructor(
        private readonly pageData: BookingCalendarPageData
    ) {

        this.loadTimeSlotIdList();
        this.loadCapacityData();
        this.loadServiceTransactionData();

    }

    public canAddServiceTransactionData(
        serviceTransactionData: ServiceTransactionData,
        clientId: documentId
    ): boolean {

        // preprocessing
        const serviceTransactionDataList = this.preprocessServiceTransactionData(
            serviceTransactionData
        );
        switch( serviceTransactionDataList.length ) {

            case 2: return (
                this.canAddServiceTransactionData( serviceTransactionDataList[ 0 ], clientId )
                && this.canAddServiceTransactionData( serviceTransactionDataList[ 1 ], clientId )
            );
            
            case 0: return false;

            default: serviceTransactionData = serviceTransactionDataList[ 0 ];

        }

        // checking if time slot exists
        const
            { timeSlotDataMap, pageData } = this,
            { bookingFromDateTime, bookingToDateTime } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingFromDateTime, bookingToDateTime ),
            timeSlotId: string = dateRange.toString( "hh:mm-hh:mm" )
        ;
        if( !( timeSlotId in timeSlotDataMap ) ) return false;

        // checking if there's available rooms/chairs
        if( !this.hasAvailableRoomTypeCount( serviceTransactionData, clientId ) )
            return false;

        // checking if there is assignable employee
        const
            { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ],
            timeSlotDataList: TimeSlotData[] = [ ...chairTimeSlotDataList, ...roomTimeSlotDataList ],
            serviceEmployeeListKeyMap: ServiceEmployeeListKeyMap = this.getServiceEmployeeKeyMap(
                dateRange
            ),
            employeeAssignedIdList: number[] = timeSlotDataList.map( () => -1 ),
            employeeAssignedIndexMap: EmployeeAssignedIndexMap = {}
        ;
        let index: number = 0;

        function resetEmployeeAssignedList( newIndex: number ): void {

            for(
                let resetIndex: number = employeeAssignedIdList.length - 1;
                resetIndex > newIndex;
                resetIndex--
            ) {

                const
                    employeeIndex: number = employeeAssignedIdList[ resetIndex ],
                    serviceId = timeSlotDataList[ resetIndex ].serviceTransactionData.service.id,
                    employeeId: string = serviceEmployeeListKeyMap[ serviceId ][ employeeIndex ]
                ;


            }
            index = newIndex - 1;

        }

        for( ; index < timeSlotDataList.length; index++ ) {

            const
                timeSlotData = timeSlotDataList[ index ],
                serviceId = timeSlotData.serviceTransactionData.service.id,
                serviceEmployeeIdList = serviceEmployeeListKeyMap[ serviceId ],
                newEmployeeIndex = ++employeeAssignedIdList[ index ],
                newEmployeeId = serviceEmployeeIdList[ newEmployeeIndex ]
            ;
            if( newEmployeeIndex >= serviceEmployeeIdList.length ) return false;
            if( newEmployeeId in employeeAssignedIndexMap ) {

                const duplicateIndex: number = employeeAssignedIndexMap[ newEmployeeId ];
                resetEmployeeAssignedList( duplicateIndex );
                continue;

            }
            // if( !( serviceId in serviceEmployeeKeyMap ) )
            

        }

        return true

        // roomTypeDataList = ( roomType === "chair" ) ? chairTimeSlotDataList : roomTimeSlotDataList
        

    }

    private getAvailableChairs( timeSlotId: string ): number {

        const
            clientMap: { [ clientId: documentId ]: undefined } = {},
            { chairs, chairTimeSlotDataList } = this.timeSlotDataMap[ timeSlotId ]
        ;
        for( let { clientId } of chairTimeSlotDataList ) clientMap[ clientId ] = undefined;
        return ( chairs - ObjectUtils.keyLength( clientMap ) );

    }

    private getAvailableRooms( timeSlotId: string ): number {

        const
            clientMap: { [ clientId: documentId ]: undefined } = {},
            { rooms, roomTimeSlotDataList } = this.timeSlotDataMap[ timeSlotId ]
        ;
        for( let { clientId } of roomTimeSlotDataList ) clientMap[ clientId ] = undefined;
        return ( rooms - ObjectUtils.keyLength( clientMap ) );

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

    private hasAvailableRoomTypeCount(
        serviceTransactionData: ServiceTransactionData,
        clientId: documentId
    ): boolean {

        const
            { timeSlotDataMap, pageData: { serviceDataMap } } = this,
            { bookingFromDateTime, bookingToDateTime } = serviceTransactionData,
            dateRange: DateRange = new DateRange( bookingFromDateTime, bookingToDateTime ),
            timeSlotId: string = dateRange.toString( "hh:mm-hh:mm" ),
            { service: { id: serviceId } } = serviceTransactionData,
            serviceData = serviceDataMap[ serviceId ],
            { chairTimeSlotDataList, roomTimeSlotDataList } = timeSlotDataMap[ timeSlotId ],
            timeSlotDataList: TimeSlotData[] = [ ...chairTimeSlotDataList, ...roomTimeSlotDataList ],
            compatibleTimeSlotDataList: TimeSlotData[] = []
        ;
        for( let timeSlotData of timeSlotDataList ) {

            const { clientId: clientIdCompare } = timeSlotData;
            if( clientId !== clientIdCompare ) continue;
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
                ( roomType === "chair" ) ? this.getAvailableChairs( timeSlotId )
                : this.getAvailableRooms( timeSlotId )
        ;
        return ( roomTypeAvailableCount > 0 );

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
                    bookingToDateTime: inBetween
                },
                serviceTransactionData2 = {
                    ...serviceTransactionData,
                    bookingFromDateTime: inBetween
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
