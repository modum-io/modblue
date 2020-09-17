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

export class Gatt {
	private aclStream: AclStream;

	private services: Map<string, GattService>;
	private characteristics: Map<string, Map<string, GattCharacteristic>>;
	private descriptors: Map<string, Map<string, Map<string, GattDescriptor>>>;

	private currentCommand: GattCommand;
	private commandQueue: GattCommand[];

	private mtu: number;
	private security: string;

	public constructor(aclStream: AclStream) {
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

	public dispose() {
		this.aclStream.off('data', this.onAclStreamData);
		this.aclStream.off('encrypt', this.onAclStreamEncrypt);
		this.aclStream.off('encryptFail', this.onAclStreamEncryptFail);
		this.aclStream.off('end', this.onAclStreamEnd);
	}

	private onAclStreamData = async (cid: number, data: Buffer) => {
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

			// this.emit('handleNotify', valueHandle, valueData);

			if (data[0] === ATT_OP_HANDLE_IND) {
				await this.queueCommand(this.handleConfirmation(), true);
				// this.emit('handleConfirmation', valueHandle);
			}

			for (const serviceUuid of this.services.keys()) {
				for (const characteristicUuid in this.characteristics.get(serviceUuid).keys()) {
					if (this.characteristics.get(serviceUuid).get(characteristicUuid).valueHandle === valueHandle) {
						// this.emit('notification', serviceUuid, characteristicUuid, valueData);
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
					// If the command has a callback stop processing and wait for the callback
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

	private async queueCommand(buffer: Buffer, resolveOnWrite: true): Promise<void>;
	private async queueCommand(buffer: Buffer, resolveOnWrite: false): Promise<Buffer>;
	private async queueCommand(buffer: Buffer, resolveOnWrite: boolean) {
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
						// If the command has a callback stop processing and wait for the callback
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
		const data = await this.queueCommand(this.mtuRequest(mtu), false);
		const opcode = data[0];

		if (opcode === ATT_OP_MTU_RESP) {
			const newMtu = data.readUInt16LE(1);
			this.mtu = newMtu;
		}

		return this.mtu;
	}

	public async discoverServices(uuids: string[]) {
		const services = await this.doDiscoverServices();
		return services.filter((s) => uuids.length === 0 || uuids.includes(s.uuid));
	}
	private async doDiscoverServices(): Promise<GattService[]> {
		const services: GattService[] = [];
		let startHandle = 0x0001;

		while (true) {
			const data = await this.queueCommand(this.readByGroupRequest(startHandle, 0xffff, GATT_PRIM_SVC_UUID), false);

			const opcode = data[0];

			if (opcode === ATT_OP_READ_BY_GROUP_RESP) {
				const type = data[1];
				const num = (data.length - 2) / type;

				for (let i = 0; i < num; i++) {
					const offset = 2 + i * type;
					const service = {
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
					};
					services.push(service);
					this.services.set(service.uuid, service);
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

	public async discoverIncludedServices(serviceUUID: string, uuids: string[]) {
		const service = this.services.get(serviceUUID);
		const includedServices = await this.doDiscoverIncludedServices(service);
		return includedServices.filter((s) => uuids.length === 0 || uuids.includes(s.uuid));
	}
	private async doDiscoverIncludedServices(service: GattService) {
		const includedServices: GattService[] = [];
		let startHandle = service.startHandle;

		while (true) {
			const data = await this.queueCommand(
				this.readByTypeRequest(startHandle, service.endHandle, GATT_INCLUDE_UUID),
				false
			);

			const opcode = data[0];

			if (opcode === ATT_OP_READ_BY_TYPE_RESP) {
				const type = data[1];
				const num = (data.length - 2) / type;

				for (let i = 0; i < num; i++) {
					const offset = 2 + i * type;
					const includedService = {
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
					};

					includedServices.push(includedService);
					if (!this.services.has(includedService.uuid)) {
						this.services.set(includedService.uuid, includedService);
					}
				}
			}

			if (
				opcode !== ATT_OP_READ_BY_TYPE_RESP ||
				includedServices[includedServices.length - 1].endHandle === service.endHandle
			) {
				break;
			} else {
				startHandle = includedServices[includedServices.length - 1].endHandle + 1;
			}
		}

		return includedServices;
	}

	public async discoverCharacteristics(serviceUUID: string, uuids: string[]) {
		const service = this.services.get(serviceUUID);
		const characteristics = await this.doDiscoverCharacteristics(service);
		return characteristics.filter((c) => uuids.length === 0 || uuids.includes(c.uuid));
	}
	private async doDiscoverCharacteristics(service: GattService) {
		const characteristics: GattCharacteristic[] = [];

		this.characteristics.set(service.uuid, this.characteristics.get(service.uuid) || new Map());

		let startHandle = service.startHandle;

		while (true) {
			const data = await this.queueCommand(
				this.readByTypeRequest(startHandle, service.endHandle, GATT_CHARAC_UUID),
				false
			);

			const opcode = data[0];

			if (opcode === ATT_OP_READ_BY_TYPE_RESP) {
				const type = data[1];
				const num = (data.length - 2) / type;

				for (let i = 0; i < num; i++) {
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
				break;
			} else {
				startHandle = characteristics[characteristics.length - 1].valueHandle + 1;
			}
		}

		// Add end handle to all characteristics
		for (let i = 0; i < characteristics.length; i++) {
			const characteristic = characteristics[i];

			if (i !== 0) {
				characteristics[i - 1].endHandle = characteristics[i].startHandle - 1;
			}

			if (i === characteristics.length - 1) {
				characteristic.endHandle = service.endHandle;
			}

			this.characteristics.get(service.uuid).set(characteristic.uuid, characteristic);
		}

		return characteristics;
	}

	public async read(serviceUUID: string, characteristicUUID: string) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);

		let readData = Buffer.alloc(0);

		let data = await this.queueCommand(this.readRequest(characteristic.valueHandle), false);
		let opcode = data[0];

		while (true) {
			if (opcode !== ATT_OP_READ_RESP && opcode !== ATT_OP_READ_BLOB_RESP) {
				return readData;
			}

			readData = Buffer.concat([readData, data.slice(1)], readData.length + data.length - 1);

			if (data.length !== this.mtu) {
				return readData;
			}

			data = await this.queueCommand(this.readBlobRequest(characteristic.valueHandle, readData.length), false);
			opcode = data[0];
		}
	}

	public async write(serviceUUID: string, characteristicUUID: string, data: Buffer, withoutResponse: boolean) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);

		if (withoutResponse) {
			await this.queueCommand(this.writeRequest(characteristic.valueHandle, data, true), true);
		} else if (data.length + 3 > this.mtu) {
			return this.longWrite(serviceUUID, characteristicUUID, data, withoutResponse);
		} else {
			const respData = await this.queueCommand(this.writeRequest(characteristic.valueHandle, data, false), false);
			const opcode = respData[0];

			if (opcode !== ATT_OP_WRITE_RESP) {
				throw new Error(`Write error, opcode ${opcode}`);
			}
		}
	}

	/* Perform a "long write" as described Bluetooth Spec section 4.9.4 "Write Long Characteristic Values" */
	private async longWrite(serviceUUID: string, characteristicUUID: string, data: Buffer, withoutResponse: boolean) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);
		const limit = this.mtu - 5;

		/* split into prepare-write chunks and queue them */
		let offset = 0;

		while (offset < data.length) {
			const end = offset + limit;
			const chunk = data.slice(offset, end);
			const chunkRespData = await this.queueCommand(
				this.prepareWriteRequest(characteristic.valueHandle, offset, chunk),
				false
			);
			const chunkOpcode = chunkRespData[0];

			if (chunkOpcode !== ATT_OP_PREPARE_WRITE_RESP) {
				throw new Error(`Long write chunk failed, invalid opcode ${chunkOpcode}`);
			} else {
				const expectedLength = chunk.length + 5;

				if (chunkRespData.length !== expectedLength) {
					/* the response should contain the data packet echoed back to the caller */
					throw new Error(`Long write chunk failed, received invalid response length`);
				}
			}
			offset = end;
		}

		/* queue the execute command with a callback to emit the write signal when done */
		const respData = await this.queueCommand(this.executeWriteRequest(characteristic.valueHandle), false);
		const opcode = respData[0];

		if (opcode !== ATT_OP_EXECUTE_WRITE_RESP && !withoutResponse) {
			throw new Error(`Long write failed, invalid opcode ${opcode}`);
		}
	}

	public async broadcast(serviceUUID: string, characteristicUUID: string, broadcast: boolean) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);

		const data = await this.queueCommand(
			this.readByTypeRequest(characteristic.startHandle, characteristic.endHandle, GATT_SERVER_CHARAC_CFG_UUID),
			false
		);

		const opcode = data[0];
		if (opcode !== ATT_OP_READ_BY_TYPE_RESP) {
			throw new Error(`Broadcast error, opcode ${opcode}`);
		}

		const handle = data.readUInt16LE(2);
		let value = data.readUInt16LE(4);

		if (broadcast) {
			value |= 0x0001;
		} else {
			value &= 0xfffe;
		}

		const valueBuffer = Buffer.alloc(2);
		valueBuffer.writeUInt16LE(value, 0);

		const moreData = await this.queueCommand(this.writeRequest(handle, valueBuffer, false), false);
		const moreOpcode = moreData[0];

		if (moreOpcode !== ATT_OP_WRITE_RESP) {
			throw new Error(`Broadcast error, opcode ${opcode}`);
		}
	}

	public async notify(serviceUUID: string, characteristicUUID: string, notify: boolean) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);

		const data = await this.queueCommand(
			this.readByTypeRequest(characteristic.startHandle, characteristic.endHandle, GATT_CLIENT_CHARAC_CFG_UUID),
			false
		);

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

			const moreData = await this.queueCommand(this.writeRequest(handle, valueBuffer, false), false);
			const moreOpcode = moreData[0];

			if (moreOpcode !== ATT_OP_WRITE_RESP) {
				throw new Error(`Notify error, opcode ${opcode}`);
			}
		}
	}

	public async discoverDescriptors(serviceUUID: string, characteristicUUID: string, uuids: string[]) {
		const service = this.services.get(serviceUUID);
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);
		const descriptors = await this.doDiscoverDescriptors(service, characteristic);
		return descriptors.filter((d) => uuids.length === 0 || uuids.includes(d.uuid));
	}
	private async doDiscoverDescriptors(service: GattService, characteristic: GattCharacteristic) {
		const descriptors: GattDescriptor[] = [];

		this.descriptors
			.get(service.uuid)
			.set(characteristic.uuid, this.descriptors.get(service.uuid).get(characteristic.uuid) || new Map());

		let startHandle = characteristic.valueHandle + 1;

		while (true) {
			const data = await this.queueCommand(this.findInfoRequest(startHandle, characteristic.endHandle), false);
			const opcode = data[0];

			if (opcode === ATT_OP_FIND_INFO_RESP) {
				const num = data[1];

				for (let i = 0; i < num; i++) {
					const descriptor = {
						handle: data.readUInt16LE(2 + i * 4 + 0),
						uuid: data.readUInt16LE(2 + i * 4 + 2).toString(16)
					};

					descriptors.push(descriptor);
					this.descriptors.get(service.uuid).get(characteristic.uuid).set(descriptor.uuid, descriptor);
				}
			}

			if (opcode !== ATT_OP_FIND_INFO_RESP || descriptors[descriptors.length - 1].handle === characteristic.endHandle) {
				break;
			} else {
				startHandle = descriptors[descriptors.length - 1].handle + 1;
			}
		}

		return descriptors;
	}

	public async readValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string) {
		const descriptor = this.descriptors.get(serviceUUID).get(characteristicUUID).get(descriptorUUID);

		let readData = Buffer.alloc(0);

		let data = await this.queueCommand(this.readRequest(descriptor.handle), false);
		let opcode = data[0];

		while (true) {
			if (opcode !== ATT_OP_READ_RESP && opcode !== ATT_OP_READ_BLOB_RESP) {
				return readData;
			}

			readData = Buffer.concat([readData, data.slice(1)]);

			if (data.length !== this.mtu) {
				return readData;
			}

			data = await this.queueCommand(this.readBlobRequest(descriptor.handle, readData.length), false);
			opcode = data[0];
		}
	}

	public async writeValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string, data: Buffer) {
		const descriptor = this.descriptors.get(serviceUUID).get(characteristicUUID).get(descriptorUUID);

		const respData = await this.queueCommand(this.writeRequest(descriptor.handle, data, false), false);
		const opcode = respData[0];

		if (opcode !== ATT_OP_WRITE_RESP) {
			throw new Error(`WriteValue error, opcode ${opcode}`);
		}
	}
}
