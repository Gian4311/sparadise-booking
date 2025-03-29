import {
    ChangeEvent,
    useEffect,
    useState
} from "react";
import DateUtils from "../utils/DateUtils";
import { DocumentReference } from "firebase/firestore/lite";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import {
    SpaRadiseDocumentData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import StringUtils from "../utils/StringUtils";

interface NameMap {

    [ documentId: documentId ]: string

}

type main = DocumentReference | boolean | Date | number | null;

export default function FormEntitySelect< T extends SpaRadiseDocumentData >(
    {
        children, className, collectionName, documentData, documentDefaultData, documentId,
        keyName, name = keyName.toString(), pageData, optionDataMap, readOnly, required,
        getDocumentName, onChange, validate
    }: {
        children?: JSX.Element | JSX.Element[],
        className?: string,
        collectionName: string,
        documentData: SpaRadiseDocumentData,
        documentDefaultData?: SpaRadiseDocumentData,
        documentId?: string,
        keyName: string,
        name?: string,
        optionDataMap: { [ documentId: documentId ]: T },
        pageData: SpaRadisePageData,
        readOnly?: boolean,
        required?: boolean,
        getDocumentName: ( document: T ) => Promise< string > | string,
        onChange?( parsedValue: main | null, unparsedValue: string, old: main | null ): Promise< void > | void,
        validate?( parsedValue: main | null, unparsedValue: string, old: main | null ): boolean | Promise< boolean >
    }
): JSX.Element {

    const
        [ unparsedValue, setUnparsedValue ] = useState< string >( "" ),
        [ nameMap, setNameMap ] = useState< NameMap >( {} )
    ;

    async function handleChange( event: ChangeEvent< HTMLSelectElement > ): Promise< void > {

        if( readOnly ) return;
        const
            unparsedValue: string = event.target.value,
            parsedValue: main | null = await parseValue( unparsedValue ),
            old = documentData[ keyName ] as main | null
        ;
        if( !( unparsedValue in optionDataMap ) )
            throw new Error( `"${ unparsedValue.toString() }" value is not in option list.` );
        if( validate ) if( !( await validate( parsedValue, unparsedValue, old ) ) ) return;
        setUnparsedValue( unparsedValue );
        documentData[ keyName ] = parsedValue;
        await handleDefault( parsedValue );
        if( onChange ) await onChange( parsedValue, unparsedValue, old );

    }

    async function handleDefault( parsedValue: main | null ): Promise< void > {
            
        if( !documentDefaultData || !documentId ) return;
        const
            { updateMap } = pageData,
            isDefault: boolean = ( documentDefaultData[ keyName ] === parsedValue ),
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

        const
            { DATE_TIME_REGEX } = SpaRadiseEnv,
            isTrue: boolean = ( unparsedValue === "true" ),
            isFalse: boolean = ( unparsedValue === "false" ),
            isNull: boolean = ( unparsedValue === "null" ),
            date: Date = new Date( unparsedValue ),
            isDateTime: boolean = Boolean(
                unparsedValue.match( DATE_TIME_REGEX )
                && NumberUtils.isNumeric( date )
            ),
            isNumber: boolean = NumberUtils.isNumeric( unparsedValue ),
            isEmpty: boolean = ( unparsedValue.length === 0 )
        ;
        return (
            isTrue ? true
            : isFalse ? false
            : isNull ? null
            : isDateTime ? date
            : isNumber ? +unparsedValue
            : isEmpty ? null
            : SpaRadiseFirestore.getDocumentReference( unparsedValue, collectionName )
        );

    }

    async function unparseValue( parsedValue: main | null ): Promise< string > {

        return (
            ( parsedValue instanceof DocumentReference ) ? parsedValue.id
            : ( parsedValue instanceof Date ) ? DateUtils.toString( parsedValue, "yyyy-mm-ddThh:mm" )
            : ( parsedValue?.toString() ?? "" )
        );

    }

    useEffect( () => { ( async() => {

        if( !documentData ) return;
        if( documentData[ keyName ] === undefined )
            throw new Error( `Key name "${ keyName }" does not exist.` );
        const newNameMap: NameMap = {};
        for( let documentId in optionDataMap ) newNameMap[ documentId ] = await getDocumentName(
            optionDataMap[ documentId ]
        );
        setNameMap( newNameMap );
        const parsedValue: main = documentData[ keyName ] as main;
        setUnparsedValue( await unparseValue( parsedValue ) );

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
            Object.keys( nameMap ).sort( ( documentId1, documentId2 ) =>
                StringUtils.compare( nameMap[ documentId1 ], nameMap[ documentId2 ] )
            ).map( documentId => <option key={ documentId } value={ documentId }>{
                nameMap[ documentId ]
            }</option> )
        }
    </select>;

}
