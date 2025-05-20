import DateUtils from "../utils/DateUtils";
import { DocumentReference } from "firebase/firestore/lite";
import FormDateInput from "../components/FormDateInput";
import {
    FormEvent,
    useEffect,
    useState
} from "react";
import { useNavigate } from "react-router-dom";
import FormMoneyInput from "../components/FormMoneyInput";
import FormNaturalNumberInput from "../components/FormNaturalNumberInput";
import FormPercentageInput from "../components/FormPercentageInput";
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
import SpaRadiseDataMapUtils from "../firebase/SpaRadiseDataMapUtils";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/EmployeeServiceManagement.css";
import "../styles/Sidebar.css";
import EmployeeSidebar from "../components/EmployeeSidebar";
import BackButton from "../images/back button.png";
import SpaRadiseLogo from "../images/SpaRadise Logo.png";
import QuickPopup from "../components/quickPopupMessage";
import FormDateTimeInput from "../components/FormDateTimeInput";
import PopupModal from "../components/PopupModal";
import FormDateTime30MinStepInput from "../components/FormDateTime30MinStepInput";
import PersonUtils from "../utils/PersonUtils";
import FormEmailInput from "../components/FormEmailInput";
import FormContactNumberInput from "../components/FormContactNumberInput";

interface AccountManagementPageData extends SpaRadisePageData {

    accountData: AccountData,
    accountId?: documentId,
    accountDataEdit: AccountData,
    accountDefaultData: AccountData,
    accountDocumentReference?: DocumentReference,
    accountName: string

}

const IS_DEV_MODE = true;

export default function AccountManagement(): JSX.Element {

    const
        [pageData, setPageData] = useState<AccountManagementPageData>({
            accountData: {} as unknown as AccountData,
            loaded: false,
            accountDataEdit: {
                lastName: null as unknown as string,
                firstName: null as unknown as string,
                middleName: null,
                sex: null as unknown as sex,
                birthDate: null as unknown as Date,
                email: null as unknown as string,
                contactNumber: null as unknown as string,
                contactNumberAlternate: null,
                accountType: "customer"
            },
            accountDefaultData: {} as AccountData,
            accountName: "New Account",
            updateMap: {}
        }),
        documentId: string | undefined = useParams().id,
        isNewMode: boolean = (documentId === "new"),
        isEditMode: boolean = (documentId !== undefined && !isNewMode),
        navigate = useNavigate()

        ;


    const [quickPopupMessage, setQuickPopupMessage] = useState("");

    async function cancelAccountForm(): Promise<void> {

        navigate(`/management/capacities/menu`);

    }

    async function checkFormValidity(): Promise<boolean> {

        return true;

    }

    async function createAccount(): Promise<void> {
        if (!isNewMode || !documentId) return;
        if( !( await checkFormValidity() ) ) return;

        pageData.loaded = false;
        const documentReference: DocumentReference = await AccountUtils.createAccount(
            pageData.accountDataEdit
        );

        pageData.accountDocumentReference = documentReference;
        delete pageData.updateMap["new"];
        reloadPageData();
        navigate(`/management/capacities/${documentReference.id}`);
        
    }

    async function deleteAccount(): Promise<void> {

        if (!isEditMode || !documentId) return;
        await AccountUtils.deleteAccount(documentId);
        alert(`Deleted!`); // note: remove later
        navigate(`/management/capacities/menu`);

    }

    async function loadPageData(): Promise<void> {

        if (!documentId) return;
        if (isEditMode) await loadAccount();
        pageData.loaded = true;
        reloadPageData();

    }

    async function loadAccount(): Promise<void> {

        if (!documentId) return;
        pageData.accountDocumentReference = SpaRadiseFirestore.getDocumentReference(
            documentId, SpaRadiseEnv.SERVICE_COLLECTION
        );
        pageData.accountDataEdit = await AccountUtils.getAccountData(documentId);
        pageData.accountName = PersonUtils.toString( pageData.accountDataEdit, "f mi l" );
        pageData.accountDefaultData = { ...pageData.accountDataEdit };

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {

        event.preventDefault();
        if (isNewMode)
            await createAccount();
        else
            await updateAccount();
        pageData.popupData= {
            children: `Success!`,
            yes: () => navigate(`/management/accounts/menu`)
        }

        loadPageData();

    }


    async function updateAccount(): Promise<void> {
        if (!isEditMode || !documentId) return;
        pageData.loaded = false;
        reloadPageData();
        if( !( await checkFormValidity() ) ) return;
        const { accountDataEdit, updateMap } = pageData;

        if (documentId in updateMap) {
            await AccountUtils.updateAccount(documentId, accountDataEdit);
            pageData.accountDefaultData = { ...pageData.accountDataEdit };
            pageData.accountName = PersonUtils.toString( pageData.accountDataEdit, "f mi l" );
        }

        delete updateMap[documentId];
        pageData.loaded = true;
        reloadPageData();
    }

    useEffect(() => { loadPageData(); }, []);

    return <>
        <PopupModal pageData={ pageData } reloadPageData={ reloadPageData }/>
        <EmployeeSidebar pageData={ pageData } reloadPageData={ reloadPageData }/>
        <form onSubmit={submit}>
            <div className="servman-container">
                <div className="service-main-content">
                    <label htmlFor="service-main-content" className="service-management-location">Accounts - {pageData.accountName}</label>
                    <div className="service-form-section">
                        <div className="service-header">
                            <button onClick={() => navigate(-1)} className="service-back-arrow" aria-label="Back" style={{ background: "none", border: "none", padding: 0 }}><img src={BackButton} alt="Back" className="back-icon" /></button>
                            <h1>{isNewMode ? "Create New Account" : pageData.accountName}</h1>
                        </div>

                        <div className="employee-form-row-group">
                            <div className="employee-form-row">
                                <label htmlFor="account-sex">Account Type</label>
                                <FormSelect className="account-input" documentData={pageData.accountDataEdit} documentDefaultData={pageData.accountDefaultData} documentId={documentId} name="account-sex" keyName="accountType" optionList={SpaRadiseEnv.ACCOUNT_TYPE_LIST} pageData={pageData} required={true}>
                                    <option value="" disabled>Select account type</option>
                                    <option value="customer">Customer</option>
                                    <option value="management">Manager</option>
                                </FormSelect>
                            </div>
                            <div className="employee-form-row">
                                <label htmlFor="account-name">Last Name</label>
                                <FormTinyTextInput className="account-input" documentData={pageData.accountDataEdit} documentDefaultData={pageData.accountDefaultData} documentId={documentId} keyName="lastName" name="account-lastName" pageData={pageData} required={true} />
                            </div>
                            <div className="employee-form-row">
                                <label htmlFor="account-name">First Name</label>
                                <FormTinyTextInput className="account-input" documentData={pageData.accountDataEdit} documentDefaultData={pageData.accountDefaultData} documentId={documentId} keyName="firstName" name="account-firstName" pageData={pageData} required={true} />
                            </div>
                            <div className="employee-form-row">
                                <label htmlFor="account-middle-name">Middle Name</label>
                                <FormTinyTextInput className="account-input" documentData={pageData.accountDataEdit} documentDefaultData={pageData.accountDefaultData} documentId={documentId} keyName="middleName" name="account-middleName" pageData={pageData} />
                            </div>
                        </div>

                        <div className="employee-form-row-group">
                            <div className="employee-form-row">
                                <label htmlFor="account-sex">Sex</label>
                                <FormSelect className="account-input" documentData={pageData.accountDataEdit} documentDefaultData={pageData.accountDefaultData} documentId={documentId} name="account-sex" keyName="sex" optionList={SpaRadiseEnv.SEX_LIST} pageData={pageData} required={true}>
                                    <option value="" disabled>Select sex</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="others">Others</option>
                                </FormSelect>
                            </div>
                            <div className="employee-form-row">
                                <label htmlFor="account-birthdate">Birthdate</label>
                                <FormDateInput className="account-input" documentData={pageData.accountDataEdit} documentDefaultData={pageData.accountDefaultData} documentId={documentId} keyName="birthDate" name="account-birthdate" pageData={pageData} required={true} />
                            </div>
                        </div>

                        <div className="employee-gap-row"></div>

                        <div className="employee-form-row-group">
                            <div className="employee-form-row">
                                <label htmlFor="account-email">Email</label>
                                <FormEmailInput className="account-input" documentData={pageData.accountDataEdit} documentDefaultData={pageData.accountDefaultData} documentId={documentId} keyName="email" name="account-email" pageData={pageData} required={true} />
                            </div>
                            <div className="employee-form-row">
                                <label htmlFor="account-contact-number">Contact Number</label>
                                <FormContactNumberInput className="account-input" documentData={pageData.accountDataEdit} documentDefaultData={pageData.accountDefaultData} documentId={documentId} keyName="contactNumber" name="account-contactNumber" pageData={pageData} required={true} />
                            </div>
                            <div className="employee-form-row">
                                <label htmlFor="account-alter-contact-number">Alternate Contact Number</label>
                                <FormContactNumberInput className="account-input" documentData={pageData.accountDataEdit} documentDefaultData={pageData.accountDefaultData} documentId={documentId} keyName="contactNumberAlternate" name="account-contactNumber" pageData={pageData} />
                            </div>
                        </div>



                        <div className="employee-form-actions">
                            <button className="employee-cancel-btn" type="button" onClick={cancelAccountForm}>Cancel</button>
                            <button className="employee-save-btn" type="submit">{isNewMode ? "Create" : "Save Changes"}</button>
                        </div>
                    </div>
                </div>
            </div>



        </form>

        {quickPopupMessage && (
            <QuickPopup
                message={quickPopupMessage}
                clearPopup={() => setQuickPopupMessage("")}
            />
        )}
    </>

}
