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
    SpaRadisePageData,
    VoucherData,
    VoucherDataMap,
    VoucherTransactionApplicationMap,
    VoucherTransactionDataMap
} from "../firebase/SpaRadiseTypes";
import DateRange from "../utils/DateRange";
import DateUtils from "../utils/DateUtils";
import Discount from "../utils/Discount";
import FormMarkButton from "./FormMarkButton";
import FormVoucherInput from "./FormVoucherInput";
import { Fragment } from "react/jsx-runtime";
import MoneyUtils from "../firebase/MoneyUtils";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import StringUtils from "../utils/StringUtils";
import {
    useEffect,
    useState
} from "react";
import VoucherUtils from "../firebase/VoucherUtils";

import "../styles/ClientBookingCreation2.css";
import "../styles/BookingReceipt.scss";

type bookingReceiptMode = "newBooking" | "management";

interface BookingReceiptPageData extends SpaRadisePageData {

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
    initialPrice: number,
    voucherDataMap: VoucherDataMap,
    voucherDiscount: number,
    voucherPackageKeyMap: {
        [ voucherId: documentId ]: { [ pakageId: documentId ]: documentId }
    },
    voucherServiceKeyMap: {
        [ voucherId: documentId ]: { [ serviceId: documentId ]: documentId }
    },
    voucherTransactionApplicationMap: VoucherTransactionApplicationMap,
    voucherTransactionDataMap: VoucherTransactionDataMap,
    voucherTransactionDefaultDataMap: VoucherTransactionDataMap

}

interface PriceRow {

    clientId: documentId,
    packageId?: documentId,
    price: number,
    serviceId?: documentId

}

const DATE_TIME_FORMAT = "h:mmAM-h:mmAM";

export default function BookingReceipt( {
    bookingReceiptMode, pageData, showActualTime,
    addVoucher, deleteVoucherTransaction, reloadPageData
}: {
    bookingReceiptMode: bookingReceiptMode,
    pageData: BookingReceiptPageData,
    showActualTime: boolean,
    addVoucher(): Promise< void > | void,
    deleteVoucherTransaction( voucherTransactionId: documentId ): Promise< void > | void,
    reloadPageData(): void
} ): JSX.Element {

    const
        {
            clientDataMap, clientInfoMap, maintenanceDataMap, packageDataMap, serviceDataMap,
            voucherDataMap,
            voucherPackageKeyMap, voucherServiceKeyMap, voucherTransactionApplicationMap,
            voucherTransactionDataMap, voucherTransactionDefaultDataMap
        } = pageData,
        [ reload, setReload ] = useState< boolean >( false )
    ;
    let priceRowCount = 0;

    async function loadComponentData(): Promise< void > {

        await loadServiceServiceTransactionData();
        await loadPriceData();
        setReload( !reload );

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

    async function loadPriceData(): Promise< void > {

        pageData.initialPrice = 0;
        pageData.voucherDiscount = 0;
        for( let clientId in clientInfoMap ) {

            const {
                packageVoucherTransactionKeyMap, serviceTransactionDataMap,
                singleServiceVoucherTransactionKeyMap
            } = clientInfoMap[ clientId ];
            ObjectUtils.clear( packageVoucherTransactionKeyMap );
            ObjectUtils.clear( singleServiceVoucherTransactionKeyMap );
            for( let serviceTransactionId in serviceTransactionDataMap ) {

                const
                    serviceTransactionData = serviceTransactionDataMap[ serviceTransactionId ],
                    { service: { id: serviceId }, status } = serviceTransactionData,
                    packageId = serviceTransactionData.package?.id
                ;
                if( status === "canceled" ) continue;
                if( packageId )
                    packageVoucherTransactionKeyMap[ packageId ] = undefined;
                else
                    singleServiceVoucherTransactionKeyMap[ serviceId ] = undefined;

            }

        }

        const
            priceTable: PriceRow[] = Object.keys( clientInfoMap ).reduce< PriceRow[] >(
                ( priceList, clientId ) => {

                    const {
                        packageVoucherTransactionKeyMap, singleServiceVoucherTransactionKeyMap
                    } = clientInfoMap[ clientId ];
                    priceList.push(...ArrayUtils.union(
                        Object.keys( packageVoucherTransactionKeyMap ),
                        Object.keys( singleServiceVoucherTransactionKeyMap )
                    ).map( documentId => ( {
                        clientId,
                        packageId:
                            ( documentId in packageVoucherTransactionKeyMap ) ? documentId
                            : undefined
                        ,
                        price: maintenanceDataMap[ documentId ].price,
                        serviceId:
                            ( documentId in packageVoucherTransactionKeyMap ) ? undefined
                            : ( documentId in singleServiceVoucherTransactionKeyMap ) ? documentId
                            : undefined
                    } ) ) );
                    return priceList;

                } , []
            ),
            voucherTransactionPriceTableMap: {
                [ voucherTransactionId: documentId ]: ( PriceRow | undefined )[]
            } = {}
        ;

        for( let { price } of priceTable ) pageData.initialPrice += price;

        for( let voucherTransactionId in voucherTransactionDataMap ) {

            const
                { voucher, status } = voucherTransactionDataMap[ voucherTransactionId ],
                voucherId = voucher?.id
            ;
            if( !voucherId || status === "canceled" ) continue;
            voucherTransactionPriceTableMap[ voucherTransactionId ] = [];
            const
                packageKeyMap = voucherPackageKeyMap[ voucherId ],
                serviceKeyMap = voucherServiceKeyMap[ voucherId ],
                voucherTransactionPriceTable =
                    voucherTransactionPriceTableMap[ voucherTransactionId ]
            ;
            for( let priceRow of priceTable ) {

                const { packageId, serviceId } = priceRow;
                if(
                    ( packageId && packageKeyMap && packageId in packageKeyMap )
                    || ( serviceId && serviceKeyMap && serviceId in serviceKeyMap )
                ) voucherTransactionPriceTable.push( priceRow );

            }
            const { length } = voucherTransactionPriceTable;
            if( !length ) {

                delete voucherTransactionPriceTableMap[ voucherTransactionId ];
                continue;

            }
            voucherTransactionPriceTable.push( undefined );

        }

        const voucherTransactionIdList: documentId[] = Object.keys( voucherTransactionPriceTableMap );
        let maxSavings: number = 0, maxPriceRowAssignedList: number[] = [];

        function checkPriceRowAssignedList( priceRowAssignedList: number[] ): void {

            const
                endIndex: number = priceRowAssignedList.length - 1,
                priceRow = getPriceRow( endIndex, priceRowAssignedList ),
                assigned: boolean = isAssigned( priceRow, endIndex, priceRowAssignedList )
            ;
            if( assigned ) return;
            if( priceRowAssignedList.length < voucherTransactionIdList.length )
                for(
                    let priceRowIndex: number = 0;
                    priceRowIndex < getPriceTableLength( endIndex );
                    priceRowIndex++
                ) checkPriceRowAssignedList( [ ...priceRowAssignedList, priceRowIndex ] );
            else
                checkSavings( priceRowAssignedList );

        }

        function checkSavings( priceRowAssignedList: number[] ) {

            let savings: number = 0;
            for(
                let voucherTransactionIndex: number = 0;
                voucherTransactionIndex < priceRowAssignedList.length;
                voucherTransactionIndex++
            ) {

                const priceRow: PriceRow | undefined =
                    getPriceRow( voucherTransactionIndex, priceRowAssignedList )
                ;
                if( !priceRow ) continue;
                const
                    { price } = priceRow,
                    discount: Discount = getDiscount( voucherTransactionIndex )
                ;
                savings = MoneyUtils.add( savings, discount.getDiscount( price ) );

            }
            if( savings > maxSavings ) {

                maxSavings = savings;
                maxPriceRowAssignedList = priceRowAssignedList;

            }

        }

        function getDiscount( voucherTransactionIndex: number ): Discount {

            const
                voucherTransactionId: documentId = getVoucherTransactionId( voucherTransactionIndex ),
                voucherId: documentId = voucherTransactionDataMap[ voucherTransactionId ].voucher.id
            ;
            return VoucherUtils.getDiscount( voucherDataMap[ voucherId ] )

        }

        function getPriceRow(
            voucherTransactionIndex: number, priceRowAssignedList: number[]
        ): PriceRow | undefined {

            const
                voucherTransactionId: documentId = getVoucherTransactionId( voucherTransactionIndex ),
                priceTable = voucherTransactionPriceTableMap[ voucherTransactionId ],
                priceRowIndex: number = priceRowAssignedList[ voucherTransactionIndex ],
                priceRow = priceTable[ priceRowIndex ]
            ;
            return priceRow;

        }

        function getPriceTableLength( voucherTransactionIndex: number ): number {

            const
                voucherTransactionId: documentId = getVoucherTransactionId( voucherTransactionIndex ),
                priceTable = voucherTransactionPriceTableMap[ voucherTransactionId ]
            ;
            return priceTable.length;

        }

        function getVoucherTransactionId( voucherTransactionIndex: number ): string {

            return voucherTransactionIdList[ voucherTransactionIndex ];

        }

        function isAssigned(
            priceRow: PriceRow | undefined, endIndex: number, priceRowAssignedList: number[]
        ): boolean {

            if( !priceRow ) return false;
            let isAssigned: boolean = false;
            for(
                let voucherTransactionIndex: number = endIndex - 1;
                voucherTransactionIndex >= 0 && !isAssigned;
                voucherTransactionIndex--
            ) {

                const priceRowCompare = getPriceRow( voucherTransactionIndex, priceRowAssignedList );
                if( !priceRowCompare ) continue;
                isAssigned = ( priceRow === priceRowCompare );

            }
            return isAssigned;

        }

        ObjectUtils.clear( voucherTransactionApplicationMap );
        if( voucherTransactionIdList.length >= 1 ) for(
            let priceRowIndex: number = 0;
            priceRowIndex < getPriceTableLength( 0 );
            priceRowIndex++
        ) checkPriceRowAssignedList( [ priceRowIndex ] );

        for(
            let voucherTransactionIndex: number = 0;
            voucherTransactionIndex < maxPriceRowAssignedList.length;
            voucherTransactionIndex++
        ) {

            const priceRow: PriceRow | undefined = getPriceRow(
                voucherTransactionIndex, maxPriceRowAssignedList
            );
            if( !priceRow ) continue;
            const
                { clientId, packageId, serviceId } = priceRow,
                {
                    packageVoucherTransactionKeyMap, singleServiceVoucherTransactionKeyMap
                } = clientInfoMap[ clientId ],
                voucherTransactionId: documentId = getVoucherTransactionId( voucherTransactionIndex )
            ;
            if( packageId && packageId in packageVoucherTransactionKeyMap ) {

                packageVoucherTransactionKeyMap[ packageId ] = voucherTransactionId;
                voucherTransactionApplicationMap[ voucherTransactionId ] = packageId;

            } else if( serviceId && serviceId in singleServiceVoucherTransactionKeyMap ) {

                singleServiceVoucherTransactionKeyMap[ serviceId ] = voucherTransactionId;
                voucherTransactionApplicationMap[ voucherTransactionId ] = serviceId;

            }

        }
        pageData.voucherDiscount = maxSavings;

    }

    useEffect( () => { loadComponentData(); }, [ pageData ] );

    return <>
        <section className="booking-summary-tables">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Service</th>
                        <th>Booking Time</th>
                        {
                            showActualTime ? <th>Actual Time</th> : undefined
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
                                                serviceTransactionDataMap[ serviceTransactionId2 ],
                                                serviceDataMap
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
                                                key={ documentId }
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
                                                                serviceTransactionDataMap[ serviceTransactionId2 ],
                                                                serviceDataMap
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
                <tfoot>
                    <tr><td colSpan={ showActualTime ? 5 : 4 }><hr/></td></tr>
                    <tr className="initial-price">
                        <td></td>
                        <td colSpan={ showActualTime ? 3 : 2 }>Initial Price</td>
                        <td>₱{ NumberUtils.toString( pageData.initialPrice, "n.00" ) }</td>
                    </tr>
                    <tr className="voucher-discount">
                        <td></td>
                        <td colSpan={ showActualTime ? 3 : 2 }>Voucher Discount</td>
                        <td>-₱{ NumberUtils.toString( pageData.voucherDiscount, "n.00" ) }</td>
                    </tr>
                    <tr className="client-total">
                        <td></td>
                        <td colSpan={ showActualTime ? 3 : 2 }>Total Price</td>
                        <td>₱{ NumberUtils.toString( MoneyUtils.add(
                            pageData.initialPrice,
                            -pageData.voucherDiscount
                        ), "n.00" ) }</td>
                    </tr>
                </tfoot>
            </table>
        </section>
        <h2 className="voucher-input-label">Vouchers:</h2>
        <section className="form-section booking-summary-section">
            <div>
                <section className="booking-summary-tables">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Applied to</th>
                                <th>Discount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(voucherTransactionDataMap).map((voucherTransactionId, index) => {
                                
                                const
                                    { packageDataMap, serviceDataMap, voucherTransactionApplicationMap } = pageData,
                                    documentId = voucherTransactionApplicationMap[ voucherTransactionId ],
                                    voucherId: string | undefined =
                                        documentId ? voucherTransactionDataMap[ voucherTransactionId ].voucher?.id
                                        : undefined
                                ;
                                return <tr key={voucherTransactionId}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <FormVoucherInput
                                            className="voucher-input"
                                            documentData={ voucherTransactionDataMap[ voucherTransactionId ] }
                                            documentId={ voucherTransactionId }
                                            keyName="voucher"
                                            pageData={pageData}
                                            voucherDataMap={ pageData.voucherDataMap }
                                            onChange={ () => reloadPageData() }
                                        />
                                    </td>
                                    <td>{
                                        ( !documentId || !voucherId ) ? "-"
                                        : voucherDataMap[ voucherId ].name
                                    }</td>
                                    <td>{
                                        !documentId ? "-"
                                        : (
                                            ( documentId in packageDataMap ) ? packageDataMap
                                            : serviceDataMap
                                        )[ documentId ].name
                                    }</td>
                                    <td>{
                                        ( !documentId || !voucherId ) ? "-"
                                        : "₱" + NumberUtils.toString(
                                            VoucherUtils.getDiscount( voucherDataMap[ voucherId ] ).getDiscount(
                                                maintenanceDataMap[ documentId ].price
                                            ),
                                            "n.00"
                                        )
                                    }</td>
                                    <td>{
                                        (
                                            !( voucherTransactionId in voucherTransactionDefaultDataMap )
                                        ) ? <button className="delete-voucher-btn" type="button" onClick={() => deleteVoucherTransaction(voucherTransactionId)}>Delete</button>
                                        : ( voucherTransactionDataMap[ voucherTransactionId ].status == "canceled" ) ? <FormMarkButton< voucherTransactionStatus >
                                            confirmMessage="Would you like to add back this voucher?"
                                            className="add-voucher-btn"
                                            documentData={ voucherTransactionDataMap[ voucherTransactionId ] }
                                            documentDefaultData={ voucherTransactionDefaultDataMap[ voucherTransactionId ] }
                                            documentId={ voucherTransactionId }
                                            keyName="status"
                                            noText="Cancel"
                                            pageData={ pageData }
                                            value="pending"
                                            reloadPageData={ reloadPageData }
                                            yesText="Yes"
                                        >Redeem</FormMarkButton>
                                        : <FormMarkButton< voucherTransactionStatus >
                                            confirmMessage="Would you like to cancel this voucher?"
                                            className="delete-voucher-btn"
                                            documentData={ voucherTransactionDataMap[ voucherTransactionId ] }
                                            documentDefaultData={ voucherTransactionDefaultDataMap[ voucherTransactionId ] }
                                            documentId={ voucherTransactionId }
                                            keyName="status"
                                            noText="Back"
                                            pageData={ pageData }
                                            value="canceled"
                                            reloadPageData={ reloadPageData }
                                            yesText="Yes, Cancel This"
                                        >Cancel</FormMarkButton>
                                    }</td>
                                </tr>;

                            })}
                            <tr>
                                <td colSpan={ 5 }></td>
                                <td><button className="add-voucher-btn" type="button" onClick={addVoucher}>
                                    Add
                                </button></td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </div>
        </section>
        {
            ( bookingReceiptMode === "management" ) ? <>
                <h2 className="voucher-input-label">Discounts:</h2>
                <section className="form-section booking-summary-section">
                    fefeef

                </section>
            </> : undefined
        }
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

function SingleServiceRow( {
    price, priceRowCount, serviceName, serviceTransactionData, showActualTime
}: {
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
        isOneMinute: boolean = Boolean(
            actualBookingDateTimeStart && actualBookingDateTimeEnd
            && DateUtils.areSameByMinute( actualBookingDateTimeStart, actualBookingDateTimeEnd )
        ),
        dateRangeActual: DateRange | undefined =
            (
                !canceled && actualBookingDateTimeStart && actualBookingDateTimeEnd && !isOneMinute
            ) ? new DateRange( actualBookingDateTimeStart, actualBookingDateTimeEnd )
            : undefined
    ;
    return <tr className="receiptRow">
        <td>{ priceRowCount }</td>
        <td>{ serviceName }</td>
        <td>{ dateRangeBooking.toString( DATE_TIME_FORMAT ) }</td>
        {
            showActualTime ? <td>{
                dateRangeActual ? dateRangeActual.toString( DATE_TIME_FORMAT )
                : ( isOneMinute && actualBookingDateTimeStart ) ?
                    DateUtils.toString( actualBookingDateTimeStart, "h:mmAM" )
                : "-"
            }</td> : undefined
        }
        <td>{ ( price !== undefined ) ? `₱` + NumberUtils.toString( price, "n.00" ) : "" }</td>
    </tr>;

}

function compareServiceTransactionData(
    serviceTransactionData1: ServiceTransactionData, serviceTransactionData2: ServiceTransactionData,
    serviceDataMap: ServiceDataMap
): number {

    const
        {
            service: { id: serviceId1 },
            bookingDateTimeEnd: bookingDateTimeEnd1,
            bookingDateTimeStart: bookingDateTimeStart1
        } = serviceTransactionData1,
        {
            service: { id: serviceId2 },
            bookingDateTimeEnd: bookingDateTimeEnd2,
            bookingDateTimeStart: bookingDateTimeStart2
        } = serviceTransactionData2,
        hasSameStart: boolean = DateUtils.areSameByMinute(
            bookingDateTimeStart1, bookingDateTimeStart2
        ),
        hasSameEnd: boolean = DateUtils.areSameByMinute(
            bookingDateTimeEnd1, bookingDateTimeEnd2
        )
    ;
    if( !hasSameStart ) return DateUtils.compare( bookingDateTimeStart1, bookingDateTimeStart2 );
    if( !hasSameEnd ) return DateUtils.compare( bookingDateTimeEnd1, bookingDateTimeEnd2 );
    return StringUtils.compare( serviceDataMap[ serviceId1 ].name, serviceDataMap[ serviceId2 ].name );

}
