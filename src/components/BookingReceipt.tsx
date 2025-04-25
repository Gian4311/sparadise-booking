import {
    ClientDataMap,
    PackageDataMap,
    PackageMaintenanceData,
    ServiceDataMap,
    ServiceMaintenanceData,
    ServiceTransactionData,
    ServiceTransactionDataMap
} from "../firebase/SpaRadiseTypes";
import DateRange from "../utils/DateRange";
import { Fragment } from "react/jsx-runtime";
import ObjectUtils from "../utils/ObjectUtils";
import StringUtils from "../utils/StringUtils";

import "../styles/ClientBookingCreation2.css";
import "../styles/BookingReceipt.scss";

interface BookingReceiptPageData {
    
    clientDataMap: ClientDataMap,
    clientInfoMap: { [ clientIndex: number ]: {
        packageIncludedMap: { [ packageId: documentId ]: boolean },
        serviceIncludedMap: { [ serviceId: documentId ]: string },
        serviceTransactionDataMap: { [ serviceTransactionId: string ]: ServiceTransactionData },
        serviceTransactionIndex: number,
        showPackages: boolean,
        showServices: boolean,
        singleServiceIncludedMap: { [ serviceId: documentId ]: boolean }
    } },
    date: Date,
    maintenanceDataMap: { [documentId: documentId]: PackageMaintenanceData | ServiceMaintenanceData },
    packageDataMap: PackageDataMap,
    packageServiceKeyMap: {
        [ packageId: documentId ]: { [ serviceId: documentId ]: documentId }
    },
    serviceDataMap: ServiceDataMap
}

interface BookingReceiptComponentData {

    clientInfoMap: {
        [ clientId: documentId ]: {

            packageMap: {
                [ packageId: documentId ]: {
                    [ serviceTransactionId: documentId ]: ServiceTransactionPriceData
                }
            },
            singleServiceMap: {
                [ serviceTransactionId: documentId ]: ServiceTransactionPriceData
            }
    
        }
    },
    totalPrice: number

}

interface PackageServiceTransactionListKeyMap {

    [ packageId: documentId ]: documentId[]

}

interface ServiceTransactionPriceData {

    serviceTransactionData: ServiceTransactionData,
    included: boolean,
    price: number

}

const DATE_TIME_FORMAT = "h:mmAM-h:mmAM";

export default function BookingReceipt(
    { pageData }: { pageData: BookingReceiptPageData }
): JSX.Element {

    const
        { clientDataMap, maintenanceDataMap, packageDataMap, serviceDataMap } = pageData,
        componentData: BookingReceiptComponentData = {
            clientInfoMap: {},
            totalPrice: 0
        }
    ;
    let rowCount = 0;

    function loadComponentData(): void {

        const { clientInfoMap } = componentData;
        let totalPrice = 0;
        for( let clientId in pageData.clientInfoMap ) {

            const { serviceTransactionDataMap } = pageData.clientInfoMap[ clientId ];
            clientInfoMap[ clientId ] = {
                packageMap: {},
                singleServiceMap: {}
            };
            const { packageMap, singleServiceMap } = clientInfoMap[ clientId ];
            for( let serviceTransactionId in serviceTransactionDataMap ) {

                const
                    serviceTransactionData = serviceTransactionDataMap[ serviceTransactionId ],
                    { canceled, free, service: { id: serviceId } } = serviceTransactionData,
                    packageId = serviceTransactionData.package?.id,
                    included: boolean = ( !canceled || !free ),
                    price: number = free ? 0 : maintenanceDataMap[ serviceId ].price,
                    serviceTransactionPriceData: ServiceTransactionPriceData = {
                        serviceTransactionData, included, price
                    }
                ;
                if( packageId ) {

                    if( !( packageId in packageMap ) ) packageMap[ packageId ] = {};
                    packageMap[ packageId ][ serviceTransactionId ] = serviceTransactionPriceData;

                } else singleServiceMap[ serviceTransactionId ] = serviceTransactionPriceData;
                totalPrice += price;

            }

        }
        componentData.totalPrice = totalPrice;

    }

    loadComponentData();

    return <>
    <section className="booking-summary-tables">
        {
            Object.keys(componentData.clientInfoMap)
                .sort((clientId1, clientId2) => StringUtils.compare(
                    clientDataMap[clientId1].name,
                    clientDataMap[clientId2].name
                ))
                .map(clientId => {

                    const {
                        packageMap,
                        singleServiceMap
                    } = componentData.clientInfoMap[clientId];
                    const { name } = clientDataMap[clientId];

                    let clientTotal = 0;
                    let rowCount = 1;

                    return (
                        <table key={clientId}>
                            <thead>
                                <tr className="client-name-summary"><th colSpan={4} >{name}</th></tr>
                                <tr>
                                    <th>#</th>
                                    <th>Service/Package</th>
                                    <th>Time</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    [...Object.keys(packageMap), ...Object.keys(singleServiceMap)]
                                        .sort((docId1, docId2) => {
                                            const name1 = docId1 in packageMap
                                                ? packageDataMap[docId1].name
                                                : serviceDataMap[singleServiceMap[docId1].serviceTransactionData.service.id].name;
                                            const name2 = docId2 in packageMap
                                                ? packageDataMap[docId2].name
                                                : serviceDataMap[singleServiceMap[docId2].serviceTransactionData.service.id].name;
                                            return StringUtils.compare(name1, name2);
                                        })
                                        .map(docId => {
                                            if (docId in singleServiceMap) {
                                                const {
                                                    serviceTransactionData: {
                                                        bookingDateTimeStart,
                                                        bookingDateTimeEnd,
                                                        service: { id: serviceId }
                                                    },
                                                    included,
                                                    price
                                                } = singleServiceMap[docId];
                                                if (!included) return null;
                                                clientTotal += price;
                                                return (
                                                    <tr key={docId}>
                                                        <td>{rowCount++}</td>
                                                        <td>{serviceDataMap[serviceId].name}</td>
                                                        <td>{new DateRange(bookingDateTimeStart, bookingDateTimeEnd).toString(DATE_TIME_FORMAT)}</td>
                                                        <td>₱{price}</td>
                                                    </tr>
                                                );
                                            }

                                            return (
                                                <Fragment key={docId}>
                                                    <tr>
                                                        <td>-</td>
                                                        <td className="package-name-summary" colSpan={3}>
                                                            {packageDataMap[docId].name}
                                                        </td>
                                                    </tr>
                                                    {
                                                        Object.keys(packageMap[docId])
                                                            .sort((s1, s2) => {
                                                                const name1 = serviceDataMap[packageMap[docId][s1].serviceTransactionData.service.id].name;
                                                                const name2 = serviceDataMap[packageMap[docId][s2].serviceTransactionData.service.id].name;
                                                                return StringUtils.compare(name1, name2);
                                                            })
                                                            .map(serviceTransactionId => {
                                                                const {
                                                                    serviceTransactionData: {
                                                                        bookingDateTimeStart,
                                                                        bookingDateTimeEnd,
                                                                        service: { id: serviceId }
                                                                    },
                                                                    included,
                                                                    price
                                                                } = packageMap[docId][serviceTransactionId];
                                                                if (!included) return null;
                                                                clientTotal += price;
                                                                return (
                                                                    <tr key={serviceTransactionId}>
                                                                        <td>{rowCount++}</td>
                                                                        <td>{serviceDataMap[serviceId].name}</td>
                                                                        <td>{new DateRange(bookingDateTimeStart, bookingDateTimeEnd).toString(DATE_TIME_FORMAT)}</td>
                                                                        <td>₱{price}</td>
                                                                    </tr>
                                                                );
                                                            })
                                                    }
                                                </Fragment>
                                            );
                                        })
                                }
                                <tr className="client-total">
                                    <td colSpan={3}></td>
                                    <td>₱{clientTotal}</td>
                                </tr>
                            </tbody>
                        </table>
                    );
                })
        }

        <table className="overall-total-table">
            <tbody>
                <tr>
                    <td colSpan={1}>Total</td>
                    <td colSpan={2} className="total-price" >₱{componentData.totalPrice}</td>
                </tr>
            </tbody>
        </table>
    </section>
</>;


}
