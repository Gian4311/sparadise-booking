import {
    ChangeEvent,
    useEffect,
    useState
} from "react";
import { Link } from "react-router-dom";
import ObjectUtils from "../utils/ObjectUtils";
import {
    PackageData,
    PackageDataMap,
    PackageMaintenanceData,
    PackageMaintenanceDataMap,
    ServiceData,
    ServiceDataMap,
    ServiceMaintenanceData,
    ServiceMaintenanceDataMap
} from "../firebase/SpaRadiseTypes";
import PackageMaintenanceUtils from "../firebase/PackageMaintenanceUtils";
import PackageUtils from "../firebase/PackageUtils";
import ServiceMaintenanceUtils from "../firebase/ServiceMaintenanceUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";
import StringUtils from "../utils/StringUtils";

type rowType = "package" | "service";
type showMode = "" | rowType;
type sortMode = "ascending" | "descending";

interface ServicePackageMenuPageData extends SpaRadisePageData  {

    maintenanceDataMap: { [ documentId: documentId ]: PackageMaintenanceData | ServiceMaintenanceData },
    packageDataMap: PackageDataMap,
    rowTypeMap: { [ documentId: documentId ]: rowType },
    serviceDataMap: ServiceDataMap

}

export default function ServicePackageMenu(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< ServicePackageMenuPageData >( {
            loaded: false,
            maintenanceDataMap: {},
            packageDataMap: {},
            rowTypeMap: {},
            serviceDataMap: {},
            updateMap: {}
        } ),
        { maintenanceDataMap, packageDataMap, rowTypeMap, serviceDataMap } = pageData,
        [ search, setSearch ] = useState< string >( "" ),
        [ showMode, setShowMode ] = useState< showMode >( "" ),
        [ sortMode, setSortMode ] = useState < sortMode >( "ascending" )
    ;

    function getDataMap( documentId: string ): PackageDataMap | ServiceDataMap {

        switch( rowTypeMap[ documentId ] ) {

            case "package": return packageDataMap;
            case "service": return serviceDataMap;

        }

    }

    function handleChangeSearch( event: ChangeEvent< HTMLInputElement > ): void {

        const { value } = event.target;
        setSearch( value );

    }

    function handleChangeShowMode( event: ChangeEvent< HTMLSelectElement > ): void {

        const newShowMode: showMode = event.target.value as showMode;
        setShowMode( newShowMode );

    }

    async function loadPageData(): Promise< void > {
        
        pageData.packageDataMap = await PackageUtils.getPackageDataMapAll();
        pageData.serviceDataMap = await ServiceUtils.getServiceDataMapAll();
        const { packageDataMap, rowTypeMap, serviceDataMap } = pageData;
        for( let packageId in packageDataMap ) rowTypeMap[ packageId ] = "package";
        for( let serviceId in serviceDataMap ) rowTypeMap[ serviceId ] = "service";
        const date: Date = new Date();
        const
            packageMaintenanceDataMap =
                await PackageMaintenanceUtils.getPackageMaintenanceDataMapByDate( date )
            ,
            serviceMaintenanceDataMap =
                await ServiceMaintenanceUtils.getServiceMaintenanceDataMapByDate( date )
        ;
        pageData.maintenanceDataMap = { ...packageMaintenanceDataMap, ...serviceMaintenanceDataMap };
        pageData.loaded = true;
        reloadPageData();

    }

    function openPackage( packageId: string ): void {

        window.open( `/management/packages/${ packageId }`, `_self` );
        
    }

    function openService( serviceId: string ): void {

        window.open( `/management/services/${ serviceId }`, `_self` );
        
    }

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    function toggleSortMode(): void {

        const newSortMode: sortMode = ( sortMode === "ascending" ) ? "descending" : "ascending";
        setSortMode( newSortMode );

    }

    function validateActiveServiceOrPackage( keyName: string ): boolean {

        return ( maintenanceDataMap[ keyName ].status === "active" );

    }

    useEffect( () => { loadPageData(); }, [] );

    return <>
        <div>
            <h4>Statistics</h4>
            <ul>
                <li>Services & Packages: { ObjectUtils.keyLength( rowTypeMap ) }</li>
                <li>Services: { ObjectUtils.keyLength( serviceDataMap ) }</li>
                <li>Active Services: {
                    ObjectUtils.keyLength( ObjectUtils.filter(
                        serviceDataMap, validateActiveServiceOrPackage
                    ) )
                }</li>
                <li>Packages: { ObjectUtils.keyLength( packageDataMap ) }</li>
                <li>Active Packages: {
                    ObjectUtils.keyLength( ObjectUtils.filter(
                        packageDataMap, validateActiveServiceOrPackage
                    ) )
                }</li>
            </ul>
        </div>
        <div>
            <h4>Filter & Sort</h4>
            <div>
                Search:
                <input value={ search } onChange={ event => handleChangeSearch( event ) }/>
                Sort:
                <button type="button" value={ sortMode } onClick={ toggleSortMode }>{
                    ( sortMode === "ascending" ) ? "A - Z" : "Z - A"
                }</button>
                Select:
                <select value={ showMode } onChange={ event => handleChangeShowMode( event ) }>
                    <option value="">Show All</option>
                    <option value="service">Services only</option>
                    <option value="package">Packages only</option>
                </select>
                <Link to="/management/services/new"><button type="button">+ Add new service</button></Link>
                <Link to="/management/packages/new"><button type="button">+ Add new package</button></Link>
            </div>
        </div>
        <table>
            <thead><tr>
                <td>#</td>
                <td>Name</td>
                <td>Type</td>
                <td>Price</td>
                <td>Status</td>
                <td>Commission</td>
            </tr></thead>
            <tbody>{
                Object.keys( rowTypeMap ).sort( ( documentId1, documentId2 ) => StringUtils.compare(
                        getDataMap( documentId1 )[ documentId1 ].name,
                        getDataMap( documentId2 )[ documentId2 ].name,
                        ( sortMode === "ascending" )
                    )
                ).map( ( documentId, index ) => {

                    const
                        rowType: rowType = rowTypeMap[ documentId ],
                        maintenanceData = maintenanceDataMap[ documentId ],
                        count: string = ( index + 1 ).toString(),
                        { name } = getDataMap( documentId )[ documentId ],
                        rowTypeName = ( rowType === "package" ) ? "Package" : "Service",
                        price = `₱${ maintenanceData.price }`,
                        statusName = ( maintenanceData.status === "active" ) ? "Active" : "Inactive",
                        commissionPercentage = ( rowType === "service" ) ? `${ maintenanceData.commissionPercentage as number }%` : `-`,
                        show: boolean = (
                            ( showMode === "" || showMode === rowType )
                            && StringUtils.has(
                                `${ count }\t${ name }\t${ rowTypeName }\t${ price }\t${
                                    statusName }\t${ commissionPercentage }`
                                , search
                            )
                        )
                    ;
                    return show ? <tr key={ documentId } onClick={ () => ( rowType === "package" ) ? openPackage( documentId ) : openService( documentId ) }>
                        <td>{ count }</td>
                        <td>{ name }</td>
                        <td>{ rowTypeName }</td>
                        <td>{ price }</td>
                        <td>{ statusName }</td>
                        <td>{ commissionPercentage }</td>
                    </tr> : undefined;

                } )
            }</tbody>
        </table>
        <button type="button" onClick={ () => console.log( pageData ) }>Log Page Data</button>
    </>;

}
