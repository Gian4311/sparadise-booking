import {
    ChangeEvent,
    useEffect,
    useRef,
    useState
} from "react";
import ObjectUtils from "../utils/ObjectUtils";
import {
    SpaRadiseDocumentData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";

type main = string;

export default function FormStringInput(
    {
        className, documentData, documentDefaultData, documentId, keyName, maxLength,
        name = keyName.toString(),
        pageData, pattern, placeholder, readOnly, required,
        onChange, validate
    }: {
        className?: string,
        documentData: SpaRadiseDocumentData,
        documentDefaultData?: SpaRadiseDocumentData,
        documentId?: string,
        keyName: string,
        maxLength?: number,
        name?: string,
        pageData: SpaRadisePageData,
        pattern?: string,
        placeholder?: string,
        readOnly?: boolean,
        required?: boolean,
        onChange?( parsedValue: main | null, unparsedValue: string, old: main | null ): Promise< void > | void,
        validate?( parsedValue: main | null, unparsedValue: string, old: main | null ): boolean | Promise< boolean >
    }
): JSX.Element {

    const
        [ unparsedValue, setUnparsedValue ] = useState< string >( "" ),
        ref = useRef< HTMLInputElement >( null )
    ;

    async function handleChange( event: ChangeEvent< HTMLInputElement > ): Promise< void > {

        const
            { selectionStart, value: unparsedValue } = event.target,
            parsedValue: main | null = await parseValue( unparsedValue ),
            old = documentData[ keyName ] as main | null
        ;
        if( validate ) if( !( await validate( parsedValue, unparsedValue, old ) ) ) return;
        setUnparsedValue( unparsedValue );
        documentData[ keyName ] = parsedValue;
        await handleDefault( parsedValue );
        if( onChange ) await onChange( parsedValue, unparsedValue, old );
        if( ref.current ) {

            ref.current.selectionStart = selectionStart;
            ref.current.selectionEnd = selectionStart;

        }

    }

    async function handleDefault( parsedValue: main | null ): Promise< void > {

        if( !documentDefaultData || !documentId ) return;
        const
            { updateMap } = pageData,
            isDefault: boolean = ( documentDefaultData[ keyName ] === parsedValue ),
            hasUpdateRecord: boolean = ( documentId in updateMap )
        ;
        if( !isDefault ) {

            if( !hasUpdateRecord ) updateMap[ documentId ] = {};
            updateMap[ documentId ][ keyName ] = true;

        } else if( hasUpdateRecord ) {

            delete updateMap[ documentId ][ keyName ];
            if( !ObjectUtils.hasKeys( updateMap[ documentId ] ) ) delete updateMap[ documentId ];

        }

    }

    async function parseValue( unparsedValue: string ): Promise< main | null > {

        return unparsedValue ? unparsedValue : null;

    }

    async function unparseValue( parsedValue: main | null ): Promise< string > {

        return parsedValue ?? "";

    }

    useEffect( () => { ( async() => {

        if( !documentData ) return;
        if( documentData[ keyName ] === undefined )
            throw new Error( `Key name "${ keyName }" does not exist.` );
        if( documentData[ keyName ] ) {

            const parsedValue: main = documentData[ keyName ] as main;
            setUnparsedValue( await unparseValue( parsedValue ) );

        }

    } )() }, [ pageData ] );

    return <input
        className={ className }
        id={ name }
        maxLength={ maxLength }
        name={ name }
        pattern={ pattern }
        placeholder={ placeholder }
        readOnly={ readOnly }
        ref={ ref }
        required={ required }
        type="text"
        value={ unparsedValue }
        onChange={ event => handleChange( event ) }
    />;

}
