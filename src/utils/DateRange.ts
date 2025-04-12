import DateUtils from "./DateUtils";
import NumberRange from "./NumberRange";

const DATETIME_FORMAT = "Mmmm dd, yyyy - hh:mm a.m.";

export default class DateRange {

    public constructor(
        private readonly start: Date,
        private readonly end: Date
    ) {
        
        const
            startTime: number = start.getTime(),
            endTime: number = end.getTime()
        ;
        if( startTime >= endTime )
            throw new Error(
                `Start of date range must be less than end. Start is ${
                    DateUtils.toString( start, DATETIME_FORMAT )
                } and end is ${
                    DateUtils.toString( end, DATETIME_FORMAT )
                }`
            );

    }

    public getEnd(): Date {

        return this.end;

    }

    public getStart(): Date {

        return this.start;

    }

    // public checkInRange( number: number, varName: string = "Number" ): boolean {

    //     const { end, endInclusive, start, startInclusive, step } = this;
    //     try {

    //         if( number < start ) throw undefined;
    //         if( number > end ) throw undefined;
    //         if( !startInclusive && number === start ) throw undefined;
    //         if( !endInclusive && number === end ) throw undefined;
    //         number -= this.start;
    //         if( number % step > 0 ) throw undefined;

    //     } catch( error ) {

    //         throw `${ varName } must only be from ${ this.getTrueStart() } to ${ this.getTrueEnd() } in steps of ${ step }.`;

    //     }
    //     return true;

    // }

    public overlapsWith( dateRange: DateRange ): boolean {

        const
            start1: number = this.getStart().getTime(),
            end1: number = this.getEnd().getTime(),
            start2: number = dateRange.getStart().getTime(),
            end2: number = dateRange.getEnd().getTime(),
            numberRange1: NumberRange = new NumberRange( start1, end1 ),
            numberRange2: NumberRange = new NumberRange( start2, end2 )
        ;
        return numberRange1.overlapsWith( numberRange2 );

    }

    public toString( dateRangeFormat: dateRangeFormat ): string {

        const { start, end } = this;
        let DATE_FORMAT: dateFormat;
        switch( dateRangeFormat ) {

            case "hh:mm-hh:mm":
                DATE_FORMAT = "hh:mm";
                return ( `${
                        DateUtils.toString( start, DATE_FORMAT )
                    }-${
                        DateUtils.toString( end, DATE_FORMAT )
                    }`
                );
            
            case "h:mmAM-h:mmAM":
                DATE_FORMAT = "h:mmAM";
                return ( `${
                        DateUtils.toString( start, DATE_FORMAT )
                    }-${
                        DateUtils.toString( end, DATE_FORMAT )
                    }`
                );

        }

    }

}
