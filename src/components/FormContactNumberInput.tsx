import FormStringInput from "./FormStringInput";
import {
    SpaRadiseDocumentData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";

type main = string;

export default function FormContactNumberInput(
    {
        className, documentDefaultData, documentData, documentId, keyName, name, pageData, placeholder,
        readOnly, required,
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
        placeholder?: string,
        readOnly?: boolean,
        required?: boolean,
        onChange?( parsedValue: main | null, unparsedValue: string, old: main | null ): Promise< void > | void,
        validate?( parsedValue: main | null, unparsedValue: string, old: main | null ): Promise< boolean >
    }
): JSX.Element {

    return <FormStringInput
        className={ className }
        documentData={ documentData }
        documentDefaultData={ documentDefaultData }
        documentId={ documentId }
        keyName={ keyName }
        name={ name }
        pageData={ pageData }
        pattern={ SpaRadiseEnv.CONTACT_NUMBER_REGEX }
        placeholder={ placeholder }
        readOnly={ readOnly }
        required={ required }
        onChange={ onChange }
        validate={ validate }
    />;

}
