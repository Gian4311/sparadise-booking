import {
    ChangeEvent,
    CSSProperties,
    MouseEvent,
    useEffect,
    useState
} from "react";
import DateUtils from "../utils/DateUtils";
import ObjectUtils from "../utils/ObjectUtils";
import {
    SpaRadiseDocumentData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";

import "../styles/FormTimeInput.scss";

type main = Date;

const DATETIME_FORMAT = "yyyy-mm-ddThh:mm";

export default function FormTimeInput(
    {
        className, date, documentData, documentDefaultData, documentId, keyName, max, min,
        name = keyName.toString(),
        pageData, readOnly, required,
        onChange, validate
    }: {
        className?: string,
        date: Date,
        documentData: SpaRadiseDocumentData,
        documentDefaultData?: SpaRadiseDocumentData,
        documentId?: string,
        keyName: string,
        max?: Date,
        min?: Date,
        name?: string,
        pageData: SpaRadisePageData,
        readOnly?: boolean,
        required?: boolean,
        onChange?( parsedValue: main | null, unparsedValue: string, old: main | null ): Promise< void > | void,
        validate?( parsedValue: main | null, unparsedValue: string, old: main | null ): boolean | Promise< boolean >
    }
): JSX.Element {

    const [ unparsedValue, setUnparsedValue ] = useState< string >( "" );

    async function handleChange( event: ChangeEvent< HTMLInputElement > ): Promise< void > {

        if( readOnly ) return;
        const
            unparsedValue: string = event.target.value,
            parsedValue: main | null = await parseValue( unparsedValue ),
            old = documentData[ keyName ] as main | null
        ;
        if( validate ) if( !( await validate( parsedValue, unparsedValue, old ) ) ) return;
        setUnparsedValue( unparsedValue );
        documentData[ keyName ] = parsedValue;
        await handleDefault( parsedValue );
        if( onChange ) await onChange( parsedValue, unparsedValue, old );

    }

    async function handleClick( event: MouseEvent< HTMLInputElement > ): Promise< void > {

        const { hr, min } = DateUtils.toTimeData( new Date() );
        if( !hr || !min ) return;
        await handleChange( {
            target: { value: `${ hr }:${ min }` }
        } as ChangeEvent< HTMLInputElement > );

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

    async function parseValue( unparsedValue: string ): Promise< main | null > {

        if( !unparsedValue ) return null;
        const
            [ hr, min ] = unparsedValue.split( ":" ).map( value => +value ),
            newDate: Date = DateUtils.setTime( date, { hr, min } )
        ;
        return newDate;

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

    return <input
        className={ `actual-datetime-input ${ className }` }
        id={ name }
        max={ max ? DateUtils.toString( max, DATETIME_FORMAT ) : undefined }
        min={ min ? DateUtils.toString( min, DATETIME_FORMAT ) : undefined }
        name={ name }
        readOnly={ readOnly }
        required={ required }
        type="time"
        value={ unparsedValue }
        onChange={ event => handleChange( event ) }
        onClick={ event => handleClick( event ) }
    />;

}
