import { GattCharacteristicLocal, GattDescriptorLocal, GattLocal } from '../../../../models';
import { HciAdapter } from '../../Adapter';
import { Hci } from '../../misc';
import * as CONST from '../Constants';

// 512 bytes is max char size + 1 byte att opcode + 2 bytes handle + 2 bytes offset for long writes
const DEFAULT_MAX_MTU = 517;

export class HciGattLocal extends GattLocal {
	private hci: Hci;

	private negotiatedMtus: Map<number, number>;

	public constructor(adapter: HciAdapter, hci: Hci, maxMtu: number = DEFAULT_MAX_MTU) {
		super(adapter, maxMtu);

		this.hci = hci;
		this.hci.on('aclDataPkt', this.onAclStreamData);
		this.hci.on('disconnectComplete', this.onHciDisconnect);

		this.negotiatedMtus = new Map();
	}

	private onHciDisconnect = (status: number, handleId: number, reason?: string) => {
		// Reset MTU after a device disconnects
		this.negotiatedMtus.delete(handleId);
	};

	private onAclStreamData = async (handle: number, cid: number, data: Buffer) => {
		if (cid !== CONST.ATT_CID) {
			return;
		}

		const requestType = data[0];
		let response: Buffer = null;

		try {
			switch (requestType) {
				case CONST.ATT_OP_MTU_REQ:
					response = await this.handleMtuRequest(handle, cid, data);
					break;

				case CONST.ATT_OP_FIND_INFO_REQ:
					response = await this.handleFindInfoRequest(handle, cid, data);
					break;

				case CONST.ATT_OP_FIND_BY_TYPE_REQ:
					response = await this.handleFindByTypeRequest(handle, cid, data);
					break;

				case CONST.ATT_OP_READ_BY_TYPE_REQ:
					response = await this.handleReadByTypeRequest(handle, cid, data);
					break;

				case CONST.ATT_OP_READ_REQ:
				case CONST.ATT_OP_READ_BLOB_REQ:
					response = await this.handleReadOrReadBlobRequest(handle, cid, data);
					break;

				case CONST.ATT_OP_READ_BY_GROUP_REQ:
					response = await this.handleReadByGroupRequest(handle, cid, data);
					break;

				case CONST.ATT_OP_WRITE_REQ:
				case CONST.ATT_OP_WRITE_CMD:
					response = await this.handleWriteRequestOrCommand(handle, cid, data);
					break;

				case CONST.ATT_OP_PREPARE_WRITE_REQ:
					response = await this.handlePrepareWriteRequest(handle, cid, data);
					break;

				case CONST.ATT_OP_EXECUTE_WRITE_REQ:
					response = await this.handleExecuteWriteRequest(handle, cid, data);
					break;

				case CONST.ATT_OP_HANDLE_CNF:
					response = await this.handleConfirmation(handle, cid, data);
					break;

				default:
				case CONST.ATT_OP_READ_MULTI_REQ:
				case CONST.ATT_OP_SIGNED_WRITE_CMD:
					response = this.errorResponse(requestType, 0x0000, CONST.ATT_ECODE_REQ_NOT_SUPP);
					break;
			}
		} catch {
			// TODO: How should errors thrown inside possibly user-defined functions be propagated?
		}

		if (response) {
			this.hci.writeAclDataPkt(handle, cid, response);
		}
	};

	private errorResponse(opcode: number, handle: number, status: number) {
		const buf = Buffer.alloc(5);

		buf.writeUInt8(CONST.ATT_OP_ERROR, 0);
		buf.writeUInt8(opcode, 1);
		buf.writeUInt16LE(handle, 2);
		buf.writeUInt8(status, 4);

		return buf;
	}

	private getMtu(handle: number) {
		return this.negotiatedMtus.get(handle) || 23;
	}

	private async handleMtuRequest(_handle: number, _cid: number, request: Buffer) {
		let mtu = request.readUInt16LE(1);

		mtu = Math.max(23, Math.min(mtu, this.maxMtu));
		this.negotiatedMtus.set(_handle, mtu);

		const response = Buffer.alloc(3);

		response.writeUInt8(CONST.ATT_OP_MTU_RESP, 0);
		response.writeUInt16LE(mtu, 1);

		return response;
	}

	private async handleFindInfoRequest(_handle: number, _cid: number, request: Buffer) {
		let response: Buffer = null;

		const startHandle = Math.max(request.readUInt16LE(1), 1);
		const endHandle = Math.min(request.readUInt16LE(3), this.handles.length - 1);

		const infos: { handle: number; uuid: string }[] = [];

		for (let i = startHandle; i <= endHandle; i++) {
			const handle = this.handles[i];
			let uuid = null;

			if (handle.type === 'service') {
				uuid = '2800';
			} else if (handle.type === 'characteristic') {
				uuid = '2803';
			} else if (handle.type === 'characteristicValue') {
				uuid = this.handles[i - 1].object.uuid;
			} else if (handle.type === 'descriptor') {
				uuid = handle.object.uuid;
			}

			if (uuid) {
				infos.push({
					handle: i,
					uuid: uuid
				});
			}
		}

		if (infos.length) {
			const uuidSize = infos[0].uuid.length / 2;
			let numInfo = 1;

			for (let i = 1; i < infos.length; i++) {
				if (infos[0].uuid.length !== infos[i].uuid.length) {
					break;
				}
				numInfo++;
			}

			const lengthPerInfo = uuidSize === 2 ? 4 : 18;
			const maxInfo = Math.floor((this.getMtu(_handle) - 2) / lengthPerInfo);
			numInfo = Math.min(numInfo, maxInfo);

			response = Buffer.alloc(2 + numInfo * lengthPerInfo);

			response[0] = CONST.ATT_OP_FIND_INFO_RESP;
			response[1] = uuidSize === 2 ? 0x01 : 0x2;

			for (let i = 0; i < numInfo; i++) {
				const info = infos[i];

				response.writeUInt16LE(info.handle, 2 + i * lengthPerInfo);

				const uuid = Buffer.from(
					info.uuid
						.match(/.{1,2}/g)
						.reverse()
						.join(''),
					'hex'
				);
				for (var j = 0; j < uuid.length; j++) {
					response[2 + i * lengthPerInfo + 2 + j] = uuid[j];
				}
			}
		} else {
			response = this.errorResponse(CONST.ATT_OP_FIND_INFO_REQ, startHandle, CONST.ATT_ECODE_ATTR_NOT_FOUND);
		}

		return response;
	}

	private async handleFindByTypeRequest(_handle: number, _cid: number, request: Buffer) {
		let response: Buffer = null;

		const startHandle = Math.max(request.readUInt16LE(1), 1);
		const endHandle = Math.min(request.readUInt16LE(3), this.handles.length - 1);

		const uuid = request
			.slice(5, 7)
			.toString('hex')
			.match(/.{1,2}/g)
			.reverse()
			.join('');
		const value = request
			.slice(7)
			.toString('hex')
			.match(/.{1,2}/g)
			.reverse()
			.join('');

		const handles = [];

		for (let i = startHandle; i <= endHandle; i++) {
			const handle = this.handles[i];

			if ('2800' === uuid && handle.type === 'service' && handle.object.uuid === value) {
				handles.push({
					start: handle.start,
					end: handle.end
				});
			}
		}

		if (handles.length) {
			const lengthPerHandle = 4;
			const maxHandles = Math.floor((this.getMtu(_handle) - 1) / lengthPerHandle);
			const numHandles = Math.min(handles.length, maxHandles);

			response = Buffer.alloc(1 + numHandles * lengthPerHandle);

			response[0] = CONST.ATT_OP_FIND_BY_TYPE_RESP;

			for (let i = 0; i < numHandles; i++) {
				const handle = handles[i];

				response.writeUInt16LE(handle.start, 1 + i * lengthPerHandle);
				response.writeUInt16LE(handle.end, 1 + i * lengthPerHandle + 2);
			}
		} else {
			response = this.errorResponse(CONST.ATT_OP_FIND_BY_TYPE_REQ, startHandle, CONST.ATT_ECODE_ATTR_NOT_FOUND);
		}

		return response;
	}

	private async handleReadByGroupRequest(_handle: number, _cid: number, request: Buffer) {
		let response: Buffer = null;

		const startHandle = Math.max(request.readUInt16LE(1), 1);
		const endHandle = Math.min(request.readUInt16LE(3), this.handles.length - 1);

		const uuid = request
			.slice(5)
			.toString('hex')
			.match(/.{1,2}/g)
			.reverse()
			.join('');

		if (uuid === '2800' || uuid === '2802') {
			const services = [];
			const type = uuid === '2800' ? 'service' : 'includedService';

			for (let i = startHandle; i <= endHandle; i++) {
				const handle = this.handles[i];

				if (handle.type === type) {
					services.push(handle);
				}
			}

			if (services.length) {
				const uuidSize = services[0].object.uuid.length / 2;
				let numServices = 1;

				for (let i = 1; i < services.length; i++) {
					if (services[0].object.uuid.length !== services[i].object.uuid.length) {
						break;
					}
					numServices++;
				}

				const lengthPerService = uuidSize === 2 ? 6 : 20;
				const maxServices = Math.floor((this.getMtu(_handle) - 2) / lengthPerService);
				numServices = Math.min(numServices, maxServices);

				response = Buffer.alloc(2 + numServices * lengthPerService);

				response[0] = CONST.ATT_OP_READ_BY_GROUP_RESP;
				response[1] = lengthPerService;

				for (let i = 0; i < numServices; i++) {
					const service = services[i];

					response.writeUInt16LE(service.start, 2 + i * lengthPerService);
					response.writeUInt16LE(service.end, 2 + i * lengthPerService + 2);

					const serviceUuid = Buffer.from(
						service.object.uuid
							.match(/.{1,2}/g)
							.reverse()
							.join(''),
						'hex'
					);
					for (var j = 0; j < serviceUuid.length; j++) {
						response[2 + i * lengthPerService + 4 + j] = serviceUuid[j];
					}
				}
			} else {
				response = this.errorResponse(CONST.ATT_OP_READ_BY_GROUP_REQ, startHandle, CONST.ATT_ECODE_ATTR_NOT_FOUND);
			}
		} else {
			response = this.errorResponse(CONST.ATT_OP_READ_BY_GROUP_REQ, startHandle, CONST.ATT_ECODE_UNSUPP_GRP_TYPE);
		}

		return response;
	}

	private async handleReadByTypeRequest(_handle: number, _cid: number, request: Buffer) {
		let response: Buffer = null;

		const startHandle = Math.max(request.readUInt16LE(1), 1);
		const endHandle = Math.min(request.readUInt16LE(3), this.handles.length - 1);

		const uuid = request
			.slice(5)
			.toString('hex')
			.match(/.{1,2}/g)
			.reverse()
			.join('');

		if (uuid === '2803') {
			const characteristics = [];

			for (let i = startHandle; i <= endHandle; i++) {
				const handle = this.handles[i];

				if (handle.type === 'characteristic') {
					characteristics.push(handle);
				}
			}

			if (characteristics.length) {
				const uuidSize = characteristics[0].object.uuid.length / 2;
				let numCharacteristics = 1;

				for (let i = 1; i < characteristics.length; i++) {
					if (characteristics[0].object.uuid.length !== characteristics[i].object.uuid.length) {
						break;
					}
					numCharacteristics++;
				}

				const lengthPerCharacteristic = uuidSize === 2 ? 7 : 21;
				const maxCharacteristics = Math.floor((this.getMtu(_handle) - 2) / lengthPerCharacteristic);
				numCharacteristics = Math.min(numCharacteristics, maxCharacteristics);

				response = Buffer.alloc(2 + numCharacteristics * lengthPerCharacteristic);

				response[0] = CONST.ATT_OP_READ_BY_TYPE_RESP;
				response[1] = lengthPerCharacteristic;

				for (let i = 0; i < numCharacteristics; i++) {
					const characteristic = characteristics[i];

					response.writeUInt16LE(characteristic.start, 2 + i * lengthPerCharacteristic);
					response.writeUInt8(characteristic.object.propertyFlag, 2 + i * lengthPerCharacteristic + 2);
					response.writeUInt16LE(characteristic.value, 2 + i * lengthPerCharacteristic + 3);

					const characteristicUuid = Buffer.from(
						characteristic.object.uuid
							.match(/.{1,2}/g)
							.reverse()
							.join(''),
						'hex'
					);
					for (var j = 0; j < characteristicUuid.length; j++) {
						response[2 + i * lengthPerCharacteristic + 5 + j] = characteristicUuid[j];
					}
				}
			} else {
				response = this.errorResponse(CONST.ATT_OP_READ_BY_TYPE_REQ, startHandle, CONST.ATT_ECODE_ATTR_NOT_FOUND);
			}
		} else {
			let handleId = startHandle;
			let handleObject: GattCharacteristicLocal | GattDescriptorLocal = null;
			let secure = false;

			for (; handleId <= endHandle; handleId++) {
				const handle = this.handles[handleId];

				if (handle.type === 'characteristic' && handle.object.uuid === uuid) {
					handleObject = handle.object;
					handleId = handle.value;
					secure = handle.object.secure.includes('read');
					break;
				} else if (handle.type === 'descriptor' && handle.object.uuid === uuid) {
					handleObject = handle.object;
					secure = false; // handle.object.secure.includes('read');
					break;
				}
			}

			if (secure /*&& !this._aclStream.encrypted*/) {
				response = this.errorResponse(CONST.ATT_OP_READ_BY_TYPE_REQ, startHandle, CONST.ATT_ECODE_AUTHENTICATION);
			} else if (handleObject) {
				let responseStatus: number = 0;
				let responseBuffer: Buffer = null;

				if (handleObject instanceof GattCharacteristicLocal) {
					[responseStatus, responseBuffer] = await handleObject.readRequest(0);
				} else {
					responseStatus = CONST.ATT_OP_READ_BY_TYPE_RESP;
					responseBuffer = handleObject.value;
				}

				if (responseStatus === CONST.ATT_ECODE_SUCCESS) {
					const dataLength = Math.min(responseBuffer.length, this.getMtu(_handle) - 4);
					response = Buffer.alloc(4 + dataLength);

					response[0] = CONST.ATT_OP_READ_BY_TYPE_RESP;
					response[1] = dataLength + 2;
					response.writeUInt16LE(handleId, 2);
					for (let i = 0; i < dataLength; i++) {
						response[4 + i] = responseBuffer[i];
					}
				} else {
					response = this.errorResponse(CONST.ATT_OP_READ_BY_TYPE_REQ, handleId, responseStatus);
				}
			} else {
				response = this.errorResponse(CONST.ATT_OP_READ_BY_TYPE_REQ, startHandle, CONST.ATT_ECODE_ATTR_NOT_FOUND);
			}
		}

		return response;
	}

	private async handleReadOrReadBlobRequest(_handle: number, _cid: number, request: Buffer) {
		let response: Buffer = null;

		const requestType = request[0];
		const valueHandle = request.readUInt16LE(1);
		const offset = requestType === CONST.ATT_OP_READ_BLOB_REQ ? request.readUInt16LE(3) : 0;

		const handle = this.handles[valueHandle];

		if (handle) {
			let result = null;
			let data: Buffer = null;

			if (handle.type === 'service') {
				result = CONST.ATT_ECODE_SUCCESS;
				data = Buffer.from(
					handle.object.uuid
						.match(/.{1,2}/g)
						.reverse()
						.join(''),
					'hex'
				);
			} else if (handle.type === 'characteristic') {
				const uuid = Buffer.from(
					handle.object.uuid
						.match(/.{1,2}/g)
						.reverse()
						.join(''),
					'hex'
				);

				result = CONST.ATT_ECODE_SUCCESS;
				data = Buffer.alloc(3 + uuid.length);
				data.writeUInt8(handle.object.propertyFlag, 0);
				data.writeUInt16LE(handle.value, 1);

				for (let i = 0; i < uuid.length; i++) {
					data[i + 3] = uuid[i];
				}
			} else if (handle.type === 'characteristicValue') {
				if (handle.object.properties.includes('read')) {
					if (handle.object.secure.includes('read') /*&& !this._aclStream.encrypted*/) {
						result = CONST.ATT_ECODE_AUTHENTICATION;
					} else {
						[result, data] = await handle.object.readRequest(offset);
					}
				} else {
					result = CONST.ATT_ECODE_READ_NOT_PERM; // non-readable
				}
			} else if (handle.type === 'descriptor') {
				// TODO: Descriptors are always read-only and not secure
				result = CONST.ATT_ECODE_SUCCESS;
				data = handle.object.value.slice(offset);
			}

			if (result !== null) {
				if (result === CONST.ATT_ECODE_SUCCESS) {
					const dataLength = Math.min(data.length, this.getMtu(_handle) - 1);
					response = Buffer.alloc(1 + dataLength);

					response[0] =
						requestType === CONST.ATT_OP_READ_BLOB_REQ ? CONST.ATT_OP_READ_BLOB_RESP : CONST.ATT_OP_READ_RESP;
					for (let i = 0; i < dataLength; i++) {
						response[1 + i] = data[i];
					}
				} else {
					response = this.errorResponse(requestType, valueHandle, result);
				}
			}
		} else {
			response = this.errorResponse(requestType, valueHandle, CONST.ATT_ECODE_INVALID_HANDLE);
		}

		return response;
	}

	private async handleWriteRequestOrCommand(_handle: number, _cid: number, request: Buffer) {
		let response: Buffer = null;

		const requestType = request[0];
		const withoutResponse = requestType === CONST.ATT_OP_WRITE_CMD;
		const valueHandle = request.readUInt16LE(1);
		const data = request.slice(3);
		const offset = 0;

		const handle = this.handles[valueHandle];

		if (handle && (handle.type === 'characteristic' || handle.type === 'characteristicValue')) {
			if (
				withoutResponse
					? handle.object.properties.includes('write-without-response')
					: handle.object.properties.includes('write')
			) {
				if (
					withoutResponse
						? handle.object.secure.includes('write-without-response')
						: handle.object.secure.includes('write') /*&& !this._aclStream.encrypted*/
				) {
					response = this.errorResponse(requestType, valueHandle, CONST.ATT_ECODE_AUTHENTICATION);
				} /*else if (handle.type === 'descriptor' || handle.object.uuid === '2902') {
					let result = null;

					if (data.length !== 2) {
						result = CONST.ATT_ECODE_INVAL_ATTR_VALUE_LEN;
					} else {
						const value = data.readUInt16LE(0);
						const handleAttribute = handle.object;

						handle.value = data;

						if (value & 0x0003) {
							const charHandle = valueHandle - 1;
							const updateValueCallback = () => {
								return (data) => {
									const dataLength = Math.min(data.length, this._maxMtu - 3);
									const useNotify = attribute.properties.indexOf('notify') !== -1;
									const useIndicate = attribute.properties.indexOf('indicate') !== -1;

									if (useNotify) {
										const notifyMessage = Buffer.alloc(3 + dataLength);

										notifyMessage.writeUInt8(CONST.ATT_OP_HANDLE_NOTIFY, 0);
										notifyMessage.writeUInt16LE(charHandle, 1);

										for (let i = 0; i < dataLength; i++) {
											notifyMessage[3 + i] = data[i];
										}

										this.send(notifyMessage);

										attribute.emit('notify');
									} else if (useIndicate) {
										const indicateMessage = Buffer.alloc(3 + dataLength);

										indicateMessage.writeUInt8(CONST.ATT_OP_HANDLE_IND, 0);
										indicateMessage.writeUInt16LE(charHandle, 1);

										for (let i = 0; i < dataLength; i++) {
											indicateMessage[3 + i] = data[i];
										}

										this._lastIndicatedAttribute = attribute;

										this.send(indicateMessage);
									}
								};
							};

							if (handleAttribute.emit) {
								handleAttribute.emit('subscribe', this._maxMtu - 3, updateValueCallback);
							}
						} else {
							handleAttribute.emit('unsubscribe');
						}

						result = CONST.ATT_ECODE_SUCCESS;
					}

					callback(result);
				}*/ else {
					const result = await handle.object.writeRequest(offset, data, withoutResponse);
					response =
						result === CONST.ATT_ECODE_SUCCESS
							? Buffer.from([CONST.ATT_OP_WRITE_RESP])
							: this.errorResponse(requestType, valueHandle, result);
				}
			} else {
				response = this.errorResponse(requestType, valueHandle, CONST.ATT_ECODE_WRITE_NOT_PERM);
			}
		} else {
			response = this.errorResponse(requestType, valueHandle, CONST.ATT_ECODE_INVALID_HANDLE);
		}

		return response;
	}

	private async handlePrepareWriteRequest(_handle: number, _cid: number, request: Buffer): Promise<Buffer> {
		throw new Error(`Method not implemented`);

		/*let response: Buffer = null;

		const requestType = request[0];
		const valueHandle = request.readUInt16LE(1);
		const offset = request.readUInt16LE(3);
		const data = request.slice(5);

		let handle = this.handles[valueHandle];

		if (handle) {
			if (handle.type === 'characteristicValue') {
				handle = this.handles[valueHandle - 1];

				var handleProperties = handle.properties;
				var handleSecure = handle.secure;

				if (handleProperties && handleProperties & 0x08) {
					if (handleSecure & 0x08 && !this._aclStream.encrypted) {
						response = this.errorResponse(requestType, valueHandle, CONST.ATT_ECODE_AUTHENTICATION);
					} else if (this._preparedWriteRequest) {
						if (this._preparedWriteRequest.handle !== handle) {
							response = this.errorResponse(requestType, valueHandle, CONST.ATT_ECODE_UNLIKELY);
						} else if (offset === this._preparedWriteRequest.offset + this._preparedWriteRequest.data.length) {
							this._preparedWriteRequest.data = Buffer.concat([this._preparedWriteRequest.data, data]);

							response = Buffer.alloc(request.length);
							request.copy(response);
							response[0] = CONST.ATT_OP_PREPARE_WRITE_RESP;
						} else {
							response = this.errorResponse(requestType, valueHandle, CONST.ATT_ECODE_INVALID_OFFSET);
						}
					} else {
						this._preparedWriteRequest = {
							handle: handle,
							valueHandle: valueHandle,
							offset: offset,
							data: data
						};

						response = new Buffer(request.length);
						request.copy(response);
						response[0] = CONST.ATT_OP_PREPARE_WRITE_RESP;
					}
				} else {
					response = this.errorResponse(requestType, valueHandle, CONST.ATT_ECODE_WRITE_NOT_PERM);
				}
			} else {
				response = this.errorResponse(requestType, valueHandle, CONST.ATT_ECODE_ATTR_NOT_LONG);
			}
		} else {
			response = this.errorResponse(requestType, valueHandle, CONST.ATT_ECODE_INVALID_HANDLE);
		}

		return response;*/
	}

	private async handleExecuteWriteRequest(_handle: number, _cid: number, request: Buffer): Promise<Buffer> {
		throw new Error(`Method not implemented`);

		/*
		let response: Buffer = null;

		const requestType = request[0];
		const flag = request[1];

		if (this._preparedWriteRequest) {
			const valueHandle = this._preparedWriteRequest.valueHandle;

			if (flag === 0x00) {
				response = Buffer.from([CONST.ATT_OP_EXECUTE_WRITE_RESP]);
			} else if (flag === 0x01) {
				const newValueHandle = this._preparedWriteRequest.valueHandle;
				const callback = () => {
					return (result) => {
						var callbackResponse = null;

						if (CONST.ATT_ECODE_SUCCESS === result) {
							callbackResponse = Buffer.from([CONST.ATT_OP_EXECUTE_WRITE_RESP]);
						} else {
							callbackResponse = this.errorResponse(requestType, newValueHandle, result);
						}

						this.send(callbackResponse);
					};
				};

				this._preparedWriteRequest.handle.attribute.emit(
					'writeRequest',
					this._preparedWriteRequest.data,
					this._preparedWriteRequest.offset,
					false,
					callback
				);
			} else {
				response = this.errorResponse(requestType, 0x0000, CONST.ATT_ECODE_UNLIKELY);
			}

			this._preparedWriteRequest = null;
		} else {
			response = this.errorResponse(requestType, 0x0000, CONST.ATT_ECODE_UNLIKELY);
		}

		return response;*/
	}

	private async handleConfirmation(_handle: number, _cid: number, _request: Buffer): Promise<undefined> {
		throw new Error(`Method not implemented`);

		/*
		if (this._lastIndicatedAttribute) {
			if (this._lastIndicatedAttribute.emit) {
				this._lastIndicatedAttribute.emit('indicate');
			}

			this._lastIndicatedAttribute = null;
		}

		return undefined;*/
	}
}
