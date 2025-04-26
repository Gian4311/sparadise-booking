import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/loading.css";

export default function LoadingScreen( { loading }: { loading: boolean } ): JSX.Element {

    if( !loading ) return <></>;
    return <>
        <div className="loading-overlay">
            <div className="loading-container">
                <div className="loading-bar"></div>
                <p className="loading-text">Loading, please wait...</p>
            </div>
        </div>
    </>;

}

// const LoadingWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [loading, setLoading] = useState(false);
//   const location = useLocation();

//   useEffect(() => {
//     setLoading(true);
//     const timeout = setTimeout(() => setLoading(false), 1000); // Show for 3s
//     return () => clearTimeout(timeout);
//   }, [location.pathname]); // triggers on every route change

//   return (
//     <>
//       {loading && (
//         <div className="loading-overlay">
//           <div className="loading-container">
//             <div className="loading-bar"></div>
//             <p className="loading-text">Loading, please wait...</p>
//           </div>
//         </div>
//       )}
//       {children}
//     </>
//   );
// };

// export default LoadingWrapper;
