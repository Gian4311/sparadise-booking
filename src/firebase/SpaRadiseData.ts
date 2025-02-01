import {
    ServiceData,
    ServiceDataMap
} from "./SpaRadiseTypes";

export default class SpaRadiseData {

    public serviceData?: ServiceData;
    public serviceDataMap?: ServiceDataMap;

    public constructor() {}

    public shallowCopy(): SpaRadiseData {

        const shallowCopy: SpaRadiseData = new SpaRadiseData();
        shallowCopy.serviceDataMap = this.serviceDataMap;
        return shallowCopy;

    }

}
