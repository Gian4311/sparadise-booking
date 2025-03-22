import FormStringInput from "./FormStringInput";
import {
    SpaRadiseDocumentData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";

type main = string;

const CONTACT_NUMBER_REGEX =
    `(^09[0-9]{9}$)`
    + `|(^09[0-9]{2} [0-9]{3} [0-9]{4}$)`
    + `|(^09[0-9]{2}-[0-9]{3}-[0-9]{4}$)`
    + `|(^[+]639[0-9]{9}$)`
    + `|(^[+]639[0-9]{2} [0-9]{3} [0-9]{4}$)`
    + `|(^[+]639[0-9]{2}-[0-9]{3}-[0-9]{4}$)`
;

export default function FormContactNumberInput(
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
        name?: string,
        pageData: SpaRadisePageData,
        placeholder?: string,
        readOnly?: boolean,
        required?: boolean,
        onChange?( parsedValue: main | null, unparsedValue: string, old: main | null ): Promise< void > | void,
        validate?( parsedValue: main | null, unparsedValue: string, old: main | null ): Promise< boolean >
    }
): JSX.Element {

    return <FormStringInput
        documentData={ documentData }
        documentDefaultData={ documentDefaultData }
        documentId={ documentId }
        keyName={ keyName }
        name={ name }
        pageData={ pageData }
        pattern={ CONTACT_NUMBER_REGEX }
        placeholder={ placeholder }
        readOnly={ readOnly }
        required={ required }
        onChange={ onChange }
        validate={ validate }
    />;

}
