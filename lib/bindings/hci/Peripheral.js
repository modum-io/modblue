var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Peripheral } from '../../models';
import { HciGattRemote } from './gatt';
import { Signaling } from './misc';
// 512 bytes is max char size + 1 byte att opcode + 2 bytes handle + 2 bytes offset for long writes
const DEFAULT_MTU = 517;
export class HciPeripheral extends Peripheral {
    get isMaster() {
        return this._isMaster;
    }
    connect(minInterval, maxInterval, latency, supervisionTimeout) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._state === 'connected') {
                return;
            }
            this._state = 'connecting';
            yield this.adapter.connect(this, minInterval, maxInterval, latency, supervisionTimeout);
        });
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
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._state === 'disconnected') {
                return;
            }
            this._state = 'disconnecting';
            yield this.adapter.disconnect(this);
        });
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
    setupGatt(requestMtu = DEFAULT_MTU) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state !== 'connected' || !this.handle) {
                throw new Error(`Peripheral is not connected`);
            }
            if (!this.mtuExchanged) {
                yield this.gatt.exchangeMtu(requestMtu);
                this.mtuExchanged = true;
            }
            return this.gatt;
        });
    }
}
//# sourceMappingURL=Peripheral.js.map