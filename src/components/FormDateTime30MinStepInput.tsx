import {
    ChangeEvent,
    useEffect,
    useState
} from "react";
import DateUtils from "../utils/DateUtils";
import ObjectUtils from "../utils/ObjectUtils";
import {
    SpaRadiseDocumentData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";

type main = Date;
type meridiem = "am" | "pm";

const DATETIME_FORMAT = "yyyy-mm-ddThh:mm";

export default function FormDateTime30MinStepInput(
    {
        className, documentData, documentDefaultData, documentId, keyName, max, min,
        name = keyName.toString(),
        pageData, placeholder, readOnly, required,
        onChange, validate
    }: {
        className?: string,
        documentData: SpaRadiseDocumentData,
        documentDefaultData?: SpaRadiseDocumentData,
        documentId?: string,
        keyName: string,
        max?: Date,
        min?: Date,
        name?: string,
        pageData: SpaRadisePageData,
        placeholder?: string,
        readOnly?: boolean,
        required?: boolean,
        onChange?( parsedValue: main | null, unparsedValue: string, old: main | null ): Promise< void > | void,
        validate?( parsedValue: main | null, unparsedValue: string, old: main | null ): boolean | Promise< boolean >
    }
): JSX.Element {

    const [ unparsedValue, setUnparsedValue ] = useState< string >( "" );

    function adjustToMinMax( date: Date ): Date {

        return (
            ( min && date < min ) ? min
            : ( max && date > max ) ? max
            : date
        );

    }

    async function handleChange( date: Date ): Promise< void > {

        if( readOnly ) return;
        const
            unparsedValueNew: string = DateUtils.toString( adjustToMinMax( date ), DATETIME_FORMAT ),
            parsedValue: main | null = await parseValue( unparsedValueNew ),
            old = documentData[ keyName ] as main | null
        ;
        if( validate ) if( !( await validate( parsedValue, unparsedValueNew, old ) ) ) return;
        setUnparsedValue( unparsedValueNew );
        documentData[ keyName ] = parsedValue;
        await handleDefault( parsedValue );
        if( onChange ) await onChange( parsedValue, unparsedValueNew, old );

    }

    async function handleDateChange( event: ChangeEvent< HTMLInputElement > ): Promise< void > {

        const
            unparsedDateValue: string = event.target.value,
            isEmpty: boolean = ( unparsedValue === "" ),
            stringAddRight: string = isEmpty ? `T00:00` : unparsedValue.substring( 10 ),
            unparsedValueNew: string = DateUtils.toString( adjustToMinMax(
                new Date( unparsedDateValue + stringAddRight )
            ), DATETIME_FORMAT ),
            parsedValue: main | null = await parseValue( unparsedValueNew ),
            old = documentData[ keyName ] as main | null
        ;
        if( validate ) if( !( await validate( parsedValue, unparsedValueNew, old ) ) ) return;
        setUnparsedValue( unparsedValueNew );
        documentData[ keyName ] = parsedValue;
        await handleDefault( parsedValue );
        if( onChange ) await onChange( parsedValue, unparsedValueNew, old );

    }

    async function handleDefault( parsedValue: main | null ): Promise< void > {
        
        if( !documentDefaultData || !documentId ) return;
        const
            { updateMap } = pageData,
            dateDefault = documentDefaultData[ keyName ] as Date | null,
            isDefault: boolean = ( dateDefault && parsedValue ) ? DateUtils.areSameByMinute(
                dateDefault, parsedValue
            ) : !parsedValue,
            hasUpdateRecord: boolean = ( documentId in updateMap )
        ;
        if( isDefault ) {

            if( hasUpdateRecord ) delete updateMap[ documentId ][ keyName ];
            if( !ObjectUtils.hasKeys( updateMap[ documentId ] ) ) delete updateMap[ documentId ];

        } else {

            if( !hasUpdateRecord ) updateMap[ documentId ] = {};
            updateMap[ documentId ][ keyName ] = true;

        }

    }

    async function handleHoursChange( event: ChangeEvent< HTMLSelectElement > ): Promise< void > {

        const
            parsedHoursValue: number = +unparsedValue.substring( 11, 13 ),
            isAm: boolean = parsedHoursValue < 12,
            parsedHoursValueNew: number = +event.target.value + ( isAm ? 0 : 12 ),
            unparsedHoursValue: string = parsedHoursValueNew.toString().padStart( 2, "0" ),
            isEmpty: boolean = ( unparsedValue === "" ),
            stringAddLeft: string =
                isEmpty ? `${ DateUtils.toString( new Date(), "yyyy-mm-dd" ) }T`
                : unparsedValue.substring( 0, 11 )
            ,
            stringAddRight: string = isEmpty ? `:00` : unparsedValue.substring( 13 ),
            unparsedValueNew: string = DateUtils.toString( adjustToMinMax(
                new Date( stringAddLeft + unparsedHoursValue + stringAddRight )
            ), DATETIME_FORMAT ),
            parsedValue: main | null = await parseValue( unparsedValueNew ),
            old = documentData[ keyName ] as main | null
        ;
        if( validate ) if( !( await validate( parsedValue, unparsedValueNew, old ) ) ) return;
        setUnparsedValue( unparsedValueNew );
        documentData[ keyName ] = parsedValue;
        await handleDefault( parsedValue );
        if( onChange ) await onChange( parsedValue, unparsedValueNew, old );

    }

    async function handleMeridiemChange( event: ChangeEvent< HTMLSelectElement > ): Promise< void > {

        let parsedHoursValue: number = +unparsedValue.substring( 11, 13 );
        const meridiemValue: meridiem = event.target.value as meridiem;
        if( parsedHoursValue >= 12 && meridiemValue === "am" )
            parsedHoursValue -= 12;
        else if( parsedHoursValue < 12 && meridiemValue === "pm" )
            parsedHoursValue += 12;
        const
            isEmpty: boolean = ( unparsedValue === "" ),
            stringAddLeft: string =
                isEmpty ? `${ DateUtils.toString( new Date(), "yyyy-mm-dd" ) }T`
                : unparsedValue.substring( 0, 11 )
            ,
            stringAddRight: string = isEmpty ? `:00` : unparsedValue.substring( 13 ),
            unparsedHoursValue: string = parsedHoursValue.toString().padStart( 2, "0" ),
            unparsedValueNew: string = DateUtils.toString( adjustToMinMax(
                new Date( stringAddLeft + unparsedHoursValue + stringAddRight )
            ), DATETIME_FORMAT ),
            parsedValue: main | null = await parseValue( unparsedValueNew ),
            old = documentData[ keyName ] as main | null
        ;
        if( validate ) if( !( await validate( parsedValue, unparsedValueNew, old ) ) ) return;
        setUnparsedValue( unparsedValueNew );
        documentData[ keyName ] = parsedValue;
        await handleDefault( parsedValue );
        if( onChange ) await onChange( parsedValue, unparsedValueNew, old );

    }

    async function handleMinutesChange( event: ChangeEvent< HTMLSelectElement > ): Promise< void > {

        const
            unparsedMinutesValue: string = event.target.value.padStart( 2, "0" ),
            isEmpty: boolean = ( unparsedValue === "" ),
            stringAddLeft: string =
                isEmpty ? `${ DateUtils.toString( new Date(), "yyyy-mm-dd" ) }T00:`
                : unparsedValue.substring( 0, 14 )
            ,
            unparsedValueNew: string = DateUtils.toString( adjustToMinMax(
                new Date( stringAddLeft + unparsedMinutesValue )
            ), DATETIME_FORMAT ),
            parsedValue: main | null = await parseValue( unparsedValueNew ),
            old = documentData[ keyName ] as main | null
        ;
        if( validate ) if( !( await validate( parsedValue, unparsedValueNew, old ) ) ) return;
        setUnparsedValue( unparsedValueNew );
        documentData[ keyName ] = parsedValue;
        await handleDefault( parsedValue );
        if( onChange ) await onChange( parsedValue, unparsedValueNew, old );

    }

    async function parseValue( unparsedValue: string ): Promise< main | null > {

        return unparsedValue ? new Date( unparsedValue ) : null;

    }

    async function unparseValue( parsedValue: main | null ): Promise< string > {
    
        return parsedValue ? DateUtils.toString( parsedValue, DATETIME_FORMAT ) : "";

    }

    useEffect( () => { ( async() => {

        if( !documentData ) return;
        if( documentData[ keyName ] === undefined )
            throw new Error( `Key name "${ keyName }" does not exist.` );
        const parsedValue: main = documentData[ keyName ] as main;
        setUnparsedValue( await unparseValue( parsedValue ) );

    } )() }, [ pageData ] );

    useEffect( () => { ( async() => {

        if( unparsedValue === "" ) return;
        const date: Date = new Date( unparsedValue );
        if( ( min && date < min ) || ( max && date > max ) ) await handleChange( date );

    } )() }, [ min, max ] );

    return <>
        <div className={ className }>
            <input
                id={ name }
                name={ name }
                placeholder={ placeholder }
                readOnly={ readOnly }
                required={ required }
                type="date"
                value={ ( unparsedValue === "" ) ? "" : unparsedValue.substring( 0, 10 ) }
                onChange={ event => handleDateChange( event ) }
            />
            <select
                required={ required }
                value={
                    ( unparsedValue === "" ) ? ""
                    : ( +unparsedValue.substring( 11, 13 ) % 12 ).toString()
                }
                onChange={ event => handleHoursChange( event ) }
            >
                <option value="" disabled>hh</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="0">12</option>
            </select>
            :
            <select
                required={ required }
                value={ ( unparsedValue === "" ) ? "" : unparsedValue.substring( 14 ) }
                onChange={ event => handleMinutesChange( event ) }
            >
                <option disabled>mm</option>
                <option value="0">00</option>
                <option value="30">30</option>
            </select>
            <select
                required={ required }
                value={
                    ( unparsedValue === "" ) ? ""
                    : ( +unparsedValue.substring( 11, 13 ) < 12 ? "am" : "pm" )
                }
                onChange={ event => handleMeridiemChange( event ) }
            >
                <option value="" disabled>-</option>
                <option value="am">a.m.</option>
                <option value="pm">p.m.</option>
            </select>
        </div>
    </>;

}
