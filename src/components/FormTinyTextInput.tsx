import FormStringInput from "./FormStringInput";
import {
    SpaRadiseDocumentData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";

type main = string;

export default function FormTinyTextInput(
    {
        className, documentDefaultData, documentData, documentId, keyName, name, pageData, pattern,
        placeholder, readOnly, required,
        onChange, validate
    }: {
        className?: string,
        defaultValue?: main,
        documentDefaultData?: SpaRadiseDocumentData,
        documentData: SpaRadiseDocumentData,
        documentId?: string,
        keyName: string,
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

    return <FormStringInput
        className={ className }
        documentData={ documentData }
        documentDefaultData={ documentDefaultData }
        documentId={ documentId }
        keyName={ keyName }
        maxLength={ 2**8 - 1 }
        name={ name }
        pageData={ pageData }
        pattern={ pattern }
        placeholder={ placeholder }
        readOnly={ readOnly }
        required={ required }
        onChange={ onChange }
        validate={ validate }
    />;

}
