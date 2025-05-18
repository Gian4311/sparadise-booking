import MoneyUtils from "../firebase/MoneyUtils";

export default class Discount {

    public constructor(
        private amount: number,
        private discountType: discountType
    ) {}

    public apply( amount: number ): number {

        if( !this.amount ) return amount;
        switch( this.discountType ) {

            case "amount": return amount - this.amount;
            case "percentage": return MoneyUtils.multiply(
                amount, ( 100 - this.amount * 100 ) / 100
            );

        }

    }

    public getAmount(): number {

        return this.amount;

    }

    public getDiscount( amount: number, minZero: boolean = true ): number {

        if( !this.amount ) return amount;
        let discount: number = 0;
        switch( this.discountType ) {

            case "amount":
                discount = this.amount;
                break;
            case "percentage":
                discount = MoneyUtils.multiply( amount, this.amount ) / 100;

        }
        if( minZero ) discount = Math.max( discount, 0 );
        return discount;

    }

}
