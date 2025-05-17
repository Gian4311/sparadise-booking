import ArrayUtils from "../utils/ArrayUtils";
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
    VoucherTransactionDataMap,
    VoucherTransactionNotIncludedMap
} from "../firebase/SpaRadiseTypes";
import DateRange from "../utils/DateRange";
import DateUtils from "../utils/DateUtils";
import Discount from "../utils/Discount";
import { Fragment } from "react/jsx-runtime";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import StringUtils from "../utils/StringUtils";
import {
    useEffect,
    useState
} from "react";

import "../styles/ClientBookingCreation2.css";
import "../styles/BookingReceipt.scss";

interface BookingReceiptPageData {

    bookingData: BookingData,
    clientDataMap: ClientDataMap,
    clientInfoMap: {
        [ clientId: string ]: {
            packageServiceTransactionDataMap: { [ packageId: documentId ]: ServiceTransactionDataMap },
            packageVoucherTransactionKeyMap: { [ packageId: documentId ]: documentId | undefined },
            serviceServiceTransactionKeyMap: { [ serviceId: documentId ]: documentId },
            serviceTransactionDataMap: ServiceTransactionDataMap,
            singleServiceVoucherTransactionKeyMap: { [ serviceId: documentId ]: documentId | undefined }
        }
    },
    date: Date,
    maintenanceDataMap: { [ documentId: documentId ]: PackageMaintenanceData | ServiceMaintenanceData },
    packageDataMap: PackageDataMap,
    packageServiceKeyMap: {
        [ packageId: documentId ]: { [ serviceId: documentId ]: documentId }
    }
    serviceDataMap: ServiceDataMap,
    voucherDataMap: VoucherDataMap,
    voucherPackageKeyMap: {
        [ voucherId: documentId ]: { [ pakageId: documentId ]: documentId }
    },
    voucherServiceKeyMap: {
        [ voucherId: documentId ]: { [ serviceId: documentId ]: documentId }
    },
    voucherTransactionDataMap: VoucherTransactionDataMap,
    voucherTransactionNotIncludedMap: VoucherTransactionNotIncludedMap

}

const DATE_TIME_FORMAT = "h:mmAM-h:mmAM";

export default function BookingReceipt( { pageData, showActualTime, reloadPageData }: {
    pageData: BookingReceiptPageData,
    showActualTime: boolean,
    reloadPageData(): void
} ): JSX.Element {

    const
        {
            clientDataMap, clientInfoMap, maintenanceDataMap, packageDataMap, serviceDataMap,
            voucherPackageKeyMap, voucherServiceKeyMap, voucherTransactionDataMap
        } = pageData
    ;
    let priceRowCount = 0;

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

        await loadServiceServiceTransactionData();
        await loadDiscountData();
        await loadVoucerData();
        reloadPageData();

    }

    async function loadDiscountData(): Promise< void > {

        for( let clientId in clientInfoMap ) {

            const {
                packageVoucherTransactionKeyMap, serviceTransactionDataMap, singleServiceVoucherTransactionKeyMap
            } = clientInfoMap[ clientId ];
            ObjectUtils.clear( packageVoucherTransactionKeyMap );
            ObjectUtils.clear( singleServiceVoucherTransactionKeyMap );
            for( let serviceTransactionId in serviceTransactionDataMap ) {

                const
                    serviceTransactionData = serviceTransactionDataMap[ serviceTransactionId ],
                    { service: { id: serviceId } } = serviceTransactionData,
                    packageId = serviceTransactionData.package?.id
                ;
                if( packageId )
                    packageVoucherTransactionKeyMap[ packageId ] = undefined;
                else
                    singleServiceVoucherTransactionKeyMap[ serviceId ] = undefined;

            }

        }

    }

    async function loadServiceServiceTransactionData(): Promise< void > {

        for( let clientId in clientInfoMap ) {

            const {
                packageServiceTransactionDataMap, serviceTransactionDataMap,
                serviceServiceTransactionKeyMap
            } = clientInfoMap[ clientId ];
            for( let serviceTransactionId in serviceTransactionDataMap ) {

                const
                    serviceTransactionData = serviceTransactionDataMap[ serviceTransactionId ],
                    serviceId: documentId = serviceTransactionData.service.id,
                    packageId: documentId | undefined =  serviceTransactionData.package?.id
                ;
                serviceServiceTransactionKeyMap[ serviceId ] = serviceTransactionId;
                if( !packageId ) continue;
                if( !( packageId in packageServiceTransactionDataMap ) )
                    packageServiceTransactionDataMap[ packageId ] = {};
                packageServiceTransactionDataMap[ packageId ][ serviceTransactionId ] =
                    serviceTransactionData
                ;

            }

        }

    }

    async function loadVoucerData(): Promise< void > {

        const
            voucherTransactionNotIncludedMap: VoucherTransactionNotIncludedMap = {},
            priceList = Object.keys( clientInfoMap ).reduce< {
                clientId: documentId,
                packageId?: documentId,
                price: number,
                serviceId?: documentId
            }[] >( ( priceList, clientId ) => {

                const { packageVoucherTransactionKeyMap, singleServiceVoucherTransactionKeyMap } = clientInfoMap[ clientId ];
                priceList.push(...ArrayUtils.union(
                    Object.keys( packageVoucherTransactionKeyMap ), Object.keys( singleServiceVoucherTransactionKeyMap )
                ).map( documentId => ( {
                    clientId,
                    packageId: ( documentId in packageVoucherTransactionKeyMap ) ? documentId : undefined,
                    price: maintenanceDataMap[ documentId ].price,
                    serviceId: ( documentId in singleServiceVoucherTransactionKeyMap ) ? documentId : undefined
                } ) ) );
                return priceList;

            } , [] ).sort( ( { price: price1 }, { price: price2 } ) => ( price1 - price2 ) )
        ;
        for( let voucherTransactionId in voucherTransactionDataMap )
            voucherTransactionNotIncludedMap[ voucherTransactionId ] = true;
        for( let { clientId, packageId, serviceId } of priceList ) {

            for( let voucherTransactionId in voucherTransactionNotIncludedMap ) {

                const {
                    voucher: { id: voucherId }
                } = voucherTransactionDataMap[ voucherTransactionId ];
                if(
                    packageId && voucherPackageKeyMap[ voucherId ]
                    && packageId in voucherPackageKeyMap[ voucherId ]
                ) {

                    delete voucherTransactionNotIncludedMap[ voucherTransactionId ];
                    clientInfoMap[ clientId ].packageVoucherTransactionKeyMap[ packageId ] =
                        voucherTransactionId
                    ;
                    break;

                } else if(
                    serviceId && voucherServiceKeyMap[ voucherId ]
                    && serviceId in voucherServiceKeyMap[ voucherId ]
                ) {

                    delete voucherTransactionNotIncludedMap[ voucherTransactionId ];
                    clientInfoMap[ clientId ].singleServiceVoucherTransactionKeyMap[ serviceId ] =
                        voucherTransactionId
                    ;
                    break;

                }

            }

        }
        ObjectUtils.clear( pageData.voucherTransactionNotIncludedMap );
        ObjectUtils.fill( pageData.voucherTransactionNotIncludedMap, voucherTransactionNotIncludedMap );

    }

    useEffect( () => { loadComponentData(); }, [] );

    return <>
        <section className="booking-summary-tables">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Service</th>
                        <th>Time</th>
                        {
                            showActualTime ? <th>Actual</th> : undefined
                        }
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
                                    packageServiceTransactionDataMap,
                                    packageVoucherTransactionKeyMap,
                                    serviceServiceTransactionKeyMap,
                                    serviceTransactionDataMap,
                                    singleServiceVoucherTransactionKeyMap
                                } = clientInfoMap[ clientId ],
                                { name } = clientDataMap[ clientId ]
                            ;
                            return <Fragment key={ clientId }>
                                <tr className="client-name-summary">
                                    <th colSpan={ showActualTime ? 5 : 4 }>{ name }</th>
                                </tr>
                                {
                                    Object.keys( serviceTransactionDataMap ).sort(
                                        ( serviceTransactionId1, serviceTransactionId2 ) =>
                                            compareServiceTransactionData(
                                                serviceTransactionDataMap[ serviceTransactionId1 ],
                                                serviceTransactionDataMap[ serviceTransactionId2 ]
                                            )
                                    ).reduce< documentId[] >(
                                        ( documentIdList, serviceTransactionId ) => {

                                            const
                                                serviceTransactionData =
                                                    serviceTransactionDataMap[ serviceTransactionId ]
                                                ,
                                                serviceId = serviceTransactionData.service.id,
                                                packageId = serviceTransactionData.package?.id,
                                                doumentId = packageId ? packageId : serviceId
                                            ;
                                            if( !documentIdList.includes( doumentId ) )
                                                documentIdList.push( doumentId );
                                            return documentIdList;

                                        } , []
                                    ).map( documentId => {

                                        priceRowCount++;
                                        if( documentId in singleServiceVoucherTransactionKeyMap )
                                            return <SingleServiceRow
                                                price={ maintenanceDataMap[ documentId ].price }
                                                priceRowCount={ priceRowCount }
                                                serviceName={ serviceDataMap[ documentId ].name }
                                                serviceTransactionData={ serviceTransactionDataMap[
                                                    serviceServiceTransactionKeyMap[ documentId ]
                                                ] }
                                                showActualTime={ showActualTime }
                                            />;
                                        if( documentId in packageServiceTransactionDataMap )
                                            return <Fragment key={ documentId }>
                                                <PackageRow
                                                    packageName={ packageDataMap[ documentId ].name }
                                                    price={ maintenanceDataMap[ documentId ].price }
                                                    priceRowCount={ priceRowCount }
                                                    showActualTime={ showActualTime }
                                                />
                                                {
                                                    Object.keys(
                                                        packageServiceTransactionDataMap[ documentId ]
                                                    ).sort(
                                                        ( serviceTransactionId1, serviceTransactionId2 ) =>
                                                            compareServiceTransactionData(
                                                                serviceTransactionDataMap[ serviceTransactionId1 ],
                                                                serviceTransactionDataMap[ serviceTransactionId2 ]
                                                            )
                                                    ).map( serviceTransactionId => {

                                                        const
                                                            serviceTransactionData =
                                                                serviceTransactionDataMap[ serviceTransactionId ]
                                                            ,
                                                            serviceId = serviceTransactionData.service.id
                                                        ;
                                                        return <SingleServiceRow
                                                            key={ serviceTransactionId }
                                                            serviceName={ serviceDataMap[ serviceId ].name }
                                                            serviceTransactionData={ serviceTransactionData }
                                                            showActualTime={ showActualTime }
                                                        />;

                                                    } )
                                                }
                                            </Fragment>;
                                        return undefined;

                                    } )
                                }
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
                            { packageVoucherTransactionKeyMap, singleServiceVoucherTransactionKeyMap } = clientInfoMap[clientId],
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

function PackageRow( { packageName, price, priceRowCount, showActualTime }: {
    packageName: string,
    price: number,
    priceRowCount?: number,
    showActualTime: boolean
} ): JSX.Element {

    return <tr className="receiptRow">
        <td>{ priceRowCount }</td>
        <td colSpan={ showActualTime ? 3 : 2 }>{ packageName }</td>
        <td>₱{ NumberUtils.toString( price, "n.00" ) }</td>
    </tr>;

}

function SingleServiceRow( { price, priceRowCount, serviceName, serviceTransactionData, showActualTime }: {
    price?: number,
    priceRowCount?: number,
    serviceName: string,
    serviceTransactionData: ServiceTransactionData,
    showActualTime: boolean
} ): JSX.Element {

    const
        {
            actualBookingDateTimeEnd, actualBookingDateTimeStart, bookingDateTimeEnd,
            bookingDateTimeStart, canceled
        } = serviceTransactionData,
        dateRangeBooking: DateRange = new DateRange( bookingDateTimeStart, bookingDateTimeEnd ),
        dateRangeActual: DateRange | undefined =
            ( !canceled && actualBookingDateTimeStart && actualBookingDateTimeEnd ) ?
                new DateRange( actualBookingDateTimeStart, actualBookingDateTimeEnd )
            : undefined
    ;
    return <tr className="receiptRow">
        <td>{ priceRowCount }</td>
        <td>{ serviceName }</td>
        <td>{ dateRangeBooking.toString( DATE_TIME_FORMAT ) }</td>
        {
            showActualTime ? <td>
                { dateRangeActual ? dateRangeActual.toString( DATE_TIME_FORMAT ) : "-" }
            </td> : undefined
        }
        <td>{ ( price !== undefined ) ? `₱` + NumberUtils.toString( price, "n.00" ) : "" }</td>
    </tr>;

}

function compareServiceTransactionData(
    serviceTransactionData1: ServiceTransactionData, serviceTransactionData2: ServiceTransactionData
): number {

    const
        {
            bookingDateTimeEnd: bookingDateTimeEnd1,
            bookingDateTimeStart: bookingDateTimeStart1
        } = serviceTransactionData1,
        {
            bookingDateTimeEnd: bookingDateTimeEnd2,
            bookingDateTimeStart: bookingDateTimeStart2
        } = serviceTransactionData2,
        hasSameStart: boolean = DateUtils.areSameByMinute(
            bookingDateTimeStart1, bookingDateTimeStart2
        )
    ;
    return hasSameStart ? DateUtils.compare(
        bookingDateTimeEnd1, bookingDateTimeEnd2
    ) : DateUtils.compare(
        bookingDateTimeStart1, bookingDateTimeStart2
    );

}
