import {
    ChangeEvent,
    useEffect,
    useState
} from "react";
import ObjectUtils from "../utils/ObjectUtils";
import {
    SpaRadiseDocumentData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";

type main = number;

export default function FormNumberInput(
    {
        documentData, documentDefaultData, documentId, keyName, max, min,
        name = keyName.toString(),
        pageData, placeholder, readOnly, required, step,
        onChange, validate
    }: {
        documentData: SpaRadiseDocumentData,
        documentDefaultData?: SpaRadiseDocumentData,
        documentId?: string,
        keyName: string,
        max?: number,
        min?: number,
        name?: string,
        pageData: SpaRadisePageData,
        placeholder?: string,
        readOnly?: boolean,
        required?: boolean,
        step?: number,
        onChange?( parsedValue: main | null, unparsedValue: string, old: main | null ): Promise< void > | void,
        validate?( parsedValue: main | null, unparsedValue: string, old: main | null ): Promise< boolean >
    }
): JSX.Element {

    const [ unparsedValue, setUnparsedValue ] = useState< string >( "" );

    async function handleChange( event: ChangeEvent< HTMLInputElement > ): Promise< void > {

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

        return ( unparsedValue !== undefined ) ? +unparsedValue : null;

    }

    async function unparseValue( parsedValue: main | null ): Promise< string > {

        return parsedValue?.toString() ?? "";

    }

    useEffect( () => { ( async() => {

        if( !documentData ) return;
        if( documentData[ keyName ] === undefined )
            throw new Error( `Key name "${ keyName }" does not exist.` );
        const parsedValue: main = documentData[ keyName ] as main;
        setUnparsedValue( await unparseValue( parsedValue ) );

    } )() }, [ pageData ] );

    return <input
        id={ name }
        max={ max }
        min={ min }
        name={ name }
        placeholder={ placeholder }
        readOnly={ readOnly }
        required={ required }
        type="number"
        step={ step }
        value={ unparsedValue }
        onChange={ event => handleChange( event ) }
    />;

}
