export default class NumberRange {

    public constructor(
        private readonly start: number,
        private readonly end: number,
        private readonly step: number = 1,
        private readonly startInclusive: boolean = true,
        private readonly endInclusive: boolean = true
    ) {
        
        const
            trueStart: number = this.getTrueStart(),
            trueEnd: number = this.getTrueEnd()
        ;
        if( trueStart >= trueEnd )
            throw new Error( `True start of number range must be less than true end. True start is ${ trueStart } and true end is ${ trueEnd }` );

    }

    public getSetEnd(): number {

        return this.end;

    }

    public getSetStart(): number {

        return this.start;

    }

    public getTrueEnd(): number {

        let { start, end, endInclusive, step } = this;
        end -= start;
        end -= end % step;
        if( !endInclusive ) end -= step;
        return start + end;

    }

    public getTrueStart(): number {

        let { start, startInclusive, step } = this;
        if( !startInclusive ) start += step;
        return start;

    }

    public checkInRange( number: number, varName: string = "Number" ): boolean {

        const { end, endInclusive, start, startInclusive, step } = this;
        try {

            if( number < start ) throw undefined;
            if( number > end ) throw undefined;
            if( !startInclusive && number === start ) throw undefined;
            if( !endInclusive && number === end ) throw undefined;
            number -= this.start;
            if( number % step > 0 ) throw undefined;

        } catch( error ) {

            throw `${ varName } must only be from ${ this.getTrueStart() } to ${ this.getTrueEnd() } in steps of ${ step }.`;

        }
        return true;

    }

    public overlapsWith( numberRange: NumberRange ): boolean {

        const
            start1: number = this.getTrueStart(),
            end1: number = this.getTrueEnd(),
            start2: number = numberRange.getTrueStart(),
            end2: number = numberRange.getTrueEnd()
        ;
        return ( end1 > start2 ) && ( end2 > start1 );

    }

}
