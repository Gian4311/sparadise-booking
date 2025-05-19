import {
    ChangeEvent,
    useEffect,
    useRef,
    useState
} from "react";
import ObjectUtils from "../utils/ObjectUtils";
import {
    AccountData,
    SpaRadiseDocumentData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";

type main = string;

interface NewBookingEmailInputPageData extends SpaRadisePageData {

    customerInOrder?: AccountData

}

const EMAIL_REGEX = "/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/";

export default function NewBookingEmailInput(
    {
        className, name,
        pageData, placeholder, readOnly, required,
        onChange, validate
    }: {
        className?: string,
        name?: string,
        pageData: NewBookingEmailInputPageData,
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
            old = null
        ;
        if( validate ) if( !( await validate( parsedValue, unparsedValue, old ) ) ) return;
        setUnparsedValue( unparsedValue );
        if( pageData.customerInOrder && parsedValue )
            pageData.customerInOrder.email = parsedValue;
        await handleDefault( parsedValue );
        if( onChange ) await onChange( parsedValue, unparsedValue, old );
        if( ref.current ) {

            ref.current.selectionStart = selectionStart;
            ref.current.selectionEnd = selectionStart;

        }

    }

    async function handleDefault( parsedValue: main | null ): Promise< void > {

        // if( !documentDefaultData || !documentId ) return;
        // const
        //     { updateMap } = pageData,
        //     isDefault: boolean = ( documentDefaultData[ keyName ] === parsedValue ),
        //     hasUpdateRecord: boolean = ( documentId in updateMap )
        // ;
        // if( !isDefault ) {

        //     if( !hasUpdateRecord ) updateMap[ documentId ] = {};
        //     updateMap[ documentId ][ keyName ] = true;

        // } else if( hasUpdateRecord ) {

        //     delete updateMap[ documentId ][ keyName ];
        //     if( !ObjectUtils.hasKeys( updateMap[ documentId ] ) ) delete updateMap[ documentId ];

        // }

    }

    async function parseValue( unparsedValue: string ): Promise< main | null > {

        return unparsedValue ? unparsedValue : null;

    }

    async function unparseValue( parsedValue: main | null ): Promise< string > {

        return parsedValue ?? "";

    }

    useEffect( () => { ( async() => {

        if( !pageData.customerInOrder ) return;
        const parsedValue: main = pageData.customerInOrder.email as main;
        setUnparsedValue( await unparseValue( parsedValue ) );

    } )() }, [ pageData ] );

    return <input
        className={ className }
        id={ name }
        name={ name }
        pattern={ EMAIL_REGEX }
        placeholder={ placeholder }
        readOnly={ readOnly }
        ref={ ref }
        required={ required }
        type="text"
        value={ unparsedValue }
        onChange={ event => handleChange( event ) }
    />;

}
