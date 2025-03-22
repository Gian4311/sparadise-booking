
import ConfirmationModal from "../components/ConfirmationModal";
import { DocumentReference } from "firebase/firestore/lite";
import {
    EmployeeData,
    JobData,
    JobDataMap,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import EmployeeUtils from "../firebase/EmployeeUtils";
import FormContactNumberInput from "../components/FormContactNumberInput";
import FormDateInput from "../components/FormDateInput";
import FormEmailInput from "../components/FormEmailInput";
import { Link } from "react-router-dom";
import {
    FormEvent,
    useEffect,
    useState
} from "react";
import FormEntitySelect from "../components/FormEntitySelect";
import FormMarkButton from "../components/FormMarkButton";
import FormSelect from "../components/FormSelect";
import FormTextArea from "../components/FormTextArea";
import FormTinyTextInput from "../components/FormTinyTextInput";
import JobUtils from "../firebase/JobUtils";
import { Link } from "react-router-dom";
import ObjectUtils from "../utils/ObjectUtils";
import PersonUtils from "../utils/PersonUtils";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import "../styles/EmployeeEmployeeManagement.css";
import "../styles/Sidebar.css";

import SpaRadiseLogo from "../images/SpaRadise Logo.png";
import BackButton from "../images/back button.png";

interface EmployeeManagementPageData extends SpaRadisePageData {

    employeeData: EmployeeData,
    employeeDefaultData: EmployeeData,
    employeeDocumentReference?: DocumentReference,
    employeeName: string,
    jobDataMap: JobDataMap

}

const IS_DEV_MODE = true;

export default function EmployeeManagement(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< EmployeeManagementPageData >( {
            employeeData: {
                lastName: null as unknown as string,
                firstName: null as unknown as string,
                middleName: null as unknown as string,
                sex: null as unknown as sex,
                birthDate: null as unknown as Date,
                email: null as unknown as string,
                contactNumber: null as unknown as string,
                contactNumberAlternate: null as unknown as string,
                buildingNumber: null as unknown as string,
                street: null as unknown as string | null,
                barangay: null as unknown as string,
                city: null as unknown as string,
                province: null as unknown as string,
                region: null as unknown as string,
                zipCode: null as unknown as string,
                job: null as unknown as DocumentReference,
                jobStatus: "active",
                hireDate: new Date(),
                unemploymentDate: null,
                unemploymentReason: null
            },
            employeeDefaultData: {} as EmployeeData,
            employeeName: "New Employee",
            jobDataMap: {},
            loaded: false,
            updateMap: {}
        } ),
        documentId: string | undefined = useParams().id,
        isNewMode: boolean = (documentId === "new"),
        isEditMode: boolean = (documentId !== undefined && !isNewMode),
        isActive: boolean = ( pageData.employeeData.jobStatus === "active" ),
        navigate = useNavigate()
    ;

    async function checkFormValidity(): Promise< boolean > {

        const {
            employeeData,
        } = pageData;
        if (employeeData.name === "New Employee")
            throw new Error(`Employee name cannot be "New Employee"!`);
        return true;

    }

    async function createEmployee(): Promise< void > {

        if (!isNewMode || !documentId) return;
        await checkFormValidity();
        const documentReference: DocumentReference = await EmployeeUtils.createEmployee(
            pageData.employeeData
        );
        pageData.employeeDocumentReference = documentReference;
        alert(`Created!`); // note: remove later
        navigate( `/management/employees/${documentReference.id}` );

    }

    async function deleteEmployee(): Promise< void > {

        if (!isEditMode || !documentId) return;
        await EmployeeUtils.deleteEmployee(documentId);
        alert(`Deleted!`); // note: remove later
        navigate( `/management/employees/menu` );

    }

    async function handleMarkActive(): Promise< void > {

        if( !documentId ) return;
        const
            {
                employeeData,
                employeeDefaultData: { unemploymentDate, unemploymentReason },
                updateMap
            } = pageData,
            updateUnemploymentDate: boolean = ( unemploymentDate !== null ),
            updateUnemploymentReason: boolean = ( unemploymentReason !== null )
        ;
        employeeData.unemploymentDate = null;
        employeeData.unemploymentReason = null;
        if( updateUnemploymentDate || updateUnemploymentReason ) {

            if( !( documentId in updateMap ) ) updateMap[ documentId ] = {};
            const employeeUpdateMap = updateMap[ documentId ];
            if( updateUnemploymentDate ) employeeUpdateMap.unemploymentDate = true;
            if( updateUnemploymentReason ) employeeUpdateMap.unemploymentReason = true;

        } else {

            const employeeUpdateMap = updateMap[ documentId ];
            if( !employeeUpdateMap ) return;
            delete employeeUpdateMap.unemploymentDate;
            delete employeeUpdateMap.unemploymentReason;
            if( !ObjectUtils.hasKeys( employeeUpdateMap ) ) delete updateMap[ documentId ];

        }

    }

    async function loadEmployee(): Promise< void > {

        if (!documentId) return;
        pageData.employeeDocumentReference = SpaRadiseFirestore.getDocumentReference(
            documentId, SpaRadiseEnv.EMPLOYEE_COLLECTION
        );
        pageData.employeeData = await EmployeeUtils.getEmployeeData( documentId );
        pageData.employeeDefaultData = { ...pageData.employeeData };
        pageData.employeeName = PersonUtils.format( pageData.employeeDefaultData, "f mi l" );

    }

    async function loadPageData(): Promise< void > {
    
        if( !documentId ) return;
        pageData.jobDataMap = await JobUtils.getJobDataMapAll();
        if( isEditMode ) await loadEmployee();
        pageData.loaded = true;
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    async function submit( event: FormEvent< HTMLFormElement > ): Promise< void > {

        event.preventDefault();
        if ( isNewMode )
            await createEmployee();
        else
            await updateEmployee();

    }

    async function updateEmployee(): Promise<void> {

        if (!isEditMode || !documentId) return;
        await checkFormValidity();
        const { employeeData, updateMap } = pageData;
        if (documentId in updateMap) {

            await EmployeeUtils.updateEmployee(documentId, employeeData);
            pageData.employeeDefaultData = { ...pageData.employeeData };
            pageData.employeeName = PersonUtils.format( pageData.employeeDefaultData, "f mi l" );

        }
        delete updateMap[documentId];
        reloadPageData();
        alert(`Updated!`); // note: remove later

    }
    
    useEffect( () => { loadPageData(); }, [] );

    return <>
        <ConfirmationModal pageData={ pageData } reloadPageData={ reloadPageData }/>
        <form onSubmit={submit}>
            <div className="sidebar">
                <div className="sidebar-logo">
                    <img src={SpaRadiseLogo} alt="SpaRadise Logo" />
                </div>
                <ul className="sidebar-menu">
                    <li><Link to="../management/dashboard" >Dashboard</Link></li>
                    <li><Link to="../management/bookings/menu" >Bookings</Link></li>
                    <li><Link to="../management/clients/menu" >Clients</Link></li>
                    <li><Link to="/management/employees/menu" className="active">Employees</Link></li>
                    <li><Link to="../management/servicesAndPackages/menu" >Services & Packages</Link></li>
                    <li><Link to="../management/vouchers/menu" >Vouchers</Link></li>
                    <li><Link to="../management/roomsAndChairs/menu" >Rooms & Chairs</Link></li>
                    <li><Link to="../management/commissions/menu" >Commissions</Link></li>
                    <li><a href="#">Log Out</a></li>
                </ul>
            </div>
            <div className="employee-main-content">
                <label htmlFor="employee-main-content" className="employee-management-location">Employees - {PersonUtils.format(pageData.employeeDefaultData, "f mi l" )}</label>
                <div className="employee-form-section">
                    <div className="employee-header">
                        <a href="#" className="employee-back-arrow" aria-label="Back">
                            &#8592;
                        </a>
                        <h1>{pageData.employeeName}</h1>
                    </div>
                    <div className="employee-form-row-group">
                        <div className="employee-form-row">
                            <label htmlFor="employee-name">Last Name</label>
                            <FormTinyTextInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="lastName" name="employee-lastName" pageData={pageData} required={true} />
                        </div>
                        <div className="employee-form-row">
                            <label htmlFor="employee-name">First Name</label>
                            <FormTinyTextInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="firstName" name="employee-firstName" pageData={pageData} required={true} />
                        </div>
                        <div className="employee-form-row">
                            <label htmlFor="employee-middle-name">Middle Name</label>
                            <FormTinyTextInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="middleName" name="employee-middleName" pageData={pageData}/>
                        </div>
                    </div>

                    <div className="employee-form-row-group">
                        <div className="employee-form-row">
                            <label htmlFor="employee-sex">Sex</label>
                            <FormSelect documentData={pageData.employeeData} documentDefaultData={pageData.employeeData} documentId={documentId} name="employee-sex" keyName="sex" optionList={SpaRadiseEnv.SEX_LIST} pageData={pageData} required={true}>
                                <option value="" disabled>Select sex</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="others">Others</option>
                            </FormSelect>
                        </div>
                        <div className="employee-form-row">
                            <label htmlFor="employee-birthdate">Birthdate</label>
                            <FormDateInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="birthDate" name="employee-birthdate" pageData={pageData} required={true} />
                        </div>
                    </div>

                    <div className="employee-gap-row">
                    </div>

                    <div className="employee-form-row-group">
                        <div className="employee-form-row">
                            <label htmlFor="employee-email">Email</label>
                            <FormEmailInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="email" name="employee-email" pageData={pageData} required={true} />
                        </div>
                        <div className="employee-form-row">
                            <label htmlFor="employee-contact-number">Contact Number</label>
                            <FormContactNumberInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="contactNumber" name="employee-contactNumber" pageData={pageData} required={true} />
                        </div>
                        <div className="employee-form-row">
                            <label htmlFor="employee-alter-contact-number">Alternate Contact Number</label>
                            <FormContactNumberInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="contactNumberAlternate" name="employee-contactNumber" pageData={pageData}/>
                        </div>
                    </div>

                    <div className="employee-gap-row">
                    </div>

                    <div className="employee-form-row-group">
                        <div className="employee-form-row">
                            <label htmlFor="employee-building">Building Number</label>
                            <FormTinyTextInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="buildingNumber" name="employee-buildingNumber" pageData={pageData} />
                        </div>
                        <div className="employee-form-row">
                            <label htmlFor="employee-street">Street Name</label>
                            <FormTinyTextInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="street" name="employee-street" pageData={pageData} />
                        </div>
                        <div className="employee-form-row">
                            <label htmlFor="employee-barangay">Barangay</label>
                            <FormTinyTextInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="barangay" name="employee-barangay" pageData={pageData} required={ true }/>
                        </div>
                    </div>
                    <div className="employee-form-row-group">
                        <div className="employee-form-row">
                            <label htmlFor="employee-city">City/Municipality</label>
                            <FormTinyTextInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="city" name="employee-city" pageData={pageData}/>
                        </div>
                        <div className="employee-form-row">
                            <label htmlFor="employee-province">Province</label>
                            <FormTinyTextInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="province" name="employee-province" pageData={pageData} required={ true }/>
                        </div>
                        <div className="employee-form-row">
                            <label htmlFor="employee-region">Region</label>
                            <FormSelect documentData={pageData.employeeData} documentDefaultData={pageData.employeeData} documentId={documentId} name="employee-region" keyName="region" optionList={ SpaRadiseEnv.REGION_LIST } pageData={pageData} required={true}>
                                <option value="" disabled>Select region</option>
                                <option value="XI">Davao Region (XI)</option>
                                <option value="NCR">Metro Manila (NCR)</option>
                                <option value="I">Ilocos Region (I)</option>
                                <option value="II">Cagayan Valley (II)</option>
                                <option value="III">Central Luzon (III)</option>
                                <option value="IV-A">CALABARZON (IV-A)</option>
                                <option value="IV-B">MIMAROPA (IV-B)</option>
                                <option value="V">Bicol Region (V)</option>
                                <option value="VI">Western Visayas (VI)</option>
                                <option value="VII">Central Visayas (VII)</option>
                                <option value="VIII">Eastern Visayas (VIII)</option>
                                <option value="IX">Zamboanga Peninsula (IX)</option>
                                <option value="X">Northern Mindanao (X)</option>
                                <option value="XII">SOCCSKSARGEN (XII)</option>
                                <option value="XIII">Caraga (XIII)</option>
                                <option value="CAR">Cordillera Administrative Region (CAR)</option>
                                <option value="BARMM">Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)</option>
                            </FormSelect>
                        </div>
                        <div className="employee-form-row">
                            <label htmlFor="employee-postal">Postal Code</label>
                            <FormTinyTextInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="zipCode" name="employee-zipCode" pageData={pageData} required={true} />
                        </div>
                    </div>

                    <div className="employee-gap-row">
                    </div>

                    {/* <div className="employee-form-row">
                        <label htmlFor="employee-status">Status</label>
                        <FormSelect documentData={pageData.employeeData} documentDefaultData={pageData.employeeData} documentId={documentId} name="employee-status" keyName="employeeStatus" optionList={SpaRadiseEnv.REGION_LIST} pageData={pageData} required={true}>
                            <option value="" disabled>Select status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </FormSelect>
                    </div> */}
                    <div className="employee-form-row">
                        <label htmlFor="employee-job">Job</label>
                        <FormEntitySelect< JobData > collectionName={ SpaRadiseEnv.JOB_COLLECTION } documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="job" name="employee-job" optionDataMap={ pageData.jobDataMap } pageData={pageData} required={true} getDocumentName={ ( { name } ) => name }>
                            <option value="" disabled>Select job</option>
                        </FormEntitySelect>
                    </div>
                    <div className="employee-form-row">
                        <label htmlFor="employee-hire-date">Date Hired</label>
                        <FormDateInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="hireDate" name="employee-hireDate" pageData={pageData} required={true} />
                    </div>
                    <button type="button"><Link to={ `/management/employeeLeaves/menu/${ documentId }` }>Open Leaves</Link></button>
                    {
                        ( pageData.employeeData.jobStatus === "active" ) ? <>
                            <FormMarkButton< jobStatus >
                                confirmMessage="Are you sure you would like to mark this employee as inactive?"
                                documentData={ pageData.employeeData } documentDefaultData={ pageData.employeeDefaultData } documentId={ documentId }
                                keyName="jobStatus" pageData={ pageData } value="inactive" reloadPageData={ reloadPageData }
                            >Mark as Inactive</FormMarkButton>
                        </>
                        : <>
                            <FormMarkButton< jobStatus >
                                confirmMessage="Are you sure you would like to mark this employee as active again?"
                                documentData={ pageData.employeeData } documentDefaultData={ pageData.employeeDefaultData } documentId={ documentId }
                                keyName="jobStatus" pageData={ pageData } value="active" reloadPageData={ reloadPageData } yes={ handleMarkActive }
                            >Mark as Active</FormMarkButton>
                        </>
                    }
                    <label>Unemployment Date</label>
                    <FormDateInput documentData={ pageData.employeeData } documentDefaultData={ pageData.employeeDefaultData } documentId={documentId} keyName="unemploymentDate" pageData={ pageData } readOnly={ isActive } required={ !isActive }/>
                    <label>Unemployment Reason</label>
                    <FormTextArea documentData={ pageData.employeeData } documentDefaultData={ pageData.employeeDefaultData } documentId={documentId} keyName="unemploymentReason" pageData={ pageData } readOnly={ isActive }/>
                </div>

                {/* <div className="employee-form-row-group">
                    <div className="employee-form-row">
                        <label htmlFor="employee-leave-from">Leave From</label>
                        <FormDateInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="leaveFrom" name="employee-fromLeave" pageData={pageData} />
                    </div>
                    <div className="employee-form-row">
                        <label htmlFor="employee-leave-to">Leave To</label>
                        <FormDateInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="leaveTo" name="employee-leaveTo" pageData={pageData} />
                    </div>
                    <div className="employee-form-row">
                        <label htmlFor="employee-leave-status">Leave Status</label>
                        <FormSelect documentData={pageData.employeeData} documentDefaultData={pageData.employeeData} documentId={documentId} name="employee-status" keyName="employeeStatus" optionList={SpaRadiseEnv.REGION_LIST} pageData={pageData}>
                            <option value="" disabled>Select status</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </FormSelect>
                    </div>
                </div> */}
                {/* <div className="employee-form-row-group">
                    <div className="employee-form-row">
                        <label htmlFor="employee-leave-reason">Leave Reason:</label>
                        <FormTextArea documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="leaveReason" name="employee-leaveReason" pageData={pageData} />
                    </div>
                </div> */}

                {/* <div className="employee-gap-row">
                </div> */}
                {/* <div className="employee-form-row-group">
                    <div className="employee-form-row">
                        <label></label>
                        <button className="employee-inactive-btn">Mark Employee as Inactive</button>
                    </div>
                </div> */}

                {/* <div className="employee-form-row-group">
                    <div className="employee-form-row">
                        <label htmlFor="employee-unemployment-date">Unemployment Date</label>
                        <FormDateInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="unemploymentDate" name="employee-unemploymentDate" pageData={pageData} />
                    </div>
                    <div className="employee-form-row">
                        <label htmlFor="employee-unemployment-date">Unemployment Reason</label>
                        <FormTextArea documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="unemploymentReason" name="employee-unemploymentReason" pageData={pageData} />
                    </div>
                </div> */}

                <div className="employee-form-actions">
                    {
                        isEditMode ? <button className="employee-delete-btn" type="button" onClick={deleteEmployee}>Delete</button>
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