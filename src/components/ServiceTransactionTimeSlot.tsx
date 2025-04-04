import {
    ChangeEvent,
    useEffect,
    useState
} from "react";
import DateRange from "../utils/DateRange";
import DateUtils from "../utils/DateUtils";
import { NewBookingPageData } from "../pages/NewBooking_v0";
import NumberUtils from "../utils/NumberUtils";
import {
    ServiceTransactionData,
    SpaRadiseDocumentData
} from "../firebase/SpaRadiseTypes";

type main = string | boolean | DateRange | number | null;

interface DateRangeOptionMap {

    [ hhmmhhmm: string ]: DateRange

}

interface EmployeeAssignableMap {

    [ serviceTransactionId: string ]: string[]

}

const TIME_RANGE_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

export default function ServiceTransactionTimeSlot(
    {
        children, className, documentData, duration, keyNameFrom,
        keyNameTo, max, min, name = keyNameFrom.toString(), pageData, readOnly, required,
        onChange, reloadPageData, validate
    }: {
        children?: JSX.Element | JSX.Element[],
        className?: string,
        documentData: ServiceTransactionData,
        duration: 30 | 60,
        keyNameFrom: string,
        keyNameTo: string,
        max?: Date,
        min?: Date,
        name?: string,
        pageData: NewBookingPageData,
        readOnly?: boolean,
        required?: boolean,
        onChange?( parsedValue: main | null, unparsedValue: string, old: main | null ): Promise< void > | void,
        reloadPageData(): void,
        validate?( parsedValue: main | null, unparsedValue: string, old: main | null ): boolean | Promise< boolean >
    }
): JSX.Element {

    // hh:mm-hh:mm

    const
        [ unparsedValue, setUnparsedValue ] = useState< string >( "" ),
        [ optionMap, setOptionMap ] = useState< DateRangeOptionMap >( {} ),
        OPTION_ADD = { min: duration }
    ;

    async function getEmployeeAssignableMap( dateRange: DateRange ): Promise< EmployeeAssignableMap > {

        const
            {
                clientInfoMap, employeeDataMap, employeeLeaveDataMap,
                jobDataMap, jobServiceDataMap, serviceTransactionOfDayDataMap
            } = pageData,
            serviceTransactionList: ServiceTransactionData[] = [],
            employeeAssignableMap: EmployeeAssignableMap = {}
        ;
        for( let clientIndex in clientInfoMap ) {

            const { serviceTransactionDataMap } = clientInfoMap[ clientIndex ];
            for( let serviceTransactionIndex in serviceTransactionDataMap ) {

                const serviceTransactionData = serviceTransactionDataMap[ serviceTransactionIndex ];
                if( documentData === serviceTransactionData ) continue;
                serviceTransactionList.push( serviceTransactionData );

            }

        }
        for( let serviceTransactionId in serviceTransactionOfDayDataMap ) {

            const
                { bookingFromDateTime, bookingToDateTime } =
                    serviceTransactionOfDayDataMap[ serviceTransactionId ]
            ;
            // if( dateRange.overlapsWith())

        }
        return employeeAssignableMap;

    }

    async function handleChange( event: ChangeEvent< HTMLSelectElement > ): Promise< void > {
    
        if( readOnly ) return;
        const
            unparsedValueNew: string = event.target.value,
            parsedValue: main | null = await parseValue( unparsedValueNew ),
            old = await parseValue( unparsedValue )
        ;
        if( validate ) if( !( await validate( parsedValue, unparsedValueNew, old ) ) ) return;
        setUnparsedValue( unparsedValueNew );
        documentData[ keyNameFrom ] =
            ( parsedValue instanceof DateRange ) ? parsedValue.getStart() : parsedValue
        ;
        documentData[ keyNameTo ] =
            ( parsedValue instanceof DateRange ) ? parsedValue.getEnd() : parsedValue
        ;
        if( onChange ) await onChange( parsedValue, unparsedValueNew, old );
        // reloadPageData();

    }

    function hasConflictingServiceTransaction( dateRange: DateRange ): boolean {

        const
            {
                clientInfoMap, employeeDataMap, employeeLeaveDataMap,
                jobDataMap, jobServiceDataMap, serviceTransactionOfDayDataMap
            } = pageData
        ;
        for( let clientIndex in clientInfoMap ) {

            const { serviceTransactionDataMap } = clientInfoMap[ clientIndex ];
            for( let serviceTransactionIndex in serviceTransactionDataMap ) {

                const serviceTransactionData = serviceTransactionDataMap[ serviceTransactionIndex ];
                if( documentData === serviceTransactionData ) continue;
                const
                    { bookingFromDateTime, bookingToDateTime } = serviceTransactionData,
                    dateRangeCompare: DateRange | null = (
                        ( bookingFromDateTime && bookingToDateTime ) ? new DateRange(
                            bookingFromDateTime, bookingToDateTime
                        ) : null
                    )
                ;
                if( !dateRangeCompare ) continue;
                if( dateRange.overlapsWith( dateRangeCompare ) ) return true;

            }

        }
        for( let serviceTransactionId in serviceTransactionOfDayDataMap ) {

            const
                { bookingFromDateTime, bookingToDateTime } =
                    serviceTransactionOfDayDataMap[ serviceTransactionId ]
                ,
                dateRangeCompare: DateRange | null = (
                    ( bookingFromDateTime && bookingToDateTime ) ? new DateRange(
                        bookingFromDateTime, bookingToDateTime
                    ) : null
                )
            ;
            if( !dateRangeCompare ) continue;
            if( dateRange.overlapsWith( dateRangeCompare ) ) return true;

        }
        return false;

    }

    async function loadOptionMap(): Promise< DateRangeOptionMap > {

        const
            { date: bookingDate } = pageData,
            isSunday: boolean = ( bookingDate?.getDay() === 0 )
        ;
        let optionMap: DateRangeOptionMap = {};
        if( !bookingDate || isSunday ) {

            setOptionMap( optionMap );
            return optionMap;

        };

        const optionMax: Date = max ? max : DateUtils.toCeilByDay( bookingDate );
        let optionDate: Date =
            min ? DateUtils.toCeilByMin( min, 30 )
            : DateUtils.toFloorByDay( bookingDate )
        ;
        while( optionDate < optionMax ) {

            const
                end: Date = DateUtils.addTime( optionDate, OPTION_ADD ),
                dateRange: DateRange = new DateRange( optionDate, end )
            ;
            if( hasConflictingServiceTransaction( dateRange ) ) continue;
            // const
            //     employeeAssignableMap: EmployeeAssignableMap = await getEmployeeAssignableMap(
            //         dateRange
            //     )
            // ;

            const unparsedValue: string = await unparseValue( dateRange );
            optionMap[ unparsedValue ] = dateRange;
            optionDate = end;

        }
        setOptionMap( optionMap );
        return optionMap;

    }

    async function parseValue( unparsedValue: string ): Promise< main | null > {
        
        const
            isTrue: boolean = ( unparsedValue === "true" ),
            isFalse: boolean = ( unparsedValue === "false" ),
            isNull: boolean = ( unparsedValue === "null" ),
            isTimeRange: boolean = Boolean( unparsedValue.match( TIME_RANGE_REGEX ) ),
            isNumber: boolean = NumberUtils.isNumeric( unparsedValue ),
            isEmpty: boolean = ( unparsedValue.length === 0 )
        ;

        function getDateRange(): DateRange {

            const
                { date } = pageData,
                [ hr1, min1, hr2, min2 ] =
                    unparsedValue.replace( "-", ":" ).split( ":" ).map( number => +number )
                ,
                date1: Date = DateUtils.setTime( date, { hr: hr1, min: min1 } ),
                date2: Date = DateUtils.setTime( date, { hr: hr2, min: min2 } )
            ;
            return new DateRange( date1, date2 );

        }

        return (
            isTrue ? true
            : isFalse ? false
            : isNull ? null
            : isTimeRange ? getDateRange()
            : isNumber ? +unparsedValue
            : isEmpty ? null
            : unparsedValue
        );

    }

    async function unparseValue( parsedValue: main | null ): Promise< string > {

        return (
            ( parsedValue instanceof DateRange ) ? parsedValue.toString( "hh:mm-hh:mm" )
            : ( parsedValue?.toString() ?? "" )
        );

    }

    useEffect( () => { ( async() => {
    
        if( !documentData ) return;
        if( documentData[ keyNameFrom ] === undefined )
            throw new Error( `Key name "${ keyNameFrom }" does not exist.` );
        if( documentData[ keyNameTo ] === undefined )
            throw new Error( `Key name "${ keyNameTo }" does not exist.` );
        const { date } = pageData;
        if( max && !DateUtils.areSameByDay( date, max ) )
            throw new Error( `Service transaction max must be same day with new booking day.` ); 
        if( min && !DateUtils.areSameByDay( date, min ) )
            throw new Error( `Service transaction min must be same day with new booking day.` );
        const
            { bookingFromDateTime, bookingToDateTime } = documentData,
            dateTimeRange: DateRange | null = (
                ( bookingFromDateTime && bookingToDateTime ) ? new DateRange(
                    bookingFromDateTime, bookingToDateTime
                ) : null
            ),
            optionMap = await loadOptionMap(),
            event = { target: { value: "" } } as ChangeEvent< HTMLSelectElement >
        ;
        let unparsedValue: string = await unparseValue( dateTimeRange );
        if( !( unparsedValue in optionMap ) )
            await handleChange( event );
        else if(
            !DateUtils.areSameByDay( bookingFromDateTime, date )
            || !DateUtils.areSameByDay( bookingToDateTime, date )
        ) {

            event.target.value = unparsedValue;
            await handleChange( event );

        } else setUnparsedValue( unparsedValue );

    } )() }, [ pageData ] );

    return <select
        className={ className }
        id={ name }
        name={ name }
        required={ required }
        value={ unparsedValue }
        onChange={ event => handleChange( event ) }
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
