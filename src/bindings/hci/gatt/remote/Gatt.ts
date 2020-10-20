import { GattRemote, Peripheral } from '../../../../models';
import { Hci } from '../../misc';
import * as CONST from '../Constants';

import { HciGattCharacteristicRemote } from './Characteristic';
import { HciGattDescriptorRemote } from './Descriptor';
import { HciGattServiceRemote } from './Service';

interface GattCommand {
	buffer: Buffer;
	resolve: (data: Buffer) => void;
	resolveOnWrite: () => void;
}

export class HciGattRemote extends GattRemote {
	private hci: Hci;
	private handle: number;

	private security: string;

	private currentCommand: GattCommand = null;
	private commandQueue: GattCommand[] = [];

	public services: Map<string, HciGattServiceRemote> = new Map();

	public constructor(peripheral: Peripheral, hci: Hci, handle: number) {
		super(peripheral);

		this.hci = hci;
		this.hci.on('aclDataPkt', this.onAclStreamData);

		this.handle = handle;
	}

	private processCommands() {
		while (this.commandQueue.length) {
			this.currentCommand = this.commandQueue.shift();

			this.writeAtt(this.currentCommand.buffer);

			if (this.currentCommand.resolve) {
				// If the command has a callback stop processing and wait for the callback
				break;
			} else if (this.currentCommand.resolveOnWrite) {
				this.currentCommand.resolveOnWrite();
				this.currentCommand = null;
			}
		}
	}

	public dispose() {
		this.hci.off('aclDataPkt', this.onAclStreamData);
		this.hci = null;
		this.handle = null;
	}

	private onAclStreamData = async (handle: number, cid: number, data: Buffer) => {
		console.log('<- acl', this.handle === handle, cid === CONST.ATT_CID, data);

		if (handle !== this.handle || cid !== CONST.ATT_CID) {
			return;
		}

		if (this.currentCommand && data.toString('hex') === this.currentCommand.buffer.toString('hex')) {
			// NO-OP
		} else if (data[0] % 2 === 0) {
			// NO-OP
			// This used to be noble multi role stuff
			console.log('noble multi role data');
		} else if (data[0] === CONST.ATT_OP_HANDLE_NOTIFY || data[0] === CONST.ATT_OP_HANDLE_IND) {
			/*const valueHandle = data.readUInt16LE(1);
			const valueData = data.slice(3);

			// this.emit('handleNotify', valueHandle, valueData);*/

			if (data[0] === CONST.ATT_OP_HANDLE_IND) {
				await this.queueCommand(this.handleConfirmation(), true);
				// this.emit('handleConfirmation', valueHandle);
			}

			/*for (const serviceUuid of this.services.keys()) {
				for (const characteristicUuid in this.characteristics.get(serviceUuid).keys()) {
					if (this.characteristics.get(serviceUuid).get(characteristicUuid).valueHandle === valueHandle) {
						this.emit('notification', serviceUuid, characteristicUuid, valueData);
					}
				}
			}*/
		} else if (!this.currentCommand) {
			// NO-OP
		} else {
			if (
				data[0] === CONST.ATT_OP_ERROR &&
				(data[4] === CONST.ATT_ECODE_AUTHENTICATION ||
					data[4] === CONST.ATT_ECODE_AUTHORIZATION ||
					data[4] === CONST.ATT_ECODE_INSUFF_ENC) &&
				this.security !== 'medium'
			) {
				// this.aclStream.encrypt();
				return;
			}

			this.currentCommand.resolve(data);

			this.currentCommand = null;
			this.processCommands();
		}
	};

	private writeAtt(data: Buffer) {
		console.log('-> acl', this.handle, CONST.ATT_CID, data);
		this.hci.writeAclDataPkt(this.handle, CONST.ATT_CID, data);
	}

	private errorResponse(opcode: number, handle: number, status: number) {
		const buf = Buffer.alloc(5);

		buf.writeUInt8(CONST.ATT_OP_ERROR, 0);
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
				resolve: !resolveOnWrite ? (data) => resolve(data) : undefined,
				resolveOnWrite: resolveOnWrite ? () => resolve() : undefined
			});

			if (!this.currentCommand) {
				this.processCommands();
			}
		});
	}

	private mtuRequest(mtu: number) {
		const buf = Buffer.alloc(3);

		buf.writeUInt8(CONST.ATT_OP_MTU_REQ, 0);
		buf.writeUInt16LE(mtu, 1);

		return buf;
	}

	public readByGroupRequest(startHandle: number, endHandle: number, groupUUID: number) {
		const buf = Buffer.alloc(7);

		buf.writeUInt8(CONST.ATT_OP_READ_BY_GROUP_REQ, 0);
		buf.writeUInt16LE(startHandle, 1);
		buf.writeUInt16LE(endHandle, 3);
		buf.writeUInt16LE(groupUUID, 5);

		return buf;
	}

	public readByTypeRequest(startHandle: number, endHandle: number, groupUUID: number) {
		const buf = Buffer.alloc(7);

		buf.writeUInt8(CONST.ATT_OP_READ_BY_TYPE_REQ, 0);
		buf.writeUInt16LE(startHandle, 1);
		buf.writeUInt16LE(endHandle, 3);
		buf.writeUInt16LE(groupUUID, 5);

		return buf;
	}

	public readRequest(handle: number) {
		const buf = Buffer.alloc(3);

		buf.writeUInt8(CONST.ATT_OP_READ_REQ, 0);
		buf.writeUInt16LE(handle, 1);

		return buf;
	}

	public readBlobRequest(handle: number, offset: number) {
		const buf = Buffer.alloc(5);

		buf.writeUInt8(CONST.ATT_OP_READ_BLOB_REQ, 0);
		buf.writeUInt16LE(handle, 1);
		buf.writeUInt16LE(offset, 3);

		return buf;
	}

	public findInfoRequest(startHandle: number, endHandle: number) {
		const buf = Buffer.alloc(5);

		buf.writeUInt8(CONST.ATT_OP_FIND_INFO_REQ, 0);
		buf.writeUInt16LE(startHandle, 1);
		buf.writeUInt16LE(endHandle, 3);

		return buf;
	}

	public writeRequest(handle: number, data: Buffer, withoutResponse: boolean) {
		const buf = Buffer.alloc(3 + data.length);

		buf.writeUInt8(withoutResponse ? CONST.ATT_OP_WRITE_CMD : CONST.ATT_OP_WRITE_REQ, 0);
		buf.writeUInt16LE(handle, 1);

		for (let i = 0; i < data.length; i++) {
			buf.writeUInt8(data.readUInt8(i), i + 3);
		}

		return buf;
	}

	private prepareWriteRequest(handle: number, offset: number, data: Buffer) {
		const buf = Buffer.alloc(5 + data.length);

		buf.writeUInt8(CONST.ATT_OP_PREPARE_WRITE_REQ, 0);
		buf.writeUInt16LE(handle, 1);
		buf.writeUInt16LE(offset, 3);

		for (let i = 0; i < data.length; i++) {
			buf.writeUInt8(data.readUInt8(i), i + 5);
		}

		return buf;
	}

	private executeWriteRequest(handle: number, cancelPreparedWrites?: boolean) {
		const buf = Buffer.alloc(2);

		buf.writeUInt8(CONST.ATT_OP_EXECUTE_WRITE_REQ, 0);
		buf.writeUInt8(cancelPreparedWrites ? 0 : 1, 1);

		return buf;
	}

	private handleConfirmation() {
		const buf = Buffer.alloc(1);

		buf.writeUInt8(CONST.ATT_OP_HANDLE_CNF, 0);

		return buf;
	}

	public async exchangeMtu(mtu: number) {
		const data = await this.queueCommand(this.mtuRequest(mtu), false);
		const opcode = data[0];

		if (opcode === CONST.ATT_OP_MTU_RESP) {
			const newMtu = data.readUInt16LE(1);
			this._mtu = Math.min(mtu, newMtu);
		} else {
			throw new Error('Exchanging mtu failed');
		}

		return this.mtu;
	}

	protected async doDiscoverServices(): Promise<HciGattServiceRemote[]> {
		const newServices: HciGattServiceRemote[] = [];
		let startHandle = 0x0001;

		while (true) {
			const data = await this.queueCommand(
				this.readByGroupRequest(startHandle, 0xffff, CONST.GATT_PRIM_SVC_UUID),
				false
			);

			const opcode = data[0];

			if (opcode === CONST.ATT_OP_READ_BY_GROUP_RESP) {
				const type = data[1];
				const num = (data.length - 2) / type;

				for (let i = 0; i < num; i++) {
					const offset = 2 + i * type;

					const srvStartHandle = data.readUInt16LE(offset);
					const srvEndHandle = data.readUInt16LE(offset + 2);
					const uuid =
						type === 6
							? data.readUInt16LE(offset + 4).toString(16)
							: data
									.slice(offset + 4)
									.slice(0, 16)
									.toString('hex')
									.match(/.{1,2}/g)
									.reverse()
									.join('');

					const newService = new HciGattServiceRemote(this, uuid, srvStartHandle, srvEndHandle);
					newServices.push(newService);
				}
			}

			if (opcode !== CONST.ATT_OP_READ_BY_GROUP_RESP || newServices[newServices.length - 1].endHandle === 0xffff) {
				break;
			} else {
				startHandle = newServices[newServices.length - 1].endHandle + 1;
			}
		}

		return newServices;
	}

	public async discoverCharacteristics(serviceUUID: string): Promise<HciGattCharacteristicRemote[]> {
		const service = this.services.get(serviceUUID);
		if (!service) {
			throw new Error(`Service ${serviceUUID} not found`);
		}

		const newChars: HciGattCharacteristicRemote[] = [];

		let startHandle = service.startHandle;

		while (true) {
			const data = await this.queueCommand(
				this.readByTypeRequest(startHandle, service.endHandle, CONST.GATT_CHARAC_UUID),
				false
			);

			const opcode = data[0];

			if (opcode === CONST.ATT_OP_READ_BY_TYPE_RESP) {
				const type = data[1];
				const num = (data.length - 2) / type;

				for (let i = 0; i < num; i++) {
					const offset = 2 + i * type;

					const charStartHandle = data.readUInt16LE(offset);
					const secureFlag = data.readUInt8(offset + 1);
					const propertiesFlag = data.readUInt8(offset + 2);
					const charValueHandle = data.readUInt16LE(offset + 3);
					const uuid =
						type === 7
							? data.readUInt16LE(offset + 5).toString(16)
							: data
									.slice(offset + 5)
									.slice(0, 16)
									.toString('hex')
									.match(/.{1,2}/g)
									.reverse()
									.join('');

					const newChar = new HciGattCharacteristicRemote(
						service,
						uuid,
						propertiesFlag,
						secureFlag,
						charStartHandle,
						charValueHandle
					);
					newChars.push(newChar);
				}
			}

			if (
				opcode !== CONST.ATT_OP_READ_BY_TYPE_RESP ||
				newChars[newChars.length - 1].valueHandle === service.endHandle
			) {
				break;
			} else {
				startHandle = newChars[newChars.length - 1].valueHandle + 1;
			}
		}

		// Add end handle to all characteristics
		for (let i = 0; i < newChars.length; i++) {
			const characteristic = newChars[i];

			if (i !== 0) {
				newChars[i - 1].endHandle = newChars[i].startHandle - 1;
			}

			if (i === newChars.length - 1) {
				characteristic.endHandle = service.endHandle;
			}
		}

		return newChars;
	}

	public async read(serviceUUID: string, characteristicUUID: string) {
		const service = this.services.get(serviceUUID);
		if (!service) {
			throw new Error(`Service ${serviceUUID} not found`);
		}

		const characteristic = service.characteristics.get(characteristicUUID);
		if (!characteristic) {
			throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
		}

		let readData = Buffer.alloc(0);

		let data = await this.queueCommand(this.readRequest(characteristic.valueHandle), false);
		let opcode = data[0];

		while (true) {
			if (opcode !== CONST.ATT_OP_READ_RESP && opcode !== CONST.ATT_OP_READ_BLOB_RESP) {
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
		const service = this.services.get(serviceUUID);
		if (!service) {
			throw new Error(`Service ${serviceUUID} not found`);
		}

		const characteristic = service.characteristics.get(characteristicUUID);
		if (!characteristic) {
			throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
		}

		if (withoutResponse) {
			await this.queueCommand(this.writeRequest(characteristic.valueHandle, data, true), true);
		} else if (data.length + 3 > this.mtu) {
			return this.longWrite(serviceUUID, characteristicUUID, data, withoutResponse);
		} else {
			const respData = await this.queueCommand(this.writeRequest(characteristic.valueHandle, data, false), false);
			const opcode = respData[0];

			if (opcode !== CONST.ATT_OP_WRITE_RESP) {
				throw new Error(`Write error, opcode ${opcode}`);
			}
		}
	}

	/* Perform a "long write" as described Bluetooth Spec section 4.9.4 "Write Long Characteristic Values" */
	private async longWrite(serviceUUID: string, characteristicUUID: string, data: Buffer, withoutResponse: boolean) {
		const service = this.services.get(serviceUUID);
		if (!service) {
			throw new Error(`Service ${serviceUUID} not found`);
		}

		const characteristic = service.characteristics.get(characteristicUUID);
		if (!characteristic) {
			throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
		}

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

			if (chunkOpcode !== CONST.ATT_OP_PREPARE_WRITE_RESP) {
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

		if (opcode !== CONST.ATT_OP_EXECUTE_WRITE_RESP && !withoutResponse) {
			throw new Error(`Long write failed, invalid opcode ${opcode}`);
		}
	}

	public async broadcast(serviceUUID: string, characteristicUUID: string, broadcast: boolean) {
		const service = this.services.get(serviceUUID);
		if (!service) {
			throw new Error(`Service ${serviceUUID} not found`);
		}

		const characteristic = service.characteristics.get(characteristicUUID);
		if (!characteristic) {
			throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
		}

		const data = await this.queueCommand(
			this.readByTypeRequest(characteristic.startHandle, characteristic.endHandle, CONST.GATT_SERVER_CHARAC_CFG_UUID),
			false
		);

		const opcode = data[0];
		if (opcode !== CONST.ATT_OP_READ_BY_TYPE_RESP) {
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

		if (moreOpcode !== CONST.ATT_OP_WRITE_RESP) {
			throw new Error(`Broadcast error, opcode ${opcode}`);
		}
	}

	public async notify(serviceUUID: string, characteristicUUID: string, notify: boolean) {
		const service = this.services.get(serviceUUID);
		if (!service) {
			throw new Error(`Service ${serviceUUID} not found`);
		}

		const characteristic = service.characteristics.get(characteristicUUID);
		if (!characteristic) {
			throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
		}

		const data = await this.queueCommand(
			this.readByTypeRequest(characteristic.startHandle, characteristic.endHandle, CONST.GATT_CLIENT_CHARAC_CFG_UUID),
			false
		);

		const opcode = data[0];
		if (opcode === CONST.ATT_OP_READ_BY_TYPE_RESP) {
			const handle = data.readUInt16LE(2);
			let value = data.readUInt16LE(4);

			const useNotify = characteristic.properties.includes('notify');
			const useIndicate = characteristic.properties.includes('indicate');

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

			if (moreOpcode !== CONST.ATT_OP_WRITE_RESP) {
				throw new Error(`Notify error, opcode ${opcode}`);
			}
		}
	}

	public async discoverDescriptors(
		serviceUUID: string,
		characteristicUUID: string
	): Promise<HciGattDescriptorRemote[]> {
		const service = this.services.get(serviceUUID);
		if (!service) {
			throw new Error(`Service ${serviceUUID} not found`);
		}

		const characteristic = service.characteristics.get(characteristicUUID);
		if (!characteristic) {
			throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
		}

		const newDescs: HciGattDescriptorRemote[] = [];

		let startHandle = characteristic.valueHandle + 1;

		while (true) {
			const data = await this.queueCommand(this.findInfoRequest(startHandle, characteristic.endHandle), false);
			const opcode = data[0];

			if (opcode === CONST.ATT_OP_FIND_INFO_RESP) {
				const num = data[1];

				for (let i = 0; i < num; i++) {
					const descHandle = data.readUInt16LE(2 + i * 4 + 0);
					const uuid = data.readUInt16LE(2 + i * 4 + 2).toString(16);

					const newDescriptor = new HciGattDescriptorRemote(characteristic, uuid, descHandle);
					newDescs.push(newDescriptor);
				}
			}

			if (opcode !== CONST.ATT_OP_FIND_INFO_RESP || newDescs[newDescs.length - 1].handle === characteristic.endHandle) {
				break;
			} else {
				startHandle = newDescs[newDescs.length - 1].handle + 1;
			}
		}

		return newDescs;
	}

	public async readValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string) {
		const service = this.services.get(serviceUUID);
		if (!service) {
			throw new Error(`Service ${serviceUUID} not found`);
		}

		const characteristic = service.characteristics.get(characteristicUUID);
		if (!characteristic) {
			throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
		}

		const descriptor = characteristic.descriptors.get(descriptorUUID);
		if (!descriptor) {
			throw new Error(
				`Descriptor ${descriptorUUID} in characteristic ${characteristicUUID} in service ${serviceUUID} not found`
			);
		}

		let readData = Buffer.alloc(0);

		let data = await this.queueCommand(this.readRequest(descriptor.handle), false);
		let opcode = data[0];

		while (true) {
			if (opcode !== CONST.ATT_OP_READ_RESP && opcode !== CONST.ATT_OP_READ_BLOB_RESP) {
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
		const service = this.services.get(serviceUUID);
		if (!service) {
			throw new Error(`Service ${serviceUUID} not found`);
		}

		const characteristic = service.characteristics.get(characteristicUUID);
		if (!characteristic) {
			throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
		}

		const descriptor = characteristic.descriptors.get(descriptorUUID);
		if (!descriptor) {
			throw new Error(
				`Descriptor ${descriptorUUID} in characteristic ${characteristicUUID} in service ${serviceUUID} not found`
			);
		}

		const respData = await this.queueCommand(this.writeRequest(descriptor.handle, data, false), false);
		const opcode = respData[0];

		if (opcode !== CONST.ATT_OP_WRITE_RESP) {
			throw new Error(`WriteValue error, opcode ${opcode}`);
		}
	}
}
