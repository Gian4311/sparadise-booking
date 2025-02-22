export default class DataMapUtils {

    public static clone< T extends {} >( dataMap: T ): T {

        const dataMapNew: T = {} as T;
        for( let keyName in dataMap ) dataMapNew[ keyName ] = { ...dataMap[ keyName ] };
        return dataMapNew;

    }

}
