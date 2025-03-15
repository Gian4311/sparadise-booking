import { Link } from "react-router-dom";
import { VoucherDataMap } from "../firebase/SpaRadiseTypes";
import VoucherUtils from "../firebase/VoucherUtils";
import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";
import {
    useEffect,
    useState
} from "react";

interface VoucherMenuPageData extends SpaRadisePageData  {

    voucherDataMap: VoucherDataMap

}

export default function VoucherMenu(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< VoucherMenuPageData >( {
            loaded: false,
            voucherDataMap: {},
            updateMap: {}
        } ),
        { voucherDataMap } = pageData
    ;

    async function loadPageData(): Promise< void > {
    
        pageData.voucherDataMap = await VoucherUtils.getVoucherListAll();
        pageData.loaded = true;
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    useEffect( () => { loadPageData(); }, [] );

    return <>
        <Link to="/management/vouchers/new">
            <h1>New</h1>
        </Link>
        {
                
            voucherDataMap ? Object.keys( voucherDataMap ).map( ( voucherId, index ) => {
                
                const voucherData = pageData.voucherDataMap[ voucherId ];
                return <Link key={ index } to={ "/management/vouchers/" + voucherId }>
                    <h1>{ voucherData.name }</h1>
                </Link>

            } ) : undefined

        }
    </>;

}
