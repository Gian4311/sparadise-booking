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
    ServiceData,
    ServiceMaintenanceData,
    ServiceMaintenanceDataMap,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import ServiceMaintenanceUtils from "../firebase/ServiceMaintenanceUtils";
import ServiceUtils from "../firebase/ServiceUtils";
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

interface ServiceManagementPageData extends SpaRadisePageData {

    serviceDefaultData: ServiceData,
    serviceData: ServiceData,
    serviceDocumentReference?: DocumentReference,
    serviceMaintenanceDefaultDataMap: ServiceMaintenanceDataMap,
    serviceMaintenanceDataMap: ServiceMaintenanceDataMap,
    serviceMaintenanceDateKeyMap: { [yyyymmdd: string]: documentId | number },
    serviceMaintenanceIndex: number,
    serviceMaintenanceToDeleteMap: { [serviceMaintenanceId: string]: boolean },
    serviceName: string

}

const IS_DEV_MODE = true;

export default function ServiceManagement(): JSX.Element {

    const
        [pageData, setPageData] = useState<ServiceManagementPageData>({
            loaded: false,
            serviceData: {
                name: null as unknown as string,
                description: null as unknown as string,
                serviceType: null as unknown as serviceType,
                roomType: null as unknown as roomType,
                ageLimit: null as unknown as number,
                durationMin: null as unknown as (30 | 60)
            },
            serviceDefaultData: {} as ServiceData,
            serviceMaintenanceDataMap: {},
            serviceMaintenanceDefaultDataMap: {},
            serviceMaintenanceDateKeyMap: {},
            serviceMaintenanceIndex: 0,
            serviceMaintenanceToDeleteMap: {},
            serviceName: "New Service",
            updateMap: {}
        }),
        documentId: string | undefined = useParams().id,
        isNewMode: boolean = (documentId === "new"),
        isEditMode: boolean = (documentId !== undefined && !isNewMode),
        navigate = useNavigate()

        ;


    const [quickPopupMessage, setQuickPopupMessage] = useState("");

    async function addServiceMaintenance(): Promise<void> {

        const {
            serviceMaintenanceDateKeyMap,
            serviceMaintenanceToDeleteMap
        } = pageData;
        let
            date: Date = new Date(),
            dateKey: string = getDateKey(date)
            ;
        while (dateKey in serviceMaintenanceDateKeyMap) {

            const serviceMaintenanceId = serviceMaintenanceDateKeyMap[dateKey] as string;
            if (serviceMaintenanceId in serviceMaintenanceToDeleteMap) {

                await restoreServiceMaintenance(serviceMaintenanceId);
                return;

            }
            date = DateUtils.addTime(date, { day: 1 });
            dateKey = getDateKey(date);

        }
        const { serviceMaintenanceDataMap, serviceMaintenanceIndex } = pageData;
        serviceMaintenanceDataMap[serviceMaintenanceIndex] = {
            service: null as unknown as DocumentReference,
            date,
            price: null as unknown as number,
            commissionPercentage: null as unknown as number,
            status: null as unknown as serviceMaintenanceStatus
        }
        pageData.serviceMaintenanceIndex++;
        serviceMaintenanceDateKeyMap[dateKey] = serviceMaintenanceIndex;
        reloadPageData();

    }

    async function cancelServiceForm(): Promise<void> {

        window.open(`/management/servicesAndPackages/menu`, `_self`);

    }

    async function checkFormValidity(): Promise<boolean> {

        const {
            serviceData,
            serviceMaintenanceDateKeyMap,
            serviceMaintenanceToDeleteMap
        } = pageData;
        if (serviceData.name === "New Service")
            throw new Error(`Service name cannot be "New Service"!`);
        // check if duplicate name
        const noMaintenances: number =
            ObjectUtils.keyLength(serviceMaintenanceDateKeyMap)
            - ObjectUtils.keyLength(serviceMaintenanceToDeleteMap)
            ;
        if (noMaintenances < 1)
            throw new Error(`There must be at least 1 service maintenance.`);
        return true;

    }

    async function createService(): Promise<void> {
        if (!isNewMode || !documentId) return;
        await checkFormValidity();

        const documentReference: DocumentReference = await ServiceUtils.createService(
            pageData.serviceData
        );

        pageData.serviceDocumentReference = documentReference;
        await updateServiceMaintenanceList();
        delete pageData.updateMap["new"];

        setQuickPopupMessage("Successfully Created");

        setTimeout(() => {
            window.open(`/management/services/${documentReference.id}`, `_self`);
        }, 2000);
    }


    async function createServiceMaintenanceList(): Promise<void> {

        const {
            serviceDocumentReference,
            serviceMaintenanceDataMap,
            serviceMaintenanceDateKeyMap,
            serviceMaintenanceDefaultDataMap
        } = pageData;
        if (!serviceDocumentReference) return;
        for (let serviceMaintenanceId in serviceMaintenanceDataMap) {

            const isNew: boolean = !( serviceMaintenanceId in serviceMaintenanceDefaultDataMap );
            if (!isNew) continue;
            const serviceMaintenanceData = serviceMaintenanceDataMap[serviceMaintenanceId];
            serviceMaintenanceData.service = serviceDocumentReference;
            const
                serviceMaintenanceDocumentReference =
                    await ServiceMaintenanceUtils.createServiceMaintenance(serviceMaintenanceData)
                ,
                serviceMaintenanceIdNew: string = serviceMaintenanceDocumentReference.id,
                dateKey: string = getDateKey(serviceMaintenanceData.date)
                ;
            delete serviceMaintenanceDataMap[serviceMaintenanceId];
            serviceMaintenanceDataMap[serviceMaintenanceIdNew] = serviceMaintenanceData;
            serviceMaintenanceDateKeyMap[dateKey] = serviceMaintenanceIdNew;

        }
        pageData.serviceMaintenanceDefaultDataMap = SpaRadiseDataMapUtils.clone(serviceMaintenanceDataMap);

    }

    async function deleteService(): Promise<void> {

        if (!isEditMode || !documentId) return;
        const { serviceMaintenanceDataMap } = pageData;
        for (let serviceMaintenanceId in serviceMaintenanceDataMap)
            await deleteServiceMaintenance(serviceMaintenanceId);
        await updateServiceMaintenanceList();
        await ServiceUtils.deleteService(documentId);
        alert(`Deleted!`); // note: remove later
        window.open(`/management/services/menu`, `_self`);

    }

    async function deleteServiceMaintenance(
        serviceMaintenanceId: documentId | number
    ): Promise<void> {

        const
            {
                serviceMaintenanceDataMap,
                serviceMaintenanceDateKeyMap,
                serviceMaintenanceToDeleteMap
            } = pageData,
            serviceMaintenanceData: ServiceMaintenanceData = serviceMaintenanceDataMap[
                serviceMaintenanceId
            ],
            dateKey: string = getDateKey(serviceMaintenanceData.date),
            isNewServiceMaintenance: boolean = NumberUtils.isNumeric(serviceMaintenanceId)
            ;
        if (isNewServiceMaintenance) {

            delete serviceMaintenanceDataMap[serviceMaintenanceId];
            delete serviceMaintenanceDateKeyMap[dateKey];

        } else
            serviceMaintenanceToDeleteMap[serviceMaintenanceId] = true;
        reloadPageData();

    }

    async function deleteServiceMaintenanceListInToDeleteMap(): Promise<void> {

        const {
            serviceMaintenanceDataMap,
            serviceMaintenanceDefaultDataMap,
            serviceMaintenanceDateKeyMap,
            serviceMaintenanceToDeleteMap
        } = pageData;
        for (let serviceMaintenanceId in serviceMaintenanceToDeleteMap) {

            const dateKey: string = getDateKey(serviceMaintenanceDataMap[serviceMaintenanceId].date);
            await ServiceMaintenanceUtils.deleteServiceMaintenance(serviceMaintenanceId);
            delete serviceMaintenanceDataMap[serviceMaintenanceId];
            delete serviceMaintenanceDefaultDataMap[serviceMaintenanceId];
            delete serviceMaintenanceDateKeyMap[dateKey];
            delete serviceMaintenanceToDeleteMap[serviceMaintenanceId];

        }

    }

    function getDateKey(date: Date): string {

        return DateUtils.toString(date, "yyyymmdd");

    }

    function handleServiceMaintenanceDateChange(
        serviceMaintenanceId: string | number, date: Date | null, old: Date | null
    ): void {

        if (!date || !old) return;
        const
            { serviceMaintenanceDateKeyMap } = pageData,
            dateKeyOld: string = getDateKey(old),
            dateKeyNew: string = getDateKey(date)
            ;
        delete serviceMaintenanceDateKeyMap[dateKeyOld];
        serviceMaintenanceDateKeyMap[dateKeyNew] = serviceMaintenanceId;

    }

    async function loadPageData(): Promise<void> {

        if (!documentId) return;
        if (isEditMode) await loadService();
        pageData.loaded = true;
        reloadPageData();

    }

    async function loadService(): Promise<void> {

        if (!documentId) return;
        pageData.serviceDocumentReference = SpaRadiseFirestore.getDocumentReference(
            documentId, SpaRadiseEnv.SERVICE_COLLECTION
        );
        pageData.serviceData = await ServiceUtils.getServiceData(documentId);
        pageData.serviceName = pageData.serviceData.name;
        pageData.serviceDefaultData = { ...pageData.serviceData };
        await loadServiceMaintenanceList();

    }

    async function loadServiceMaintenanceList(): Promise<void> {

        if (!documentId) return;
        pageData.serviceMaintenanceDataMap =
            await ServiceMaintenanceUtils.getServiceMaintenanceDataMapByService(documentId)
            ;
        const { serviceMaintenanceDataMap, serviceMaintenanceDateKeyMap } = pageData;
        pageData.serviceMaintenanceDefaultDataMap = SpaRadiseDataMapUtils.clone(serviceMaintenanceDataMap);
        for (let serviceMaintenanceId in serviceMaintenanceDataMap) {

            const dateKey: string = getDateKey(
                serviceMaintenanceDataMap[serviceMaintenanceId].date
            );
            serviceMaintenanceDateKeyMap[dateKey] = serviceMaintenanceId;

        }

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    async function restoreServiceMaintenance(serviceMaintenanceId: documentId): Promise<void> {

        const { serviceMaintenanceToDeleteMap } = pageData;
        delete serviceMaintenanceToDeleteMap[serviceMaintenanceId];
        reloadPageData();

    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {

        event.preventDefault();
        if (isNewMode)
            await createService();
        else
            await updateService();

    }


    async function updateService(): Promise<void> {
        if (!isEditMode || !documentId) return;
        await checkFormValidity();
        const { serviceData, updateMap } = pageData;

        if (documentId in updateMap) {
            await ServiceUtils.updateService(documentId, serviceData);
            pageData.serviceDefaultData = { ...pageData.serviceData };
            pageData.serviceName = serviceData.name;
        }

        delete updateMap[documentId];
        await updateServiceMaintenanceList();
        reloadPageData();
        setQuickPopupMessage("Successfully Updated");
    }


    async function updateServiceMaintenanceList(): Promise<void> {

        await deleteServiceMaintenanceListInToDeleteMap();
        await updateServiceMaintenanceListInUpdateMap();
        await createServiceMaintenanceList();

    }

    async function updateServiceMaintenanceListInUpdateMap(): Promise<void> {

        const {
            serviceMaintenanceDataMap,
            serviceMaintenanceDefaultDataMap,
            updateMap
        } = pageData;
        for (let serviceMaintenanceId in updateMap) {

            const isServiceMaintenanceId: boolean = serviceMaintenanceId in serviceMaintenanceDataMap;
            if (!isServiceMaintenanceId) continue;
            const serviceMaintenanceData = serviceMaintenanceDataMap[serviceMaintenanceId];
            await ServiceMaintenanceUtils.updateServiceMaintenance(
                serviceMaintenanceId, serviceMaintenanceData
            );
            delete updateMap[serviceMaintenanceId];
            serviceMaintenanceDefaultDataMap[serviceMaintenanceId] = { ...serviceMaintenanceData };

        }

    }

    async function validateServiceMaintenanceDate(date: Date | null): Promise<boolean> {

        if (!date) return false;
        const dateKey: string = getDateKey(date);
        if (!(dateKey in pageData.serviceMaintenanceDateKeyMap)) return true;
        alert("Date already chosen!");
        return false;

    }

    useEffect(() => { loadPageData(); }, []);

    return <>

        <EmployeeSidebar />
        <form onSubmit={submit}>
            <div className="servman-container">
                <div className="service-main-content">
                    <label htmlFor="service-main-content" className="service-management-location">Services & Packages - {pageData.serviceName}</label>
                    <div className="service-form-section">
                        <div className="service-header">
                            <button onClick={() => navigate(-1)} className="service-back-arrow" aria-label="Back" style={{ background: "none", border: "none", padding: 0 }}><img src={BackButton} alt="Back" className="back-icon" /></button>
                            <h1>{pageData.serviceName}</h1>
                        </div>

                        <div>
                            <div className="service-form-row-group">
                                <div className="service-form-row">
                                    <label htmlFor="service-name">Name</label>
                                    <FormTinyTextInput documentData={pageData.serviceData} documentDefaultData={pageData.serviceDefaultData} documentId={documentId} keyName="name" name="service-name" pageData={pageData} required={true} />
                                </div>
                            </div>

                            <div className="service-form-row">
                                <label htmlFor="service-description">Description</label>
                                <FormTextArea documentData={pageData.serviceData} documentDefaultData={pageData.serviceDefaultData} documentId={documentId} keyName="description" name="service-description" pageData={pageData} required={true} />
                            </div>

                            <div className="service-form-row-group">
                                <div className="service-form-row">
                                    <label htmlFor="service-type">Service Type</label>
                                    <FormSelect documentData={pageData.serviceData} documentDefaultData={pageData.serviceDefaultData} documentId={documentId} name="service-type" keyName="serviceType" optionList={SpaRadiseEnv.SERVICE_TYPE_LIST} pageData={pageData} required={true}>
                                        <option value="" disabled>Select Service Type</option>
                                        <option value="body">Body</option>
                                        <option value="browsAndLashes">Brows and Lashes</option>
                                        <option value="facial">Facial</option>
                                        <option value="handsAndFeet">Hands and Feet</option>
                                        <option value="health">Health</option>
                                        <option value="wax">Wax</option>
                                    </FormSelect>
                                </div>
                                <div className="service-form-row">
                                    <label htmlFor="service-room-type">Room Type</label>
                                    <FormSelect documentData={pageData.serviceData} documentDefaultData={pageData.serviceDefaultData} documentId={documentId} keyName="roomType" name="service-room-type" optionList={SpaRadiseEnv.ROOM_TYPE_LIST} pageData={pageData} required={true}>
                                        <option value="" disabled>Select Service Type</option>
                                        <option value="room">Room</option>
                                        <option value="chair">Chair</option>
                                    </FormSelect>
                                </div>
                            </div>

                            <div className="service-form-row-group">
                                <div className="service-form-row">
                                    <label htmlFor="service-duration">Duration (minutes)</label>
                                    <FormSelect documentData={pageData.serviceData} documentDefaultData={pageData.serviceDefaultData} documentId={documentId} keyName="durationMin" name="service-duration" optionList={SpaRadiseEnv.SERVICE_DURATION_LIST} pageData={pageData} required={true}>
                                        <option value="" disabled>Select duration</option>
                                        <option value="30">30</option>
                                        <option value="60">60</option>
                                    </FormSelect>
                                </div>
                                <div className="service-form-row">
                                    <label htmlFor="service-age-limit">Age Limit</label>
                                    <FormNaturalNumberInput documentData={pageData.serviceData} documentDefaultData={pageData.serviceDefaultData} documentId={documentId} keyName="ageLimit" min={13} name="service-age-limit" pageData={pageData} required={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="service-maintenance">

                        <label htmlFor="service-maintenance" className="service-maintenance-label">Service Maintenance:</label>

                        <button type="button" className="addServiceMaintenanceButton" onClick={addServiceMaintenance}>+ Add Maintenance</button>
                        <table className="service-history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Price</th>
                                    <th>Commission (%)</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    Object.keys(pageData.serviceMaintenanceDateKeyMap).sort().map((keyDate, key) => {

                                        const
                                            {
                                                serviceMaintenanceDataMap,
                                                serviceMaintenanceDateKeyMap,
                                                serviceMaintenanceDefaultDataMap,
                                                serviceMaintenanceToDeleteMap
                                            } = pageData,
                                            documentId: string | number = serviceMaintenanceDateKeyMap[keyDate],
                                            inputDocumentId: string | undefined = (!NumberUtils.isNumeric(documentId) ? documentId as string : undefined),
                                            serviceMaintenanceData: ServiceMaintenanceData = serviceMaintenanceDataMap[documentId],
                                            serviceMaintenanceDefaultData: ServiceMaintenanceData = serviceMaintenanceDefaultDataMap[documentId]
                                            ;
                                        if (serviceMaintenanceToDeleteMap[documentId]) return undefined;
                                        return <tr key={key}>
                                            <td>
                                                <FormDateInput
                                                    documentData={serviceMaintenanceData}
                                                    documentDefaultData={serviceMaintenanceDefaultData}
                                                    documentId={inputDocumentId} keyName="date"
                                                    onChange={(date, _, old) => handleServiceMaintenanceDateChange(documentId, date, old)}
                                                    pageData={pageData} required={true}
                                                    validate={date => validateServiceMaintenanceDate(date)}
                                                />
                                            </td>
                                            <td>
                                                ₱<FormMoneyInput documentData={serviceMaintenanceData} documentDefaultData={serviceMaintenanceDefaultData} documentId={inputDocumentId} keyName="price" min={0.01} pageData={pageData} required={true} />
                                            </td>
                                            <td>
                                                <FormPercentageInput documentData={serviceMaintenanceData} documentDefaultData={serviceMaintenanceDefaultData} documentId={inputDocumentId} keyName="commissionPercentage" min={0.01} pageData={pageData} required={true} />
                                            </td>
                                            <td>
                                                <FormSelect documentData={serviceMaintenanceData} documentDefaultData={serviceMaintenanceDefaultData} documentId={inputDocumentId} keyName="status" optionList={SpaRadiseEnv.SERVICE_MAINTENANCE_STATUS_LIST} pageData={pageData} required={true}>
                                                    <option value="" disabled>Select Service Type</option>
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </FormSelect>
                                            </td>
                                            <td>
                                                <button className="service-maintenance-delete-btn" type="button" onClick={() => deleteServiceMaintenance(documentId)}>Delete</button>
                                            </td>
                                        </tr>
                                    })
                                }
                            </tbody>
                        </table>

                        <div className="service-form-actions">
                            {
                                isEditMode ? <button className="service-delete-btn" type="button" onClick={deleteService}>Delete</button>
                                    : undefined
                            }
                            <button className="service-cancel-btn" type="button" onClick={cancelServiceForm}>Cancel</button>
                            <button className="service-save-btn" type="submit">{isNewMode ? "Create" : "Save Changes"}</button>
                            {
                                IS_DEV_MODE ? <button style={{}} type="button" onClick={() => console.log(pageData)}>Log page data</button>
                                    : undefined
                            }
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
