export interface ServiceData {

    name: string
    description: string
    serviceType: serviceType
    roomType: roomType
    ageLimit: number
    durationMin: number

}

export interface ServiceDataMap {

    [ serviceId: string ]: ServiceData

}
