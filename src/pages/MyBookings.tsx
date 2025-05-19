import { AccountData, BookingDataMap, ClientDataMap, ServiceDataMap, ServiceTransactionDataMap } from "../firebase/SpaRadiseTypes";
import BookingUtils from "../firebase/BookingUtils";
import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";
import {
    useEffect,
    useState
} from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";
import "../styles/EmployeeServiceMenu.css";
import LoadingScreen from "../components/LoadingScreen";
import { Link, useNavigate } from "react-router-dom";
import { ChangeEvent } from "react";
import StringUtils from "../utils/StringUtils";
import ObjectUtils from "../utils/ObjectUtils";
import ClientUtils from "../firebase/ClientUtils";
import ServiceTransactionUtils from "../firebase/ServiceTransactionUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import DateUtils from "../utils/DateUtils";
import ClientNavBar from "../components/ClientNavBar";

type sortMode = "ascending" | "descending";

interface MyBookingsPageData extends SpaRadisePageData {

    accountData: AccountData,
    accountId?: documentId,
    bookingDataMap: BookingDataMap,
    bookingDateMap: { [ bookingId: documentId ]: Date },
    clientDataMap: ClientDataMap,
    serviceDataMap: ServiceDataMap,
    serviceTransactionDataMap: ServiceTransactionDataMap

}

export default function MyBookings(): JSX.Element {

    const
        [pageData, setPageData] = useState<MyBookingsPageData>({
            accountData: {} as unknown as AccountData,
            bookingDataMap: {},
            bookingDateMap: {},
            clientDataMap: {},
            loaded: false,
            serviceDataMap: {},
            serviceTransactionDataMap: {},
            updateMap: {}
        }),
        { bookingDataMap } = pageData,
        [search, setSearch] = useState<string>(""),
        [sortMode, setSortMode] = useState<sortMode>("ascending"),
        navigate = useNavigate()
    ;

    async function cancelBooking( bookingId: documentId ): Promise< void > {

        const
            bookingData = bookingDataMap[ bookingId ],
            clientDataMap: ClientDataMap = {},
            serviceTransactionDataMap: ServiceTransactionDataMap = {}
        ;
        for( let clientId in pageData.clientDataMap ) {

            const clientData = pageData.clientDataMap[ clientId ];
            if( clientData.booking.id === bookingId )
                clientDataMap[ clientId ] = clientData

        }
        for( let serviceTransactionId in pageData.serviceTransactionDataMap ) {

            const serviceTransactionData = pageData.serviceTransactionDataMap[ serviceTransactionId ];
            if( serviceTransactionId in clientDataMap )
                serviceTransactionDataMap[ serviceTransactionId ] = serviceTransactionData;

        }
        for( let serviceTransactionId in serviceTransactionDataMap ) {

            pageData.serviceTransactionDataMap[ serviceTransactionId ].status = "serviceCanceled";

        }
        bookingData.canceledDateTime = new Date();
        for (let serviceTransactionId in serviceTransactionDataMap) {
        
            const serviceTransactionData = serviceTransactionDataMap[serviceTransactionId];
            await ServiceTransactionUtils.updateServiceTransaction(
                serviceTransactionId, serviceTransactionData
            );

        }
        await BookingUtils.updateBooking(bookingId, bookingData);
        reloadPageData();

    }

    async function loadPageData(): Promise<void> {

        if( !pageData.accountId ) return;
        pageData.loaded = false;
        pageData.bookingDataMap = await BookingUtils.getBookingDataMapByAccount(
            pageData.accountId
        );
        pageData.serviceDataMap = await ServiceUtils.getServiceDataMapAll();
        pageData.clientDataMap = await ClientUtils.getClientDataMapAll();
        for( let clientId in pageData.clientDataMap ) {

            const { booking: { id: bookingId } } = pageData.clientDataMap[ clientId ];
            if( !( bookingId in pageData.bookingDataMap ) )
                delete pageData.clientDataMap[ clientId ];

        }
        if( ObjectUtils.hasKeys( pageData.clientDataMap ) )
            pageData.serviceTransactionDataMap =
                await ServiceTransactionUtils.getServiceTransactionDataMapByClientDataMap(
                    pageData.clientDataMap
                )
            ;
        for( let serviceTransactionId in pageData.serviceTransactionDataMap ) {

            const
                {
                    bookingDateTimeStart, client: { id: clientId }
                } = pageData.serviceTransactionDataMap[ serviceTransactionId ],
                { booking: { id: bookingId } } = pageData.clientDataMap[ clientId ]
            ;
            if(
                !pageData.bookingDateMap[ bookingId ]
                || DateUtils.compare( bookingDateTimeStart, pageData.bookingDateMap[ bookingId ] ) < 0
            ) pageData.bookingDateMap[ bookingId ] = bookingDateTimeStart;

        }
        pageData.loaded = true;
        reloadPageData();

    }

    function handleChangeSearch(event: ChangeEvent<HTMLInputElement>): void {
    
        const { value } = event.target;
        setSearch(value);

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    function toggleSortMode(): void {

        const newSortMode: sortMode = (sortMode === "ascending") ? "descending" : "ascending";
        setSortMode(newSortMode);

    }

    useEffect(() => { loadPageData(); }, [ pageData.accountId ]);

    return <>
        <ClientNavBar pageData={ pageData } reloadPageData={ reloadPageData }/>
        <LoadingScreen loading={!pageData.loaded}></LoadingScreen>
        <div>
            
            <div className="service-menu-main-content">
                <label htmlFor="service-menu-main-content" className="service-menu-main-content-location">Bookings</label>
                <div className="service-menu-form-section">
                    <div className="service-stats">
                        <div className="service-stat">{ObjectUtils.keyLength( bookingDataMap )}<br></br><span>Total Bookings</span></div>
                    </div>
                    <div className="controls">
                        <input placeholder="Search services or packages" className="search" value={search} onChange={event => handleChangeSearch(event)} />
                        <button className="filter-btn" type="button" value={sortMode} onClick={toggleSortMode}>{
                            (sortMode === "ascending") ? "A - Z" : "Z - A"
                        }</button>
                        <Link to="/management/bookings/new"><button className="action-btn" type="button">+ Add new</button></Link>
                    </div>
                    <table className="services-table">
                        <thead><tr>
                            <th>#</th>
                            <th>Client/s</th>
                            <th>Services</th>
                            <th>Date & Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr></thead>
                        <tbody>{
                            Object.keys( bookingDataMap ).sort((documentId1, documentId2) => {

                                const
                                    date1 = pageData.bookingDateMap[ documentId1 ],
                                    date2 = pageData.bookingDateMap[ documentId2 ]
                                ;
                                if( !date1 ) return -1;
                                if( !date2 ) return 1;
                                return DateUtils.compare( date1, date2 );

                            }).map((documentId, index) => {

                                const
                                    count: string = (index + 1).toString(),
                                    bookingData = bookingDataMap[documentId],
                                    clientDataMap: ClientDataMap = {},
                                    serviceTransactionDataMap: ServiceTransactionDataMap = {},
                                    serviceCountMap: { [ serviceId: documentId ]: number } = {}
                                ;
                                for( let clientId in pageData.clientDataMap ) {

                                    const clientData = pageData.clientDataMap[ clientId ];
                                    if( clientData.booking.id === documentId )
                                        clientDataMap[ clientId ] = clientData

                                }
                                for( let serviceTransactionId in pageData.serviceTransactionDataMap ) {

                                    const serviceTransactionData = pageData.serviceTransactionDataMap[ serviceTransactionId ];
                                    if( serviceTransactionId in clientDataMap )
                                        serviceTransactionDataMap[ serviceTransactionId ] = serviceTransactionData;

                                }
                                for( let serviceTransactionId in serviceTransactionDataMap ) {

                                    const { service: { id: serviceId } } = pageData.serviceTransactionDataMap[ serviceTransactionId ];
                                    if( !( serviceId in serviceCountMap ) )
                                        serviceCountMap[ serviceId ] = 0;
                                    else
                                        serviceCountMap[ serviceId ]++;

                                }
                                const
                                    status = (
                                        bookingData.canceledDateTime ? "Canceled"
                                        : bookingData.finishedDateTime ? "Finished"
                                        : bookingData.activeDateTime ? "Active"
                                        : bookingData.reservedDateTime ? "Reserved"
                                        : "Pending"
                                    ),
                                    show: boolean = StringUtils.has(
                                        `${count}\t${status}`
                                        , search
                                    )
                                ;
                                return show ? <tr key={documentId} onClick={() => navigate(`/management/bookings/${documentId}`)}>
                                    <td>{count}</td>
                                    <td>{
                                        Object.keys( serviceCountMap ).sort( ( serviceId1, serviceId2 ) => StringUtils.compare(
                                            pageData.serviceDataMap[ serviceId1 ].name,
                                            pageData.serviceDataMap[ serviceId1 ].name
                                        ) ).map( serviceId => {

                                            const count = serviceCountMap[ serviceId ];
                                            return pageData.serviceDataMap[ serviceId ].name + ( count > 1 ? ` × ` + count : `` );

                                        } ).join( `, ` )
                                    }</td>
                                    <td>{ pageData.bookingDateMap[ documentId ] ? DateUtils.toString( pageData.bookingDateMap[ documentId ], "Mmmm dd, yyyy - hh:mm a.m." ) : `-` }</td>
                                    <td>{ status }</td>
                                    <td><button className="employee-cancel-btn" type="button" onClick={ () => cancelBooking( documentId ) }>Cancel</button></td>
                                </tr> : undefined;

                            })
                        }</tbody>
                    </table>
                </div>
            </div>
        </div>
    </>;

}
