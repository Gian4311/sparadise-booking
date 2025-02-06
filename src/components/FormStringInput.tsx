import {
    ChangeEvent,
    useEffect,
    useState
} from "react";

type main = string;

export default function FormStringInput(
    {
        keyName, maxLength, name, object, onChange, placeholder, readOnly, reloader, required, validate
    }: {
        keyName: string | number,
        maxLength?: number,
        name?: string,
        object: any,
        placeholder?: string,
        readOnly?: boolean,
        reloader: any,
        required?: boolean,
        onChange?( parsedValue: main | null, unparsedValue: string ): Promise< void > | void,
        validate?( parsedValue: main | null ): Promise< boolean >
    }
): JSX.Element {

    const [ unparsedValue, setUnparsedValue ] = useState< string >( "" );

    async function handleChange( event: ChangeEvent< HTMLInputElement > ): Promise< void > {

        const
            unparsedValue: string = event.target.value,
            parsedValue: main | null = await parseValue( unparsedValue )
        ;
        if( validate ) if( !( await validate( parsedValue ) ) ) return;
        setUnparsedValue( unparsedValue );
        object[ keyName ] = parsedValue;
        if( onChange ) await onChange( parsedValue, unparsedValue );

    }

    async function parseValue( unparsedValue: string ): Promise< main | null > {

        return unparsedValue ? unparsedValue : null;

    }

    async function unparseValue( parsedValue: main | null ): Promise< string > {

        return parsedValue ?? "";

    }

    useEffect( () => { ( async() => {

        if( !object ) return;
        const parsedValue: main = object[ keyName ] as main;
        setUnparsedValue( await unparseValue( parsedValue ) );

    } )() }, [ reloader ] );

    return <input
        id={ name }
        maxLength={ maxLength }
        name={ name }
        placeholder={ placeholder }
        readOnly={ readOnly }
        required={ required }
        value={ unparsedValue }
        onChange={ event => handleChange( event ) }
    />;

}
