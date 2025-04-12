import DateRange from "../utils/DateRange";
import DateUtils from "../utils/DateUtils";
import { DocumentReference } from "firebase/firestore/lite";
import {
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

    employeeDataMap: EmployeeDataMap,
    employeeLeaveData: EmployeeLeaveData,
    employeeLeaveDefaultData: EmployeeLeaveData,
    employeeLeaveDocumentReference?: DocumentReference

}

const IS_DEV_MODE = true;

export default function EmployeeLeaveManagement(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< EmployeeLeaveManagementPageData >( {
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
        } ),
        documentId: string | undefined = useParams().id,
        isNewMode: boolean = (documentId === "new"),
        isEditMode: boolean = (documentId !== undefined && !isNewMode),
        canceled: boolean = ( pageData.employeeLeaveData.status === "canceled" ),
        navigate = useNavigate()
    ;

    async function checkFormValidity(): Promise< boolean > {

        const errorList: string[] = [];

        async function validateUniqueDateRange(): Promise< void > {

            const
                { employeeLeaveData: { employee, dateTimeStart, dateTimeEnd } } = pageData,
                employeeLeaveDataMap =
                    await EmployeeLeaveUtils.getApprovedEmployeeLeaveDataMapByEmployee( employee )
                ,
                dateRange1: DateRange = new DateRange( dateTimeStart, dateTimeEnd ),
                DATE_FORMAT = "Mmmm dd, yyyy - hh:mm a.m."
            ;
            for( let employeeLeaveId in employeeLeaveDataMap ) {

                const
                    { dateTimeStart, dateTimeEnd } = employeeLeaveDataMap[ employeeLeaveId ],
                    dateRange2: DateRange = new DateRange( dateTimeStart, dateTimeEnd )
                ;
                if( dateRange1.overlapsWith( dateRange2 ) ) errorList.push(
                    `The date range overlaps with an approved ${
                        DateUtils.toString( dateTimeStart, DATE_FORMAT )
                    } - ${
                        DateUtils.toString( dateTimeEnd, DATE_FORMAT )
                    } leave.`
                );

            }

        }

        await validateUniqueDateRange();

        if( errorList.length > 0 ) {

            pageData.popupData = {
                children: <>
                    <ul>{ errorList.map( ( error, index ) => <li key={ index }>{ error }</li> ) }</ul>
                </>,
                popupMode: "yesOnly",
                yesText: "OK"
            }
            reloadPageData();
            return false;

        }

        return true;

    }

    async function createEmployeeLeave(): Promise< void > {

        if ( !isNewMode || !documentId || !( await checkFormValidity() ) ) return;
        await checkFormValidity();
        const documentReference: DocumentReference = await EmployeeLeaveUtils.createEmployeeLeave(
            pageData.employeeLeaveData
        );
        pageData.employeeLeaveDocumentReference = documentReference;
        alert(`Created!`); // note: remove later
        navigate( `/management/employeeLeaves/${ documentReference.id }` );

    }

    async function deleteEmployeeLeave(): Promise< void > {

        if (!isEditMode || !documentId) return;
        await EmployeeLeaveUtils.deleteEmployeeLeave(documentId);
        alert(`Deleted!`); // note: remove later
        navigate( `/management/employees/menu` );

    }

    async function loadEmployeeLeave(): Promise< void > {

        if (!documentId) return;
        pageData.employeeLeaveDocumentReference = SpaRadiseFirestore.getDocumentReference(
            documentId, SpaRadiseEnv.EMPLOYEE_COLLECTION
        );
        pageData.employeeLeaveData = await EmployeeLeaveUtils.getEmployeeLeaveData( documentId );
        pageData.employeeLeaveDefaultData = { ...pageData.employeeLeaveData };

    }

    async function loadPageData(): Promise< void > {
    
        if( !documentId ) return;
        pageData.employeeDataMap = await EmployeeUtils.getEmployeeDataMapAll();
        if( isEditMode ) await loadEmployeeLeave();
        pageData.loaded = true;
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    async function submit( event: FormEvent< HTMLFormElement > ): Promise< void > {

        event.preventDefault();
        if ( isNewMode )
            await createEmployeeLeave();
        else
            await updateEmployeeLeave();

    }

    async function updateEmployeeLeave(): Promise<void> {

        if ( !isEditMode || !documentId || !( await checkFormValidity() ) ) return;
        const { employeeLeaveData, updateMap } = pageData;
        if (documentId in updateMap) {

            await EmployeeLeaveUtils.updateEmployeeLeave(documentId, employeeLeaveData);
            pageData.employeeLeaveDefaultData = { ...pageData.employeeLeaveData };

        }
        delete updateMap[documentId];
        reloadPageData();
        alert(`Updated!`); // note: remove later

    }
    
    useEffect( () => { loadPageData(); }, [] );

    return <>
        <PopupModal pageData={ pageData } reloadPageData={ reloadPageData } />
        <form onSubmit={submit}>
            <EmployeeSidebar/>
            <nav className="navbar">
                <div className="clientIndex-Logo">
                    <img src="../images/SpaRadise Logo.png" alt="SpaRadise Logo"/>
                </div>
                <ul className="nav-links">
                    <li><a href="#">Dashboard</a></li>
                    <li><a href="#">Bookings</a></li>
                    <li><a href="#">Clients</a></li>
                    <li><a href="#">Employees</a></li>
                    <li><a href="#">Services & Packages</a></li>
                    <li><a href="#">Vouchers</a></li>
                    <li><a href="#">Rooms & Chairs</a></li>
                    <li><a href="#">Log Out</a></li>
                </ul>
            </nav>
            
            <div className="employee-main-content">
                <label htmlFor="employee-main-content" className="employee-management-location">EmployeeLeaves - Name</label>
                <div className="employee-form-section">

                    <label>Employee: </label>
                    <FormEntitySelect< EmployeeData > collectionName={ SpaRadiseEnv.EMPLOYEE_COLLECTION } documentData={pageData.employeeLeaveData} documentDefaultData={pageData.employeeLeaveDefaultData} documentId={documentId} keyName="employee" optionDataMap={ pageData.employeeDataMap } pageData={pageData} readOnly={ canceled } required={true} getDocumentName={ employeeData => PersonUtils.format( employeeData, "f mi l" ) }>
                        <option value="" disabled>Select employee</option>
                    </FormEntitySelect>
                    <label>From Date Time: </label>
                    <FormDateTime30MinStepInput documentData={pageData.employeeLeaveData} documentDefaultData={pageData.employeeLeaveDefaultData} documentId={documentId} keyName="dateTimeStart" pageData={pageData} readOnly={ canceled } required={true} onChange={ reloadPageData }/>
                    <label>To Date Time: </label>
                    <FormDateTime30MinStepInput
                        documentData={pageData.employeeLeaveData} documentDefaultData={pageData.employeeLeaveDefaultData} documentId={documentId} keyName="dateTimeEnd"
                        min={ pageData.employeeLeaveData.dateTimeStart ? DateUtils.addTime( pageData.employeeLeaveData.dateTimeStart, { min: 30 } ) : undefined }
                        pageData={pageData} readOnly={ canceled } required={true}
                    />
                    <label>Reason: </label>
                    <FormTextArea documentData={ pageData.employeeLeaveData } documentDefaultData={ pageData.employeeLeaveDefaultData } documentId={documentId} keyName="reason" pageData={ pageData } readOnly={ canceled } required={ true }/>
                    {
                        isEditMode ? <>
                            <label>Status: </label>
                            {
                                ( pageData.employeeLeaveData.status === "pending" ) ? <>
                                    <FormMarkButton< leaveStatus >
                                        confirmMessage="Would you like to approve this leave?"
                                        documentData={ pageData.employeeLeaveData } documentDefaultData={ pageData.employeeLeaveDefaultData } documentId={ documentId }
                                        keyName="status" pageData={ pageData } value="approved" reloadPageData={ reloadPageData }
                                    >Approve Leave</FormMarkButton>
                                </> : <></>
                            }
                            {
                                ( !canceled ) ? <>
                                    <FormMarkButton< leaveStatus >
                                        confirmMessage="Would you like to cancel this leave?"
                                        documentData={ pageData.employeeLeaveData } documentDefaultData={ pageData.employeeLeaveDefaultData } documentId={ documentId }
                                        keyName="status" pageData={ pageData } value="canceled" reloadPageData={ reloadPageData }
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
                </div>
                <div className="employee-form-actions">
                    {
                        isEditMode ? <button className="employee-delete-btn" type="button" onClick={deleteEmployeeLeave}>Delete</button>
                            : undefined

                    }
                    <button className="employee-cancel-btn" type="button" onClick={ () => navigate( `/management/employees/menu` ) }>Cancel</button>
                    <button className="employee-save-btn" type="submit">{isNewMode ? "Create" : "Save Changes"}</button>
                </div>
            </div>
        </form >
        {
            IS_DEV_MODE ? <button style={{ float: "right" }
            } type="button" onClick={() => console.log(pageData)
            }> Log page data</button >
                : undefined
        }
    </>

}