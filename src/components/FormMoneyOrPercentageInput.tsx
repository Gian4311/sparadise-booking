import FormMoneyInput from "./FormMoneyInput";
import {
    ChangeEvent,
    useEffect,
    useState
} from "react";
import FormPercentageInput from "./FormPercentageInput";
import ObjectUtils from "../utils/ObjectUtils";
import {
    SpaRadiseDocumentData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";

type main = number;
type mode = "money" | "percentage";

export default function FormMoneyOrPercentageInput(
    {
        className, documentData, documentDefaultData, documentId, name,
        pageData, readOnly, required,

        keyNameMoney, maxMoney, minMoney = 0, placeholderMoney, stepMoney = 0.01,
        keyNamePercentage, maxPercentage = 100, minPercentage = 0, placeholderPercentage, stepPercentage = 0.01,

        onChange, validate
    }: {
        className?: string,
        documentData: SpaRadiseDocumentData,
        documentDefaultData?: SpaRadiseDocumentData,
        documentId?: string,
        name: string,
        pageData: SpaRadisePageData,
        readOnly?: boolean,
        required?: boolean,

        keyNameMoney: string,
        maxMoney?: number,
        minMoney?: number,
        placeholderMoney?: string,
        stepMoney?: number,

        keyNamePercentage: string,
        maxPercentage?: number,
        minPercentage?: number,
        placeholderPercentage?: string,
        stepPercentage?: number,
        
        onChange?( parsedValue: main | null, unparsedValue: string, old: main | null, mode: mode ): Promise< void > | void,
        validate?( parsedValue: main | null, unparsedValue: string, old: main | null, mode: mode ): Promise< boolean >
    }
): JSX.Element {

    if( minMoney === undefined || minMoney < 0 )
        throw new Error( `Money input minimum must be more than or equals to 0.` );
    if( stepMoney === undefined || ( stepMoney % 0.01 ) > 0 )
        throw new Error( `Money input step must more than 0.01.` );
    if( minPercentage === undefined || minPercentage < 0 )
        throw new Error( `Percentage input minimum must be more than or equals to 0.` );
    if( maxPercentage === undefined || maxPercentage > 100 )
        throw new Error( `Percentage input maximum must be less than or equals to 100.` );
    if( stepPercentage === undefined || ( stepPercentage % 0.01 ) > 0 )
        throw new Error( `Percentage input step must more than 0.01.` );
    
    const [ mode, setMode ] = useState< mode >( "money" );

    async function handleChangeValue(
        parsedValue: main | null, unparsedValue: string, old: main | null
    ): Promise< void > {
        
        if( onChange ) await onChange( parsedValue, unparsedValue, old, mode );

    }

    function handleChangeMode( event: ChangeEvent< HTMLSelectElement > ): void {

        event.preventDefault();
        const
            { updateMap } = pageData,
            newMode = event.target.value as mode
        ;
        switch( newMode ) {

            case "money":
                documentData[ keyNameMoney ] = documentDefaultData?.[ keyNameMoney ] ?? null;
                documentData[ keyNamePercentage ] = null;
                if( documentId && updateMap[ documentId ] )
                    delete updateMap[ documentId ][ keyNamePercentage ];
                break;
            
            case "percentage":
                documentData[ keyNameMoney ] = null;
                documentData[ keyNamePercentage ] = documentDefaultData?.[ keyNamePercentage ] ?? null;
                if( documentId && updateMap[ documentId ] )
                    delete updateMap[ documentId ][ keyNameMoney ];

        }
        if( documentId && updateMap[ documentId ] && !ObjectUtils.hasKeys( updateMap[ documentId ] ) )
            delete updateMap[ documentId ];
        setMode( newMode );

    }

    async function handleValidate(
        parsedValue: main | null, unparsedValue: string, old: main | null
    ): Promise< boolean > {
    
        return validate ? await validate( parsedValue, unparsedValue, old, mode ) : true;

    }

    useEffect( () => { ( async() => {
    
        if( !documentData ) return;
        if( documentData[ keyNameMoney ] === undefined )
            throw new Error( `Key name "${ keyNameMoney }" does not exist.` );
        if( documentData[ keyNamePercentage ] === undefined )
            throw new Error( `Key name "${ keyNamePercentage }" does not exist.` );
        const defaultMode: mode = ( documentData[ keyNameMoney ] !== null ) ? "money" : "percentage";
        setMode( defaultMode );

    } )() }, [ pageData ] );

    return <>
        <select value={ mode } onChange={ event => handleChangeMode( event ) }>
            <option value="money">₱</option>
            <option value="percentage">%</option>
        </select>
        {
            ( mode === "money" ) ? <>
                <FormMoneyInput
                    className={ className }
                    documentData={ documentData }
                    documentDefaultData={ documentDefaultData }
                    documentId={ documentId }
                    keyName={ keyNameMoney }
                    max={ maxMoney }
                    min={ minMoney }
                    name={ name }
                    pageData={ pageData }
                    placeholder={ placeholderMoney }
                    readOnly={ readOnly }
                    required={ required }
                    step={ stepMoney }
                    onChange={ handleChangeValue }
                    validate={ handleValidate }
                />
            </> : <>
                <FormPercentageInput
                    className={ className }
                    documentData={ documentData }
                    documentDefaultData={ documentDefaultData }
                    documentId={ documentId }
                    keyName={ keyNamePercentage }
                    max={ maxPercentage }
                    min={ minPercentage }
                    name={ name }
                    pageData={ pageData }
                    placeholder={ placeholderPercentage }
                    readOnly={ readOnly }
                    required={ required }
                    step={ stepPercentage }
                    onChange={ handleChangeValue }
                    validate={ handleValidate }
                />
            </>
        }
    </>;

}
