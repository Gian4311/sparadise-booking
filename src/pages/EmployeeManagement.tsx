import DataMapUtils from "../utils/DataMapUtils";
import DateUtils from "../utils/DateUtils";
import { DocumentReference } from "firebase/firestore/lite";
import FormDateInput from "../components/FormDateInput";
import {
    FormEvent,
    useEffect,
    useState
} from "react";
import FormMoneyInput from "../components/FormMoneyInput";
import FormNaturalNumberInput from "../components/FormNaturalNumberInput";
import FormPercentageInput from "../components/FormPercentageInput";
import FormSelect from "../components/FormSelect";
import FormTextArea from "../components/FormTextArea";
import FormTinyTextInput from "../components/FormTinyTextInput";
import NumberUtils from "../utils/NumberUtils";
import FormContactNumberInput from "../components/FormContactNumberInput";
import FormEmailInput from "../components/FormEmailInput";
import {
    EmployeeData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import EmployeeUtils from "../firebase/EmployeeUtils";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import { useParams } from "react-router-dom";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";

import "../styles/EmployeeEmployeeManagement.css";
import "../styles/Sidebar.css";

import SpaRadiseLogo from "../images/SpaRadise Logo.png";
import BackButton from "../images/back button.png";
import ObjectUtils from "../utils/ObjectUtils";

interface EmployeeManagementPageData extends SpaRadisePageData {

    employeeDefaultData: EmployeeData,
    employeeData: EmployeeData,
    employeeDocumentReference?: DocumentReference,
    employeeName: string

}

const IS_DEV_MODE = true;

export default function EmployeeManagement(): JSX.Element {

    const
        [pageData, setPageData] = useState<EmployeeManagementPageData>({
            employeeData: {
                lastName: null as unknown as string,
                firstName: null as unknown as string,
                middleName: null as unknown as string,
                sex: null as unknown as "male" | "female" | "others",
                email: null as unknown as string,
                contactNumber: null as unknown as string,
                contactNumberAlternate: null as unknown as string,
                buildingNumber: null as unknown as string,
                streetName: null as unknown as string | null,
                barangay: null as unknown as string,
                city: null as unknown as string,
                province: null as unknown as string,
                region: null as unknown as string,
                postalCode: null as unknown as string,
                jobStatus: null as unknown as string,
                hireDate: null as unknown as Date | null,
                unemploymentDate: null as unknown as Date | null,
                unemploymentReason: null as unknown as string | null
            },//undefined as unknown as EmployeeData,
            employeeDefaultData: {} as EmployeeData,
            employeeName: "New Employee",
            updateMap: {}
        }),
        documentId: string | undefined = useParams().id,
        isNewMode: boolean = (documentId === "new"),
        isEditMode: boolean = (documentId !== undefined && !isNewMode)
        ;

    async function cancelEmployeeForm(): Promise<void> {

        window.open(`/management/employees/menu`, `_self`);

    }

    async function checkFormValidity(): Promise<boolean> {

        const {
            employeeData,
        } = pageData;
        if (employeeData.name === "New Employee")
            throw new Error(`Employee name cannot be "New Employee"!`);
        return true;

    }

    async function createEmployee(): Promise<void> {

        if (!isNewMode || !documentId) return;
        await checkFormValidity();
        const documentReference: DocumentReference = await EmployeeUtils.createEmployee(
            pageData.employeeData
        );
        pageData.employeeDocumentReference = documentReference;
        alert(`Created!`); // note: remove later
        window.open(`/management/employees/${documentReference.id}`, `_self`);

    }


    async function deleteEmployee(): Promise<void> {

        if (!isEditMode || !documentId) return;
        await EmployeeUtils.deleteEmployee(documentId);
        alert(`Deleted!`); // note: remove later
        window.open(`/management/employees/menu`, `_self`);

    }


    function getDateKey(date: Date): string {

        return DateUtils.toString(date, "yyyymmdd");

    }

    async function newEmployeeForm(): Promise<void> {

        pageData.employeeData = {
            lastName: null as unknown as string,
            firstName: null as unknown as string,
            middleName: null as unknown as string,
            sex: null as unknown as "male" | "female" | "others",
            email: null as unknown as string,
            contactNumber: null as unknown as string,
            contactNumberAlternate: null as unknown as string,
            buildingNumber: null as unknown as string,
            streetName: null as unknown as string | null,
            barangay: null as unknown as string,
            city: null as unknown as string,
            province: null as unknown as string,
            region: null as unknown as string,
            postalCode: null as unknown as string,
            jobStatus: null as unknown as string,
            hireDate: null as unknown as Date | null,
            unemploymentDate: null as unknown as Date | null,
            unemploymentReason: null as unknown as string | null
        }

    }

    async function openEmployeeForm(): Promise<void> {

        if (!documentId) return;
        pageData.employeeDocumentReference = SpaRadiseFirestore.getDocumentReference(
            documentId, SpaRadiseEnv.EMPLOYEE_COLLECTION
        );
        pageData.employeeData = await EmployeeUtils.getEmployeeData(documentId);
    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {

        event.preventDefault();

        if (isNewMode)
            await createEmployee();
        else
            await updateEmployee();

    }

    async function updateEmployee(): Promise<void> {

        if (!isEditMode || !documentId) return;
        await checkFormValidity();
        const { employeeData, updateMap } = pageData;
        if (documentId in updateMap)
            if (documentId in updateMap) {

                await EmployeeUtils.updateEmployee(documentId, employeeData);
                pageData.employeeDefaultData = { ...pageData.employeeData };

            }
        delete updateMap[documentId];
        pageData.employeeName = employeeData.name;
        reloadPageData();
        alert(`Updated!`); // note: remove later

    }
    useEffect(() => {
        (async () => {

            if (!documentId) return;
            await (isNewMode ? newEmployeeForm() : openEmployeeForm());
            reloadPageData();

        })()
    }, []);

    async function loadEmployee(): Promise<void> {

        if (!documentId) return;
        pageData.employeeDocumentReference = SpaRadiseFirestore.getDocumentReference(
            documentId, SpaRadiseEnv.EMPLOYEE_COLLECTION
        );
        pageData.employeeData = await EmployeeUtils.getEmployeeData(documentId);
        pageData.employeeData = pageData.employeeData.name;
        pageData.employeeDefaultData = { ...pageData.employeeData };

    }

    return <>

        <form onSubmit={submit}>
            <div className="sidebar">
                <div className="sidebar-logo">
                    <img src={SpaRadiseLogo} alt="SpaRadise Logo" />
                </div>
                <ul className="sidebar-menu">
                    <li><a href="#">Dashboard</a></li>
                    <li><a href="#">Bookings</a></li>
                    <li><a href="#">Clients</a></li>
                    <li><a href="../pages/EmployeeEmployeeManagement.html" className="active">Employees</a></li>
                    <li><a href="../pages/EmployeeEmployeePackageMenu.html">Employees & Packages</a></li>
                    <li><a href="#">Vouchers</a></li>
                    <li><a href="#">Rooms & Chairs</a></li>
                    <li><a href="#">Log Out</a></li>
                </ul>
            </div>
            <div className="employee-main-content">
                <label htmlFor="employee-main-content" className="employee-management-location">Employees - Cabangbang, R-Man Rey
                    S.</label>
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
                            <FormDateInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="middleName" name="employee-middleName" pageData={pageData} required={true} />
                        </div>
                    </div>

                    <div className="employee-form-row-group">
                        <div className="employee-form-row">
                            <label htmlFor="employee-sex">Sex</label>
                            <FormSelect documentData={pageData.employeeData} documentDefaultData={pageData.employeeData} documentId={documentId} name="employee-sex" keyName="employeeSex" optionList={SpaRadiseEnv.SEX_LIST} pageData={pageData} required={true}>
                                <option value="" disabled>Select sex</option>
                                <option value="body">Female</option>
                                <option value="browsAndLashes">Male</option>
                                <option value="browsAndLashes">Others</option>
                            </FormSelect>
                        </div>
                        <div className="employee-form-row">
                            <label htmlFor="employee-birthdate">Birthdate</label>
                            <FormDateInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="birthdate" name="employee-birthdate" pageData={pageData} required={true} />
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
                            <FormContactNumberInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="contactNumberAlternate" name="employee-contactNumber" pageData={pageData} required={true} />
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
                            <FormTinyTextInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="streetName" name="employee-streetName" pageData={pageData} />
                        </div>
                        <div className="employee-form-row">
                            <label htmlFor="employee-barangay">Barangay</label>
                            <FormTinyTextInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="barangay" name="employee-barangay" pageData={pageData} />
                        </div>
                    </div>
                    <div className="employee-form-row-group">
                        <div className="employee-form-row">
                            <label htmlFor="employee-city">City/Municipality</label>
                            <FormTinyTextInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="city" name="employee-city" pageData={pageData} />
                        </div>
                        <div className="employee-form-row">
                            <label htmlFor="employee-province">Province</label>
                            <FormTinyTextInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="province" name="employee-province" pageData={pageData} />
                        </div>
                        <div className="employee-form-row">
                            <label htmlFor="employee-region">Region</label>
                            <FormSelect documentData={pageData.employeeData} documentDefaultData={pageData.employeeData} documentId={documentId} name="employee-region" keyName="employeeRegion" optionList={SpaRadiseEnv.REGION_LIST} pageData={pageData} required={true}>
                                <option value="" disabled>Select region</option>
                                <option >Davao Region (XI)</option>
                                <option>Metro Manila (NCR)</option>
                                <option>Ilocos Region (I)</option>
                                <option>Cagayan Valley (II)</option>
                                <option>Central Luzon (III)</option>
                                <option>CALABARZON (IV-A)</option>
                                <option>MIMAROPA (IV-B)</option>
                                <option>Bicol Region (V)</option>
                                <option>Western Visayas (VI)</option>
                                <option>Central Visayas (VII)</option>
                                <option>Eastern Visayas (VIII)</option>
                                <option>Zamboanga Peninsula (IX)</option>
                                <option>Northern Mindanao (X)</option>
                                <option>SOCCSKSARGEN (XII)</option>
                                <option>Caraga (XIII)</option>
                                <option>Cordillera Administrative Region (CAR)</option>
                                <option>Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)</option>
                            </FormSelect>
                        </div>
                        <div className="employee-form-row">
                            <label htmlFor="employee-postal">Postal Code</label>
                            <FormDateInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="postalCode" name="employee-postalCode" pageData={pageData} required={true} />
                        </div>
                    </div>

                    <div className="employee-gap-row">
                    </div>

                    <div className="employee-form-row">
                        <label htmlFor="employee-status">Status</label>
                        <FormSelect documentData={pageData.employeeData} documentDefaultData={pageData.employeeData} documentId={documentId} name="employee-status" keyName="employeeStatus" optionList={SpaRadiseEnv.REGION_LIST} pageData={pageData} required={true}>
                            <option value="" disabled>Select status</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </FormSelect>
                    </div>
                    <div className="employee-form-row">
                        <label htmlFor="employee-hire-date">Date Hired</label>
                        <FormDateInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="hireDate" name="employee-hireDate" pageData={pageData} required={true} />
                    </div>
                </div>
                <div className="employee-form-row-group">
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
                </div>
                <div className="employee-form-row-group">
                    <div className="employee-form-row">
                        <label htmlFor="employee-leave-reason">Leave Reason:</label>
                        <FormTextArea documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="leaveReason" name="employee-leaveReason" pageData={pageData} />
                    </div>
                </div>

                <div className="employee-gap-row">
                </div>
                <div className="employee-form-row-group">
                    <div className="employee-form-row">
                        <label></label>
                        <button className="employee-inactive-btn">Mark Employee as Inactive</button>
                    </div>
                </div>

                <div className="employee-form-row-group">
                    <div className="employee-form-row">
                        <label htmlFor="employee-unemployment-date">Unemployment Date</label>
                        <FormDateInput documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="unemploymentDate" name="employee-unemploymentDate" pageData={pageData} />
                    </div>
                    <div className="employee-form-row">
                        <label htmlFor="employee-unemployment-date">Unemployment Reason</label>
                        <FormTextArea documentData={pageData.employeeData} documentDefaultData={pageData.employeeDefaultData} documentId={documentId} keyName="unemploymentReason" name="employee-unemploymentReason" pageData={pageData} />
                    </div>
                </div>

                <div className="employee-form-actions">
                    {
                        isEditMode ? <button className="employee-delete-btn" type="button" onClick={deleteEmployee}>Delete</button>
                            : undefined

                    }
                    <button className="employee-cancel-btn" type="button" onClick={cancelEmployeeForm}>Cancel</button>
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