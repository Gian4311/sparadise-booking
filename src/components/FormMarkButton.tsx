import ObjectUtils from "../utils/ObjectUtils";
import {
    SpaRadiseDocumentData,
    SpaRadisePageData,
    SpaRadisePopupData
} from "../firebase/SpaRadiseTypes";
import { useEffect } from "react";

type main = string | boolean | number | null;

export default function FormMarkButton< T extends main >(
    {
        children, className, confirmMessage, documentData, documentDefaultData, documentId, keyName,
        name = keyName.toString(), noText = "Cancel", pageData, value, yesText = "Yes",
        no, reloadPageData, validate, yes
    }: {
        children: JSX.Element | JSX.Element[] | string,
        className?: string,
        confirmMessage: string,
        documentData: SpaRadiseDocumentData,
        documentDefaultData?: SpaRadiseDocumentData,
        documentId?: string,
        keyName: string,
        name?: string,
        noText?: string,
        pageData: SpaRadisePageData,
        value: T,
        yesText?: string,
        no?( parsedValue: main | null, unparsedValue: string, old: main | null ): void | Promise< void >,
        reloadPageData: () => void,
        validate?( parsedValue: main | null, unparsedValue: string, old: main | null ): boolean | Promise< boolean >,
        yes?( parsedValue: main | null, unparsedValue: string, old: main | null ): void | Promise< void >
    }
): JSX.Element {

    async function handleClick(): Promise< void > {

        const popupData: SpaRadisePopupData = {
            children: confirmMessage,
            noText, yesText,
            yes: handleYes,
            no: handleNo
        }
        pageData.popupData = popupData;
        reloadPageData();

    }

    async function handleDefault( parsedValue: main | null ): Promise< void > {
            
        if( !documentDefaultData || !documentId ) return;
        const
            { updateMap } = pageData,
            isDefault: boolean = ( documentDefaultData[ keyName ] === parsedValue ),
            hasUpdateRecord: boolean = ( documentId in updateMap )
        ;
        if( !isDefault ) {

            if( !hasUpdateRecord ) updateMap[ documentId ] = {};
            updateMap[ documentId ][ keyName ] = true;

        } else if( hasUpdateRecord ) {

            delete updateMap[ documentId ][ keyName ];
            if( !ObjectUtils.hasKeys( updateMap[ documentId ] ) ) delete updateMap[ documentId ];

        }

    }

    async function handleNo(): Promise< void > {

        const
            unparsedValue: string = await unparseValue( value ),
            parsedValue: main | null = await parseValue( unparsedValue ),
            old = documentData[ keyName ] as main | null
        ;
        if( no ) await no( parsedValue, unparsedValue, old );

    }

    async function handleYes(): Promise< void > {

        const
            unparsedValue: string = await unparseValue( value ),
            parsedValue: main | null = await parseValue( unparsedValue ),
            old = documentData[ keyName ] as main | null
        ;
        if( validate ) if( !( await validate( parsedValue, unparsedValue, old ) ) ) return;
        documentData[ keyName ] = parsedValue;
        await handleDefault( parsedValue );
        if( yes ) await yes( parsedValue, unparsedValue, old );

    }

    async function parseValue( unparsedValue: string ): Promise< main | null > {

        const
            isTrue: boolean = ( unparsedValue === "true" ),
            isFalse: boolean = ( unparsedValue === "false" ),
            isNull: boolean = ( unparsedValue === "null" ),
            isNumber: boolean = !isNaN( +unparsedValue ),
            isEmpty: boolean = ( unparsedValue.length === 0 )
        ;
        return (
            isTrue ? true
            : isFalse ? false
            : isNull ? null
            : isNumber ? +unparsedValue
            : isEmpty ? null
            : unparsedValue
        );

    }

    async function unparseValue( parsedValue: main | null ): Promise< string > {

        return parsedValue?.toString() ?? "";

    }

    useEffect( () => { ( async() => {
    
        if( !documentData ) return;
        if( documentData[ keyName ] === undefined )
            throw new Error( `Key name "${ keyName }" does not exist.` );

    } )() }, [ pageData ] );

    return <button
        className={ className }
        id={ name }
        name={ name }
        type="button"
        onClick={ handleClick }
    >{ children }</button>;

}
