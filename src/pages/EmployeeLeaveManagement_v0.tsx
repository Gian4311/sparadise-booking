import DateRange from "../utils/DateRange";
import DateUtils from "../utils/DateUtils";
import { DocumentReference } from "firebase/firestore/lite";
import {
    AccountData,
    EmployeeData,
    EmployeeDataMap,
    EmployeeLeaveData,
    EmployeeLeaveDataMap,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import EmployeeLeaveUtils from "../firebase/EmployeeLeaveUtils";
import EmployeeUtils from "../firebase/EmployeeUtils";
import FormContactNumberInput from "../components/FormContactNumberInput";
import FormDateInput from "../components/FormDateInput";
import FormDateTime30MinStepInput from "../components/FormDateTime30MinStepInput";
import FormDateTimeInput from "../components/FormDateTimeInput";
import FormEmailInput from "../components/FormEmailInput";
import FormEntitySelect from "../components/FormEntitySelect";
import BackButton from "../images/back button.png";
import {
    FormEvent,
    useEffect,
    useState
} from "react";
import FormMarkButton from "../components/FormMarkButton";
import FormSelect from "../components/FormSelect";
import FormTextArea from "../components/FormTextArea";
import FormTinyTextInput from "../components/FormTinyTextInput";
import JobUtils from "../firebase/JobUtils";
import { Link } from "react-router-dom";
import ObjectUtils from "../utils/ObjectUtils";
import PersonUtils from "../utils/PersonUtils";
import PopupModal from "../components/PopupModal";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import EmployeeSidebar from "../components/EmployeeSidebar";

import "../styles/Sidebar.css";

import SpaRadiseLogo from "../images/SpaRadise Logo.png";

interface EmployeeLeaveManagementPageData extends SpaRadisePageData {

    accountData: AccountData,
    accountId?: documentId,
    employeeDataMap: EmployeeDataMap,
    employeeLeaveData: EmployeeLeaveData,
    employeeLeaveDefaultData: EmployeeLeaveData,
    employeeLeaveDocumentReference?: DocumentReference

}

const IS_DEV_MODE = true;

export default function EmployeeLeaveManagement(): JSX.Element {

    const
        [pageData, setPageData] = useState<EmployeeLeaveManagementPageData>({
            accountData: {
                lastName: null as unknown as string,
                firstName: null as unknown as string,
                middleName: null,
                sex: null as unknown as sex,
                birthDate: null as unknown as Date,
                email: null as unknown as string,
                contactNumber: null as unknown as string,
                contactNumberAlternate: null,
                accountType: null as unknown as accountType
            },
            employeeDataMap: {},
            employeeLeaveData: {
                employee: null as unknown as DocumentReference,
                dateTimeStart: null as unknown as Date,
                dateTimeEnd: null as unknown as Date,
                status: "pending",
                reason: null as unknown as string
            },
            employeeLeaveDefaultData: {} as EmployeeLeaveData,
            loaded: false,
            updateMap: {}
        }),
        documentId: string | undefined = useParams().id,
        isNewMode: boolean = (documentId === "new"),
        isEditMode: boolean = (documentId !== undefined && !isNewMode),
        canceled: boolean = (pageData.employeeLeaveData.status === "canceled"),
        navigate = useNavigate()
        ;

    async function checkFormValidity(): Promise<boolean> {

        const errorList: string[] = [];

        async function validateUniqueDateRange(): Promise<void> {

            const
                { employeeLeaveData: { employee, dateTimeStart, dateTimeEnd } } = pageData,
                employeeLeaveDataMap =
                    await EmployeeLeaveUtils.getApprovedEmployeeLeaveDataMapByEmployee(employee)
                ,
                dateRange1: DateRange = new DateRange(dateTimeStart, dateTimeEnd),
                DATE_FORMAT = "Mmmm dd, yyyy - hh:mm a.m."
                ;
            for (let employeeLeaveId in employeeLeaveDataMap) {

                const
                    { dateTimeStart, dateTimeEnd } = employeeLeaveDataMap[employeeLeaveId],
                    dateRange2: DateRange = new DateRange(dateTimeStart, dateTimeEnd)
                    ;
                if (dateRange1.overlapsWith(dateRange2)) errorList.push(
                    `The date range overlaps with an approved ${DateUtils.toString(dateTimeStart, DATE_FORMAT)
                    } - ${DateUtils.toString(dateTimeEnd, DATE_FORMAT)
                    } leave.`
                );

            }

        }

        await validateUniqueDateRange();

        if (errorList.length > 0) {

            pageData.popupData = {
                children: <>
                    <ul>{errorList.map((error, index) => <li key={index}>{error}</li>)}</ul>
                </>,
                popupMode: "yesOnly",
                yesText: "OK"
            }
            reloadPageData();
            return false;

        }

        return true;

    }

    async function createEmployeeLeave(): Promise<void> {

        if (!isNewMode || !documentId || !(await checkFormValidity())) return;
        await checkFormValidity();
        const documentReference: DocumentReference = await EmployeeLeaveUtils.createEmployeeLeave(
            pageData.employeeLeaveData
        );
        pageData.employeeLeaveDocumentReference = documentReference;
        navigate(`/management/employeeLeaves/${documentReference.id}`);

    }

    async function deleteEmployeeLeave(): Promise<void> {

        if (!isEditMode || !documentId) return;
        await EmployeeLeaveUtils.deleteEmployeeLeave(documentId);
        alert(`Deleted!`); // note: remove later
        navigate(`/management/employees/menu`);

    }

    async function loadEmployeeLeave(): Promise<void> {

        if (!documentId) return;
        pageData.employeeLeaveDocumentReference = SpaRadiseFirestore.getDocumentReference(
            documentId, SpaRadiseEnv.EMPLOYEE_COLLECTION
        );
        pageData.employeeLeaveData = await EmployeeLeaveUtils.getEmployeeLeaveData(documentId);
        pageData.employeeLeaveDefaultData = { ...pageData.employeeLeaveData };

    }

    async function loadPageData(): Promise<void> {

        if (!documentId) return;
        pageData.employeeDataMap = await EmployeeUtils.getEmployeeDataMapAll();
        if (isEditMode) await loadEmployeeLeave();
        pageData.loaded = true;
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {

        event.preventDefault();
        if (isNewMode)
            await createEmployeeLeave();
        else
            await updateEmployeeLeave();
        pageData.popupData = {
            children: `Success!`,
            yes: () => navigate(`/management/employeeLeaves/menu`)
        }

        reloadPageData();

    }

    async function updateEmployeeLeave(): Promise<void> {

        if (!isEditMode || !documentId || !(await checkFormValidity())) return;
        const { employeeLeaveData, updateMap } = pageData;
        if (documentId in updateMap) {

            await EmployeeLeaveUtils.updateEmployeeLeave(documentId, employeeLeaveData);
            pageData.employeeLeaveDefaultData = { ...pageData.employeeLeaveData };

        }
        delete updateMap[documentId];
        reloadPageData();

    }

    useEffect(() => { loadPageData(); }, []);

    return <>
        <PopupModal pageData={pageData} reloadPageData={reloadPageData} />
        <form onSubmit={submit}>
            <EmployeeSidebar pageData={pageData} reloadPageData={reloadPageData} />

            <div className="employee-main-content">
                <label htmlFor="employee-main-content" className="employee-management-location">Employee Leaves - {pageData.employeeLeaveData.employee ? PersonUtils.toString(pageData.employeeDataMap[pageData.employeeLeaveData.employee.id], "f mi l") : ``}</label>
                <div className="service-header">
                    <button onClick={() => navigate(-1)} className="service-back-arrow" aria-label="Back" style={{ background: "none", border: "none", padding: 0 }}><img src={BackButton} alt="Back" className="back-icon" /></button>
                    <h1>{pageData.employeeLeaveData.employee ? PersonUtils.toString(pageData.employeeDataMap[pageData.employeeLeaveData.employee.id], "f mi l") : ``}</h1></div>
                <div className="employee-form-section">

                    <div className="employee-form-row-group">
                        <label>Employee: </label>
                        <FormEntitySelect< EmployeeData > collectionName={SpaRadiseEnv.EMPLOYEE_COLLECTION} documentData={pageData.employeeLeaveData} documentDefaultData={pageData.employeeLeaveDefaultData} documentId={documentId} keyName="employee" optionDataMap={pageData.employeeDataMap} pageData={pageData} readOnly={canceled} required={true} getDocumentName={employeeData => PersonUtils.toString(employeeData, "f mi l")}>
                            <option value="" disabled>Select employee</option>
                        </FormEntitySelect> </div>
                    <div className="employee-form-row-group">
                        <div className="employee-form-row">
                            <label>From Date Time: </label>
                            <FormDateTime30MinStepInput documentData={pageData.employeeLeaveData} documentDefaultData={pageData.employeeLeaveDefaultData} documentId={documentId} keyName="dateTimeStart" pageData={pageData} readOnly={canceled} required={true} onChange={reloadPageData} />
                        </div>
                        <div className="employee-form-row">
                            <label>To Date Time: </label>
                            <FormDateTime30MinStepInput
                                documentData={pageData.employeeLeaveData} documentDefaultData={pageData.employeeLeaveDefaultData} documentId={documentId} keyName="dateTimeEnd"
                                min={pageData.employeeLeaveData.dateTimeStart ? DateUtils.addTime(pageData.employeeLeaveData.dateTimeStart, { min: 30 }) : undefined}
                                pageData={pageData} readOnly={canceled} required={true}
                            /> </div></div>
                    <div className="employee-form-row">
                        <label>Reason: </label>
                        <FormTextArea documentData={pageData.employeeLeaveData} documentDefaultData={pageData.employeeLeaveDefaultData} documentId={documentId} keyName="reason" pageData={pageData} readOnly={canceled} required={true} />
                    </div>
                    {
                        isEditMode ? <>
                            <label>Status: </label>
                            {
                                (pageData.employeeLeaveData.status === "pending") ? <>
                                    <FormMarkButton< leaveStatus >
                                        confirmMessage="Would you like to approve this leave?"
                                        documentData={pageData.employeeLeaveData} documentDefaultData={pageData.employeeLeaveDefaultData} documentId={documentId}
                                        keyName="status" pageData={pageData} value="approved" reloadPageData={reloadPageData}
                                    >Approve Leave</FormMarkButton>
                                </> : <></>
                            }
                            {
                                (!canceled) ? <>
                                    <FormMarkButton< leaveStatus >
                                        confirmMessage="Would you like to cancel this leave?"
                                        documentData={pageData.employeeLeaveData} documentDefaultData={pageData.employeeLeaveDefaultData} documentId={documentId}
                                        keyName="status" pageData={pageData} value="canceled" reloadPageData={reloadPageData}
                                    >Cancel Leave</FormMarkButton>
                                </> : <>Canceled</>
                            }
                        </> : <></>
                    }

                    {/* <button type="button"><Link to={ `/management/employeeLeaves/menu/${ documentId }` }>Open Leaves</Link></button>
                    {
                        ( pageData.employeeLeaveData.status === "active" ) ? <>
                            <FormMarkButton< status >
                                confirmMessage="Are you sure you would like to mark this employee as inactive?"
                                documentData={ pageData.employeeLeaveData } documentDefaultData={ pageData.employeeLeaveDefaultData } documentId={ documentId }
                                keyName="status" pageData={ pageData } value="inactive" reloadPageData={ reloadPageData }
                            >Mark as Inactive</FormMarkButton>
                        </>
                        : <>
                            <FormMarkButton< status >
                                confirmMessage="Are you sure you would like to mark this employee as active again?"
                                documentData={ pageData.employeeLeaveData } documentDefaultData={ pageData.employeeLeaveDefaultData } documentId={ documentId }
                                keyName="status" pageData={ pageData } value="active" reloadPageData={ reloadPageData } yes={ handleMarkActive }
                            >Mark as Active</FormMarkButton>
                        </>
                    }
                    <label>Unemployment Date</label>
                    <FormDateInput documentData={ pageData.employeeLeaveData } documentDefaultData={ pageData.employeeLeaveDefaultData } documentId={documentId} keyName="unemploymentDate" pageData={ pageData } readOnly={ isActive } required={ !isActive }/>
                    <label>Unemployment Reason</label>
                    <FormTextArea documentData={ pageData.employeeLeaveData } documentDefaultData={ pageData.employeeLeaveDefaultData } documentId={documentId} keyName="unemploymentReason" pageData={ pageData } readOnly={ isActive }/> */}
                    <div className="employee-form-actions">
                        <button className="employee-cancel-btn" type="button" onClick={() => navigate(`/management/employees/menu`)}>Cancel</button>
                        <button className="employee-save-btn" type="submit">{isNewMode ? "Create" : "Save Changes"}</button>
                    </div>
                </div>
            </div>
        </form >
    </>

}