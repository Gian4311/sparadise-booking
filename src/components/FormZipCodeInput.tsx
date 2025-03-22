import FormStringInput from "./FormStringInput";
import {
    SpaRadiseDocumentData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";

type main = string;

const ZIP_CODE_REGEX = `^[0-9]{4}$`;

export default function FormZipCodeInput(
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
        pattern={ ZIP_CODE_REGEX }
        placeholder={ placeholder }
        readOnly={ readOnly }
        required={ required }
        onChange={ onChange }
        validate={ validate }
    />;

}
