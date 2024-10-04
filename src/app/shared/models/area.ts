export interface Area {
    id: string,
    name: string,
    description: string,
    creationDate: string,
    subscriptionId: string,
    bbox: string,
    markerCoordinates: string,
    shapeFileMask: string,
    supportArchive: string,
    archiveStartDate: string,
    archiveEndDate: string
}

export const exampleArea: Area = {
    id: '1',
    name: 'Area 51',
    description: "Area 51 - shh it's a secret",
    creationDate: "04/10/2024",
    subscriptionId: '1',
    bbox: null,
    markerCoordinates: '37.2431, -115.7930',
    shapeFileMask: '',
    supportArchive: '',
    archiveStartDate: '',
    archiveEndDate: ''

}