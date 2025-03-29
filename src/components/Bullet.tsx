import { CSSProperties } from "react";

import "../styles/Bullet.scss";

export default function Bullet( { color, size, style }: {
    color: string,
    size: string,
    style?: CSSProperties
} ): JSX.Element {

    return <span className="bullet" style={
        { background: color, height: size, width: size, ...style }
    }></span>;

}
