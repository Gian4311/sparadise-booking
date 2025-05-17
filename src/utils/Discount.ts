export default class Discount {

    public constructor(
        private amount: number,
        private discountType: discountType
    ) {}

    public apply( amount: number ): number {

        if( !this.amount ) return amount;
        switch( this.discountType ) {

            case "amount": return amount - this.amount;
            case "percentage": return Math.round( 10000 * ( 1 - this.amount ) ) / 100;

        }

    }

}
