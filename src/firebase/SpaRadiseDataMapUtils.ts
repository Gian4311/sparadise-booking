import { SpaRadiseDataMap, SpaRadiseDocumentData } from "./SpaRadiseTypes";

export default class SpaRadiseDataMapUtils {

    public static clone< T extends SpaRadiseDocumentData  >(
        dataMap: SpaRadiseDataMap< T >
    ): SpaRadiseDataMap< T > {

        const dataMapNew: SpaRadiseDataMap< T > = {};
        for( let keyName in dataMap ) dataMapNew[ keyName ] = { ...dataMap[ keyName ] };
        return dataMapNew;

    }

}
