import FormNumberInput from "./FormNumberInput";
import {
    SpaRadiseDocumentData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";

type main = number;

export default function FormMoneyInput(
    {
        className, documentData, documentDefaultData, documentId, keyName, max, min = 0,
        name = keyName.toString(),
        pageData, placeholder, readOnly, required, step = 0.01,
        onChange, validate
    }: {
        className?: string,
        documentData: SpaRadiseDocumentData,
        documentDefaultData?: SpaRadiseDocumentData,
        documentId?: string,
        keyName: string,
        max?: number,
        min?: number,
        name?: string,
        pageData: SpaRadisePageData,
        placeholder?: string,
        readOnly?: boolean,
        required?: boolean,
        step?: number,
        onChange?( parsedValue: main | null, unparsedValue: string, old: main | null ): Promise< void > | void,
        validate?( parsedValue: main | null, unparsedValue: string, old: main | null ): boolean | Promise< boolean >
    }
): JSX.Element {

    if( min === undefined || min < 0 )
        throw new Error( `Money input minimum must be more than or equals to 0.` );
    if( step === undefined || ( step % 0.01 ) > 0 )
        throw new Error( `Money input step must more than 0.01.` );

    return <FormNumberInput
        className={ className }
        documentData={ documentData }
        documentDefaultData={ documentDefaultData }
        documentId={ documentId }
        keyName={ keyName }
        max={ max }
        min={ min }
        name={ name }
        pageData={ pageData }
        placeholder={ placeholder }
        readOnly={ readOnly }
        required={ required }
        step={ step }
        onChange={ onChange }
        validate={ validate }
    />;

}
