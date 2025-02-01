// Basic data

export interface ServiceData {

    name: string
    description: string
    serviceType: "body" | "browsAndLashes" | "facial" | "handsAndFoot" | "health" | "wax"
    roomType: "room" | "chair"
    ageLimit: number
    durationMin: number

}

// In-app

export interface Service extends ServiceData {

    id: string

}
