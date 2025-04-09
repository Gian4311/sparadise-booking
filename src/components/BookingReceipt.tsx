import DateRange from "../utils/DateRange";
import { Fragment } from "react/jsx-runtime";
import ObjectUtils from "../utils/ObjectUtils";
import {
    PackageDataMap,
    PackageMaintenanceData,
    ServiceDataMap,
    ServiceMaintenanceData,
    ServiceTransactionData,
    ServiceTransactionDataMap
} from "../firebase/SpaRadiseTypes";

import "../styles/BookingReceipt.scss";

interface BookingReceiptPageData {
    
    clientInfoMap: { [ clientIndex: number ]: {
        packageIncluded: { [ packageId: documentId ]: boolean },
        serviceIncludedMap: { [ serviceId: documentId ]: string },
        serviceTransactionDataMap: { [ serviceTransactionId: string ]: ServiceTransactionData },
        serviceTransactionIndex: number,
        showPackages: boolean,
        showServices: boolean,
        singleServiceIncluded: { [ serviceId: documentId ]: boolean }
    } },
    date: Date,
    maintenanceDataMap: { [documentId: documentId]: PackageMaintenanceData | ServiceMaintenanceData },
    packageDataMap: PackageDataMap,
    packageServiceKeyMap: {
        [ packageId: documentId ]: { [ serviceId: documentId ]: documentId }
    },
    serviceDataMap: ServiceDataMap
}

interface BookingReceiptRowData {

    price: number,
    serviceTransactionDataList: ServiceTransactionData[],
    packageId?: documentId

}

interface BookingReceiptRowData2 {

    price: number,
    serviceTransactionDataList: ServiceTransactionData[]

}

export default function BookingReceipt(
    { pageData }: { pageData: BookingReceiptPageData }
): JSX.Element {

    const
        { clientInfoMap, maintenanceDataMap, packageDataMap, serviceDataMap } = pageData,
        receiptRowDataGroupList = []
    ;

    function loadComponentData(): void {

        for( let clientId in clientInfoMap ) {

            const { serviceTransactionDataMap } = clientInfoMap[ clientId ];


        }

    }

    loadComponentData();

    return <>
        <section className="bookingReceipt">
            <table>
                <thead><tr>
                    <td>#</td>
                    <td>Name</td>
                    <td>Time</td>
                    <td>Price</td>
                </tr></thead>
                <tbody>{
                    Object.keys( clientInfoMap ).reduce( ( array, clientId ) => {

                        const
                            { serviceTransactionDataMap } = clientInfoMap[ +clientId ],
                            packageIncluded: { [ packageId: documentId ]: number } = {}
                        ;
                        for( let serviceTransactionId in serviceTransactionDataMap ) {

                            const
                                serviceTransactionData = serviceTransactionDataMap[
                                    serviceTransactionId
                                ],
                                { service: { id: serviceId } } = serviceTransactionData,
                                packageId = serviceTransactionData.package?.id
                            ;
                            if( !packageId )
                                array.push( {
                                    price: maintenanceDataMap[ serviceId ].price,
                                    serviceTransactionDataList: [ serviceTransactionData ]
                                } );
                            else if( packageId in packageIncluded ) {

                                const index: number = packageIncluded[ packageId ];
                                array[ index ].serviceTransactionDataList.push(
                                    serviceTransactionData
                                );

                            } else
                                array.push( {
                                    packageId,
                                    price: maintenanceDataMap[ packageId ].price,
                                    serviceTransactionDataList: [ serviceTransactionData ]
                                } );

                        }
                        return array;

                    }, [] as BookingReceiptRowData[] ).sort(
                        ( rowData1, rowData2 ) => {

                            const
                                {  } = rowData1
                            ;
                            return -1;

                        }
                    ).map( a => <></> )
                }</tbody>
            </table>
        </section>
    </>;

}
