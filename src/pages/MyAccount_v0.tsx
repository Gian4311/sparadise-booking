import {
    AccountData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import AccountUtils from "../firebase/AccountUtils";
import { DocumentReference } from "firebase/firestore/lite";
import FormContactNumberInput from "../components/FormContactNumberInput";
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
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import {
    useNavigate,
    useParams
} from "react-router-dom";
import LoadingWrapper from "../components/LoadingWrapper";
import "../styles/ClientAccount.css";
import NavBar from "../components/ClientNavBar";

interface AccountManagementPageData extends SpaRadisePageData {

    accountData: AccountData,
    accountDefaultData: AccountData,
    accountDocumentReference?: DocumentReference

}

export default function MyAccount(): JSX.Element {

    const
        [pageData, setPageData] = useState<AccountManagementPageData>({
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
        }),
        accountId: string | undefined = useParams().accountId,
        navigate = useNavigate()
        ;

    async function cancelAccountForm(): Promise<void> {



    }

    async function checkFormValidity(): Promise<boolean> {

        // check if duplicate email
        return true;

    }

    async function deleteAccount(): Promise<void> {

        if (!accountId) return;
        await AccountUtils.deleteAccount(accountId);
        // note: logout
        alert(`Deleted!`); // note: remove later
        navigate("/");

    }

    async function loadAccount(): Promise<void> {

        if (!accountId) return;
        pageData.accountDocumentReference = SpaRadiseFirestore.getDocumentReference(
            accountId, SpaRadiseEnv.ACCOUNT_COLLECTION
        );
        pageData.accountData = await AccountUtils.getAccountData(accountId);
        pageData.accountDefaultData = { ...pageData.accountData };

    }

    async function loadPageData(): Promise<void> {

        if (!accountId) return;
        await loadAccount();
        pageData.loaded = true;
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {

        event.preventDefault();
        await updateAccount();

    }

    async function updateAccount(): Promise<void> {

        if (!accountId) return;
        await checkFormValidity();
        const { updateMap } = pageData;
        if (accountId in updateMap) {

            await AccountUtils.updateAccount(accountId, pageData.accountData);
            pageData.accountDefaultData = { ...pageData.accountData };

        }
        delete updateMap[accountId];
        reloadPageData();
        alert(`Updated!`); // note: remove later

    }

    useEffect(() => { loadPageData(); }, []);

    return <>
        <LoadingWrapper>
            <NavBar />
            <form onSubmit={submit}>
                <main className="account-container">
                    <section className="account-details">
                        <h1>Account Details</h1>
                        <div className="form-row-group">
                            <div className="form-row">
                                <label className="form-row-label" htmlFor="last-name">Last Name</label>
                                <FormTinyTextInput className="account-input" documentData={pageData.accountData} documentDefaultData={pageData.accountDefaultData} documentId={accountId} keyName="lastName" pageData={pageData} required={true} />
                            </div>
                            <div className="form-row">
                                <label className="form-row-label" htmlFor="first-name">First Name</label>
                                <FormTinyTextInput className="account-input" documentData={pageData.accountData} documentDefaultData={pageData.accountDefaultData} documentId={accountId} keyName="firstName" pageData={pageData} required={true} />
                            </div>
                            <div className="form-row">
                                <label className="form-row-label" htmlFor="middle-name">Middle Name</label>
                                <FormTinyTextInput className="account-input" documentData={pageData.accountData} documentDefaultData={pageData.accountDefaultData} documentId={accountId} keyName="middleName" pageData={pageData} />
                            </div>
                        </div>
                        <div className="form-row-group">
                            <div className="form-row">
                                <label className="form-row-label" htmlFor="sex">Sex</label>
                                <FormSelect className="account-select" documentData={pageData.accountData} documentDefaultData={pageData.accountDefaultData} documentId={accountId} keyName="sex" optionList={SpaRadiseEnv.SEX_LIST} pageData={pageData} required={true}>
                                    <option value="" disabled>Select Sex</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="others">Others</option>
                                </FormSelect>
                            </div>
                            <div className="form-row">
                                <label className="form-row-label" htmlFor="birthdate">Birth Date</label>
                                <FormDateInput className="account-input" documentData={pageData.accountData} documentDefaultData={pageData.accountDefaultData} documentId={accountId} keyName="birthDate" pageData={pageData} required={true} />
                            </div>
                        </div>

                        <hr className="divider" />

                        <div className="form-row-group">
                            <div className="form-row">
                                <label className="form-row-label" htmlFor="email">Email</label>
                                <FormEmailInput className="account-input" documentData={pageData.accountData} documentDefaultData={pageData.accountDefaultData} documentId={accountId} keyName="email" pageData={pageData} required={true} />
                            </div>
                            <div className="form-row">
                                <label className="form-row-label" htmlFor="contact-number">Contact Number</label>
                                <FormContactNumberInput className="account-input" documentData={pageData.accountData} documentDefaultData={pageData.accountDefaultData} documentId={accountId} keyName="contactNumber" pageData={pageData} required={true} />
                            </div>
                            <div className="form-row">
                                <label className="form-row-label" htmlFor="alt-contact-number">Alternate Contact Number (Optional)</label>
                                <FormContactNumberInput className="account-input" documentData={pageData.accountData} documentDefaultData={pageData.accountDefaultData} documentId={accountId} keyName="contactNumberAlternate" pageData={pageData} />
                            </div>
                        </div>

                        <div className="action-buttons">
                            <div className="left-buttons">
                                <button className="cancel-account-btn" type="button" onClick={cancelAccountForm}>Cancel</button>
                                <button className="delete-account-btn" type="button" onClick={deleteAccount}>Delete</button>
                            </div>
                            <div className="right-buttons">
                                <button className="save-changes-btn" type="submit">Save Changes</button>
                            </div>
                        </div>
                    </section>
                </main>
            </form>
        </LoadingWrapper>
    </>

}
