import { DocumentReference } from "firebase/firestore/lite";
import FormDateInput from "../components/FormDateInput";
import FormEmailInput from "../components/FormEmailInput";
import {
    FormEvent,
    useEffect,
    useState
} from "react";
import FormSelect from "../components/FormSelect";
import FormTextArea from "../components/FormTextArea";
import FormTinyTextInput from "../components/FormTinyTextInput";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import {
    AccountData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import AccountUtils from "../firebase/AccountUtils";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import { useParams } from "react-router-dom";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";
import FormContactNumberInput from "../components/FormContactNumberInput";

interface AccountManagementPageData extends SpaRadisePageData {
    
    accountData: AccountData,
    accountDefaultData: AccountData,
    accountDocumentReference?: DocumentReference

}

export default function MyAccount(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< AccountManagementPageData >( {
            accountData: {
                lastName: null as unknown as string,
                firstName: null as unknown as string,
                middleName: null,
                sex: null as unknown as sex,
                birthDate: null as unknown as Date,
                email: null as unknown as string,
                contactNumber: null as unknown as string,
                contactNumberAlternate: null
            },
            accountDefaultData: {} as AccountData,
            loaded: false,
            updateMap: {}
        } ),
        accountId: string | undefined = useParams().accountId
    ;

    async function cancelAccountForm(): Promise< void > {

        window.open( `/home`, `_self`);

    }

    async function checkFormValidity(): Promise< boolean > {
    
        // check if duplicate email
        return true;

    }

    async function deleteAccount(): Promise< void > {

        if( !accountId ) return;
        await AccountUtils.deleteAccount( accountId );
        // note: logout
        alert( `Deleted!` ); // note: remove later
        window.open( `/home`, `_self`);

    }

    async function loadAccount(): Promise< void > {

        if( !accountId ) return;
        pageData.accountDocumentReference = SpaRadiseFirestore.getDocumentReference(
            accountId, SpaRadiseEnv.ACCOUNT_COLLECTION
        );
        pageData.accountData = await AccountUtils.getAccountData( accountId );
        pageData.accountDefaultData = { ...pageData.accountData };

    }

    async function loadPageData(): Promise< void > {

        if( !accountId ) return;
        await loadAccount();
        pageData.loaded = true;
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    async function submit( event: FormEvent< HTMLFormElement > ): Promise< void > {

        event.preventDefault();
        await updateAccount();

    }

    async function updateAccount(): Promise< void > {

        if( !accountId ) return;
        await checkFormValidity();
        const { updateMap } = pageData;
        if( accountId in updateMap ) {
        
            await AccountUtils.updateAccount( accountId, pageData.accountData );
            pageData.accountDefaultData = { ...pageData.accountData };

        }
        delete updateMap[ accountId ];
        reloadPageData();
        alert( `Updated!` ); // note: remove later

    }

    useEffect( () => { loadPageData(); }, [] );

    return <>
        <form onSubmit={ submit }>
            <h1>ID: { accountId }</h1>
            <label>Last Name</label>
            <FormTinyTextInput documentData={ pageData.accountData } documentDefaultData={ pageData.accountDefaultData } documentId={ accountId } keyName="lastName" pageData={ pageData } required={ true }/>
            <label>First Name</label>
            <FormTinyTextInput documentData={ pageData.accountData } documentDefaultData={ pageData.accountDefaultData } documentId={ accountId } keyName="firstName" pageData={ pageData } required={ true }/>
            <label>Middle Name</label>
            <FormTinyTextInput documentData={ pageData.accountData } documentDefaultData={ pageData.accountDefaultData } documentId={ accountId } keyName="middleName" pageData={ pageData }/>
            <label>Sex</label>
            <FormSelect documentData={ pageData.accountData } documentDefaultData={ pageData.accountDefaultData } documentId={ accountId } keyName="sex" optionList={ SpaRadiseEnv.SEX_LIST } pageData={ pageData } required={ true }>
                <option value="" disabled>Select Sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
            </FormSelect>
            <label>Birth Date</label>
            <FormDateInput documentData={ pageData.accountData } documentDefaultData={ pageData.accountDefaultData } documentId={ accountId } keyName="birthDate" pageData={ pageData } required={ true }/>
            <label>Email</label>
            <FormEmailInput documentData={ pageData.accountData } documentDefaultData={ pageData.accountDefaultData } documentId={ accountId } keyName="email" pageData={ pageData } required={ true }/>
            <label>Contact Number</label>
            <FormContactNumberInput documentData={ pageData.accountData } documentDefaultData={ pageData.accountDefaultData } documentId={ accountId } keyName="contactNumber" pageData={ pageData } required={ true }/>
            <label>Contact Number (Alternate)</label>
            <FormContactNumberInput documentData={ pageData.accountData } documentDefaultData={ pageData.accountDefaultData } documentId={ accountId } keyName="contactNumberAlternate" pageData={ pageData }/>
            <button type="button" onClick={ cancelAccountForm }>Cancel</button>
            <button type="button" onClick={ () => console.log( pageData ) }>Log page data</button>
            <button type="button" onClick={ deleteAccount }>Delete</button>
            <button type="submit">Submit</button>
        </form>

    </>

}
