import { EventEmitter } from 'events';
import os from 'os';

import { AddressType } from '../../types';

import { Hci } from './hci';

const IS_NTC_CHIP = os.platform() === 'linux' && os.release().indexOf('-ntc') !== -1;

interface Discovery {
	address: string;
	addressType: AddressType;
	connectable: boolean;
	advertisement: any;
	rssi: number;
	count: number;
	hasScanResponse: boolean;
}

export declare interface Gap {
	on(
		event: 'discover',
		listener: (
			status: number,
			address: string,
			addressType: AddressType,
			connectable: boolean,
			advertisement: any,
			rssi: number
		) => void
	): this;
}

export class Gap extends EventEmitter {
	private hci: Hci;
	private scanState: string;
	private scanFilterDuplicates: boolean;
	private discoveries: Map<string, Discovery>;

	public constructor(hci: any) {
		super();

		this.hci = hci;

		this.scanState = null;
		this.scanFilterDuplicates = null;
		this.discoveries = new Map();

		this.hci.on('leAdvertisingReport', this.onHciLeAdvertisingReport);
	}

	public async startScanning(allowDuplicates: boolean) {
		this.scanState = 'starting';
		this.scanFilterDuplicates = !allowDuplicates;

		// Always set scan parameters before scanning
		// https://www.bluetooth.org/docman/handlers/downloaddoc.ashx?doc_id=229737
		// p106 - p107
		try {
			await this.hci.setScanEnabled(false, true);
		} catch {
			// NO-OP
		}
		await this.hci.setScanParameters();

		if (IS_NTC_CHIP) {
			// work around for Next Thing Co. C.H.I.P, always allow duplicates, to get scan response
			this.scanFilterDuplicates = false;
		}

		await this.hci.setScanEnabled(true, this.scanFilterDuplicates);

		this.scanState = 'started';
	}

	public async stopScanning() {
		this.scanState = 'stopping';
		await this.hci.setScanEnabled(false, true);
		this.scanState = 'stopped';
	}

	private onHciLeAdvertisingReport = (
		status: number,
		type: number,
		address: string,
		addressType: AddressType,
		eir: Buffer,
		rssi: number
	) => {
		const previouslyDiscovered = this.discoveries.get(address);

		const advertisement = previouslyDiscovered?.advertisement || {
			localName: undefined,
			txPowerLevel: undefined,
			manufacturerData: undefined,
			serviceData: [],
			serviceUuids: [],
			solicitationServiceUuids: []
		};

		let discoveryCount = previouslyDiscovered?.count || 0;
		let hasScanResponse = previouslyDiscovered?.hasScanResponse || false;

		if (type === 0x04) {
			hasScanResponse = true;
		} else {
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
		if (
			type === 0x04 ||
			!connectable ||
			(discoveryCount > 1 && !hasScanResponse) ||
			process.env.NOBLE_REPORT_ALL_HCI_EVENTS
		) {
			this.emit('discover', status, address, addressType, connectable, advertisement, rssi);
		}
	};
}
