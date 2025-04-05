import { DocumentReference } from "firebase/firestore/lite";
import {
    FormEvent,
    useEffect,
    useState
} from "react";
import FormMoneyOrPercentageInput from "../components/FormMoneyOrPercentageInput";
import FormTinyTextInput from "../components/FormTinyTextInput";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import PackageUtils from "../firebase/PackageUtils";
import {
    ServiceData,
    PackageData,
    PackageDataMap,
    ServiceDataMap,
    SpaRadisePageData,
    VoucherData,
    VoucherPackageDataMap,
    VoucherServiceDataMap
} from "../firebase/SpaRadiseTypes";
import VoucherUtils from "../firebase/VoucherUtils";
import VoucherPackageUtils from "../firebase/VoucherPackageUtils";
import VoucherServiceUtils from "../firebase/VoucherServiceUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import { useParams } from "react-router-dom";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";
import EmployeeSidebar from "../components/EmployeeSidebar";
import BackButton from "../images/back button.png";
import SpaRadiseLogo from "../images/SpaRadise Logo.png";

interface VoucherManagementPageData extends SpaRadisePageData {

    packageDataMap: PackageDataMap,
    serviceDataMap: ServiceDataMap,
    voucherData: VoucherData,
    voucherDefaultData: VoucherData,
    voucherDocumentReference?: DocumentReference,
    voucherPackageDataMap: VoucherPackageDataMap,
    voucherPackageIncludedMap: { [packageId: documentId]: documentId | number },
    voucherPackageIndex: number,
    voucherPackageToDeleteMap: { [voucherPackageId: documentId]: boolean },
    voucherServiceDataMap: VoucherServiceDataMap,
    voucherServiceIncludedMap: { [serviceId: documentId]: documentId | number },
    voucherServiceIndex: number,
    voucherServiceToDeleteMap: { [voucherServiceId: documentId]: boolean },
    serviceData: ServiceData,
    packageData: PackageData

}

export default function VoucherManagement(): JSX.Element {

    const
        [pageData, setPageData] = useState<VoucherManagementPageData>({
            loaded: false,
            packageDataMap: {},
            serviceDataMap: {},
            updateMap: {},
            voucherData: {
                name: null as unknown as string,
                code: null as unknown as string,
                amount: null,
                percentage: null
            },
            voucherDefaultData: {} as VoucherData,
            voucherPackageDataMap: {},
            voucherPackageIncludedMap: {},
            voucherPackageIndex: 0,
            voucherPackageToDeleteMap: {},
            voucherServiceDataMap: {},
            voucherServiceIncludedMap: {},
            voucherServiceIndex: 0,
            voucherServiceToDeleteMap: {},
            serviceData: {
                name: null as unknown as string,
                description: null as unknown as string,
                serviceType: null as unknown as serviceType,
                roomType: null as unknown as roomType,
                ageLimit: null as unknown as number,
                durationMin: null as unknown as ( 30 | 60 )
            },
            packageData: {
                name: null as unknown as string,
                description: null as unknown as string
            }
        }),
        documentId: string | undefined = useParams().id,
        isNewMode: boolean = (documentId === "new"),
        isEditMode: boolean = (documentId !== undefined && !isNewMode)
        ;

    async function addVoucherPackage(packageId: string): Promise<void> {

        const
            { voucherPackageIncludedMap, voucherPackageToDeleteMap } = pageData,
            voucherPackageId = voucherPackageIncludedMap[packageId] as string
            ;
        if (voucherPackageId in voucherPackageToDeleteMap) {

            await restoreVoucherPackageInclusion(voucherPackageId);
            return;

        }
        const
            {
                voucherPackageDataMap,
                voucherPackageIndex
            } = pageData
            ;
        voucherPackageDataMap[voucherPackageIndex] = {
            voucher: null as unknown as DocumentReference,
            package: SpaRadiseFirestore.getDocumentReference(
                packageId, SpaRadiseEnv.PACKAGE_COLLECTION
            )
        };
        pageData.voucherPackageIndex++;
        voucherPackageIncludedMap[packageId] = voucherPackageIndex;
        reloadPageData();

    }

    async function addVoucherService(serviceId: string): Promise<void> {

        const
            { voucherServiceIncludedMap, voucherServiceToDeleteMap } = pageData,
            voucherServiceId = voucherServiceIncludedMap[serviceId] as string
            ;
        if (voucherServiceId in voucherServiceToDeleteMap) {

            await restoreVoucherServiceInclusion(voucherServiceId);
            return;

        }
        const
            {
                voucherServiceDataMap,
                voucherServiceIndex
            } = pageData
            ;
        voucherServiceDataMap[voucherServiceIndex] = {
            voucher: null as unknown as DocumentReference,
            service: SpaRadiseFirestore.getDocumentReference(
                serviceId, SpaRadiseEnv.SERVICE_COLLECTION
            )
        };
        pageData.voucherServiceIndex++;
        voucherServiceIncludedMap[serviceId] = voucherServiceIndex;
        reloadPageData();

    }

    async function cancelVoucherForm(): Promise<void> {

        window.open(`/management/vouchers/menu`, `_self`);

    }

    async function checkFormValidity(): Promise<boolean> {

        const {
            voucherData,
            voucherPackageIncludedMap,
            voucherPackageToDeleteMap,
            voucherServiceIncludedMap,
            voucherServiceToDeleteMap
        } = pageData;
        if (voucherData.name === "New Voucher")
            throw new Error(`Voucher name cannot be "New Voucher"!`);
        // check if duplicate name
        if (!voucherData.amount && !voucherData.percentage)
            throw new Error(`Voucher must have amount/percentage deduction!`);
        const noServicesAndPackages: number =
            ObjectUtils.keyLength(voucherPackageIncludedMap)
            - ObjectUtils.keyLength(voucherPackageToDeleteMap)
            + ObjectUtils.keyLength(voucherServiceIncludedMap)
            - ObjectUtils.keyLength(voucherServiceToDeleteMap)
            ;
        if (noServicesAndPackages < 1)
            throw new Error(`There must be at least 1 voucher services/packages.`);
        return true;

    }

    async function createVoucher(): Promise<void> {

        if (!isNewMode || !documentId) return;
        await checkFormValidity();
        const documentReference: DocumentReference = await VoucherUtils.createVoucher(
            pageData.voucherData
        );
        pageData.voucherDocumentReference = documentReference;
        await updateVoucherPackageList();
        await updateVoucherServiceList();
        delete pageData.updateMap["new"];
        alert(`Created!`); // note: remove later
        window.open(`/management/vouchers/${documentReference.id}`, `_self`);

    }

    async function createVoucherPackageList(): Promise<void> {

        const {
            voucherDocumentReference,
            voucherPackageDataMap,
            voucherPackageIncludedMap
        } = pageData;
        if (!voucherDocumentReference) return;
        for (let voucherPackageId in voucherPackageDataMap) {

            const isNew: boolean = NumberUtils.isNumeric(voucherPackageId);
            if (!isNew) continue;
            const voucherPackageData = voucherPackageDataMap[voucherPackageId];
            voucherPackageData.voucher = voucherDocumentReference;
            const
                voucherPackageDocumentReference =
                    await VoucherPackageUtils.createVoucherPackage(voucherPackageData)
                ,
                voucherPackageIdNew: string = voucherPackageDocumentReference.id,
                packageId: string = voucherPackageData.package.id
                ;
            delete voucherPackageDataMap[voucherPackageId];
            voucherPackageDataMap[voucherPackageIdNew] = voucherPackageData;
            voucherPackageIncludedMap[packageId] = voucherPackageIdNew;

        }

    }

    async function createVoucherServiceList(): Promise<void> {

        const {
            voucherDocumentReference,
            voucherServiceDataMap,
            voucherServiceIncludedMap
        } = pageData;
        if (!voucherDocumentReference) return;
        for (let voucherServiceId in voucherServiceDataMap) {

            const isNew: boolean = NumberUtils.isNumeric(voucherServiceId);
            if (!isNew) continue;
            const voucherServiceData = voucherServiceDataMap[voucherServiceId];
            voucherServiceData.voucher = voucherDocumentReference;
            const
                voucherServiceDocumentReference =
                    await VoucherServiceUtils.createVoucherService(voucherServiceData)
                ,
                voucherServiceIdNew: string = voucherServiceDocumentReference.id,
                serviceId: string = voucherServiceData.service.id
                ;
            delete voucherServiceDataMap[voucherServiceId];
            voucherServiceDataMap[voucherServiceIdNew] = voucherServiceData;
            voucherServiceIncludedMap[serviceId] = voucherServiceIdNew;

        }

    }

    async function deleteVoucher(): Promise<void> {

        if (!isEditMode || !documentId) return;
        await updateVoucherPackageList();
        await updateVoucherServiceList();
        await VoucherUtils.deleteVoucher(documentId);
        alert(`Deleted!`); // note: remove later
        window.open(`/management/vouchers/menu`, `_self`);

    }

    async function deleteVoucherPackage(packageId: documentId): Promise<void> {

        const
            {
                voucherPackageDataMap,
                voucherPackageIncludedMap,
                voucherPackageToDeleteMap
            } = pageData,
            voucherPackageId: string | number = voucherPackageIncludedMap[packageId],
            isNewVoucherPackage: boolean = NumberUtils.isNumeric(voucherPackageId)
            ;
        if (isNewVoucherPackage) {

            delete voucherPackageDataMap[voucherPackageId];
            delete voucherPackageIncludedMap[packageId];

        } else
            voucherPackageToDeleteMap[voucherPackageId] = true;
        reloadPageData();

    }

    async function deleteVoucherService(serviceId: documentId): Promise<void> {

        const
            {
                voucherServiceDataMap,
                voucherServiceIncludedMap,
                voucherServiceToDeleteMap
            } = pageData,
            voucherServiceId: string | number = voucherServiceIncludedMap[serviceId],
            isNewVoucherService: boolean = NumberUtils.isNumeric(voucherServiceId)
            ;
        if (isNewVoucherService) {

            delete voucherServiceDataMap[voucherServiceId];
            delete voucherServiceIncludedMap[serviceId];

        } else
            voucherServiceToDeleteMap[voucherServiceId] = true;
        reloadPageData();

    }

    async function deleteVoucherPackageListInToDeleteMap(): Promise<void> {

        const {
            voucherPackageDataMap,
            voucherPackageIncludedMap,
            voucherPackageToDeleteMap
        } = pageData;
        for (let voucherPackageId in voucherPackageToDeleteMap) {

            const packageId: string = voucherPackageDataMap[voucherPackageId].package.id;
            await VoucherPackageUtils.deleteVoucherPackage(voucherPackageId);
            delete voucherPackageDataMap[voucherPackageId];
            delete voucherPackageIncludedMap[packageId];
            delete voucherPackageToDeleteMap[voucherPackageId];

        }

    }

    async function deleteVoucherServiceListInToDeleteMap(): Promise<void> {

        const {
            voucherServiceDataMap,
            voucherServiceIncludedMap,
            voucherServiceToDeleteMap
        } = pageData;
        for (let voucherServiceId in voucherServiceToDeleteMap) {

            const serviceId: string = voucherServiceDataMap[voucherServiceId].service.id;
            await VoucherServiceUtils.deleteVoucherService(voucherServiceId);
            delete voucherServiceDataMap[voucherServiceId];
            delete voucherServiceIncludedMap[serviceId];
            delete voucherServiceToDeleteMap[voucherServiceId];

        }

    }

    async function loadPageData(): Promise<void> {

        if (!documentId) return;
        pageData.serviceDataMap = await ServiceUtils.getServiceDataMapAll();
        pageData.packageDataMap = await PackageUtils.getPackageDataMapAll();
        if (isEditMode) await loadVoucher();
        pageData.loaded = true;
        reloadPageData();

    }

    async function loadVoucher(): Promise<void> {

        if (!documentId) return;
        pageData.voucherDocumentReference = SpaRadiseFirestore.getDocumentReference(
            documentId, SpaRadiseEnv.VOUCHER_COLLECTION
        );
        pageData.voucherData = await VoucherUtils.getVoucherData(documentId);
        pageData.voucherDefaultData = { ...pageData.voucherData };
        await loadVoucherPackageList();
        await loadVoucherServiceList();

    }

    async function loadVoucherPackageList(): Promise<void> {

        if (!documentId) return;
        pageData.voucherPackageDataMap =
            await VoucherPackageUtils.getVoucherPackageDataMapByVoucher(documentId)
            ;
        const { voucherPackageDataMap, voucherPackageIncludedMap } = pageData;
        for (let voucherPackageId in voucherPackageDataMap) {

            const serviceId: string = voucherPackageDataMap[voucherPackageId].package.id;
            voucherPackageIncludedMap[serviceId] = voucherPackageId;

        }

    }

    async function loadVoucherServiceList(): Promise<void> {

        if (!documentId) return;
        pageData.voucherServiceDataMap =
            await VoucherServiceUtils.getVoucherServiceDataMapByVoucher(documentId)
            ;
        const { voucherServiceDataMap, voucherServiceIncludedMap } = pageData;
        for (let voucherServiceId in voucherServiceDataMap) {

            const serviceId: string = voucherServiceDataMap[voucherServiceId].service.id;
            voucherServiceIncludedMap[serviceId] = voucherServiceId;

        }

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    async function restoreVoucherPackageInclusion(voucherPackageId: string): Promise<void> {

        const { voucherPackageToDeleteMap } = pageData;
        delete voucherPackageToDeleteMap[voucherPackageId];
        reloadPageData();

    }

    async function restoreVoucherServiceInclusion(voucherServiceId: string): Promise<void> {

        const { voucherServiceToDeleteMap } = pageData;
        delete voucherServiceToDeleteMap[voucherServiceId];
        reloadPageData();

    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {

        event.preventDefault();
        if (isNewMode)
            await createVoucher();
        else
            await updateVoucher();

    }

    async function updateVoucher(): Promise<void> {

        if (!isEditMode || !documentId) return;
        await checkFormValidity();
        const { updateMap } = pageData;
        if (documentId in updateMap) {

            await VoucherUtils.updateVoucher(documentId, pageData.voucherData);
            pageData.voucherDefaultData = { ...pageData.voucherData };

        }
        delete updateMap[documentId];
        await updateVoucherPackageList();
        await updateVoucherServiceList();
        reloadPageData();
        alert(`Updated!`); // note: remove later

    }

    async function updateVoucherPackageList(): Promise<void> {

        await deleteVoucherPackageListInToDeleteMap();
        await createVoucherPackageList();

    }

    async function updateVoucherServiceList(): Promise<void> {

        await deleteVoucherServiceListInToDeleteMap();
        await createVoucherServiceList();

    }

    useEffect(() => { loadPageData() }, []);

    return <>
        <EmployeeSidebar />
        <form onSubmit={submit}>
            <div className="service-main-content">
                <label htmlFor="service-main-content" className="service-management-location"> Vouchers - {pageData.voucherData.name}</label>
                <div className="service-form-section">
                    <div className="service-header">
                        <a href="#" className="service-back-arrow" aria-label="Back">
                            <img src={BackButton} alt="Back" className="back-icon" />
                        </a>
                        <h1>{pageData.voucherData.name}</h1>
                    </div>
                    <div className="service-form-row-group">
                        <div className="service-form-row">
                            <label htmlFor="voucher-name">Name</label>
                            <FormTinyTextInput documentData={pageData.voucherData} documentDefaultData={pageData.voucherDefaultData} documentId={documentId} keyName="name" name="voucher-name" pageData={pageData} required={true} />
                        </div>
                    </div>
                    <div className="service-form-row-group">
                        <div className="service-form-row">
                            <label htmlFor="voucher-code">Code</label>
                            <FormTinyTextInput documentData={pageData.voucherData} documentDefaultData={pageData.voucherDefaultData} documentId={documentId} keyName="code" name="voucher-code" pageData={pageData} required={true} />
                        </div>
                    </div>
                    <div className="service-form-row">
                        <div className="voucher-deduction">
                            <label htmlFor="voucher-deduction">Deductions:</label>
                            <FormMoneyOrPercentageInput documentData={pageData.voucherData} documentDefaultData={pageData.voucherDefaultData} documentId={documentId} keyNameMoney="amount" keyNamePercentage="percentage" name="amount" pageData={pageData} required={true} />
                        </div>
                    </div>

                    <div className="section-label"> Select Services:
                        <div id="services-list">
                            <div className="service-scroll-container">
                                {
                                    Object.keys(pageData.serviceDataMap).map((serviceId, key) => {
                                        const service = pageData.serviceDataMap[serviceId];
                                        const packageServiceId: string | number = pageData.voucherServiceIncludedMap[serviceId];

                                        return (
                                            <div className="service-scroll-item">
                                                <div className="service-name" key={key}>
                                                    {service.name}</div>
                                                <div className="service-description" key={key}>
                                                    {service.description}</div>

                                                {
                                                    !(serviceId in pageData.voucherServiceIncludedMap) ||
                                                        packageServiceId in pageData.voucherServiceIncludedMap ? (
                                                        <button className="add-btn" type="button" onClick={() => addVoucherService(serviceId)}>Add</button>
                                                    ) : (
                                                        <button className="remove-btn" type="button" onClick={() => deleteVoucherService(serviceId)}>Remove</button>
                                                    )
                                                }
                                            </div>
                                        );
                                    })
                                }


                            </div>
                        </div>
                    </div>
                    <div className="section-label"> Select Services:
                        <div id="services-list">
                            <div className="service-scroll-container">
                                {
                                    Object.keys(pageData.packageDataMap).map((packageId, key) => {
                                        const packages = pageData.packageDataMap[packageId];
                                        const packageServiceId: string | number = pageData.voucherPackageIncludedMap[packageId];

                                        return (
                                            <div className="service-scroll-item">
                                                <div className="package-name" key={key}>
                                                    {packages.name}</div>
                                                <div className="service-description" key={key}>
                                                    {packages.description}</div>

                                                {
                                                    !(packageId in pageData.voucherPackageIncludedMap) ||
                                                        packageServiceId in pageData.voucherPackageIncludedMap ? (
                                                        <button className="add-btn" type="button" onClick={() => addVoucherPackage(packageId)}>Add</button>
                                                    ) : (
                                                        <button className="remove-btn" type="button" onClick={() => deleteVoucherPackage(packageId)}>Remove</button>
                                                    )
                                                }
                                            </div>
                                        );
                                    })
                                }


                            </div>
                        </div>
                    </div>
                    {
                        Object.keys(pageData.packageDataMap).map((packageId, key) => {

                            const
                                package_ = pageData.packageDataMap[packageId],
                                voucherPackageId: string | number = pageData.voucherPackageIncludedMap[packageId]
                                ;
                            return <div key={key}>
                                {package_.name}
                                {
                                    (
                                        !(packageId in pageData.voucherPackageIncludedMap)
                                        || (voucherPackageId in pageData.voucherPackageToDeleteMap)
                                    ) ? (
                                        <button type="button" onClick={() => addVoucherPackage(packageId)}>Add</button>
                                    ) : (
                                        <button type="button" onClick={() => deleteVoucherPackage(packageId)}>Remove</button>
                                    )
                                }

                            </div>;

                        })
                    }

                    <button type="button" onClick={() => console.log(pageData)}>Log page data</button>
                    <button className="service-delete-btn" type="button" onClick={deleteVoucher}>Delete</button>
                    <button className="service-cancel-btn" type="button">Cancel</button>
                    <button className="service-save-btn" type="submit">Submit</button>
                </div>
            </div>
        </form>

    </>

}
