type dateFormat =
    "dd Mmmm yyyy" | "hhmm" | "hh:mm" | "Mmmm dd, yyyy" | "Mmmm dd, yyyy - hh:mm" | "mmddyyyy"
    | "yyyy-mm-dd" | "yyyymmdd" | "yyyy-mm-ddThh:mm"
;

export default class DateUtils {

    public static addTime(
        date: Date,
        { days, minutes }: {
            days?: number,
            minutes?: number
        }
    ): Date {

        const newDate: Date = new Date( date );
        if( days ) newDate.setDate( date.getDate() + days );
        if( minutes ) newDate.setMinutes( date.getMinutes() + minutes );
        return newDate;

    }

    public static areEqualDateTimes( date1: Date, date2: Date ): boolean {

        return date1.toISOString() === date2.toISOString();

    }

    public static areSameDay( date1: Date, date2: Date ): boolean {

        const
            year1: number = date1.getFullYear(),
            month1: number = date1.getMonth(),
            day1: number = date1.getDate(),
            year2: number = date2.getFullYear(),
            month2: number = date2.getMonth(),
            day2: number = date2.getDate()
        ;
        return ( year1 === year2 && month1 === month2 && year1 === year2 && day1 === day2 );

    }

    public static getYearAge( date: Date ): number {

        const
            today: Date = new Date(),
            year1: number = today.getFullYear(),
            month1: number = today.getMonth(),
            day1: number = today.getDate(),
            year2: number = date.getFullYear(),
            month2: number = date.getMonth(),
            day2: number = date.getDate()
        ;
        let yearAge: number = year1 - year2;
        if( ( month1 < month2 ) || ( month1 === month2 && day1 < day2 ) ) yearAge--;
        return yearAge;

    }

    public static setTime(
        date: Date,
        {
            year = date.getFullYear(),
            month = date.getMonth(),
            day = date.getDate(),
            hours, minutes, seconds
        }: {
            year?: number,
            month?: number,
            day?: number,
            hours?: number,
            minutes?: number,
            seconds?: number
        }
    ): Date {

        const newDate: Date = new Date( date );
        newDate.setFullYear( year, month, day );
        if( hours !== undefined ) newDate.setHours( hours );
        if( minutes !== undefined ) newDate.setMinutes( minutes );
        if( seconds !== undefined ) newDate.setSeconds( seconds );
        return newDate;

    }

    public static toCeilByDay( date: Date ): Date {

        const newDate: Date = new Date( date );
        newDate.setHours( 24, 0, 0 );
        return newDate;

    }

    public static toFloorByDay( date: Date ): Date {

        const newDate: Date = new Date( date );
        newDate.setHours( 0, 0, 0 );
        return newDate;

    }

    public static toString( date: Date, format: dateFormat ): string {

        let year: string, month: string, day: string, hours: string, minutes: string;
        switch( format ) {

            case "dd Mmmm yyyy":
                month = date.toLocaleString( "default", { month: "long" } );
                day = date.getDate().toString().padStart( 2, "0" );
                year = date.getFullYear().toString();
                return `${ day } ${ month } ${ year }`;

            case "hhmm":
                hours = date.getHours().toString().padStart( 2, "0" );
                minutes = date.getMinutes().toString().padStart( 2, "0" );
                return `${ hours }${ minutes }`;

            case "hh:mm":
                hours = date.getHours().toString().padStart( 2, "0" );
                minutes = date.getMinutes().toString().padStart( 2, "0" );
                return `${ hours }:${ minutes }`;

            case "Mmmm dd, yyyy":
                month = date.toLocaleString( "default", { month: "long" } );
                day = date.getDate().toString().padStart( 2, "0" );
                year = date.getFullYear().toString();
                return `${ month } ${ day }, ${ year }`;
            
            case "Mmmm dd, yyyy - hh:mm":
                month = date.toLocaleString( "default", { month: "long" } );
                day = date.getDate().toString().padStart( 2, "0" );
                year = date.getFullYear().toString();
                hours = date.getHours().toString().padStart( 2, "0" );
                minutes = date.getMinutes().toString().padStart( 2, "0" );
                return `${ month } ${ day }, ${ year } - ${ hours }:${ minutes }`;
            
            case "mmddyyyy":
                year = date.getFullYear().toString();
                month = ( date.getMonth() + 1 ).toString().padStart( 2, "0" );
                day = date.getDate().toString().padStart( 2, "0" );
                return `${ month }${ day }${ year }`;
            
            case "yyyymmdd":
                year = date.getFullYear().toString();
                month = ( date.getMonth() + 1 ).toString().padStart( 2, "0" );
                day = date.getDate().toString().padStart( 2, "0" );
                return `${ year }${ month }${ day }`;

            case "yyyy-mm-dd":
                year = date.getFullYear().toString();
                month = ( date.getMonth() + 1 ).toString().padStart( 2, "0" );
                day = date.getDate().toString().padStart( 2, "0" );
                return `${ year }-${ month }-${ day }`;
            
            case "yyyy-mm-ddThh:mm":
                year = date.getFullYear().toString();
                month = ( date.getMonth() + 1 ).toString().padStart( 2, "0" );
                day = date.getDate().toString().padStart( 2, "0" );
                hours = date.getHours().toString().padStart( 2, "0" );
                minutes = date.getMinutes().toString().padStart( 2, "0" );
                return `${ year }-${ month }-${ day }T${ hours }:${ minutes }`;

        }

    }

}
