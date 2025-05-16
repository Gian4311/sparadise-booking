import {
    ChangeEvent,
    useEffect,
    useState
} from "react";
import DateUtils from "../utils/DateUtils";
import { DocumentReference } from "firebase/firestore/lite";
import {
    EmployeeDataMap,
    SpaRadiseDocumentData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import PersonUtils from "../utils/PersonUtils";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";

type main = boolean | DocumentReference | Date | number | null;

export default function FormEmployeeSelect(
    {
        children, className, documentData, documentDefaultData, documentId, employeeDataMap, keyName,
        name = keyName.toString(),
        pageData, readOnly, required,
        onChange, validate
    }: {
        children?: JSX.Element | JSX.Element[],
        className?: string,
        documentData: SpaRadiseDocumentData,
        documentDefaultData?: SpaRadiseDocumentData,
        documentId?: string,
        employeeDataMap: EmployeeDataMap,
        keyName: string,
        name?: string,
        pageData: SpaRadisePageData,
        readOnly?: boolean,
        required?: boolean,
        onChange?(
            parsedValue: main | null, unparsedValue: string, old: main | null
        ): Promise< void > | void,
        validate?(
            parsedValue: main | null, unparsedValue: string, old: main | null
        ): boolean | Promise< boolean >
    }
): JSX.Element {

    const [ unparsedValue, setUnparsedValue ] = useState< string >( "" );

    async function handleChange( event: ChangeEvent< HTMLSelectElement > ): Promise< void > {

        if( readOnly ) return;
        const
            unparsedValue: string = event.target.value,
            parsedValue: main | null = await parseValue( unparsedValue ),
            old = documentData[ keyName ] as main | null
        ;
        if( validate ) if( !( await validate( parsedValue, unparsedValue, old ) ) ) return;
        setUnparsedValue( unparsedValue );
        documentData[ keyName ] = parsedValue;
        await handleDefault( parsedValue );
        if( onChange ) await onChange( parsedValue, unparsedValue, old );

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

    async function parseValue( unparsedValue: string ): Promise< main | null > {

        const
            { DATE_TIME_REGEX } = SpaRadiseEnv,
            isTrue: boolean = ( unparsedValue === "true" ),
            isFalse: boolean = ( unparsedValue === "false" ),
            isNull: boolean = ( unparsedValue === "null" ),
            date: Date = new Date( unparsedValue ),
            isDateTime: boolean = Boolean(
                unparsedValue.match( DATE_TIME_REGEX )
                && NumberUtils.isNumeric( date )
            ),
            isNumber: boolean = NumberUtils.isNumeric( unparsedValue ),
            isEmpty: boolean = ( unparsedValue.length === 0 )
        ;
        return (
            isTrue ? true
            : isFalse ? false
            : ( isNull || isEmpty ) ? null
            : isDateTime ? date
            : isNumber ? +unparsedValue
            : SpaRadiseFirestore.getDocumentReference( unparsedValue, SpaRadiseEnv.EMPLOYEE_COLLECTION )
        );

    }

    async function unparseValue( parsedValue: main | null ): Promise< string > {

        return (
            ( parsedValue instanceof DocumentReference ) ? parsedValue.id
            : ( parsedValue instanceof Date ) ? DateUtils.toString( parsedValue, "yyyy-mm-ddThh:mm" )
            : ( parsedValue?.toString() ?? "" )
        );

    }

    useEffect( () => { ( async() => {

        if( !documentData ) return;
        if( documentData[ keyName ] === undefined )
            throw new Error( `Key name "${ keyName }" does not exist.` );
        const parsedValue: main = documentData[ keyName ] as main;
        setUnparsedValue( await unparseValue( parsedValue ) );

    } )() }, [ pageData ] );

    return <select
        className={ className }
        id={ name }
        name={ name }
        required={ required }
        value={ unparsedValue }
        onChange={ event => handleChange( event ) }
    >
        { children }
        {
            Object.keys( employeeDataMap ).sort(
                ( employeeId1, employeeId2 ) => {

                    const
                        employeeData1 = employeeDataMap[ employeeId1 ],
                        employeeData2 = employeeDataMap[ employeeId2 ]
                    ;
                    return PersonUtils.compare(
                        employeeData1, employeeData2, [ "firstName", "middleName", "lastName" ]
                    );

                }
            ).map( employeeId => <option key={ employeeId } value={ employeeId }>{
                PersonUtils.format( employeeDataMap[ employeeId ], "f mi l" )
            }</option> )
        }
    </select>;

}
