export default class NumberSystem {

    private valueArray: number[] = [];

    public constructor(
        private bases: number[],
        private value: number = 0
    ) {

        for( let base of bases ) this.valueArray.push( 0 );
        this.reloadValueArray();

    }

    public decrement(): number[] {

        this.value--;
        return this.getValueArray();

    }

    public getValue(): number {

        return this.value;

    }

    public getValueArray(): number[] {

        this.reloadValueArray();
        return this.valueArray;

    }

    public increment(): number[] {

        this.value++;
        return this.getValueArray();

    }

    public isMax(): boolean {

        const { bases, valueArray } = this;
        if( !bases.length ) return true;
        return valueArray[ 0 ] === ( bases[ 0 ] - 1 );

    }

    private reloadValueArray(): void {

        const
            { bases, valueArray } = this,
            { length } = bases
        ;
        let { value } = this;
        for( let index: number = length - 1; index > 0; index-- ) {

            let element: number = value % bases[ index ];
            valueArray[ index ] = element;
            value -= element;
            value /= bases[ index - 1 ];

        }

    }

    private setValue( value: number ): number[] {

        this.value = value;
        return this.getValueArray();

    }

}
