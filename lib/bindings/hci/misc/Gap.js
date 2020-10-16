"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gap = void 0;
const events_1 = require("events");
const os_1 = __importDefault(require("os"));
const Hci_1 = require("./Hci");
const IS_NTC_CHIP = os_1.default.platform() === 'linux' && os_1.default.release().indexOf('-ntc') !== -1;
const IS_LINUX = os_1.default.platform() === 'linux';
const IS_INTEL_EDISON = IS_LINUX && os_1.default.release().indexOf('edison') !== -1;
const IS_YOCTO = IS_LINUX && os_1.default.release().indexOf('yocto') !== -1;
class Gap extends events_1.EventEmitter {
    constructor(hci) {
        super();
        this.onHciLeScanParametersSet = () => {
            // NO-OP
        };
        // Called when receive an event "Command Complete" for "LE Set Scan Enable"
        this.onHciLeScanEnableSet = (status) => {
            // Check the status we got from the command complete function.
            if (status !== 0) {
                // If it is non-zero there was an error, and we should not change
                // our status as a result.
                return;
            }
            if (this.scanState === 'starting') {
                this.scanState = 'started';
                this.emit('scanStart', this.scanFilterDuplicates);
            }
            else if (this.scanState === 'stopping') {
                this.scanState = 'stopped';
                this.emit('scanStop');
            }
        };
        // Called when we see the actual command "LE Set Scan Enable"
        this.onLeScanEnableSetCmd = (enable, filterDuplicates) => {
            // Check to see if the new settings differ from what we expect.
            // If we are scanning, then a change happens if the new command stops
            // scanning or if duplicate filtering changes.
            // If we are not scanning, then a change happens if scanning was enabled.
            if (this.scanState === 'starting' || this.scanState === 'started') {
                if (!enable) {
                    this.emit('scanStop');
                }
                else if (this.scanFilterDuplicates !== filterDuplicates) {
                    this.scanFilterDuplicates = filterDuplicates;
                    this.emit('scanStart', this.scanFilterDuplicates);
                }
            }
            else if ((this.scanState === 'stopping' || this.scanState === 'stopped') && enable) {
                // Someone started scanning on us.
                this.emit('scanStart', this.scanFilterDuplicates);
            }
        };
        this.onHciLeAdvertisingReport = (status, type, address, addressType, eir, rssi) => {
            const previouslyDiscovered = this.discoveries.get(address);
            const advertisement = (previouslyDiscovered === null || previouslyDiscovered === void 0 ? void 0 : previouslyDiscovered.advertisement) || {
                localName: undefined,
                txPowerLevel: undefined,
                manufacturerData: undefined,
                serviceData: [],
                serviceUuids: [],
                solicitationServiceUuids: []
            };
            let discoveryCount = (previouslyDiscovered === null || previouslyDiscovered === void 0 ? void 0 : previouslyDiscovered.count) || 0;
            let hasScanResponse = (previouslyDiscovered === null || previouslyDiscovered === void 0 ? void 0 : previouslyDiscovered.hasScanResponse) || false;
            if (type === 0x04) {
                hasScanResponse = true;
            }
            else {
                // reset service data every non-scan response event
                advertisement.serviceData = [];
                advertisement.serviceUuids = [];
                advertisement.serviceSolicitationUuids = [];
            }
            discoveryCount++;
            let i = 0;
            while (i + 1 < eir.length) {
                const length = eir.readUInt8(i);
                if (length < 1) {
                    break;
                }
                // https://www.bluetooth.org/en-us/specification/assigned-numbers/generic-access-profile
                const eirType = eir.readUInt8(i + 1);
                if (i + length + 1 > eir.length) {
                    break;
                }
                const bytes = eir.slice(i + 2).slice(0, length - 1);
                switch (eirType) {
                    case 0x02: // Incomplete List of 16-bit Service Class UUID
                    case 0x03: // Complete List of 16-bit Service Class UUIDs
                        for (let j = 0; j < bytes.length; j += 2) {
                            const serviceUuid = bytes.readUInt16LE(j).toString(16);
                            if (advertisement.serviceUuids.indexOf(serviceUuid) === -1) {
                                advertisement.serviceUuids.push(serviceUuid);
                            }
                        }
                        break;
                    case 0x06: // Incomplete List of 128-bit Service Class UUIDs
                    case 0x07: // Complete List of 128-bit Service Class UUIDs
                        for (let j = 0; j < bytes.length; j += 16) {
                            const serviceUuid = bytes
                                .slice(j, j + 16)
                                .toString('hex')
                                .match(/.{1,2}/g)
                                .reverse()
                                .join('');
                            if (advertisement.serviceUuids.indexOf(serviceUuid) === -1) {
                                advertisement.serviceUuids.push(serviceUuid);
                            }
                        }
                        break;
                    case 0x08: // Shortened Local Name
                    case 0x09: // Complete Local Name»
                        advertisement.localName = bytes.toString('utf8');
                        break;
                    case 0x0a: // Tx Power Level
                        advertisement.txPowerLevel = bytes.readInt8(0);
                        break;
                    case 0x14: // List of 16 bit solicitation UUIDs
                        for (let j = 0; j < bytes.length; j += 2) {
                            const serviceSolicitationUuid = bytes.readUInt16LE(j).toString(16);
                            if (advertisement.serviceSolicitationUuids.indexOf(serviceSolicitationUuid) === -1) {
                                advertisement.serviceSolicitationUuids.push(serviceSolicitationUuid);
                            }
                        }
                        break;
                    case 0x15: // List of 128 bit solicitation UUIDs
                        for (let j = 0; j < bytes.length; j += 16) {
                            const serviceSolicitationUuid = bytes
                                .slice(j, j + 16)
                                .toString('hex')
                                .match(/.{1,2}/g)
                                .reverse()
                                .join('');
                            if (advertisement.serviceSolicitationUuids.indexOf(serviceSolicitationUuid) === -1) {
                                advertisement.serviceSolicitationUuids.push(serviceSolicitationUuid);
                            }
                        }
                        break;
                    case 0x16: // 16-bit Service Data, there can be multiple occurences
                        advertisement.serviceData.push({
                            uuid: bytes
                                .slice(0, 2)
                                .toString('hex')
                                .match(/.{1,2}/g)
                                .reverse()
                                .join(''),
                            data: bytes.slice(2, bytes.length)
                        });
                        break;
                    case 0x20: // 32-bit Service Data, there can be multiple occurences
                        advertisement.serviceData.push({
                            uuid: bytes
                                .slice(0, 4)
                                .toString('hex')
                                .match(/.{1,2}/g)
                                .reverse()
                                .join(''),
                            data: bytes.slice(4, bytes.length)
                        });
                        break;
                    case 0x21: // 128-bit Service Data, there can be multiple occurences
                        advertisement.serviceData.push({
                            uuid: bytes
                                .slice(0, 16)
                                .toString('hex')
                                .match(/.{1,2}/g)
                                .reverse()
                                .join(''),
                            data: bytes.slice(16, bytes.length)
                        });
                        break;
                    case 0x1f: // List of 32 bit solicitation UUIDs
                        for (let j = 0; j < bytes.length; j += 4) {
                            const serviceSolicitationUuid = bytes.readUInt32LE(j).toString(16);
                            if (advertisement.serviceSolicitationUuids.indexOf(serviceSolicitationUuid) === -1) {
                                advertisement.serviceSolicitationUuids.push(serviceSolicitationUuid);
                            }
                        }
                        break;
                    case 0xff: // Manufacturer Specific Data
                        advertisement.manufacturerData = bytes;
                        break;
                    default:
                        break;
                }
                i += length + 1;
            }
            const connectable = type === 0x04 && previouslyDiscovered ? previouslyDiscovered.connectable : type !== 0x03;
            this.discoveries.set(address, {
                address: address,
                addressType: addressType,
                connectable: connectable,
                advertisement: advertisement,
                rssi: rssi,
                count: discoveryCount,
                hasScanResponse: hasScanResponse
            });
            // only report after a scan response event or if non-connectable or more than one discovery without a scan response,
            // so more data can be collected
            if (type === 0x04 ||
                !connectable ||
                (discoveryCount > 1 && !hasScanResponse) ||
                process.env.NOBLE_REPORT_ALL_HCI_EVENTS) {
                this.emit('discover', status, address, addressType, connectable, advertisement, rssi);
            }
        };
        this.onHciLeAdvertisingParametersSet = (status) => {
            // NO-OP
        };
        this.onHciLeAdvertisingDataSet = (status) => {
            // NO-OP
        };
        this.onHciLeScanResponseDataSet = (status) => {
            // NO-OP
        };
        this.onHciLeAdvertiseEnableSet = (status) => {
            if (this.advertiseState === 'starting') {
                this.advertiseState = 'started';
                var error = null;
                if (status) {
                    error = new Error(Hci_1.Hci.STATUS_MAPPER[status] || `Unknown (${status})`);
                }
                this.emit('advertisingStart', error);
            }
            else if (this.advertiseState === 'stopping') {
                this.advertiseState = 'stopped';
                this.emit('advertisingStop');
            }
        };
        this.hci = hci;
        this.scanState = null;
        this.scanFilterDuplicates = null;
        this.discoveries = new Map();
        this.hci.on('leScanParametersSet', this.onHciLeScanParametersSet);
        this.hci.on('leScanEnableSet', this.onHciLeScanEnableSet);
        this.hci.on('leAdvertisingReport', this.onHciLeAdvertisingReport);
        this.hci.on('leScanEnableSetCmd', this.onLeScanEnableSetCmd);
        this.hci.on('leAdvertisingParametersSet', this.onHciLeAdvertisingParametersSet);
        this.hci.on('leAdvertisingDataSet', this.onHciLeAdvertisingDataSet);
        this.hci.on('leScanResponseDataSet', this.onHciLeScanResponseDataSet);
        this.hci.on('leAdvertiseEnableSet', this.onHciLeAdvertiseEnableSet);
    }
    startScanning(allowDuplicates) {
        this.scanState = 'starting';
        this.scanFilterDuplicates = !allowDuplicates;
        // Always set scan parameters before scanning
        // https://www.bluetooth.org/docman/handlers/downloaddoc.ashx?doc_id=229737
        // p106 - p107
        this.hci.setScanEnabled(false, true);
        this.hci.setScanParameters();
        if (IS_NTC_CHIP) {
            // work around for Next Thing Co. C.H.I.P, always allow duplicates, to get scan response
            this.scanFilterDuplicates = false;
        }
        this.hci.setScanEnabled(true, this.scanFilterDuplicates);
    }
    stopScanning() {
        this.scanState = 'stopping';
        this.hci.setScanEnabled(false, true);
    }
    startAdvertising(name, serviceUuids) {
        let advertisementDataLength = 3;
        let scanDataLength = 0;
        const serviceUuids16bit = [];
        const serviceUuids128bit = [];
        let i = 0;
        if (name && name.length) {
            scanDataLength += 2 + name.length;
        }
        if (serviceUuids && serviceUuids.length) {
            for (i = 0; i < serviceUuids.length; i++) {
                const serviceUuid = Buffer.from(serviceUuids[i]
                    .match(/.{1,2}/g)
                    .reverse()
                    .join(''), 'hex');
                if (serviceUuid.length === 2) {
                    serviceUuids16bit.push(serviceUuid);
                }
                else if (serviceUuid.length === 16) {
                    serviceUuids128bit.push(serviceUuid);
                }
            }
        }
        if (serviceUuids16bit.length) {
            advertisementDataLength += 2 + 2 * serviceUuids16bit.length;
        }
        if (serviceUuids128bit.length) {
            advertisementDataLength += 2 + 16 * serviceUuids128bit.length;
        }
        const advertisementData = Buffer.alloc(advertisementDataLength);
        const scanData = Buffer.alloc(scanDataLength);
        // flags
        advertisementData.writeUInt8(2, 0);
        advertisementData.writeUInt8(0x01, 1);
        advertisementData.writeUInt8(0x06, 2);
        var advertisementDataOffset = 3;
        if (serviceUuids16bit.length) {
            advertisementData.writeUInt8(1 + 2 * serviceUuids16bit.length, advertisementDataOffset);
            advertisementDataOffset++;
            advertisementData.writeUInt8(0x03, advertisementDataOffset);
            advertisementDataOffset++;
            for (i = 0; i < serviceUuids16bit.length; i++) {
                serviceUuids16bit[i].copy(advertisementData, advertisementDataOffset);
                advertisementDataOffset += serviceUuids16bit[i].length;
            }
        }
        if (serviceUuids128bit.length) {
            advertisementData.writeUInt8(1 + 16 * serviceUuids128bit.length, advertisementDataOffset);
            advertisementDataOffset++;
            advertisementData.writeUInt8(0x06, advertisementDataOffset);
            advertisementDataOffset++;
            for (i = 0; i < serviceUuids128bit.length; i++) {
                serviceUuids128bit[i].copy(advertisementData, advertisementDataOffset);
                advertisementDataOffset += serviceUuids128bit[i].length;
            }
        }
        // name
        if (name && name.length) {
            const nameBuffer = Buffer.from(name);
            console.log(name);
            scanData.writeUInt8(1 + nameBuffer.length, 0);
            scanData.writeUInt8(0x08, 1);
            nameBuffer.copy(scanData, 2);
        }
        this.startAdvertisingWithEIRData(advertisementData, scanData);
    }
    startAdvertisingWithEIRData(advertisementData, scanData) {
        advertisementData = advertisementData || Buffer.alloc(0);
        scanData = scanData || Buffer.alloc(0);
        let error = null;
        if (advertisementData.length > 31) {
            error = new Error('Advertisement data is over maximum limit of 31 bytes');
        }
        else if (scanData.length > 31) {
            error = new Error('Scan data is over maximum limit of 31 bytes');
        }
        if (error) {
            this.emit('advertisingStart', error);
        }
        else {
            this.advertiseState = 'starting';
            if (IS_INTEL_EDISON || IS_YOCTO) {
                // work around for Intel Edison
            }
            else {
                this.hci.setScanResponseData(scanData);
                this.hci.setAdvertisingData(advertisementData);
            }
            this.hci.setAdvertiseEnable(true);
            this.hci.setScanResponseData(scanData);
            this.hci.setAdvertisingData(advertisementData);
        }
    }
    stopAdvertising() {
        this.advertiseState = 'stopping';
        this.hci.setAdvertiseEnable(false);
    }
}
exports.Gap = Gap;
//# sourceMappingURL=Gap.js.map