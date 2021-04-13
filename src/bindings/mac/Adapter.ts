import events from 'events';
import util from 'util';

import { Adapter, AddressType, GattLocal, MODblue, Peripheral } from '../../models';
import { MacPeripheral } from './Peripheral';

export class MacAdapter extends Adapter {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public readonly noble: any = null;

	private initDone = false;
	private scanning = false;

	private peripherals: Map<string, Peripheral> = new Map();

	public async isScanning(): Promise<boolean> {
		return this.scanning;
	}

	public constructor(modblue: MODblue, id: string, name: string) {
		super(modblue, id, name);

		// This fixes an issue with webpack trying to load the module at compile time
		const NAME = 'mac-ble.node';
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const NobleMac = require(`../../../build/Relase/${NAME}`).NobleMac;
		util.inherits(NobleMac, events.EventEmitter);
		this.noble = new NobleMac();
	}

	private async init() {
		if (this.initDone) {
			return;
		}

		await new Promise<void>((resolve, reject) => {
			this.noble.on('stateChange', (state: string) => {
				if (state === 'poweredOn') {
					resolve();
				} else {
					reject(new Error(`State was ${state}`));
				}
			});
			this.noble.init();
		});

		this.noble.on('read', this.onNotification);

		this.initDone = true;
	}

	public dispose(): void {
		this.noble.removeAllListeners();
		this.noble.stop();
	}

	public async startScanning(serviceUUIDs?: string[], allowDuplicates?: boolean): Promise<void> {
		await this.init();
		this.peripherals.clear();
		this.noble.startScanning(serviceUUIDs, allowDuplicates);
		this.noble.on('discover', this.onDiscover);
		this.scanning = true;
	}

	private onDiscover = (
		uuid: string,
		address: string,
		addressType: AddressType,
		connectable: boolean,
		advertisement: { localName?: string; manufacturerData?: Buffer },
		rssi: number
	) => {
		let peripheral = this.peripherals.get(uuid);
		if (!peripheral) {
			peripheral = new MacPeripheral(
				this,
				uuid,
				advertisement.localName,
				addressType,
				address,
				advertisement.manufacturerData,
				rssi
			);
		} else {
			peripheral.name = advertisement.localName;
			peripheral.manufacturerData = advertisement.manufacturerData;
		}
		this.emit('discover', peripheral);
	};

	private onNotification = (
		uuid: string,
		serviceUUID: string,
		charUUID: string,
		data: Buffer,
		isNotification: boolean
	) => {
		if (isNotification) {
			const peripheral = this.peripherals.get(uuid);
			if (peripheral) {
				const service = peripheral.gatt.services.get(serviceUUID);
				if (service) {
					const char = service.characteristics.get(charUUID);
					if (char) {
						char.emit('notification', data);
					}
				}
			}
		}
	};

	public async stopScanning(): Promise<void> {
		this.noble.stopScanning();
		this.scanning = false;
	}

	public async getScannedPeripherals(): Promise<Peripheral[]> {
		return [...this.peripherals.values()];
	}

	public isAdvertising(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	public startAdvertising(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public stopAdvertising(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public setupGatt(): Promise<GattLocal> {
		throw new Error('Method not implemented.');
	}
}
