import {
    ChangeEvent,
    useEffect,
    useState
} from "react";
import DateRange from "../utils/DateRange";
import DateUtils from "../utils/DateUtils";
import { NewBookingPageData } from "../pages/NewBooking_v0";
import NumberUtils from "../utils/NumberUtils";
import { ServiceTransactionData } from "../firebase/SpaRadiseTypes";

type main = string | boolean | DateRange | number | null;

interface DateRangeOptionMap {

    [ hhmmhhmm: string ]: DateRange

}

interface EmployeeAssignableMap {

    [ serviceTransactionId: string ]: string[]

}

const
    TIME_RANGE_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
    OPTION_ADD = { min: 30 }
;

export default function ServiceTransactionTimeSlot(
    {
        children, className, clientId, documentData, duration, keyNameFrom,
        keyNameTo, max, min, name = keyNameFrom.toString(), pageData, readOnly, required,
        serviceTransactionId,
        onChange, reloadPageData, validate
    }: {
        children?: JSX.Element | JSX.Element[],
        className?: string,
        clientId: string,
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

    // hh:mm-hh:mm

    const
        [ unparsedValue, setUnparsedValue ] = useState< string >( "" ),
        [ optionMap, setOptionMap ] = useState< DateRangeOptionMap >( {} ),
        DURATION_ADD = { min: duration }
    ;

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
        reloadPageData();

    }

    async function loadComponentData(): Promise< void > {

        const
            { date, bookingCalendar } = pageData,
            optionMap = await loadOptionMap()
        ;
        let { bookingFromDateTime, bookingToDateTime } = documentData;
        if( !bookingFromDateTime && !bookingToDateTime ) return;
        let
            dateTimeRange: DateRange | null = (
                ( bookingFromDateTime && bookingToDateTime ) ? new DateRange(
                    bookingFromDateTime, bookingToDateTime
                ) : null
            ),
            unparsedValue: string = await unparseValue( dateTimeRange )
        ;
        if(
            DateUtils.areSameByDay( date, bookingFromDateTime )
            || DateUtils.areSameByDay( date, bookingToDateTime )
        ) {

            setUnparsedValue( unparsedValue );
            return;

        }
        const dayData = {
            year: date.getFullYear(),
            mon: date.getMonth(),
            day: date.getDate()
        };
        bookingFromDateTime = DateUtils.setTime( bookingFromDateTime, dayData );
        bookingToDateTime = DateUtils.setTime( bookingToDateTime, dayData );
        dateTimeRange = (
            ( bookingFromDateTime && bookingToDateTime ) ? new DateRange(
                bookingFromDateTime, bookingToDateTime
            ) : null
        );
        unparsedValue = await unparseValue( dateTimeRange );
        bookingCalendar.deleteServiceTransaction( documentData, serviceTransactionId, clientId );
        if( !( unparsedValue in optionMap ) ) {

            documentData.bookingFromDateTime = null as unknown as Date;
            documentData.bookingToDateTime = null as unknown as Date;
            setUnparsedValue( "" );

        } else {

            documentData.bookingFromDateTime = bookingFromDateTime;
            documentData.bookingToDateTime = bookingToDateTime;
            bookingCalendar.addServiceTransaction( documentData, serviceTransactionId, clientId );
            setUnparsedValue( unparsedValue );

        }

    }

    async function loadOptionMap(): Promise< DateRangeOptionMap > {

        const
            { date: bookingDate, bookingCalendar } = pageData,
            isSunday: boolean = ( bookingDate?.getDay() === 0 ),
            optionMap: DateRangeOptionMap = {}
        ;
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
                end: Date = DateUtils.addTime( optionDate, DURATION_ADD ),
                serviceTransactionData: ServiceTransactionData = {
                    ...documentData,
                    bookingFromDateTime: optionDate,
                    bookingToDateTime: end
                }
            ;
            if(
                bookingCalendar.hasServiceTransaction(
                    serviceTransactionData, serviceTransactionId
                ) || bookingCalendar.canAddServiceTransactionData(
                    serviceTransactionData, serviceTransactionId, clientId
                )
            ) {

                const
                    dateRange: DateRange = new DateRange( optionDate, end ),
                    unparsedValue: string = await unparseValue( dateRange )
                ;
                optionMap[ unparsedValue ] = dateRange;

            }
            optionDate = DateUtils.addTime( optionDate, OPTION_ADD );
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
        await loadComponentData();

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
