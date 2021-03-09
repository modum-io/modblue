/// <reference types="node" />
export interface Advertisement {
    localName: string;
    txPowerLevel: number;
    manufacturerData: Buffer;
    serviceData: {
        uuid: string;
        data: Buffer;
    }[];
    serviceUuids: string[];
    solicitationServiceUuids: string[];
}
//# sourceMappingURL=Advertisement.d.ts.map