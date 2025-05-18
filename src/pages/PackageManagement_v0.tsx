import DataMapUtils from "../firebase/SpaRadiseDataMapUtils";
import DateUtils from "../utils/DateUtils";
import { DocumentReference } from "firebase/firestore/lite";
import FormDateInput from "../components/FormDateInput";
import {
    FormEvent,
    useEffect,
    useState
} from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import FormMoneyInput from "../components/FormMoneyInput";
import FormSelect from "../components/FormSelect";
import FormTextArea from "../components/FormTextArea";
import FormTinyTextInput from "../components/FormTinyTextInput";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import {
    PackageData,
    PackageMaintenanceData,
    PackageMaintenanceDataMap,
    PackageServiceDataMap,
    ServiceDataMap,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import PackageUtils from "../firebase/PackageUtils";
import PackageMaintenanceUtils from "../firebase/PackageMaintenanceUtils";
import PackageServiceUtils from "../firebase/PackageServiceUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import { useParams } from "react-router-dom";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";
import "../styles/EmployeeServiceManagement.css";
import "../styles/Sidebar.css";
import EmployeeSidebar from "../components/EmployeeSidebar";
import BackButton from "../images/back button.png";
import SpaRadiseLogo from "../images/SpaRadise Logo.png";

interface PackageManagementPageData extends SpaRadisePageData {

    packageDefaultData: PackageData,
    packageData: PackageData,
    packageDocumentReference?: DocumentReference,
    packageMaintenanceDefaultDataMap: PackageMaintenanceDataMap,
    packageMaintenanceDataMap: PackageMaintenanceDataMap,
    packageMaintenanceDateKeyMap: { [yyyymmdd: string]: documentId | number },
    packageMaintenanceIndex: number,
    packageMaintenanceToDeleteMap: { [packageMaintenanceId: documentId]: boolean },
    packageServiceDataMap: PackageServiceDataMap,
    packageServiceIncludedMap: { [serviceId: documentId]: documentId | number },
    packageServiceIndex: number,
    packageServiceToDeleteMap: { [packageServiceId: documentId]: boolean },
    serviceDataMap: ServiceDataMap,
    packageName: string

}

export default function PackageManagement(): JSX.Element {

    const
        [pageData, setPageData] = useState<PackageManagementPageData>({
            loaded: false,
            packageData: {
                name: null as unknown as string,
                description: null as unknown as string
            },
            packageDefaultData: {} as PackageData,
            packageMaintenanceDataMap: {},
            packageMaintenanceDefaultDataMap: {},
            packageMaintenanceDateKeyMap: {},
            packageMaintenanceIndex: 0,
            packageMaintenanceToDeleteMap: {},
            packageServiceDataMap: {},
            packageServiceIncludedMap: {},
            packageServiceIndex: 0,
            packageServiceToDeleteMap: {},
            serviceDataMap: {},
            updateMap: {},
            packageName: "New Package"
        }),
        documentId: string | undefined = useParams().id,
        isNewMode: boolean = (documentId === "new"),
        isEditMode: boolean = (documentId !== undefined && !isNewMode),
        navigate = useNavigate()

        ;

    async function addPackageMaintenance(): Promise<void> {

        const {
            packageMaintenanceDateKeyMap,
            packageMaintenanceToDeleteMap
        } = pageData;
        let
            date: Date = new Date(),
            dateKey: string = getDateKey(date)
            ;
        while (dateKey in packageMaintenanceDateKeyMap) {

            const packageMaintenanceId = packageMaintenanceDateKeyMap[dateKey] as string;
            if (packageMaintenanceId in packageMaintenanceToDeleteMap) {

                await restorePackageMaintenance(packageMaintenanceId);
                return;

            }
            date = DateUtils.addTime(date, { day: 1 });
            dateKey = getDateKey(date);

        }
        const { packageMaintenanceDataMap, packageMaintenanceIndex } = pageData;
        packageMaintenanceDataMap[packageMaintenanceIndex] = {
            package: null as unknown as DocumentReference,
            date,
            price: null as unknown as number,
            status: null as unknown as packageMaintenanceStatus
        }
        pageData.packageMaintenanceIndex++;
        packageMaintenanceDateKeyMap[dateKey] = packageMaintenanceIndex;
        reloadPageData();

    }

    async function addPackageService(serviceId: string): Promise<void> {

        const
            { packageServiceIncludedMap, packageServiceToDeleteMap } = pageData,
            packageServiceId = packageServiceIncludedMap[serviceId] as string
            ;
        if (packageServiceId in packageServiceToDeleteMap) {

            await restorePackageServiceInclusion(packageServiceId);
            return;

        }
        const
            {
                packageServiceDataMap,
                packageServiceIndex
            } = pageData
            ;
        packageServiceDataMap[packageServiceIndex] = {
            package: null as unknown as DocumentReference,
            service: SpaRadiseFirestore.getDocumentReference(
                serviceId, SpaRadiseEnv.SERVICE_COLLECTION
            )
        };
        pageData.packageServiceIndex++;
        packageServiceIncludedMap[serviceId] = packageServiceIndex;
        reloadPageData();

    }

    async function cancelPackageForm(): Promise<void> {

        window.open(`/management/packages/menu`, `_self`);

    }

    async function checkFormValidity(): Promise<boolean> {

        const {
            packageData,
            packageMaintenanceDateKeyMap,
            packageMaintenanceToDeleteMap,
            packageServiceIncludedMap,
            packageServiceToDeleteMap
        } = pageData;
        if (packageData.name === "New Package")
            throw new Error(`Package name cannot be "New Package"!`);
        // check if duplicate name
        const noServices: number =
            ObjectUtils.keyLength(packageServiceIncludedMap)
            - ObjectUtils.keyLength(packageServiceToDeleteMap)
            ;
        if (noServices < 2)
            throw new Error(`There must be at least 2 package services.`);
        const noMaintenances: number =
            ObjectUtils.keyLength(packageMaintenanceDateKeyMap)
            - ObjectUtils.keyLength(packageMaintenanceToDeleteMap)
            ;
        if (noMaintenances < 1)
            throw new Error(`There must be at least 1 package maintenance.`);
        return true;

    }

    async function createPackage(): Promise<void> {

        if (!isNewMode || !documentId) return;
        await checkFormValidity();
        const documentReference: DocumentReference = await PackageUtils.createPackage(
            pageData.packageData
        );
        pageData.packageDocumentReference = documentReference;
        await updatePackageMaintenanceList();
        await updatePackageServiceList();
        delete pageData.updateMap["new"];
        alert(`Created!`); // note: remove later
        window.open(`/management/packages/${documentReference.id}`, `_self`);

    }

    async function createPackageMaintenanceList(): Promise<void> {

        const {
            packageDocumentReference,
            packageMaintenanceDataMap,
            packageMaintenanceDefaultDataMap,
            packageMaintenanceDateKeyMap
        } = pageData;
        if (!packageDocumentReference) return;
        for (let packageMaintenanceId in packageMaintenanceDataMap) {

            const isNew: boolean = NumberUtils.isNumeric(packageMaintenanceId);
            if (!isNew) continue;
            const packageMaintenanceData = packageMaintenanceDataMap[packageMaintenanceId];
            packageMaintenanceData.package = packageDocumentReference;
            const
                packageMaintenanceDocumentReference =
                    await PackageMaintenanceUtils.createPackageMaintenance(packageMaintenanceData)
                ,
                packageMaintenanceIdNew: string = packageMaintenanceDocumentReference.id,
                dateKey: string = getDateKey(packageMaintenanceData.date)
                ;
            delete packageMaintenanceDataMap[packageMaintenanceId];
            packageMaintenanceDataMap[packageMaintenanceIdNew] = packageMaintenanceData;
            packageMaintenanceDateKeyMap[dateKey] = packageMaintenanceIdNew;

        }
        pageData.packageMaintenanceDefaultDataMap = DataMapUtils.clone(packageMaintenanceDataMap);

    }

    async function createPackageServiceList(): Promise<void> {

        const {
            packageDocumentReference,
            packageServiceDataMap,
            packageServiceIncludedMap
        } = pageData;
        if (!packageDocumentReference) return;
        for (let packageServiceId in packageServiceDataMap) {

            const isNew: boolean = NumberUtils.isNumeric(packageServiceId);
            if (!isNew) continue;
            const packageServiceData = packageServiceDataMap[packageServiceId];
            packageServiceData.package = packageDocumentReference;
            const
                packageServiceDocumentReference =
                    await PackageServiceUtils.createPackageService(packageServiceData)
                ,
                packageServiceIdNew: string = packageServiceDocumentReference.id,
                serviceId: string = packageServiceData.service.id
                ;
            delete packageServiceDataMap[packageServiceId];
            packageServiceDataMap[packageServiceIdNew] = packageServiceData;
            packageServiceIncludedMap[serviceId] = packageServiceIdNew;

        }

    }

    async function deletePackage(): Promise<void> {

        if (!isEditMode || !documentId) return;
        const {
            packageMaintenanceDataMap, packageServiceDataMap, packageServiceIncludedMap
        } = pageData;
        for (let packageMaintenanceId in packageMaintenanceDataMap)
            await deletePackageMaintenance(packageMaintenanceId);
        await updatePackageMaintenanceList();
        for (let packageServiceId in packageServiceDataMap)
            await deletePackageService(packageServiceIncludedMap[packageServiceId] as string);
        await updatePackageServiceList();
        await PackageUtils.deletePackage(documentId);
        alert(`Deleted!`); // note: remove later
        window.open(`/management/packages/menu`, `_self`);

    }

    async function deletePackageMaintenance(
        packageMaintenanceId: documentId | number
    ): Promise<void> {

        const
            {
                packageMaintenanceDataMap,
                packageMaintenanceDateKeyMap,
                packageMaintenanceToDeleteMap
            } = pageData,
            packageMaintenanceData: PackageMaintenanceData = packageMaintenanceDataMap[
                packageMaintenanceId
            ],
            dateKey: string = getDateKey(packageMaintenanceData.date),
            isNewPackageMaintenance: boolean = (
                (typeof packageMaintenanceId === "number")
                || NumberUtils.isNumeric(packageMaintenanceId)
            )
            ;
        if (isNewPackageMaintenance) {

            delete packageMaintenanceDataMap[packageMaintenanceId];
            delete packageMaintenanceDateKeyMap[dateKey];

        } else
            packageMaintenanceToDeleteMap[packageMaintenanceId] = true;
        reloadPageData();

    }

    async function deletePackageMaintenanceListInToDeleteMap(): Promise<void> {

        const {
            packageMaintenanceDataMap,
            packageMaintenanceDefaultDataMap,
            packageMaintenanceDateKeyMap,
            packageMaintenanceToDeleteMap
        } = pageData;
        for (let packageMaintenanceId in packageMaintenanceToDeleteMap) {

            const dateKey: string = getDateKey(packageMaintenanceDataMap[packageMaintenanceId].date);
            await PackageMaintenanceUtils.deletePackageMaintenance(packageMaintenanceId);
            delete packageMaintenanceDataMap[packageMaintenanceId];
            delete packageMaintenanceDefaultDataMap[packageMaintenanceId];
            delete packageMaintenanceDateKeyMap[dateKey];
            delete packageMaintenanceToDeleteMap[packageMaintenanceId];

        }

    }

    async function deletePackageService(serviceId: documentId): Promise<void> {

        const
            {
                packageServiceDataMap,
                packageServiceIncludedMap,
                packageServiceToDeleteMap
            } = pageData,
            packageServiceId: string | number = packageServiceIncludedMap[serviceId],
            isNewPackageService: boolean = NumberUtils.isNumeric(packageServiceId)
            ;
        if (isNewPackageService) {

            delete packageServiceDataMap[packageServiceId];
            delete packageServiceIncludedMap[serviceId];

        } else
            packageServiceToDeleteMap[packageServiceId] = true;
        reloadPageData();

    }

    async function deletePackageServiceListInToDeleteMap(): Promise<void> {

        const {
            packageServiceDataMap,
            packageServiceIncludedMap,
            packageServiceToDeleteMap
        } = pageData;
        for (let packageServiceId in packageServiceToDeleteMap) {

            const serviceId: string = packageServiceDataMap[packageServiceId].service.id;
            await PackageServiceUtils.deletePackageService(packageServiceId);
            delete packageServiceDataMap[packageServiceId];
            delete packageServiceIncludedMap[serviceId];
            delete packageServiceToDeleteMap[packageServiceId];

        }

    }

    function getDateKey(date: Date): string {

        return DateUtils.toString(date, "yyyymmdd");

    }

    function handlePackageMaintenanceDateChange(
        packageMaintenanceId: string | number, date: Date | null, old: Date | null
    ): void {

        if (!date || !old) return;
        const
            { packageMaintenanceDateKeyMap } = pageData,
            dateKeyOld: string = getDateKey(old),
            dateKeyNew: string = getDateKey(date)
            ;
        delete packageMaintenanceDateKeyMap[dateKeyOld];
        packageMaintenanceDateKeyMap[dateKeyNew] = packageMaintenanceId;

    }

    async function loadPackage(): Promise<void> {

        if (!documentId) return;
        pageData.packageDocumentReference = SpaRadiseFirestore.getDocumentReference(
            documentId, SpaRadiseEnv.PACKAGE_COLLECTION
        );
        pageData.packageData = await PackageUtils.getPackageData(documentId);
        pageData.packageName = pageData.packageData.name;
        pageData.packageDefaultData = { ...pageData.packageData };
        await loadPackageMaintenanceList();
        await loadPackageServiceList();

    }

    async function loadPackageMaintenanceList(): Promise<void> {

        if (!documentId) return;
        pageData.packageMaintenanceDataMap =
            await PackageMaintenanceUtils.getPackageMaintenanceDataMapByPackage(documentId)
            ;
        const { packageMaintenanceDataMap, packageMaintenanceDateKeyMap } = pageData;
        pageData.packageMaintenanceDefaultDataMap = DataMapUtils.clone(packageMaintenanceDataMap);
        for (let packageMaintenanceId in packageMaintenanceDataMap) {

            const dateKey: string = getDateKey(
                packageMaintenanceDataMap[packageMaintenanceId].date
            );
            packageMaintenanceDateKeyMap[dateKey] = packageMaintenanceId;

        }

    }

    async function loadPackageServiceList(): Promise<void> {

        if (!documentId) return;
        pageData.packageServiceDataMap =
            await PackageServiceUtils.getPackageServiceListByPackage(documentId)
            ;
        const { packageServiceDataMap, packageServiceIncludedMap } = pageData;
        for (let packageServiceId in packageServiceDataMap) {

            const serviceId: string = packageServiceDataMap[packageServiceId].service.id;
            packageServiceIncludedMap[serviceId] = packageServiceId;

        }

    }

    async function loadPageData(): Promise<void> {

        if (!documentId) return;
        pageData.serviceDataMap = await ServiceUtils.getServiceDataMapAll();
        if (isEditMode) await loadPackage();
        pageData.loaded = true;
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    async function restorePackageMaintenance(packageMaintenanceId: documentId): Promise<void> {

        const { packageMaintenanceToDeleteMap } = pageData;
        delete packageMaintenanceToDeleteMap[packageMaintenanceId];
        reloadPageData();

    }

    async function restorePackageServiceInclusion(packageServiceId: string): Promise<void> {

        const { packageServiceToDeleteMap } = pageData;
        delete packageServiceToDeleteMap[packageServiceId];
        reloadPageData();

    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {

        event.preventDefault();
        if (isNewMode)
            await createPackage();
        else
            await updatePackage();

    }

    async function updatePackage(): Promise<void> {

        if (!isEditMode || !documentId) return;
        await checkFormValidity();
        const { packageData, updateMap } = pageData;
        if (documentId in updateMap) {

            await PackageUtils.updatePackage(documentId, pageData.packageData);
            pageData.packageDefaultData = { ...pageData.packageData };
            pageData.packageName = packageData.name;

        }
        delete updateMap[documentId];
        await updatePackageMaintenanceList();
        await updatePackageServiceList();
        reloadPageData();

    }

    async function updatePackageMaintenanceList(): Promise<void> {

        await deletePackageMaintenanceListInToDeleteMap();
        await updatePackageMaintenanceListInUpdateMap();
        await createPackageMaintenanceList();

    }

    async function updatePackageMaintenanceListInUpdateMap(): Promise<void> {

        const {
            packageMaintenanceDataMap,
            packageMaintenanceDefaultDataMap,
            updateMap
        } = pageData;
        for (let packageMaintenanceId in updateMap) {

            const isPackageMaintenanceId: boolean = packageMaintenanceId in packageMaintenanceDataMap;
            if (!isPackageMaintenanceId) continue;
            const packageMaintenanceData = packageMaintenanceDataMap[packageMaintenanceId];
            await PackageMaintenanceUtils.updatePackageMaintenance(
                packageMaintenanceId, packageMaintenanceData
            );
            delete updateMap[packageMaintenanceId];
            packageMaintenanceDefaultDataMap[packageMaintenanceId] = { ...packageMaintenanceData };

        }

    }

    async function updatePackageServiceList(): Promise<void> {

        await deletePackageServiceListInToDeleteMap();
        await createPackageServiceList();

    }

    async function validatePackageMaintenanceDate(date: Date | null): Promise<boolean> {

        if (!date) return false;
        const dateKey: string = getDateKey(date);
        if (!(dateKey in pageData.packageMaintenanceDateKeyMap)) return true;
        alert("Date already chosen!");
        return false;

    }

    useEffect(() => { loadPageData(); }, []);

    return <>
        <form onSubmit={submit}>
            <EmployeeSidebar />
            <div className="service-main-content">
                <label htmlFor="service-main-content" className="service-management-location">Services & Packages - {pageData.packageName}</label>
                <div className="service-form-section">
                    <div className="service-header">
                        <button onClick={() => navigate(-1)} className="service-back-arrow" aria-label="Back" style={{ background: "none", border: "none", padding: 0 }}><img src={BackButton} alt="Back" className="back-icon" /></button>

                        <h1>{pageData.packageName}</h1>
                    </div>
                    <div className="service-form-row-group">
                        <div className="service-form-row">
                            <label htmlFor="service-name">Name</label>
                            <FormTinyTextInput documentData={pageData.packageData} documentDefaultData={pageData.packageDefaultData} documentId={documentId} keyName="name" pageData={pageData} required={true} />
                        </div>
                    </div>
                    <div className="service-form-row-group">
                        <div className="service-form-row">
                            <label htmlFor="service-name">Description</label>
                            <FormTextArea documentData={pageData.packageData} documentDefaultData={pageData.packageDefaultData} documentId={documentId} keyName="description" pageData={pageData} required={true} />
                        </div>
                    </div>

                    <div className="section-label"> Select Services:
                        <div id="services-list">
                            <div className="service-scroll-container">
                                {
                                    Object.keys(pageData.serviceDataMap).map((serviceId, key) => {
                                        const service = pageData.serviceDataMap[serviceId];
                                        const packageServiceId: string | number = pageData.packageServiceIncludedMap[serviceId];

                                        return (
                                            <div className="service-scroll-item">
                                                <div className="service-name" key={key}>
                                                    {service.name}</div>
                                                <div className="service-description" key={key}>
                                                    {service.description}</div>

                                                {
                                                    !(serviceId in pageData.packageServiceIncludedMap) ||
                                                        packageServiceId in pageData.packageServiceToDeleteMap ? (
                                                        <button className="add-btn" type="button" onClick={() => addPackageService(serviceId)}>Add</button>
                                                    ) : (
                                                        <button className="remove-btn" type="button" onClick={() => deletePackageService(serviceId)}>Remove</button>
                                                    )
                                                }
                                            </div>
                                        );
                                    })
                                }


                            </div>
                        </div>
                    </div>

                </div>
                <div className="service-maintenance">
                    <label htmlFor="service-maintenance" className="service-maintenance-label">Package
                        Maintenance:
                    </label>
                    <button className="addServiceMaintenanceButton" type="button" onClick={addPackageMaintenance}>+ Add Maintenance</button>
                    <table className="service-history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                Object.keys(pageData.packageMaintenanceDateKeyMap).sort().map((keyDate, key) => {

                                    const
                                        {
                                            packageMaintenanceDataMap,
                                            packageMaintenanceDateKeyMap,
                                            packageMaintenanceDefaultDataMap,
                                            packageMaintenanceToDeleteMap
                                        } = pageData,
                                        documentId: string | number = packageMaintenanceDateKeyMap[keyDate],
                                        inputDocumentId: string | undefined = (!NumberUtils.isNumeric(documentId) ? documentId as string : undefined),
                                        packageMaintenanceData: PackageMaintenanceData = packageMaintenanceDataMap[documentId],
                                        packageMaintenanceDefaultData: PackageMaintenanceData = packageMaintenanceDefaultDataMap[documentId]
                                        ;
                                    if (packageMaintenanceToDeleteMap[documentId]) return undefined;
                                    return <tr key={key}>
                                        <td>
                                            <FormDateInput
                                                documentData={packageMaintenanceData}
                                                documentDefaultData={packageMaintenanceDefaultData}
                                                documentId={inputDocumentId} keyName="date"
                                                onChange={(date, _, old) => handlePackageMaintenanceDateChange(documentId, date, old)}
                                                pageData={pageData} required={true}
                                                validate={date => validatePackageMaintenanceDate(date)}
                                            />
                                        </td>
                                        <td>
                                            <FormMoneyInput documentData={packageMaintenanceData} documentDefaultData={packageMaintenanceDefaultData} documentId={inputDocumentId} keyName="price" min={0.01} pageData={pageData} required={true} />
                                        </td>
                                        <td>
                                            <FormSelect documentData={packageMaintenanceData} documentDefaultData={packageMaintenanceDefaultData} documentId={inputDocumentId} keyName="status" optionList={SpaRadiseEnv.SERVICE_MAINTENANCE_STATUS_LIST} pageData={pageData} required={true}>
                                                <option value="" disabled>Select Package Type</option>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </FormSelect>
                                        </td>
                                        <td>
                                            <button className="service-maintenance-delete-btn" type="button" onClick={() => deletePackageMaintenance(documentId)}>Delete</button>
                                        </td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>

                    <div className="service-form-actions">
                        <button type="button" onClick={() => console.log(pageData)}>Log page data</button>
                        <button className="service-delete-btn" type="button" onClick={deletePackage}>Delete</button>
                        <button className="service-save-btn" type="submit">Submit</button>
                    </div>
                </div>
            </div>
        </form>

    </>

}
