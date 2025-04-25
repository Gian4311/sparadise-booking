import {
    ChangeEvent,
    useEffect,
    useRef,
    useState
} from "react";
import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";

type main = string;

export default function FormVoucherInput(
    {
        className, defaultValue, error, maxLength, name,
        pageData, pattern, placeholder, readOnly, required,
        onChange, preprocess, validate
    }: {
        className?: string,
        defaultValue?: string,
        error?: string,
        maxLength?: number,
        name?: string,
        pageData: SpaRadisePageData,
        pattern?: string,
        placeholder?: string,
        readOnly?: boolean,
        required?: boolean,
        preprocess?( unparsedValue: string ): Promise< string > | string,
        onChange?( parsedValue: main | null, unparsedValue: string, old: main | null ): Promise< void > | void,
        validate?( parsedValue: main | null, unparsedValue: string, old: main | null ): boolean | Promise< boolean >
    }
): JSX.Element {

    const
        [ parsedValue, setParsedValue ] = useState< main | null >( null ),
        [ unparsedValue, setUnparsedValue ] = useState< string >( "" ),
        ref = useRef< HTMLInputElement >( null )
    ;

    async function handleChange( event: ChangeEvent< HTMLInputElement > ): Promise< void > {

        let { selectionStart, value: unparsedValue } = event.target;
        if( preprocess ) unparsedValue = await preprocess( unparsedValue );
        const
            parsedValueNew: main | null = await parseValue( unparsedValue ),
            old = parsedValue
        ;
        if( validate ) if( !( await validate( parsedValueNew, unparsedValue, old ) ) ) return;
        setUnparsedValue( unparsedValue );
        setParsedValue( parsedValueNew );
        if( onChange ) await onChange( parsedValueNew, unparsedValue, old );
        if( ref.current ) {

            ref.current.selectionStart = selectionStart;
            ref.current.selectionEnd = selectionStart;

        }

    }

    async function parseValue( unparsedValue: string ): Promise< main | null > {

        return unparsedValue ? unparsedValue : null;

    }

    async function unparseValue( parsedValue: main | null ): Promise< string > {

        return parsedValue ?? "";

    }

    useEffect( () => { ( async() => {

        if( defaultValue ) {

            const parsedValue: main | null = await parseValue( defaultValue ? defaultValue : "" );
            setUnparsedValue( await unparseValue( parsedValue ) );

        }

    } )() }, [ pageData ] );

    return <div>
        <input
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
        />
        {
            error ? <p>{ error }</p> : <></>
        }
    </div>;

}
