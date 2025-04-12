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
        <section className="bookingReceipt">
            <table>
                <thead><tr>
                    <td>#</td>
                    <td>Name</td>
                    <td>Time</td>
                    <td>Price</td>
                </tr></thead>
                <tbody>
                {
                    Object.keys( componentData.clientInfoMap )
                        .sort( ( clientId1, clientId2 ) => StringUtils.compare(
                            clientDataMap[ clientId1 ].name,
                            clientDataMap[ clientId2 ].name
                        ) )
                        .map( clientId => {

                            const
                                {
                                    packageMap, singleServiceMap
                                } = componentData.clientInfoMap[ clientId ],
                                { name } = clientDataMap[ +clientId ]
                            ;
                            return <Fragment key={ clientId }>
                                <tr><td colSpan={ 4 }>{ name }</td></tr>
                                {
                                    [
                                        ...Object.keys( packageMap ),
                                        ...Object.keys( singleServiceMap )
                                    ].sort( ( documentId1, documentId2 ) => {

                                        const
                                            { name: name1 } = (
                                                ( documentId1 in packageMap ) ?
                                                    packageDataMap[ documentId1 ]
                                                :
                                                    serviceDataMap[
                                                        singleServiceMap[ documentId1 ]
                                                        .serviceTransactionData.service.id
                                                ]
                                            ),
                                            { name: name2 } = (
                                                ( documentId2 in packageMap ) ?
                                                    packageDataMap[ documentId2 ]
                                                :
                                                    serviceDataMap[
                                                        singleServiceMap[ documentId2 ]
                                                        .serviceTransactionData.service.id
                                                    ]
                                            )
                                        ;
                                        return StringUtils.compare( name1, name2 ); 

                                    } ).map( documentId => {

                                        if( documentId in singleServiceMap ) {

                                            const {
                                                serviceTransactionData: {
                                                    bookingDateTimeStart, bookingDateTimeEnd,
                                                    service: { id: serviceId }
                                                },
                                                included, price
                                            } = singleServiceMap[ documentId ];
                                            if( !included ) return undefined;
                                            rowCount++;
                                            return <tr key={ documentId }>
                                                <td>{ rowCount }</td>
                                                <td>{ serviceDataMap[ serviceId ].name }</td>
                                                <td>{
                                                    new DateRange( bookingDateTimeStart, bookingDateTimeEnd ).toString( DATE_TIME_FORMAT )
                                                }</td>
                                                <td>P{ price }</td>
                                            </tr>;

                                        }
                                        return <Fragment key={ documentId }>
                                            <tr>
                                                <td>-</td>
                                                <td colSpan={ 3 }>{
                                                    packageDataMap[ documentId ].name
                                                }</td>
                                            </tr>
                                            {
                                                Object.keys( packageMap[ documentId ] )
                                                    .sort( (
                                                        serviceTransactionId1, serviceTransactionId2
                                                    ) => {

                                                        const
                                                            { name: name1 } = serviceDataMap[
                                                                packageMap[ documentId ]
                                                                [ serviceTransactionId1 ]
                                                                .serviceTransactionData.service.id
                                                            ],
                                                            { name: name2 } = serviceDataMap[
                                                                packageMap[ documentId ]
                                                                [ serviceTransactionId2 ]
                                                                .serviceTransactionData.service.id
                                                            ]
                                                        ;
                                                        return StringUtils.compare(
                                                            name1, name2
                                                        ); 
                
                                                    } )
                                                    .map( serviceTransactionId => {

                                                        const {
                                                            serviceTransactionData: {
                                                                bookingDateTimeStart, bookingDateTimeEnd,
                                                                service: { id: serviceId }
                                                            },
                                                            included, price
                                                        } = packageMap[ documentId ][ serviceTransactionId ];
                                                        if( !included ) return undefined;
                                                        rowCount++;
                                                        return <tr key={ serviceTransactionId }>
                                                            <td>{ rowCount }</td>
                                                            <td>{
                                                                serviceDataMap[ serviceId ].name
                                                            }</td>
                                                            <td>{
                                                                new DateRange( bookingDateTimeStart, bookingDateTimeEnd ).toString( DATE_TIME_FORMAT )
                                                            }</td>
                                                            <td>P{ price }</td>
                                                        </tr>;

                                                    } )
                                            }
                                        </Fragment>;

                                    } )
                                }
                            </Fragment>;

                        } )
                }
                <tr>
                    <td colSpan={ 3 }>Total</td>
                    <td>P{ componentData.totalPrice }</td>
                </tr>
                </tbody>
            </table>

        </section>
    </>;

}
