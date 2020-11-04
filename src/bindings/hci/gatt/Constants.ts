// tslint:disable: no-bitwise

export const ATT_OP_ERROR = 0x01;
export const ATT_OP_MTU_REQ = 0x02;
export const ATT_OP_MTU_RESP = 0x03;
export const ATT_OP_FIND_INFO_REQ = 0x04;
export const ATT_OP_FIND_INFO_RESP = 0x05;
export const ATT_OP_FIND_BY_TYPE_REQ = 0x06;
export const ATT_OP_FIND_BY_TYPE_RESP = 0x07;
export const ATT_OP_READ_BY_TYPE_REQ = 0x08;
export const ATT_OP_READ_BY_TYPE_RESP = 0x09;
export const ATT_OP_READ_REQ = 0x0a;
export const ATT_OP_READ_RESP = 0x0b;
export const ATT_OP_READ_BLOB_REQ = 0x0c;
export const ATT_OP_READ_BLOB_RESP = 0x0d;
export const ATT_OP_READ_MULTI_REQ = 0x0e;
export const ATT_OP_READ_MULTI_RESP = 0x0f;
export const ATT_OP_READ_BY_GROUP_REQ = 0x10;
export const ATT_OP_READ_BY_GROUP_RESP = 0x11;
export const ATT_OP_WRITE_REQ = 0x12;
export const ATT_OP_WRITE_RESP = 0x13;
export const ATT_OP_PREPARE_WRITE_REQ = 0x16;
export const ATT_OP_PREPARE_WRITE_RESP = 0x17;
export const ATT_OP_EXECUTE_WRITE_REQ = 0x18;
export const ATT_OP_EXECUTE_WRITE_RESP = 0x19;
export const ATT_OP_HANDLE_NOTIFY = 0x1b;
export const ATT_OP_HANDLE_IND = 0x1d;
export const ATT_OP_HANDLE_CNF = 0x1e;
export const ATT_OP_WRITE_CMD = 0x52;
export const ATT_OP_SIGNED_WRITE_CMD = 0xd2;

export const ATT_ECODE_SUCCESS = 0x00;
export const ATT_ECODE_INVALID_HANDLE = 0x01;
export const ATT_ECODE_READ_NOT_PERM = 0x02;
export const ATT_ECODE_WRITE_NOT_PERM = 0x03;
export const ATT_ECODE_INVALID_PDU = 0x04;
export const ATT_ECODE_AUTHENTICATION = 0x05;
export const ATT_ECODE_REQ_NOT_SUPP = 0x06;
export const ATT_ECODE_INVALID_OFFSET = 0x07;
export const ATT_ECODE_AUTHORIZATION = 0x08;
export const ATT_ECODE_PREP_QUEUE_FULL = 0x09;
export const ATT_ECODE_ATTR_NOT_FOUND = 0x0a;
export const ATT_ECODE_ATTR_NOT_LONG = 0x0b;
export const ATT_ECODE_INSUFF_ENCR_KEY_SIZE = 0x0c;
export const ATT_ECODE_INVAL_ATTR_VALUE_LEN = 0x0d;
export const ATT_ECODE_UNLIKELY = 0x0e;
export const ATT_ECODE_INSUFF_ENC = 0x0f;
export const ATT_ECODE_UNSUPP_GRP_TYPE = 0x10;
export const ATT_ECODE_INSUFF_RESOURCES = 0x11;

export const GATT_PRIM_SVC_UUID = 0x2800;
export const GATT_INCLUDE_UUID = 0x2802;
export const GATT_CHARAC_UUID = 0x2803;

export const GATT_CLIENT_CHARAC_CFG_UUID = 0x2902;
export const GATT_SERVER_CHARAC_CFG_UUID = 0x2903;

export const ATT_CID = 0x0004;
