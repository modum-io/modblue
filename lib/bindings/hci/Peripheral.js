import { Peripheral } from '../../models';
import { HciGattRemote } from './gatt';
import { Signaling } from './misc';
// 512 bytes is max char size + 1 byte att opcode + 2 bytes handle + 2 bytes offset for long writes
const DEFAULT_MTU = 517;
export class HciPeripheral extends Peripheral {
    get isMaster() {
        return this._isMaster;
    }
    async connect(minInterval, maxInterval, latency, supervisionTimeout) {
        if (this._state === 'connected') {
            return;
        }
        this._state = 'connecting';
        await this.adapter.connect(this, minInterval, maxInterval, latency, supervisionTimeout);
    }
    onConnect(isMaster, hci, handle) {
        this.hci = hci;
        this.handle = handle;
        this._isMaster = isMaster;
        this.signaling = new Signaling(this.hci, this.handle);
        this.gatt = new HciGattRemote(this, hci, handle);
        this.mtuExchanged = false;
        this._state = 'connected';
    }
    async disconnect() {
        if (this._state === 'disconnected') {
            return;
        }
        this._state = 'disconnecting';
        await this.adapter.disconnect(this);
    }
    onDisconnect(reason) {
        if (this.gatt) {
            this.gatt.dispose(reason);
            this.gatt = null;
        }
        if (this.signaling) {
            this.signaling.dispose();
            this.signaling = null;
        }
        this.hci = null;
        this.handle = null;
        this.mtuExchanged = false;
        this._state = 'disconnected';
    }
    async setupGatt(requestMtu = DEFAULT_MTU) {
        if (this.state !== 'connected' || !this.handle) {
            throw new Error(`Peripheral is not connected`);
        }
        if (!this.mtuExchanged) {
            await this.gatt.exchangeMtu(requestMtu);
            this.mtuExchanged = true;
        }
        return this.gatt;
    }
}
//# sourceMappingURL=Peripheral.js.map