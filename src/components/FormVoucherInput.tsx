import {
    ChangeEvent,
    useEffect,
    useState
} from "react";
import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";

type main = string;

export default function FormVoucherInput(
    {
        className, defaultValue, keyName, maxLength, name = keyName.toString(),
        pageData, pattern, placeholder, readOnly, required,
        onChange, validate
    }: {
        className?: string,
        defaultValue?: string,
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
        [ parsedValue, setParsedValue ] = useState< main | null >( null ),
        [ unparsedValue, setUnparsedValue ] = useState< string >( "" )
    ;

    async function handleChange( event: ChangeEvent< HTMLInputElement > ): Promise< void > {

        const
            unparsedValue: string = event.target.value,
            parsedValueNew: main | null = await parseValue( unparsedValue ),
            old = parsedValue
        ;
        if( validate ) if( !( await validate( parsedValueNew, unparsedValue, old ) ) ) return;
        setUnparsedValue( unparsedValue );
        setParsedValue( parsedValueNew );
        if( onChange ) await onChange( parsedValueNew, unparsedValue, old );

    }

    async function parseValue( unparsedValue: string ): Promise< main | null > {

        return unparsedValue ? unparsedValue : null;

    }

    async function unparseValue( parsedValue: main | null ): Promise< string > {

        return parsedValue ?? "";

    }

    useEffect( () => { ( async() => {

        const parsedValue: main | null = await parseValue( defaultValue ? defaultValue : "" );
        setUnparsedValue( await unparseValue( parsedValue ) );

    } )() }, [ pageData ] );

    return <input
        className={ className }
        id={ name }
        maxLength={ maxLength }
        name={ name }
        pattern={ pattern }
        placeholder={ placeholder }
        readOnly={ readOnly }
        required={ required }
        type="text"
        value={ unparsedValue }
        onChange={ event => handleChange( event ) }
    />;

}
