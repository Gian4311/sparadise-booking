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
    CapacityData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import CapacityUtils from "../firebase/CapacityUtils";
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

interface CapacityManagementPageData extends SpaRadisePageData {

    accountData: AccountData,
    accountId?: documentId,
    capacityDefaultData: CapacityData,
    capacityData: CapacityData,
    capacityDocumentReference?: DocumentReference,
    capacityName: string

}

const IS_DEV_MODE = true;

export default function CapacityManagement(): JSX.Element {

    const
        [pageData, setPageData] = useState<CapacityManagementPageData>({
            accountData: {} as unknown as AccountData,
            loaded: false,
            capacityData: {
                roomCount: null as unknown as number,
                chairCount: null as unknown as number,
                datetime: null as unknown as Date
            },
            capacityDefaultData: {} as CapacityData,
            capacityName: "New Capacity",
            updateMap: {}
        }),
        documentId: string | undefined = useParams().id,
        isNewMode: boolean = (documentId === "new"),
        isEditMode: boolean = (documentId !== undefined && !isNewMode),
        navigate = useNavigate()

        ;


    const [quickPopupMessage, setQuickPopupMessage] = useState("");

    async function cancelCapacityForm(): Promise<void> {

        navigate(`/management/capacitiesAndPackages/menu`);

    }

    async function checkFormValidity(): Promise<boolean> {

        const datetime = pageData.capacityData.datetime;
        if( !datetime ) return false;

        const closest = await CapacityUtils.getCapacityDataByDate( datetime );
        if( !closest ) return true;
        const
            { datetime: dateTimeClosest } = closest,
            areSame = DateUtils.areSameByMinute( datetime, dateTimeClosest )
        ;
        if( areSame ) {

            pageData.popupData = {
                children: `A capacity history with the same date & time already exists.`
            };
            return false;

        }
        return true;

    }

    async function createCapacity(): Promise<void> {
        if (!isNewMode || !documentId) return;
        if( !( await checkFormValidity() ) ) return;

        pageData.loaded = false;
        const documentReference: DocumentReference = await CapacityUtils.createCapacity(
            pageData.capacityData
        );

        pageData.capacityDocumentReference = documentReference;
        delete pageData.updateMap["new"];
        reloadPageData();
        navigate(`/management/capacities/${documentReference.id}`);
        
    }

    async function deleteCapacity(): Promise<void> {

        if (!isEditMode || !documentId) return;
        await CapacityUtils.deleteCapacity(documentId);
        alert(`Deleted!`); // note: remove later
        navigate(`/management/capacities/menu`);

    }

    async function loadPageData(): Promise<void> {

        if (!documentId) return;
        if (isEditMode) await loadCapacity();
        pageData.loaded = true;
        reloadPageData();

    }

    async function loadCapacity(): Promise<void> {

        if (!documentId) return;
        pageData.capacityDocumentReference = SpaRadiseFirestore.getDocumentReference(
            documentId, SpaRadiseEnv.SERVICE_COLLECTION
        );
        pageData.capacityData = await CapacityUtils.getCapacityData(documentId);
        pageData.capacityName = pageData.capacityData.datetime ? DateUtils.toString( pageData.capacityData.datetime, "Mmmm dd, yyyy - hh:mm a.m." ) : "";
        pageData.capacityDefaultData = { ...pageData.capacityData };

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {

        event.preventDefault();
        if (isNewMode)
            await createCapacity();
        else
            await updateCapacity();

    }


    async function updateCapacity(): Promise<void> {
        if (!isEditMode || !documentId) return;
        pageData.loaded = false;
        reloadPageData();
        if( !( await checkFormValidity() ) ) return;
        const { capacityData, updateMap } = pageData;

        if (documentId in updateMap) {
            await CapacityUtils.updateCapacity(documentId, capacityData);
            pageData.capacityDefaultData = { ...pageData.capacityData };
            pageData.capacityName = DateUtils.toString( capacityData.datetime, "Mmmm dd, yyyy - hh:mm a.m." );
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
                    <label htmlFor="service-main-content" className="service-management-location">Capacitys & Packages - {pageData.capacityName}</label>
                    <div className="service-form-section">
                        <div className="service-header">
                            <button onClick={() => navigate(`/management/capacities/menu`)} className="service-back-arrow" aria-label="Back" style={{ background: "none", border: "none", padding: 0 }}><img src={BackButton} alt="Back" className="back-icon" /></button>
                            <h1>{pageData.capacityName}</h1>
                        </div>

                        <div>
                            <div className="service-form-row-group">
                                <div className="service-form-row">
                                    <label htmlFor="service-name">Date & Time</label>
                                    <FormDateTime30MinStepInput documentData={pageData.capacityData} documentDefaultData={pageData.capacityDefaultData} documentId={documentId} keyName="datetime" min={ isNewMode ? new Date() : undefined } name="service-name" pageData={pageData} required={true} />
                                </div>
                            </div>

                            <div className="service-form-row">
                                <label htmlFor="service-description">Rooms</label>
                                <FormNaturalNumberInput documentData={pageData.capacityData} documentDefaultData={pageData.capacityDefaultData} documentId={documentId} keyName="roomCount" name="service-description" pageData={pageData} required={true} />
                            </div>

                            <div className="service-form-row">
                                <label htmlFor="service-description">Chairs</label>
                                <FormNaturalNumberInput documentData={pageData.capacityData} documentDefaultData={pageData.capacityDefaultData} documentId={documentId} keyName="chairCount" name="service-description" pageData={pageData} required={true} />
                            </div>
                        </div>
                        <div className="service-form-actions">
                            {
                                isEditMode ? <button className="service-delete-btn" type="button" onClick={deleteCapacity}>Delete</button>
                                    : undefined
                            }
                            <button className="service-cancel-btn" type="button" onClick={cancelCapacityForm}>Cancel</button>
                            <button className="service-save-btn" type="submit">{isNewMode ? "Create" : "Save Changes"}</button>
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
