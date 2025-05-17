import {
    BookingData,
    ClientDataMap,
    PackageDataMap,
    PackageMaintenanceData,
    ServiceDataMap,
    ServiceMaintenanceData,
    ServiceTransactionData,
    ServiceTransactionDataMap,
    VoucherDataMap,
    VoucherTransactionDataMap
} from "../firebase/SpaRadiseTypes";
import DateRange from "../utils/DateRange";
import Discount from "../utils/Discount";
import { Fragment } from "react/jsx-runtime";
import ObjectUtils from "../utils/ObjectUtils";
import StringUtils from "../utils/StringUtils";
import { useEffect } from "react";

import "../styles/ClientBookingCreation2.css";
import "../styles/BookingReceipt.scss";

interface BookingReceiptPageData {

    bookingData: BookingData,
    clientDataMap: ClientDataMap,
    clientInfoMap: {
        [ clientId: string ]: {
            packageDiscountMap: { [ packageId: documentId ]: Discount | undefined },
            serviceTransactionDataMap: ServiceTransactionDataMap,
            singleServiceDiscountMap: { [ serviceId: documentId ]: Discount | undefined }
        }
    },
    date: Date,
    maintenanceDataMap: { [ documentId: documentId ]: PackageMaintenanceData | ServiceMaintenanceData },
    packageDataMap: PackageDataMap,
    packageServiceKeyMap: {
        [ packageId: documentId ]: { [ serviceId: documentId ]: documentId }
    }
    serviceDataMap: ServiceDataMap,
    serviceTransactionDataMap: ServiceTransactionDataMap,
    voucherDataMap: VoucherDataMap,
    voucherPackageKeyMap: {
        [ voucherId: documentId ]: { [ pakageId: documentId ]: documentId }
    },
    voucherServiceKeyMap: {
        [ voucherId: documentId ]: { [ serviceId: documentId ]: documentId }
    },
    voucherTransactionDataMap: VoucherTransactionDataMap
}

const DATE_TIME_FORMAT = "h:mmAM-h:mmAM";

export default function BookingReceipt(
    { pageData }: { pageData: BookingReceiptPageData }
): JSX.Element {

    const {
        clientDataMap, clientInfoMap, maintenanceDataMap, packageDataMap, serviceDataMap
    } = pageData;

    // function loadComponentData(): void {

    //     const { clientInfoMap } = componentData;
    //     let totalPrice = 0;
    //     for (let clientId in pageData.clientInfoMap) {

    //         const { serviceTransactionDataMap } = pageData.clientInfoMap[clientId];
    //         clientInfoMap[clientId] = {
    //             packageMap: {},
    //             singleServiceMap: {}
    //         };
    //         const { packageMap, singleServiceMap } = clientInfoMap[clientId];
    //         for (let serviceTransactionId in serviceTransactionDataMap) {

    //             const
    //                 serviceTransactionData = serviceTransactionDataMap[serviceTransactionId],
    //                 { canceled, free, service: { id: serviceId } } = serviceTransactionData,
    //                 packageId = serviceTransactionData.package?.id,
    //                 included: boolean = (!canceled || !free),
    //                 price: number = free ? 0 : maintenanceDataMap[serviceId].price,
    //                 serviceTransactionPriceData: ServiceTransactionPriceData = {
    //                     serviceTransactionData, included, price
    //                 }
    //                 ;
    //             if (packageId) {

    //                 if (!(packageId in packageMap)) packageMap[packageId] = {};
    //                 packageMap[packageId][serviceTransactionId] = serviceTransactionPriceData;

    //             } else singleServiceMap[serviceTransactionId] = serviceTransactionPriceData;
    //             totalPrice += price;

    //         }

    //     }
    //     componentData.totalPrice = totalPrice;

    // }

    // loadComponentData();

    async function loadComponentData(): Promise< void > {

        await loadDiscountData();

    }

    async function loadDiscountData(): Promise< void > {

        for( let clientId in clientInfoMap ) {

            const {
                packageDiscountMap, serviceTransactionDataMap, singleServiceDiscountMap
            } = clientInfoMap[ clientId ];
            ObjectUtils.clear( packageDiscountMap );
            ObjectUtils.clear( singleServiceDiscountMap );
            for( let serviceTransactionId in serviceTransactionDataMap ) {

                const
                    serviceTransactionData = serviceTransactionDataMap[ serviceTransactionId ],
                    { service: { id: serviceId } } = serviceTransactionData,
                    packageId = serviceTransactionData.package?.id
                ;
                if( packageId )
                    packageDiscountMap[ packageId ] = undefined;
                else
                    singleServiceDiscountMap[ serviceId ] = undefined;

            }

        }

    }

    useEffect( () => { loadComponentData(); }, [] );

    return <>
        <section className="booking-summary-tables">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Services</th>
                        <th>Time</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>{
                    Object.keys( clientInfoMap )
                        .sort( ( clientId1, clientId2 ) => StringUtils.compare(
                            clientDataMap[ clientId1 ].name,
                            clientDataMap[ clientId2 ].name
                        ) )
                        .map( clientId => {

                            const
                                {
                                    packageDiscountMap, singleServiceDiscountMap
                                } = clientInfoMap[ clientId ],
                                { name } = clientDataMap[ clientId ]
                            ;
                            return <Fragment key={ clientId }>
                                <tr className="client-name-summary"><th colSpan={4} >{ name }</th></tr>
                                
                            </Fragment>

                        } )
                }</tbody>
                <tfoot></tfoot>
            </table>
            {/* {
                Object.keys(clientInfoMap)
                    .sort((clientId1, clientId2) => StringUtils.compare(
                        clientDataMap[clientId1].name,
                        clientDataMap[clientId2].name
                    ))
                    .map(clientId => {

                        const
                            { packageDiscountMap, singleServiceDiscountMap } = clientInfoMap[clientId],
                            { name } = clientDataMap[clientId]
                        ;

                        let clientTotal = 0;
                        let rowCount = 1;

                        return (
                            <table key={clientId}>
                                <thead>
                                    <tr className="client-name-summary"><th colSpan={4} >{name}</th></tr>
                                    <tr>
                                        <th>#</th>
                                        <th>Services</th>
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

                                                const packagePrice = maintenanceDataMap[docId]?.price ?? 0;
                                                clientTotal += packagePrice;

                                                return (
                                                    <Fragment key={docId}>
                                                        <tr className="summary-divider-row">
                                                            <td colSpan={4}></td>
                                                        </tr>
                                                        <tr>
                                                            <td>-</td>
                                                            <td className="package-name-summary" colSpan={2}>
                                                                {packageDataMap[docId].name}
                                                            </td>
                                                            <td>₱{packagePrice}</td>
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
                                                                        included
                                                                    } = packageMap[docId][serviceTransactionId];
                                                                    if (!included) return null;
                                                                    return (
                                                                        <tr key={serviceTransactionId} className="package-service-row">
                                                                            <td>{rowCount++}</td>
                                                                            <td>{serviceDataMap[serviceId].name}</td>
                                                                            <td>{new DateRange(bookingDateTimeStart, bookingDateTimeEnd).toString(DATE_TIME_FORMAT)}</td>
                                                                            <td></td>
                                                                        </tr>
                                                                    );
                                                                })
                                                        }
                                                    </Fragment>
                                                );
                                            })

                                    }
                                    <br></br>
                                    <tr className="voucher-discount">
                                        <td colSpan={3}>Voucher Discount</td>
                                        <td>₱{ Replace with actual discount value here }0</td>
                                    </tr>
                                    <tr className="client-total">
                                        <td colSpan={3}>Total After Discount</td>
                                        <td>₱{clientTotal replace with discounted total if applicable }</td>
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
            </table> */}
        </section>
    </>;


}
