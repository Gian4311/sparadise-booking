import NumberUtils from "../utils/NumberUtils";

export default class MoneyUtils {

    public static add( ...addendList: number[] ): number {

        let sum: number = 0;
        for( let addend of addendList ) sum += 100 * addend;
        sum /= 100;
        sum = NumberUtils.round( sum, 2 );
        return sum;

    }

    public static multiply( amount: number, factor: number ): number {

        let product: number = ( 100 * amount * factor ) / 100;
        product = NumberUtils.round( product, 2 );
        return product;

    }

    public static subtract( minuend: number, subtrahend: number ): number {

        let difference: number = ( 100 * minuend - 100 * subtrahend ) / 100;
        difference = NumberUtils.round( difference, 2 );
        return difference;

    }

}
