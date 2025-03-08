import { NumberRange } from "../utils/NumberRange";

export default class SpaRadiseEnv {

    public static ACCOUNT_COLLECTION = "accounts";
    public static BOOKING_COLLECTION = "bookings";
    public static CLIENT_COLLECTION = "clients";
    public static JOB_COLLECTION = "jobs";
    public static JOB_SERVICE_COLLECTION = "jobServices";
    public static MIN_AGE_LIMIT = 12;
    public static MIN_DENOMINATION = 30;
    public static PACKAGE_COLLECTION = "packages";
    public static PACKAGE_MAINTENANCE_COLLECTION = "packageMaintenances";
    public static PACKAGE_SERVICE_COLLECTION = "packageServices";
    public static ROOM_TYPE_LIST: roomType[] = [ "chair", "room" ];
    public static SERVICE_COLLECTION = "services";
    public static SERVICE_DURATION_MIN_RANGE = new NumberRange( 0, 120, 30, false );
    public static SERVICE_MAINTENANCE_COLLECTION = "serviceMaintenances";
    public static SERVICE_TYPE_LIST: serviceType[] = [
        "body", "browsAndLashes", "facial", "handsAndFeet", "health", "wax"
    ];
    public static SERVICE_MAINTENANCE_STATUS_TYPE_LIST: serviceMaintenanceStatus[] = [
        "active", "inactive"
    ];
    public static SEX_LIST: sex[] = [ "female", "male", "others" ];
    public static VOUCHER_COLLECTION = "vouchers";
    public static VOUCHER_PACKAGE_COLLECTION = "voucherPackages";
    public static VOUCHER_SERVICE_COLLECTION = "voucherServices";

    public static isRoomType( string: roomType ): boolean {

        return SpaRadiseEnv.ROOM_TYPE_LIST.includes( string );

    }

    public static isServiceType( string: serviceType ): boolean {

        return SpaRadiseEnv.SERVICE_TYPE_LIST.includes( string );

    }

}
