import {
    AccountData,
    BookingData,
    BookingDataMap,
    ClientData,
    ClientDataMap,
    PackageDataMap,
    PackageServiceDataMap,
    ServiceDataMap,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import AccountUtils from "../firebase/AccountUtils";
import BookingUtils from "../firebase/BookingUtils";
import DateUtils from "../utils/DateUtils";
import { DocumentReference } from "firebase/firestore/lite";
import FormDateInput from "../components/FormDateInput";
import {
    FormEvent,
    useEffect,
    useState
} from "react";
import FormTextArea from "../components/FormTextArea";
import FormTinyTextInput from "../components/FormTinyTextInput";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import PackageUtils from "../firebase/PackageUtils";
import PersonUtils from "../utils/PersonUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import { useParams } from "react-router-dom";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";

interface NewBookingPageData extends SpaRadisePageData {
    
    accountData: AccountData,
    bookingData: BookingData,
    clientDataMap: ClientDataMap,
    clientIndex: number,
    packageDataMap: PackageDataMap,
    packageServiceDataMap: PackageServiceDataMap,
    serviceDataMap: ServiceDataMap,
    formIndex: number

}

export default function NewBooking(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< NewBookingPageData >( {
            accountData: {} as AccountData,
            bookingData: {
                account: null as unknown as DocumentReference,
                reservedDateTime: null as unknown as Date,
                activeDateTime: null,
                finishedDateTime: null,
                canceledDateTime: null
            },
            clientDataMap: {} as ClientDataMap,
            clientIndex: 0,
            formIndex: 0,
            packageDataMap: {} as PackageDataMap,
            packageServiceDataMap: {} as PackageServiceDataMap,
            serviceDataMap: {} as ServiceDataMap,
            updateMap: {}
        } ),
        accountId: string | undefined = useParams().accountId
    ;

    function addFormIndex( value: number = 1 ): void {

        pageData.formIndex += value;
        reloadPageData();

    }

    async function createBooking(): Promise< void > {



    }

    async function checkFormValidity(): Promise< boolean > {
    
        // const {
        //     bookingData
        // } = pageData;
        // if( bookingData.name === "New Booking" )
        //     throw new Error( `Booking name cannot be "New Booking"!` );
        // // check if duplicate name
        // const noServices: number =
        //     ObjectUtils.keyLength( bookingServiceIncludedMap )
        //     - ObjectUtils.keyLength( bookingServiceToDeleteMap )
        // ;
        // if( noServices < 1 )
        //     throw new Error( `There must be at least 1 booking service.` );
        return true;

    }

    function loadFirstClient(): void {

        const { accountData: { birthDate, firstName, middleName, lastName } } = pageData;
        pageData.clientDataMap[ -1 ] = {
            booking: null as unknown as DocumentReference,
            name: PersonUtils.format( firstName, middleName, lastName, "f mi l" ),
            birthDate,
            notes: null
        };

    }

    async function loadPageData(): Promise< void > {

        if( !accountId ) return;
        pageData.accountData = await AccountUtils.getAccountData( accountId );
        pageData.bookingData.account = SpaRadiseFirestore.getDocumentReference(
            accountId, SpaRadiseEnv.ACCOUNT_COLLECTION
        );
        pageData.packageDataMap = await PackageUtils.getPackageListAll();
        pageData.serviceDataMap = await ServiceUtils.getServiceListAll();
        loadFirstClient();
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    async function submit( event: FormEvent< HTMLFormElement > ): Promise< void > {

        event.preventDefault();
        await createBooking();

    }

    useEffect( () => { loadPageData(); }, [] );

    return <>
        <h1>Account ID: { accountId }</h1>
        <form onSubmit={ submit }>
            {
                ( pageData.formIndex === 0 ) ? <ChooseClients addFormIndex={ addFormIndex } pageData={ pageData } reloadPageData={ reloadPageData }/>
                : ( pageData.formIndex === 1 ) ? <ChooseServices addFormIndex={ addFormIndex } pageData={ pageData } reloadPageData={ reloadPageData }/>
                // other form indexes
                : <>none</>
            }
            
            <button type="button" onClick={ () => console.log( pageData ) }>Log page data</button>
        </form>

    </>

}

function ChooseClients( { addFormIndex, pageData, reloadPageData }: {
    addFormIndex: ( value?: number ) => void,
    pageData: NewBookingPageData,
    reloadPageData: () => void
} ): JSX.Element {

    const { clientDataMap } = pageData;

    async function addClient(): Promise< void > {
    
        const { clientDataMap, clientIndex } = pageData;
        clientDataMap[ clientIndex ] = {
            booking: null as unknown as DocumentReference,
            name: null as unknown as string,
            birthDate: null as unknown as Date,
            notes: null
        };
        pageData.clientIndex++;
        reloadPageData();

    }

    async function checkFormValidity(): Promise< boolean > {
    
        const
            { MIN_AGE_LIMIT } = SpaRadiseEnv,
            { clientDataMap } = pageData
        ;
        for( let clientId in clientDataMap ) {

            const { name, birthDate } = clientDataMap[ clientId ];
            if( !name ) throw new Error( `Client names cannot be empty!` );
            // check for duplicate names
            if( !birthDate ) throw new Error( `Birth dates cannot be empty!` );
            if( DateUtils.getYearAge( birthDate ) < MIN_AGE_LIMIT )
                throw new Error( `The age limit is ${ MIN_AGE_LIMIT } years old!` );

        }
        return true;

    }

    async function nextPage(): Promise< void > {

        await checkFormValidity();
        addFormIndex();

    }

    async function previousPage(): Promise< void > {

        window.open( `/home`, `_self` );

    }

    return <>
        <h1>Who are the Clients?</h1>
        {
            Object.keys( clientDataMap ).sort().map( ( clientId, index ) => {

                const clientData: ClientData = clientDataMap[ clientId ];
                return <div key={ index }>
                    <label>Name</label>
                    <FormTinyTextInput documentData={ clientData } keyName="name" pageData={ pageData } required={ true }/>
                    <label>Birth Date</label>
                    <FormDateInput documentData={ clientData } keyName="birthDate" pageData={ pageData } required={ true }/>
                </div>;

            } )
        }
        <button type="button" onClick={ addClient }>Add</button>
        <button type="button" onClick={ previousPage }>Back</button>
        <button type="button" onClick={ nextPage }>Proceed (1/3)</button>
    </>;

}

function ChooseServices( { addFormIndex, pageData, reloadPageData }: {
    addFormIndex: ( value?: number ) => void,
    pageData: NewBookingPageData,
    reloadPageData: () => void
} ): JSX.Element {

    const
        { clientDataMap } = pageData,
        [ clientIndexActive, setClientIndexActive ] = useState< number >( getFirstClientIndex ),
        [ showPackages, setShowPackages ] = useState< boolean >( true ),
        [ showServices, setShowServices ] = useState< boolean >( true )
    ;

    async function checkFormValidity(): Promise< boolean > {
    
        const
            { MIN_AGE_LIMIT } = SpaRadiseEnv,
            { clientDataMap } = pageData
        ;
        for( let clientId in clientDataMap ) {

            const { name, birthDate } = clientDataMap[ clientId ];
            if( !name ) throw new Error( `Client names cannot be empty!` );
            // check for duplicate names
            if( !birthDate ) throw new Error( `Birth dates cannot be empty!` );
            if( DateUtils.getYearAge( birthDate ) < MIN_AGE_LIMIT )
                throw new Error( `The age limit is ${ MIN_AGE_LIMIT } years old!` );

        }
        return true;

    }

    function getFirstClientIndex(): number {

        let minimum: number = Infinity;
        for( let keyName in clientDataMap ) {

            const index = +keyName;
            if( index < minimum ) minimum = index;

        }
        return minimum;

    }

    async function handleChangeClientActive( clientIndex: number ): Promise< void > {

        setClientIndexActive( clientIndex );
        reloadPageData();

    }

    async function nextPage(): Promise< void > {

        await checkFormValidity();
        addFormIndex();

    }

    async function previousPage(): Promise< void > {

        addFormIndex( -1 );

    }

    function togglePackages(): void {

        setShowPackages( !showPackages );

    }

    function toggleServices(): void {

        setShowServices( !showServices );

    }

    return <>
        <h1>Choose services</h1>
        <ul>{
            Object.keys( clientDataMap ).sort().map( clientIndex => 
                <li
                    className={ ( +clientIndex == clientIndexActive ) ? `active` : `` }
                    key={ clientIndex }
                    onClick={ () => handleChangeClientActive( +clientIndex ) }
                >{ clientDataMap[ clientIndex ].name }</li>
            )
        }</ul>
        <button type="button" onClick={ togglePackages }><h1>Packages</h1></button>
        {
            showPackages ? <div>
                feef
            </div> : <></>
        }
        <button type="button" onClick={ previousPage }>Back</button>
        <button type="button" onClick={ nextPage }>Proceed (1/3)</button>
    </>;

}
