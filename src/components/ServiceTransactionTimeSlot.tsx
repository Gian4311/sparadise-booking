import {
    ChangeEvent,
    useEffect,
    useState
} from "react";
import { DateRange } from "../utils/DateRange";
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

const TIME_RANGE_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

export default function ServiceTransactionTimeSlot(
    {
        children, className, documentData, duration, keyNameFrom,
        keyNameTo, max, min, name = keyNameFrom.toString(), pageData, readOnly, required,
        onChange, validate
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
        validate?( parsedValue: main | null, unparsedValue: string, old: main | null ): boolean | Promise< boolean >
    }
): JSX.Element {

    // hh:mm-hh:mm

    const
        [ unparsedValue, setUnparsedValue ] = useState< string >( "" ),
        [ optionMap, setOptionMap ] = useState< DateRangeOptionMap >( {} ),
        OPTION_ADD = { min: duration }
    ;

    async function adjustToMinMax(
        unparsedValue: string, optionMap: DateRangeOptionMap
    ): Promise< string > {

        const dateRange = parseValue( unparsedValue );
        if( !( dateRange instanceof DateRange ) ) return unparsedValue;
        const
            optionKeys = Object.keys( optionMap ),
            dateTimeFrom = documentData[ keyNameFrom ],
            dateTimeTo = documentData[ keyNameTo ]
        ;
        if( min && ( dateTimeFrom instanceof Date ) && dateTimeFrom < min )
            return optionKeys[ 0 ];
        if( max && ( dateTimeTo instanceof Date ) && dateTimeTo > max )
            return optionKeys[ optionKeys.length - 1 ];
        return unparsedValue;

    }

    async function handleChange( event: ChangeEvent< HTMLSelectElement > ): Promise< void > {
    
        if( readOnly ) return;
        const
            unparsedValueNew: string = event.target.value,
            parsedValue: main | null = parseValue( unparsedValueNew ),
            old = parseValue( unparsedValue )
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

    }

    async function handleChangeDate(): Promise< void > {

        const
            { bookingFromDateTime, bookingToDateTime } = documentData,
            { date } = pageData,
            dayData = {
                yr: date.getFullYear(),
                mon: date.getMonth(),
                day: date.getDate()
            },
            emptyDate = null as unknown as Date
        ;
        if( bookingFromDateTime )
            documentData.bookingFromDateTime = dayData ? DateUtils.setTime(
                bookingFromDateTime, dayData
            ) : emptyDate;
        if( bookingToDateTime )
            documentData.bookingToDateTime = dayData ? DateUtils.setTime(
                bookingToDateTime, dayData
            ) : emptyDate;

    }

    async function loadOptionMap(): Promise< void > {

        const { date: bookingDate } = pageData
        if( bookingDate.getDay() === 0 ) {

            setOptionMap( {} )
            return;

        };
        const
            optionMax: Date = max ? max : DateUtils.toCeilByDay( bookingDate ),
            optionMap: DateRangeOptionMap = {}
        ;
        let optionDate: Date =
            min ? DateUtils.toCeilByMin( min, 30 )
            : DateUtils.toFloorByDay( bookingDate )
        ;
        while( optionDate < optionMax ) {

            const
                end: Date = DateUtils.addTime( optionDate, OPTION_ADD ),
                dateRange: DateRange = new DateRange( optionDate, end ),
                unparsedValue: string = unparseValue( dateRange )
            ;
            optionMap[ unparsedValue ] = dateRange;
            optionDate = end;

        }
        setOptionMap( optionMap );
        const adjusted = await adjustToMinMax( unparsedValue, optionMap );
        if( unparsedValue !== adjusted ) await handleChange( {
            target: { value: adjusted }
        } as ChangeEvent< HTMLSelectElement > );

    }

    function parseValue( unparsedValue: string ): main | null {
        
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

    function unparseValue( parsedValue: main | null ): string {

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
        await handleChangeDate();
        await loadOptionMap();

    } )() }, [ pageData, max, min ] );

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
