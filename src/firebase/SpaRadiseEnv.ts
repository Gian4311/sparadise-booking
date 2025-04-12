import NumberRange from "../utils/NumberRange";

export default class SpaRadiseEnv {

    public static ACCOUNT_COLLECTION = "accounts";
    public static BOOKING_COLLECTION = "bookings";
    public static CLIENT_COLLECTION = "clients";
    public static CONTACT_NUMBER_REGEX =
        `(^09[0-9]{9}$)`
        + `|(^09[0-9]{2} [0-9]{3} [0-9]{4}$)`
        + `|(^09[0-9]{2}-[0-9]{3}-[0-9]{4}$)`
        + `|(^[+]639[0-9]{9}$)`
        + `|(^[+]639[0-9]{2} [0-9]{3} [0-9]{4}$)`
        + `|(^[+]639[0-9]{2}-[0-9]{3}-[0-9]{4}$)`
    ;
    public static DATE_REGEX = /^[0-9]{4}-(0[1-9]|1[0-2])-[0-3][0-9]$/;
    public static DATE_TIME_REGEX = /^[0-9]{4}-(0[1-9]|1[0-2])-[0-3][0-9]T[0-2][0-9]:[0-6][0-9]$/;
    public static EMPLOYEE_COLLECTION = "employees";
    public static EMPLOYEE_LEAVE_COLLECTION = "employeeLeaves";
    public static EMPLOYEE_LEAVE_STATUS_LIST = [ "approved", "canceled", "pending" ];
    public static JOB_COLLECTION = "jobs";
    public static JOB_SERVICE_COLLECTION = "jobServices";
    public static JOB_STATUS_LIST: jobStatus[] = [ "active", "inactive" ];
    public static MIN_AGE_LIMIT = 12;
    public static MIN_DENOMINATION = 30;
    public static PACKAGE_COLLECTION = "packages";
    public static PACKAGE_MAINTENANCE_COLLECTION = "packageMaintenances";
    public static PACKAGE_SERVICE_COLLECTION = "packageServices";
    public static REGION_LIST: region[] = [
        "NCR", "I", "II", "III", "IV-A", "IV-B", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII",
        "XIII", "CAR", "BARMM"
    ];
    public static ROOM_TYPE_LIST: roomType[] = [ "chair", "room" ];
    public static SERVICE_COLLECTION = "services";
    public static SERVICE_DURATION_LIST = [ 30, 60 ];
    public static SERVICE_DURATION_MIN_RANGE = new NumberRange( 0, 120, 30, false );
    public static SERVICE_MAINTENANCE_COLLECTION = "serviceMaintenances";
    public static SERVICE_MAINTENANCE_STATUS_LIST: serviceMaintenanceStatus[] = [
        "active", "inactive"
    ];
    public static SERVICE_TRANSACTION_COLLECTION = "serviceTransactions";
    public static SERVICE_TRANSACTION_STATUS_LIST: serviceTransactionStatus[] = [
        "canceled", "uncanceled"
    ];
    public static SERVICE_TYPE_LIST: serviceType[] = [
        "body", "browsAndLashes", "facial", "handsAndFeet", "health", "wax"
    ];
    public static SEX_LIST: sex[] = [ "female", "male", "others" ];
    public static VOUCHER_COLLECTION = "vouchers";
    public static VOUCHER_PACKAGE_COLLECTION = "voucherPackages";
    public static VOUCHER_SERVICE_COLLECTION = "voucherServices";
    public static ZIP_CODE_REGEX = `^[0-9]{4}$`;

    public static isRoomType( string: roomType ): boolean {

        return SpaRadiseEnv.ROOM_TYPE_LIST.includes( string );

    }

    public static isServiceType( string: serviceType ): boolean {

        return SpaRadiseEnv.SERVICE_TYPE_LIST.includes( string );

    }

}
