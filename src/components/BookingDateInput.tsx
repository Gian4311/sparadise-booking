import {
    ChangeEvent,
    useEffect,
    useState
} from "react";
import DateUtils from "../utils/DateUtils";
import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";

type main = Date;

const DATE_FORMAT = "yyyy-mm-dd";

interface BookingManagementPageData extends SpaRadisePageData {

    date: Date

}

export default function BookingDateInput(
    {
        className, name, pageData, placeholder, readOnly, required = true,
        onChange, reloadPageData, validate
    }: {
        className?: string,
        name?: string,
        pageData: BookingManagementPageData,
        placeholder?: string,
        readOnly?: boolean,
        required?: boolean,
        onChange?( parsedValue: main | null, unparsedValue: string, old: main | null ): Promise< void > | void,
        reloadPageData: () => void,
        validate?( parsedValue: main | null, unparsedValue: string, old: main | null ): Promise< boolean >
    }
): JSX.Element {

    const [ unparsedValue, setUnparsedValue ] = useState< string >( "" );

    async function handleChange( event: ChangeEvent< HTMLInputElement > ): Promise< void > {

        pageData.loaded = false;
        reloadPageData();
        const
            unparsedValueNew: string = event.target.value,
            parsedValue: main = await parseValue( unparsedValueNew ),
            old = await parseValue( unparsedValue )
        ;
        if( parsedValue instanceof Date && DateUtils.isSunday( parsedValue ) ) {

            pageData.popupData = {
                children: `Booking cannot be on a Sunday.`,
                popupMode: `yesOnly`,
                yesText: `OK`
            };
            pageData.loaded = true;
            reloadPageData();
            return;

        }
        if( validate ) if( !( await validate( parsedValue, unparsedValueNew, old ) ) ) return;
        setUnparsedValue( unparsedValueNew );
        pageData.date = parsedValue ?? ( null as unknown as Date );
        if( onChange ) await onChange( parsedValue, unparsedValueNew, old );
        pageData.loaded = true;
        reloadPageData();

    }

    async function parseValue( unparsedValue: string ): Promise< main > {

        return new Date( unparsedValue );

    }

    async function unparseValue( parsedValue: main ): Promise< string > {

        return parsedValue ? DateUtils.toString( parsedValue, DATE_FORMAT ) : "";

    }

    useEffect( () => { ( async() => {

        const { date } = pageData;
        setUnparsedValue( await unparseValue( date ) );

    } )() }, [ pageData ] );

    return <input
        className={ className }
        id={ name }
        // max={ max ? DateUtils.toString( max, DATE_FORMAT ) : undefined }
        // min={ min ? DateUtils.toString( min, DATE_FORMAT ) : undefined }
        name={ name }
        placeholder={ placeholder }
        readOnly={ readOnly }
        required={ required }
        type="date"
        value={ unparsedValue }
        onChange={ event => handleChange( event ) }
    />;

}
