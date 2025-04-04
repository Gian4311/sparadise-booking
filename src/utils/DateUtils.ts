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

export default class DateUtils {

    public static addTime( date: Date, timeData: TimeData ): Date {

        const
            { yr, mon, week, day, hr, min, sec, ms } = timeData,
            newDate: Date = new Date( date )
        ;
        if( yr ) newDate.setFullYear( date.getFullYear() + yr );
        if( mon ) newDate.setMonth( date.getMonth() + mon )
        if( week ) newDate.setDate( date.getDate() + 7 * week );
        if( day ) newDate.setDate( date.getDate() + day );
        if( hr ) newDate.setHours( date.getHours() + hr );
        if( min ) newDate.setMinutes( date.getMinutes() + min );
        if( sec ) newDate.setSeconds( date.getSeconds() + sec );
        if( ms ) newDate.setMilliseconds( date.getMilliseconds() + ms );
        return newDate;

    }

    public static areEqualDateTimes( date1: Date, date2: Date ): boolean {

        return date1.toISOString() === date2.toISOString();

    }

    public static areSameByDay( date1: Date, date2: Date ): boolean {

        const
            yr1: number = date1.getFullYear(),
            mon1: number = date1.getMonth(),
            day1: number = date1.getDate(),
            yr2: number = date2.getFullYear(),
            mon2: number = date2.getMonth(),
            day2: number = date2.getDate()
        ;
        return ( yr1 === yr2 && mon1 === mon2 && yr1 === yr2 && day1 === day2 );

    }

    public static areSameByMinute( date1: Date, date2: Date ): boolean {

        const
            yr1: number = date1.getFullYear(),
            mon1: number = date1.getMonth(),
            day1: number = date1.getDate(),
            hr1: number = date1.getHours(),
            min1: number = date1.getMinutes(),
            yr2: number = date2.getFullYear(),
            mon2: number = date2.getMonth(),
            day2: number = date2.getDate(),
            hr2: number = date2.getHours(),
            min2: number = date2.getMinutes()
        ;
        return (
            yr1 === yr2 && mon1 === mon2 && yr1 === yr2 && day1 === day2
            && hr1 === hr2 && min1 === min2
        );

    }

    public static getMinDiff( date1: Date, date2: Date ): number {

        return ( date1.getTime() - date2.getTime() ) / 60000;

    }

    public static getYearAge( date: Date ): number {

        const
            today: Date = new Date(),
            yr1: number = today.getFullYear(),
            mon1: number = today.getMonth(),
            day1: number = today.getDate(),
            yr2: number = date.getFullYear(),
            mon2: number = date.getMonth(),
            day2: number = date.getDate()
        ;
        let yrAge: number = yr1 - yr2;
        if( ( mon1 < mon2 ) || ( mon1 === mon2 && day1 < day2 ) ) yrAge--;
        return yrAge;

    }

    public static setTime( date: Date, timeData: TimeData ): Date {

        const
            { yr, mon, day, hr, min, sec, ms } = timeData,
            newDate: Date = new Date( date )
        ;
        if( yr !== undefined ) newDate.setFullYear( yr );
        if( mon !== undefined ) newDate.setMonth( mon );
        // set week
        if( day !== undefined ) newDate.setDate( day );
        if( hr !== undefined ) newDate.setHours( hr );
        if( min !== undefined ) newDate.setMinutes( min );
        if( sec !== undefined ) newDate.setSeconds( sec );
        if( ms !== undefined ) newDate.setMilliseconds( ms );
        return newDate;

    }

    public static toCeilByDay( date: Date ): Date {

        const newDate: Date = new Date( date );
        newDate.setHours( 24, 0, 0, 0 );
        return newDate;

    }

    public static toCeilByMin( date: Date, ceilByMin: number ): Date {

        const
            newDate: Date = new Date( date ),
            min: number = newDate.getMinutes()
        ;
        newDate.setMinutes( ceilByMin * Math.ceil( min / ceilByMin ) );
        return newDate;

    }

    public static toFloorByMin( date: Date, floorByMin: number ): Date {

        const
            newDate: Date = new Date( date ),
            min: number = newDate.getMinutes()
        ;
        newDate.setMinutes( floorByMin * Math.floor( min / floorByMin ) );
        return newDate;

    }

    public static toFloorByDay( date: Date ): Date {

        const newDate: Date = new Date( date );
        newDate.setHours( 0, 0, 0, 0 );
        return newDate;

    }

    public static toString( date: Date, format: dateFormat ): string {

        let
            yr: string, mon: string, day: string, hr: string, min: string,
            hrValue: number, meridiem: string
        ;
        switch( format ) {

            case "dd Mmmm yyyy":
                mon = date.toLocaleString( "default", { month: "long" } );
                day = date.getDate().toString().padStart( 2, "0" );
                yr = date.getFullYear().toString();
                return `${ day } ${ mon } ${ yr }`;

            case "hhmm":
                hr = date.getHours().toString().padStart( 2, "0" );
                min = date.getMinutes().toString().padStart( 2, "0" );
                return `${ hr }${ min }`;

            case "hh:mm":
                hr = date.getHours().toString().padStart( 2, "0" );
                min = date.getMinutes().toString().padStart( 2, "0" );
                return `${ hr }:${ min }`;
            
            case "h:mmAM":
                hrValue = date.getHours();
                hr = ( ( hrValue + 11 ) % 12 + 1 ).toString();
                min = date.getMinutes().toString().padStart( 2, "0" );
                meridiem = `${ hrValue < 12 ? `A` : `P` }M`;
                return `${ hr }:${ min }${ meridiem }`;

            case "Mmmm dd, yyyy":
                mon = date.toLocaleString( "default", { month: "long" } );
                day = date.getDate().toString().padStart( 2, "0" );
                yr = date.getFullYear().toString();
                return `${ mon } ${ day }, ${ yr }`;
            
            case "Mmmm dd, yyyy - hh:mm":
                mon = date.toLocaleString( "default", { month: "long" } );
                day = date.getDate().toString().padStart( 2, "0" );
                yr = date.getFullYear().toString();
                hr = date.getHours().toString().padStart( 2, "0" );
                min = date.getMinutes().toString().padStart( 2, "0" );
                return `${ mon } ${ day }, ${ yr } - ${ hr }:${ min }`;

            case "Mmmm dd, yyyy - hh:mm a.m.":
                mon = date.toLocaleString( "default", { month: "long" } );
                day = date.getDate().toString().padStart( 2, "0" );
                yr = date.getFullYear().toString();
                hrValue = date.getHours();
                hr = ( ( hrValue + 11 ) % 12 + 1 ).toString().padStart( 2, "0" );
                min = date.getMinutes().toString().padStart( 2, "0" );
                meridiem = `${ hrValue < 12 ? `a` : `p` }.m.`;
                return `${ mon } ${ day }, ${ yr } - ${ hr }:${ min } ${ meridiem }`;
            
            case "mmddyyyy":
                yr = date.getFullYear().toString();
                mon = ( date.getMonth() + 1 ).toString().padStart( 2, "0" );
                day = date.getDate().toString().padStart( 2, "0" );
                return `${ mon }${ day }${ yr }`;
            
            case "yyyymmdd":
                yr = date.getFullYear().toString();
                mon = ( date.getMonth() + 1 ).toString().padStart( 2, "0" );
                day = date.getDate().toString().padStart( 2, "0" );
                return `${ yr }${ mon }${ day }`;

            case "yyyy-mm-dd":
                yr = date.getFullYear().toString();
                mon = ( date.getMonth() + 1 ).toString().padStart( 2, "0" );
                day = date.getDate().toString().padStart( 2, "0" );
                return `${ yr }-${ mon }-${ day }`;
            
            case "yyyy-mm-ddThh:mm":
                yr = date.getFullYear().toString();
                mon = ( date.getMonth() + 1 ).toString().padStart( 2, "0" );
                day = date.getDate().toString().padStart( 2, "0" );
                hr = date.getHours().toString().padStart( 2, "0" );
                min = date.getMinutes().toString().padStart( 2, "0" );
                return `${ yr }-${ mon }-${ day }T${ hr }:${ min }`;

        }

    }

}
