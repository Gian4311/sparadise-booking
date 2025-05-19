import { DocumentReference } from "firebase/firestore/lite";
import {
    FormEvent,
    useEffect,
    useState
} from "react";
import { useNavigate } from "react-router-dom";
import FormTextArea from "../components/FormTextArea";
import FormTinyTextInput from "../components/FormTinyTextInput";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import {
    AccountData,
    JobData,
    JobServiceDataMap,
    ServiceDataMap,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import JobUtils from "../firebase/JobUtils";
import JobServiceUtils from "../firebase/JobServiceUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import { useParams } from "react-router-dom";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";
import EmployeeSidebar from "../components/EmployeeSidebar";
import "../styles/EmployeeEmployeeManagement.css";
import BackButton from "../images/back button.png";

interface JobManagementPageData extends SpaRadisePageData {

    accountData: AccountData,
    jobData: JobData,
    jobDefaultData: JobData,
    jobDocumentReference?: DocumentReference,
    jobServiceDataMap: JobServiceDataMap,
    jobServiceIndex: number,
    jobServiceToDeleteMap: { [jobServiceId: documentId]: boolean },
    serviceDataMap: ServiceDataMap,
    serviceIncludedMap: { [serviceId: documentId]: documentId | number }

}

export default function JobManagement(): JSX.Element {

    const
        [pageData, setPageData] = useState<JobManagementPageData>({
            accountData: {} as unknown as AccountData,
            jobData: {
                name: null as unknown as string,
                description: null as unknown as string
            },
            jobDefaultData: {} as JobData,
            jobServiceDataMap: {},
            jobServiceIndex: 0,
            jobServiceToDeleteMap: {},
            loaded: false,
            serviceDataMap: {},
            serviceIncludedMap: {},
            updateMap: {}
        }),
        documentId: string | undefined = useParams().id,
        isNewMode: boolean = (documentId === "new"),
        isEditMode: boolean = (documentId !== undefined && !isNewMode),
        navigate = useNavigate()

        ;

    async function addJobService(serviceId: string): Promise<void> {

        const
            { serviceIncludedMap, jobServiceToDeleteMap } = pageData,
            jobServiceId = serviceIncludedMap[serviceId] as string
            ;
        if (jobServiceId in jobServiceToDeleteMap) {

            await restoreJobServiceInclusion(jobServiceId);
            return;

        }
        const
            {
                jobServiceDataMap,
                jobServiceIndex
            } = pageData
            ;
        jobServiceDataMap[jobServiceIndex] = {
            job: null as unknown as DocumentReference,
            service: SpaRadiseFirestore.getDocumentReference(
                serviceId, SpaRadiseEnv.SERVICE_COLLECTION
            )
        };
        pageData.jobServiceIndex++;
        serviceIncludedMap[serviceId] = jobServiceIndex;
        reloadPageData();

    }

    async function cancelJobForm(): Promise<void> {

        window.open(`/management/jobs/menu`, `_self`);

    }

    async function checkFormValidity(): Promise<boolean> {

        const {
            jobData,
            serviceIncludedMap,
            jobServiceToDeleteMap
        } = pageData;
        if (jobData.name === "New Job")
            throw new Error(`Job name cannot be "New Job"!`);
        // check if duplicate name
        const noServices: number =
            ObjectUtils.keyLength(serviceIncludedMap)
            - ObjectUtils.keyLength(jobServiceToDeleteMap)
            ;
        if (noServices < 1)
            throw new Error(`There must be at least 1 job service.`);
        return true;

    }

    async function createJob(): Promise<void> {

        if (!isNewMode || !documentId) return;
        await checkFormValidity();
        const documentReference: DocumentReference = await JobUtils.createJob(
            pageData.jobData
        );
        pageData.jobDocumentReference = documentReference;
        await updateJobServiceList();
        delete pageData.updateMap["new"];
        alert(`Created!`); // note: remove later
        window.open(`/management/jobs/${documentReference.id}`, `_self`);

    }

    async function createJobServiceList(): Promise<void> {

        const {
            jobDocumentReference,
            jobServiceDataMap,
            serviceIncludedMap
        } = pageData;
        if (!jobDocumentReference) return;
        for (let jobServiceId in jobServiceDataMap) {

            const isNew: boolean = NumberUtils.isNumeric(jobServiceId);
            if (!isNew) continue;
            const jobServiceData = jobServiceDataMap[jobServiceId];
            jobServiceData.job = jobDocumentReference;
            const
                jobServiceDocumentReference =
                    await JobServiceUtils.createJobService(jobServiceData)
                ,
                jobServiceIdNew: string = jobServiceDocumentReference.id,
                serviceId: string = jobServiceData.service.id
                ;
            delete jobServiceDataMap[jobServiceId];
            jobServiceDataMap[jobServiceIdNew] = jobServiceData;
            serviceIncludedMap[serviceId] = jobServiceIdNew;

        }

    }

    async function deleteJob(): Promise<void> {

        if (!isEditMode || !documentId) return;
        await JobUtils.deleteJob(documentId, pageData.jobServiceDataMap);
        alert(`Deleted!`); // note: remove later
        window.open(`/management/jobs/menu`, `_self`);

    }

    async function deleteJobService(serviceId: documentId): Promise<void> {

        const
            {
                jobServiceDataMap,
                serviceIncludedMap,
                jobServiceToDeleteMap
            } = pageData,
            jobServiceId: string | number = serviceIncludedMap[serviceId],
            isNewJobService: boolean = NumberUtils.isNumeric(jobServiceId)
            ;
        if (isNewJobService) {

            delete jobServiceDataMap[jobServiceId];
            delete serviceIncludedMap[serviceId];

        } else
            jobServiceToDeleteMap[jobServiceId] = true;
        reloadPageData();

    }

    async function deleteJobServiceListInToDeleteMap(): Promise<void> {

        const {
            jobServiceDataMap,
            serviceIncludedMap,
            jobServiceToDeleteMap
        } = pageData;
        for (let jobServiceId in jobServiceToDeleteMap) {

            const serviceId: string = jobServiceDataMap[jobServiceId].service.id;
            await JobServiceUtils.deleteJobService(jobServiceId);
            delete jobServiceDataMap[jobServiceId];
            delete serviceIncludedMap[serviceId];
            delete jobServiceToDeleteMap[jobServiceId];

        }

    }

    async function loadJob(): Promise<void> {

        if (!documentId) return;
        pageData.jobDocumentReference = SpaRadiseFirestore.getDocumentReference(
            documentId, SpaRadiseEnv.JOB_COLLECTION
        );
        pageData.jobData = await JobUtils.getJobData(documentId);
        pageData.jobDefaultData = { ...pageData.jobData };
        await loadJobServiceList();

    }

    async function loadJobServiceList(): Promise<void> {

        if (!documentId) return;
        pageData.jobServiceDataMap =
            await JobServiceUtils.getJobServiceDataMapByJob(documentId)
            ;
        const { jobServiceDataMap, serviceIncludedMap } = pageData;
        for (let jobServiceId in jobServiceDataMap) {

            const serviceId: string = jobServiceDataMap[jobServiceId].service.id;
            serviceIncludedMap[serviceId] = jobServiceId;

        }

    }

    async function loadPageData(): Promise<void> {

        if (!documentId) return;
        pageData.serviceDataMap = await ServiceUtils.getServiceDataMapAll();
        if (isEditMode) await loadJob();
        pageData.loaded = true;
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    async function restoreJobServiceInclusion(jobServiceId: string): Promise<void> {

        const { jobServiceToDeleteMap } = pageData;
        delete jobServiceToDeleteMap[jobServiceId];
        reloadPageData();

    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {

        event.preventDefault();
        if (isNewMode)
            await createJob();
        else
            await updateJob();

    }

    async function updateJob(): Promise<void> {

        if (!isEditMode || !documentId) return;
        await checkFormValidity();
        const { updateMap } = pageData;
        if (documentId in updateMap) {

            await JobUtils.updateJob(documentId, pageData.jobData);
            pageData.jobDefaultData = { ...pageData.jobData };

        }
        delete updateMap[documentId];
        await updateJobServiceList();
        reloadPageData();

    }

    async function updateJobServiceList(): Promise<void> {

        await deleteJobServiceListInToDeleteMap();
        await createJobServiceList();

    }

    useEffect(() => { loadPageData(); }, []);

    return <>
        <EmployeeSidebar pageData={pageData} reloadPageData={reloadPageData} />
        {/* <EmployeeSidebar/> */}
        <form onSubmit={submit}>
            <div className="service-main-content">
                <label htmlFor="service-main-content" className="employee-management-location">Job - {pageData.jobData.name}</label>
                <div className="service-form-section">
                    <div className="service-header">
                        <button onClick={() => navigate(-1)} className="service-back-arrow" aria-label="Back" style={{ background: "none", border: "none", padding: 0 }}><img src={BackButton} alt="Back" className="back-icon" /></button>
                        <h1>{pageData.jobData.name}</h1>
                    </div>

                    <div>
                        <div className="service-form-row-group">
                            <div className="service-form-row">
                                <label htmlFor="service-name">Name</label>
                                <FormTinyTextInput documentData={pageData.jobData} documentDefaultData={pageData.jobDefaultData} documentId={documentId} keyName="name" pageData={pageData} required={true} />
                            </div>
                        </div>
                        <div className="service-form-row-group">
                            <div className="service-form-row">
                                <label htmlFor="service-name">Description</label>
                                <FormTextArea documentData={pageData.jobData} documentDefaultData={pageData.jobDefaultData} documentId={documentId} keyName="description" pageData={pageData} required={true} />
                            </div>
                        </div>
                    </div>
                    <div className="section-label">Select Services:
                        <div id="services-list">
                            <div className="service-scroll-container">
                                {
                                    Object.keys(pageData.serviceDataMap).map((serviceId, key) => {

                                        const
                                            service = pageData.serviceDataMap[serviceId],
                                            jobServiceId: string | number = pageData.serviceIncludedMap[serviceId]
                                            ;
                                        return <div className="service-scroll-item" key={key}>

                                            <div className="service-name" key={key}>
                                                {service.name}</div>
                                            <div className="service-description" key={key}>
                                                {service.description}</div>

                                            {
                                                (
                                                    !(serviceId in pageData.serviceIncludedMap)
                                                    || (jobServiceId in pageData.jobServiceToDeleteMap)
                                                ) ? (
                                                    <button className="add-btn" type="button" onClick={() => addJobService(serviceId)}>Add</button>
                                                ) : (
                                                    <button type="button" onClick={() => deleteJobService(serviceId)}>Remove</button>
                                                )
                                            }

                                        </div>;


                                    })
                                }
                            </div>
                        </div>

                        <div className="service-form-actions">
                            <button className="service-delete-btn" type="button" onClick={deleteJob}>Delete</button>
                            <button className="service-cancel-btn" type="button"  onClick={() => navigate(-1)} >Cancel</button>
                            <button className="service-save-btn" type="submit">Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>


    </>

}
