type dateFormat =
    "dd Mmmm yyyy" | "h AM" | "hhmm" | "hh:mm" | "h:mmAM" | "Mmmm dd, yyyy" | "Mmmm dd, yyyy - hh:mm"
    | "Mmmm dd, yyyy - hh:mm a.m." | "mmddyyyy" | "yyyy-mm-dd" | "yyyymmdd" | "yyyy-mm-ddThh:mm"
;
type dateRangeFormat =
    "h:mmAM-h:mmAM" | "hh:mm-hh:mm"
;
type numberFormat = "n.00";

interface TimeData {

    yr?: number,
    mon?: number,
    week?: number,
    day?: number,
    hr?: number,
    min?: number,
    sec?: number,
    ms?: number

}
