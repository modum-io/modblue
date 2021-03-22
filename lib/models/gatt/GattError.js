export class GattError extends Error {
    constructor(peripheral, message, details) {
        super(message);
        this.name = 'GattError';
        this.peripheral = peripheral;
        this.details = details;
    }
}
//# sourceMappingURL=GattError.js.map