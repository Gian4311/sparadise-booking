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
    ServiceTransactionAvailabilityKeyMap,
    ServiceTransactionData,
    ServiceTransactionDataMap
} from "../firebase/SpaRadiseTypes";
import ObjectUtils from "../utils/ObjectUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import StringUtils from "../utils/StringUtils";
import {
    useEffect,
    useState
} from "react"

interface TimeSlotSelectPageData {

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

type main = string | boolean | DateRange | number | null;

interface DateRangeOptionMap {

    [ hhmmhhmm: string ]: DateRange

}

export default function ServiceTransactionTimeSlotSelect(
    {
        children, className, max, min, name, pageData, readOnly, required,
        serviceTransactionData, serviceTransactionId,
        onChange, reloadPageData, validate
    }: {
        children?: JSX.Element | JSX.Element[],
        className?: string,
        max?: Date,
        min?: Date,
        name?: string,
        pageData: TimeSlotSelectPageData,
        readOnly?: boolean,
        required?: boolean,
        serviceTransactionData: ServiceTransactionData,
        serviceTransactionId: string,
        onChange?(
            parsedValue: main | null, unparsedValue: string, old: main | null
        ): Promise< void > | void,
        reloadPageData(): void,
        validate?(
            parsedValue: main | null, unparsedValue: string, old: main | null
        ): boolean | Promise< boolean >
    }
): JSX.Element {

    const
        [ unparsedValue, setUnparsedValue ] = useState< string >( "" ),
        [ optionMap, setOptionMap ] = useState< DateRangeOptionMap >( {} )
    ;

    async function loadComponentData(): Promise< void > {
        
        await loadOptionMap();
        const { date, serviceTransactionAvailabilityKeyMap } = pageData;
        let { bookingDateTimeStart, bookingDateTimeEnd } = serviceTransactionData;
        if( !bookingDateTimeStart || !bookingDateTimeEnd ) return;
        let dateTimeRange: DateRange = new DateRange( bookingDateTimeStart, bookingDateTimeEnd );
        if( dateTimeRange.getDifferenceMin() > 30 )
            dateTimeRange = dateTimeRange.addEnd( { min: -30 } );
        // const timeSlotId: string = await unparseValue( dateTimeRange );
        if(
            DateUtils.areSameByDay( date, bookingDateTimeStart )
            || DateUtils.areSameByDay( date, bookingDateTimeEnd )
        ) {

            // setUnparsedValue( timeSlotId );
            return;

        }
        const timeSlotAvailabilityMap = serviceTransactionAvailabilityKeyMap[ serviceTransactionId ];

        // const dayData = {
        //     year: date.getFullYear(),
        //     mon: date.getMonth(),
        //     day: date.getDate()
        // };
        // bookingDateTimeStart = DateUtils.setTime( bookingDateTimeStart, dayData );
        // bookingDateTimeEnd = DateUtils.setTime( bookingDateTimeEnd, dayData );
        // dateTimeRange = (
        //     ( bookingDateTimeStart && bookingDateTimeEnd ) ? new DateRange(
        //         bookingDateTimeStart, bookingDateTimeEnd
        //     ) : null
        // );
        // unparsedValue = await unparseValue( dateTimeRange );
        // bookingCalendar.deleteServiceTransaction( serviceTransactionData, serviceTransactionId, clientId );
        // if( !timeSlotAvailabilityMap[ timeSlotId ] ) {

        //     serviceTransactionData.bookingDateTimeStart = null as unknown as Date;
        //     serviceTransactionData.bookingDateTimeEnd = null as unknown as Date;
        //     setUnparsedValue( "" );

        // } else {

        //     serviceTransactionData.bookingDateTimeStart = bookingDateTimeStart;
        //     serviceTransactionData.bookingDateTimeEnd = bookingDateTimeEnd;
        //     // bookingCalendar.addServiceTransaction( serviceTransactionData, serviceTransactionId, clientId );
        //     setUnparsedValue( unparsedValue );

        // }

    }

    async function loadOptionMap(): Promise< void > {

        // here
        setOptionMap( { ...optionMap } );

    }

    useEffect( () => { ( async() => {
        
        if( !serviceTransactionData ) return;
        const { date } = pageData;
        if( max && !DateUtils.areSameByDay( date, max ) )
            throw new Error( `Service transaction max must be same day with new booking day.` ); 
        if( min && !DateUtils.areSameByDay( date, min ) )
            throw new Error( `Service transaction min must be same day with new booking day.` );
        await loadComponentData();

    } )() }, [ pageData ] );

    return <select
        className={ className }
        id={ name }
        name={ name }
        required={ required }
        value={ unparsedValue }
        // onChange={ event => handleChange( event ) }
    >
        { children }
        {
            Object.keys( optionMap ).map( timeRangeKey => <option
                key={ timeRangeKey }
                value={ timeRangeKey }
            >{ optionMap[ timeRangeKey ].toString( "h:mmAM-h:mmAM" ) }</option> )
        }
    </select>;

}
