import { EventEmitter } from 'events';

import { AclStream } from './acl-stream';

/* eslint-disable no-unused-vars */
// tslint:disable: no-bitwise
const ATT_OP_ERROR = 0x01;
const ATT_OP_MTU_REQ = 0x02;
const ATT_OP_MTU_RESP = 0x03;
const ATT_OP_FIND_INFO_REQ = 0x04;
const ATT_OP_FIND_INFO_RESP = 0x05;
const ATT_OP_READ_BY_TYPE_REQ = 0x08;
const ATT_OP_READ_BY_TYPE_RESP = 0x09;
const ATT_OP_READ_REQ = 0x0a;
const ATT_OP_READ_RESP = 0x0b;
const ATT_OP_READ_BLOB_REQ = 0x0c;
const ATT_OP_READ_BLOB_RESP = 0x0d;
const ATT_OP_READ_BY_GROUP_REQ = 0x10;
const ATT_OP_READ_BY_GROUP_RESP = 0x11;
const ATT_OP_WRITE_REQ = 0x12;
const ATT_OP_WRITE_RESP = 0x13;
const ATT_OP_PREPARE_WRITE_REQ = 0x16;
const ATT_OP_PREPARE_WRITE_RESP = 0x17;
const ATT_OP_EXECUTE_WRITE_REQ = 0x18;
const ATT_OP_EXECUTE_WRITE_RESP = 0x19;
const ATT_OP_HANDLE_NOTIFY = 0x1b;
const ATT_OP_HANDLE_IND = 0x1d;
const ATT_OP_HANDLE_CNF = 0x1e;
const ATT_OP_WRITE_CMD = 0x52;

const ATT_ECODE_SUCCESS = 0x00;
const ATT_ECODE_INVALID_HANDLE = 0x01;
const ATT_ECODE_READ_NOT_PERM = 0x02;
const ATT_ECODE_WRITE_NOT_PERM = 0x03;
const ATT_ECODE_INVALID_PDU = 0x04;
const ATT_ECODE_AUTHENTICATION = 0x05;
const ATT_ECODE_REQ_NOT_SUPP = 0x06;
const ATT_ECODE_INVALID_OFFSET = 0x07;
const ATT_ECODE_AUTHORIZATION = 0x08;
const ATT_ECODE_PREP_QUEUE_FULL = 0x09;
const ATT_ECODE_ATTR_NOT_FOUND = 0x0a;
const ATT_ECODE_ATTR_NOT_LONG = 0x0b;
const ATT_ECODE_INSUFF_ENCR_KEY_SIZE = 0x0c;
const ATT_ECODE_INVAL_ATTR_VALUE_LEN = 0x0d;
const ATT_ECODE_UNLIKELY = 0x0e;
const ATT_ECODE_INSUFF_ENC = 0x0f;
const ATT_ECODE_UNSUPP_GRP_TYPE = 0x10;
const ATT_ECODE_INSUFF_RESOURCES = 0x11;

const GATT_PRIM_SVC_UUID = 0x2800;
const GATT_INCLUDE_UUID = 0x2802;
const GATT_CHARAC_UUID = 0x2803;

const GATT_CLIENT_CHARAC_CFG_UUID = 0x2902;
const GATT_SERVER_CHARAC_CFG_UUID = 0x2903;

const ATT_CID = 0x0004;
/* eslint-enable no-unused-vars */

interface GattCommand {
	buffer: Buffer;
	callback?: (data: Buffer) => void;
	writeCallback?: () => void;
}

export interface GattService {
	uuid: string;
	startHandle: number;
	endHandle: number;
}

export interface GattCharacteristic {
	uuid: string;
	startHandle: number;
	endHandle?: number;
	propertiesFlags: number;
	properties: string[];
	valueHandle: number;
}

export interface GattDescriptor {
	uuid: string;
	handle: number;
}

export declare interface Gatt {
	on(
		event: 'includedServicesDiscovered',
		listener: (serviceUUID: string, includedServices: GattService[]) => void
	): this;
	on(
		event: 'characteristicsDiscovered',
		listener: (serviceUUID: string, characteristics: GattCharacteristic[]) => void
	): this;
	on(event: 'read', listener: (serviceUUID: string, characteristicUUID: string, data: Buffer) => void): this;
	on(event: 'write', listener: (serviceUUID: string, characteristicUUID: string) => void): this;
	on(event: 'broadcast', listener: (serviceUUID: string, characteristicUUID: string, broadcast: boolean) => void): this;
	on(event: 'notify', listener: (serviceUUID: string, characteristicUUID: string, notify: boolean) => void): this;
	on(
		event: 'notification',
		listener: (serviceUUID: string, characteristicUUID: string, valueData: Buffer) => void
	): this;
	on(
		event: 'descriptorsDiscovered',
		listener: (serviceUUID: string, characteristicUUID: string, descriptors: GattDescriptor[]) => void
	): this;
	on(
		event: 'valueRead',
		listener: (serviceUUID: string, characteristicUUID: string, descriptorUUID: string, data: Buffer) => void
	): this;
	on(
		event: 'valueWrite',
		listener: (serviceUUID: string, characteristicUUID: string, descriptorUUID: string) => void
	): this;
	on(event: 'handleRead', listener: (handle: number, data: Buffer) => void): this;
	on(event: 'handleWrite', listener: (handle: number) => void): this;
	on(event: 'handleNotify', listener: (valueHandle: number, valueData: Buffer) => void): this;
	on(event: 'handleConfirmation', listener: (valueHandle: number) => void): this;
}

export class Gatt extends EventEmitter {
	private aclStream: AclStream;

	private services: Map<string, GattService>;
	private characteristics: Map<string, Map<string, GattCharacteristic>>;
	private descriptors: Map<string, Map<string, Map<string, GattDescriptor>>>;

	private currentCommand: GattCommand;
	private commandQueue: GattCommand[];

	private mtu: number;
	private security: string;

	public constructor(aclStream: AclStream) {
		super();

		this.aclStream = aclStream;

		this.services = new Map();
		this.characteristics = new Map();
		this.descriptors = new Map();

		this.currentCommand = null;
		this.commandQueue = [];

		this.mtu = 23;
		this.security = 'low';

		this.aclStream.on('data', this.onAclStreamData);
		this.aclStream.on('encrypt', this.onAclStreamEncrypt);
		this.aclStream.on('encryptFail', this.onAclStreamEncryptFail);
		this.aclStream.on('end', this.onAclStreamEnd);
	}

	private onAclStreamData = (cid: number, data: Buffer) => {
		if (cid !== ATT_CID) {
			return;
		}

		if (this.currentCommand && data.toString('hex') === this.currentCommand.buffer.toString('hex')) {
			// NO-OP
		} else if (data[0] % 2 === 0) {
			// NO-OP
			// This used to be noble multi role stuff
		} else if (data[0] === ATT_OP_HANDLE_NOTIFY || data[0] === ATT_OP_HANDLE_IND) {
			const valueHandle = data.readUInt16LE(1);
			const valueData = data.slice(3);

			this.emit('handleNotify', valueHandle, valueData);

			if (data[0] === ATT_OP_HANDLE_IND) {
				this.queueCommand(this.handleConfirmation(), null, () => {
					this.emit('handleConfirmation', valueHandle);
				});
			}

			for (const serviceUuid of this.services.keys()) {
				for (const characteristicUuid in this.characteristics.get(serviceUuid).keys()) {
					if (this.characteristics.get(serviceUuid).get(characteristicUuid).valueHandle === valueHandle) {
						this.emit('notification', serviceUuid, characteristicUuid, valueData);
					}
				}
			}
		} else if (!this.currentCommand) {
			// NO-OP
		} else {
			if (
				data[0] === ATT_OP_ERROR &&
				(data[4] === ATT_ECODE_AUTHENTICATION ||
					data[4] === ATT_ECODE_AUTHORIZATION ||
					data[4] === ATT_ECODE_INSUFF_ENC) &&
				this.security !== 'medium'
			) {
				this.aclStream.encrypt();
				return;
			}

			this.currentCommand.callback(data);

			this.currentCommand = null;

			while (this.commandQueue.length) {
				this.currentCommand = this.commandQueue.shift();

				this.writeAtt(this.currentCommand.buffer);

				if (this.currentCommand.callback) {
					break;
				} else if (this.currentCommand.writeCallback) {
					this.currentCommand.writeCallback();

					this.currentCommand = null;
				}
			}
		}
	};

	private onAclStreamEncrypt = (encrypt: number) => {
		if (encrypt) {
			this.security = 'medium';

			this.writeAtt(this.currentCommand.buffer);
		}
	};

	private onAclStreamEncryptFail = () => {
		// NO-OP
	};

	private onAclStreamEnd = () => {
		this.aclStream.off('data', this.onAclStreamData);
		this.aclStream.off('encrypt', this.onAclStreamEncrypt);
		this.aclStream.off('encryptFail', this.onAclStreamEncryptFail);
		this.aclStream.off('end', this.onAclStreamEnd);
	};

	private writeAtt(data: Buffer) {
		this.aclStream.write(ATT_CID, data);
	}

	private errorResponse(opcode: number, handle: number, status: number) {
		const buf = Buffer.alloc(5);

		buf.writeUInt8(ATT_OP_ERROR, 0);
		buf.writeUInt8(opcode, 1);
		buf.writeUInt16LE(handle, 2);
		buf.writeUInt8(status, 4);

		return buf;
	}

	private queueCommand(buffer: Buffer, callback?: (data: Buffer) => void, writeCallback?: () => void) {
		this.commandQueue.push({
			buffer: buffer,
			callback: callback,
			writeCallback: writeCallback
		});

		if (this.currentCommand === null) {
			while (this.commandQueue.length) {
				this.currentCommand = this.commandQueue.shift();

				this.writeAtt(this.currentCommand.buffer);

				if (this.currentCommand.callback) {
					break;
				} else if (this.currentCommand.writeCallback) {
					this.currentCommand.writeCallback();

					this.currentCommand = null;
				}
			}
		}
	}

	private async queueCommandAsync(buffer: Buffer, resolveOnWrite: true): Promise<void>;
	private async queueCommandAsync(buffer: Buffer, resolveOnWrite: false): Promise<Buffer>;
	private async queueCommandAsync(buffer: Buffer, resolveOnWrite: boolean) {
		return new Promise<any>((resolve) => {
			this.commandQueue.push({
				buffer: buffer,
				callback: !resolveOnWrite ? (data) => resolve(data) : undefined,
				writeCallback: resolveOnWrite ? () => resolve() : undefined
			});

			if (this.currentCommand === null) {
				while (this.commandQueue.length) {
					this.currentCommand = this.commandQueue.shift();

					this.writeAtt(this.currentCommand.buffer);

					if (this.currentCommand.callback) {
						break;
					} else if (this.currentCommand.writeCallback) {
						this.currentCommand.writeCallback();

						this.currentCommand = null;
					}
				}
			}
		});
	}

	private mtuRequest(mtu: number) {
		const buf = Buffer.alloc(3);

		buf.writeUInt8(ATT_OP_MTU_REQ, 0);
		buf.writeUInt16LE(mtu, 1);

		return buf;
	}

	public readByGroupRequest(startHandle: number, endHandle: number, groupUUID: number) {
		const buf = Buffer.alloc(7);

		buf.writeUInt8(ATT_OP_READ_BY_GROUP_REQ, 0);
		buf.writeUInt16LE(startHandle, 1);
		buf.writeUInt16LE(endHandle, 3);
		buf.writeUInt16LE(groupUUID, 5);

		return buf;
	}

	public readByTypeRequest(startHandle: number, endHandle: number, groupUUID: number) {
		const buf = Buffer.alloc(7);

		buf.writeUInt8(ATT_OP_READ_BY_TYPE_REQ, 0);
		buf.writeUInt16LE(startHandle, 1);
		buf.writeUInt16LE(endHandle, 3);
		buf.writeUInt16LE(groupUUID, 5);

		return buf;
	}

	public readRequest(handle: number) {
		const buf = Buffer.alloc(3);

		buf.writeUInt8(ATT_OP_READ_REQ, 0);
		buf.writeUInt16LE(handle, 1);

		return buf;
	}

	public readBlobRequest(handle: number, offset: number) {
		const buf = Buffer.alloc(5);

		buf.writeUInt8(ATT_OP_READ_BLOB_REQ, 0);
		buf.writeUInt16LE(handle, 1);
		buf.writeUInt16LE(offset, 3);

		return buf;
	}

	public findInfoRequest(startHandle: number, endHandle: number) {
		const buf = Buffer.alloc(5);

		buf.writeUInt8(ATT_OP_FIND_INFO_REQ, 0);
		buf.writeUInt16LE(startHandle, 1);
		buf.writeUInt16LE(endHandle, 3);

		return buf;
	}

	public writeRequest(handle: number, data: Buffer, withoutResponse: boolean) {
		const buf = Buffer.alloc(3 + data.length);

		buf.writeUInt8(withoutResponse ? ATT_OP_WRITE_CMD : ATT_OP_WRITE_REQ, 0);
		buf.writeUInt16LE(handle, 1);

		for (let i = 0; i < data.length; i++) {
			buf.writeUInt8(data.readUInt8(i), i + 3);
		}

		return buf;
	}

	private prepareWriteRequest(handle: number, offset: number, data: Buffer) {
		const buf = Buffer.alloc(5 + data.length);

		buf.writeUInt8(ATT_OP_PREPARE_WRITE_REQ, 0);
		buf.writeUInt16LE(handle, 1);
		buf.writeUInt16LE(offset, 3);

		for (let i = 0; i < data.length; i++) {
			buf.writeUInt8(data.readUInt8(i), i + 5);
		}

		return buf;
	}

	private executeWriteRequest(handle: number, cancelPreparedWrites?: boolean) {
		const buf = Buffer.alloc(2);

		buf.writeUInt8(ATT_OP_EXECUTE_WRITE_REQ, 0);
		buf.writeUInt8(cancelPreparedWrites ? 0 : 1, 1);

		return buf;
	}

	private handleConfirmation() {
		const buf = Buffer.alloc(1);

		buf.writeUInt8(ATT_OP_HANDLE_CNF, 0);

		return buf;
	}

	public async exchangeMtu(mtu: number) {
		const data = await this.queueCommandAsync(this.mtuRequest(mtu), false);
		const opcode = data[0];

		if (opcode === ATT_OP_MTU_RESP) {
			const newMtu = data.readUInt16LE(1);
			this.mtu = newMtu;
		}

		return this.mtu;
	}

	public async discoverServices(uuids: string[]) {
		const services: GattService[] = await this.doDiscoverServices();

		const wantedServices: GattService[] = [];
		for (const service of services) {
			const uuid = service.uuid.trim();
			if (uuids.length === 0 || uuids.indexOf(uuid) !== -1) {
				wantedServices.push(service);
			}

			this.services.set(service.uuid, service);
		}

		return wantedServices;
	}
	private async doDiscoverServices(): Promise<GattService[]> {
		const services: GattService[] = [];
		let startHandle = 0x0001;

		while (true) {
			const data = await this.queueCommandAsync(
				this.readByGroupRequest(startHandle, 0xffff, GATT_PRIM_SVC_UUID),
				false
			);

			const opcode = data[0];

			if (opcode === ATT_OP_READ_BY_GROUP_RESP) {
				const type = data[1];
				const num = (data.length - 2) / type;

				for (let i = 0; i < num; i++) {
					const offset = 2 + i * type;
					services.push({
						startHandle: data.readUInt16LE(offset),
						endHandle: data.readUInt16LE(offset + 2),
						uuid:
							type === 6
								? data.readUInt16LE(offset + 4).toString(16)
								: data
										.slice(offset + 4)
										.slice(0, 16)
										.toString('hex')
										.match(/.{1,2}/g)
										.reverse()
										.join('')
					});
				}
			}

			if (opcode !== ATT_OP_READ_BY_GROUP_RESP || services[services.length - 1].endHandle === 0xffff) {
				break;
			} else {
				startHandle = services[services.length - 1].endHandle + 1;
			}
		}

		return services;
	}

	public discoverIncludedServices(serviceUUID: string, uuids: string[]) {
		const service = this.services.get(serviceUUID);
		const includedServices: GattService[] = [];

		const callback = (data: Buffer) => {
			const opcode = data[0];
			let i = 0;

			if (opcode === ATT_OP_READ_BY_TYPE_RESP) {
				const type = data[1];
				const num = (data.length - 2) / type;

				for (i = 0; i < num; i++) {
					const offset = 2 + i * type;
					includedServices.push({
						endHandle: data.readUInt16LE(offset),
						startHandle: data.readUInt16LE(offset + 2),
						uuid:
							type === 8
								? data.readUInt16LE(offset + 6).toString(16)
								: data
										.slice(offset + 6)
										.slice(0, 16)
										.toString('hex')
										.match(/.{1,2}/g)
										.reverse()
										.join('')
					});
				}
			}

			if (
				opcode !== ATT_OP_READ_BY_TYPE_RESP ||
				includedServices[includedServices.length - 1].endHandle === service.endHandle
			) {
				const wantedIncludedServices: GattService[] = [];

				for (i = 0; i < includedServices.length; i++) {
					if (uuids.length === 0 || uuids.indexOf(includedServices[i].uuid) !== -1) {
						wantedIncludedServices.push(includedServices[i]);
					}
				}

				this.emit('includedServicesDiscovered', service.uuid, wantedIncludedServices);
			} else {
				this.queueCommand(
					this.readByTypeRequest(
						includedServices[includedServices.length - 1].endHandle + 1,
						service.endHandle,
						GATT_INCLUDE_UUID
					),
					callback
				);
			}
		};

		this.queueCommand(this.readByTypeRequest(service.startHandle, service.endHandle, GATT_INCLUDE_UUID), callback);
	}

	public discoverCharacteristics(serviceUUID: string, characteristicUUIDs: string[]) {
		const service = this.services.get(serviceUUID);
		const characteristics: GattCharacteristic[] = [];

		this.characteristics.set(serviceUUID, this.characteristics.get(serviceUUID) || new Map());
		this.descriptors.set(serviceUUID, this.descriptors.get(serviceUUID) || new Map());

		const callback = (data: Buffer) => {
			const opcode = data[0];
			let i = 0;

			if (opcode === ATT_OP_READ_BY_TYPE_RESP) {
				const type = data[1];
				const num = (data.length - 2) / type;

				for (i = 0; i < num; i++) {
					const offset = 2 + i * type;
					const propertiesFlag = data.readUInt8(offset + 2);
					const properties: string[] = [];

					if (propertiesFlag & 0x01) {
						properties.push('broadcast');
					}
					if (propertiesFlag & 0x02) {
						properties.push('read');
					}
					if (propertiesFlag & 0x04) {
						properties.push('writeWithoutResponse');
					}
					if (propertiesFlag & 0x08) {
						properties.push('write');
					}
					if (propertiesFlag & 0x10) {
						properties.push('notify');
					}
					if (propertiesFlag & 0x20) {
						properties.push('indicate');
					}
					if (propertiesFlag & 0x40) {
						properties.push('authenticatedSignedWrites');
					}
					if (propertiesFlag & 0x80) {
						properties.push('extendedProperties');
					}

					characteristics.push({
						startHandle: data.readUInt16LE(offset),
						propertiesFlags: propertiesFlag,
						properties: properties,
						valueHandle: data.readUInt16LE(offset + 3),
						uuid:
							type === 7
								? data.readUInt16LE(offset + 5).toString(16)
								: data
										.slice(offset + 5)
										.slice(0, 16)
										.toString('hex')
										.match(/.{1,2}/g)
										.reverse()
										.join('')
					});
				}
			}

			if (
				opcode !== ATT_OP_READ_BY_TYPE_RESP ||
				characteristics[characteristics.length - 1].valueHandle === service.endHandle
			) {
				const wantedCharacteristics: GattCharacteristic[] = [];
				for (i = 0; i < characteristics.length; i++) {
					const characteristic = characteristics[i];

					if (i !== 0) {
						characteristics[i - 1].endHandle = characteristics[i].startHandle - 1;
					}

					if (i === characteristics.length - 1) {
						characteristic.endHandle = service.endHandle;
					}

					this.characteristics.get(serviceUUID).set(characteristic.uuid, characteristic);

					if (characteristicUUIDs.length === 0 || characteristicUUIDs.indexOf(characteristic.uuid) !== -1) {
						wantedCharacteristics.push(characteristic);
					}
				}

				this.emit('characteristicsDiscovered', serviceUUID, wantedCharacteristics);
			} else {
				this.queueCommand(
					this.readByTypeRequest(
						characteristics[characteristics.length - 1].valueHandle + 1,
						service.endHandle,
						GATT_CHARAC_UUID
					),
					callback
				);
			}
		};

		this.queueCommand(this.readByTypeRequest(service.startHandle, service.endHandle, GATT_CHARAC_UUID), callback);
	}

	public read(serviceUUID: string, characteristicUUID: string) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);

		let readData = Buffer.alloc(0);

		const callback = (data: Buffer) => {
			const opcode = data[0];

			if (opcode === ATT_OP_READ_RESP || opcode === ATT_OP_READ_BLOB_RESP) {
				readData = Buffer.from(`${readData.toString('hex')}${data.slice(1).toString('hex')}`, 'hex');

				if (data.length === this.mtu) {
					this.queueCommand(this.readBlobRequest(characteristic.valueHandle, readData.length), callback);
				} else {
					this.emit('read', serviceUUID, characteristicUUID, readData);
				}
			} else {
				this.emit('read', serviceUUID, characteristicUUID, readData);
			}
		};

		this.queueCommand(this.readRequest(characteristic.valueHandle), callback);
	}

	public write(serviceUUID: string, characteristicUUID: string, data: Buffer, withoutResponse: boolean) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);

		if (withoutResponse) {
			this.queueCommand(this.writeRequest(characteristic.valueHandle, data, true), null, () => {
				this.emit('write', serviceUUID, characteristicUUID);
			});
		} else if (data.length + 3 > this.mtu) {
			return this.longWrite(serviceUUID, characteristicUUID, data, withoutResponse);
		} else {
			this.queueCommand(this.writeRequest(characteristic.valueHandle, data, false), (moreData: Buffer) => {
				const opcode = moreData[0];

				if (opcode === ATT_OP_WRITE_RESP) {
					this.emit('write', serviceUUID, characteristicUUID);
				}
			});
		}
	}

	/* Perform a "long write" as described Bluetooth Spec section 4.9.4 "Write Long Characteristic Values" */
	private longWrite(serviceUUID: string, characteristicUUID: string, data: Buffer, withoutResponse: boolean) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);
		const limit = this.mtu - 5;

		const prepareWriteCallback = (dataChunk: Buffer) => {
			return (resp: Buffer) => {
				const opcode = resp[0];

				if (opcode !== ATT_OP_PREPARE_WRITE_RESP) {
					// NO-OP
				} else {
					const expectedLength = dataChunk.length + 5;

					if (resp.length !== expectedLength) {
						/* the response should contain the data packet echoed back to the caller */
						// NO-OP
					}
				}
			};
		};

		/* split into prepare-write chunks and queue them */
		let offset = 0;

		while (offset < data.length) {
			const end = offset + limit;
			const chunk = data.slice(offset, end);
			this.queueCommand(
				this.prepareWriteRequest(characteristic.valueHandle, offset, chunk),
				prepareWriteCallback(chunk)
			);
			offset = end;
		}

		/* queue the execute command with a callback to emit the write signal when done */
		this.queueCommand(this.executeWriteRequest(characteristic.valueHandle), (resp: Buffer) => {
			const opcode = resp[0];

			if (opcode === ATT_OP_EXECUTE_WRITE_RESP && !withoutResponse) {
				this.emit('write', serviceUUID, characteristicUUID);
			}
		});
	}

	public broadcast(serviceUUID: string, characteristicUUID: string, broadcast: boolean) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);

		this.queueCommand(
			this.readByTypeRequest(characteristic.startHandle, characteristic.endHandle, GATT_SERVER_CHARAC_CFG_UUID),
			(data: Buffer) => {
				const opcode = data[0];
				if (opcode === ATT_OP_READ_BY_TYPE_RESP) {
					const handle = data.readUInt16LE(2);
					let value = data.readUInt16LE(4);

					if (broadcast) {
						value |= 0x0001;
					} else {
						value &= 0xfffe;
					}

					const valueBuffer = Buffer.alloc(2);
					valueBuffer.writeUInt16LE(value, 0);

					this.queueCommand(this.writeRequest(handle, valueBuffer, false), (moreData: Buffer) => {
						const moreOpcode = moreData[0];

						if (moreOpcode === ATT_OP_WRITE_RESP) {
							this.emit('broadcast', serviceUUID, characteristicUUID, broadcast);
						}
					});
				}
			}
		);
	}

	public notify(serviceUUID: string, characteristicUUID: string, notify: boolean) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);

		this.queueCommand(
			this.readByTypeRequest(characteristic.startHandle, characteristic.endHandle, GATT_CLIENT_CHARAC_CFG_UUID),
			(data: Buffer) => {
				const opcode = data[0];
				if (opcode === ATT_OP_READ_BY_TYPE_RESP) {
					const handle = data.readUInt16LE(2);
					let value = data.readUInt16LE(4);

					const useNotify = characteristic.propertiesFlags & 0x10;
					const useIndicate = characteristic.propertiesFlags & 0x20;

					if (notify) {
						if (useNotify) {
							value |= 0x0001;
						} else if (useIndicate) {
							value |= 0x0002;
						}
					} else {
						if (useNotify) {
							value &= 0xfffe;
						} else if (useIndicate) {
							value &= 0xfffd;
						}
					}

					const valueBuffer = Buffer.alloc(2);
					valueBuffer.writeUInt16LE(value, 0);

					this.queueCommand(this.writeRequest(handle, valueBuffer, false), (moreData: Buffer) => {
						const moreOpcode = moreData[0];

						if (moreOpcode === ATT_OP_WRITE_RESP) {
							this.emit('notify', serviceUUID, characteristicUUID, notify);
						}
					});
				}
			}
		);
	}

	public discoverDescriptors(serviceUUID: string, characteristicUUID: string) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);
		const descriptors: GattDescriptor[] = [];

		this.descriptors.get(serviceUUID).set(characteristicUUID, new Map());

		const callback = (data: Buffer) => {
			const opcode = data[0];
			let i = 0;

			if (opcode === ATT_OP_FIND_INFO_RESP) {
				const num = data[1];

				for (i = 0; i < num; i++) {
					descriptors.push({
						handle: data.readUInt16LE(2 + i * 4 + 0),
						uuid: data.readUInt16LE(2 + i * 4 + 2).toString(16)
					});
				}
			}

			if (opcode !== ATT_OP_FIND_INFO_RESP || descriptors[descriptors.length - 1].handle === characteristic.endHandle) {
				const discoveredDescriptors: GattDescriptor[] = [];
				for (i = 0; i < descriptors.length; i++) {
					discoveredDescriptors.push(descriptors[i]);
					this.descriptors.get(serviceUUID).get(characteristicUUID).set(descriptors[i].uuid, descriptors[i]);
				}

				this.emit('descriptorsDiscovered', serviceUUID, characteristicUUID, discoveredDescriptors);
			} else {
				this.queueCommand(
					this.findInfoRequest(descriptors[descriptors.length - 1].handle + 1, characteristic.endHandle),
					callback
				);
			}
		};

		this.queueCommand(this.findInfoRequest(characteristic.valueHandle + 1, characteristic.endHandle), callback);
	}

	public readValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string) {
		const descriptor = this.descriptors.get(serviceUUID).get(characteristicUUID).get(descriptorUUID);

		let readData = Buffer.alloc(0);

		const callback = (data: Buffer) => {
			const opcode = data[0];
			if (opcode === ATT_OP_READ_RESP || opcode === ATT_OP_READ_BLOB_RESP) {
				readData = Buffer.from(`${readData.toString('hex')}${data.slice(1).toString('hex')}`, 'hex');
				if (data.length === this.mtu) {
					this.queueCommand(this.readBlobRequest(descriptor.handle, readData.length), callback);
				} else {
					this.emit('valueRead', serviceUUID, characteristicUUID, descriptorUUID, readData);
				}
			} else {
				this.emit('valueRead', serviceUUID, characteristicUUID, descriptorUUID, readData);
			}
		};

		this.queueCommand(this.readRequest(descriptor.handle), callback);
	}

	public writeValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string, data: Buffer) {
		const descriptor = this.descriptors.get(serviceUUID).get(characteristicUUID).get(descriptorUUID);

		this.queueCommand(this.writeRequest(descriptor.handle, data, false), (moreData: Buffer) => {
			const opcode = moreData[0];

			if (opcode === ATT_OP_WRITE_RESP) {
				this.emit('valueWrite', serviceUUID, characteristicUUID, descriptorUUID);
			}
		});
	}

	public readHandle(handle: number) {
		let readData = Buffer.alloc(0);

		const callback = (data: Buffer) => {
			const opcode = data[0];
			if (opcode === ATT_OP_READ_RESP || opcode === ATT_OP_READ_BLOB_RESP) {
				readData = Buffer.from(`${readData.toString('hex')}${data.slice(1).toString('hex')}`, 'hex');
				if (data.length === this.mtu) {
					this.queueCommand(this.readBlobRequest(handle, readData.length), callback);
				} else {
					this.emit('handleRead', handle, readData);
				}
			} else {
				this.emit('handleRead', handle, readData);
			}
		};

		this.queueCommand(this.readRequest(handle), callback);
	}

	public writeHandle(handle: number, data: Buffer, withoutResponse: boolean) {
		if (withoutResponse) {
			this.queueCommand(this.writeRequest(handle, data, true), null, () => {
				this.emit('handleWrite', handle);
			});
		} else {
			this.queueCommand(this.writeRequest(handle, data, false), (moreData: Buffer) => {
				const opcode = moreData[0];

				if (opcode === ATT_OP_WRITE_RESP) {
					this.emit('handleWrite', handle);
				}
			});
		}
	}
}
