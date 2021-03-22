import { Gatt, Peripheral } from '../../models';
import { WebAdapter } from './Adapter';
export declare class WebPeripheral extends Peripheral {
    adapter: WebAdapter;
    constructor(adapter: WebAdapter, id: string, advertisement: Record<string, unknown>, rssi: number);
    connect(minInterval?: number, maxInterval?: number, latency?: number, supervisionTimeout?: number): Promise<void>;
    disconnect(): Promise<void>;
    setupGatt(requestMtu?: number): Promise<Gatt>;
}
//# sourceMappingURL=Peripheral.d.ts.map