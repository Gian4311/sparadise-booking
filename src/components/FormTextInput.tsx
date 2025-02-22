import FormStringInput from "./FormStringInput";
import {
    SpaRadiseDocumentData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";

type main = string;

export default function FormTextInput(
    {
        documentDefaultData, documentData, documentId, keyName, name, pageData, placeholder, readOnly,
        required,
        onChange, validate
    }: {
        defaultValue?: main,
        documentDefaultData?: SpaRadiseDocumentData,
        documentData: SpaRadiseDocumentData,
        documentId?: string,
        keyName: string,
        maxLength?: number,
        name?: string,
        pageData: SpaRadisePageData,
        placeholder?: string,
        readOnly?: boolean,
        required?: boolean,
        onChange?( parsedValue: main | null, unparsedValue: string, old: main | null ): Promise< void > | void,
        validate?( parsedValue: main | null ): Promise< boolean >
    }
): JSX.Element {

    return <FormStringInput
        documentData={ documentData }
        documentDefaultData={ documentDefaultData }
        documentId={ documentId }
        keyName={ keyName }
        maxLength={ 2**16 - 1 }
        name={ name }
        pageData={ pageData }
        placeholder={ placeholder }
        readOnly={ readOnly }
        required={ required }
        onChange={ onChange }
        validate={ validate }
    />;

}
