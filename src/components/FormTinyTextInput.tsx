import {
    ChangeEvent,
    useEffect,
    useState
} from "react";
import FormStringInput from "./FormStringInput";

type main = string;

export default function FormTinyTextInput(
    {
        keyName, name, object, onChange, placeholder, readOnly, reloader, required, validate
    }: {
        keyName: string | number,
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

    return <FormStringInput
        keyName={ keyName }
        maxLength={ 2**8 - 1 }
        name={ name }
        object={ object }
        placeholder={ placeholder }
        readOnly={ readOnly }
        reloader={ reloader }
        required={ required }
        onChange={ onChange }
        validate={ validate }
    />;

}
