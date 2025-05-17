type dateFormat =
    "dd Mmmm yyyy" | "h AM" | "hhmm" | "hh:mm" | "h:mmAM" | "Mmmm dd, yyyy" | "Mmmm dd, yyyy - hh:mm"
    | "Mmmm dd, yyyy - hh:mm a.m." | "mmddyyyy" | "yyyy-mm-dd" | "yyyymmdd" | "yyyy-mm-ddThh:mm"
;
type dateRangeFormat =
    "h:mmAM-h:mmAM" | "hh:mm-hh:mm"
;
type discountType = "amount" | "percentage";
type documentId = string;
type employeeStatus = "active" | "inactive";
type jobStatus = "active" | "inactive";
type leaveStatus = "approved" | "canceled" | "pending";
type objectKeyName = number | string;
type popupMode = "yesAndNo" | "yesOnly";
type packageMaintenanceStatus = "active" | "inactive";
type region =
    "NCR" | "I" | "II" | "III" | "IV-A" | "IV-B" | "V" | "VI" | "VII" | "VIII" | "IX" | "X" | "XI"
    | "XII" | "XIII" | "CAR" | "BARMM"
;
type roomType = "room" | "chair";
type serviceTransactionStatus = "canceled" | "uncanceled";
type serviceType = "body" | "browsAndLashes" | "facial" | "handsAndFeet" | "health" | "wax";
type serviceMaintenanceStatus = packageMaintenanceStatus;
type sex = "female" | "male" | "others";
type timeSlotRowPosition = ( "single" | "up" | "down" );
type voucherStatus = "availed" | "canceled" | "pending";
