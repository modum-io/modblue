var bleno = require('@abandonware/bleno');

var name = 'name';
var serviceUuids = ['fffffffffffffffffffffffffffffff0'];

const data = 'testing stuff';
let dataBuff = Buffer.alloc(0);

const ADVERTISING_NAME = 'modum.io Gateway';
const SERVICE_ID = '48ee0000-bf49-460c-a3d7-7ec7a512a4ce';
const OVERVIEW_CHAR_ID = '48ee0001-bf49-460c-a3d7-7ec7a512a4ce';

bleno.on('stateChange', (state) => {
	console.log('state', state);

	bleno.setServices(
		[
			new bleno.PrimaryService({
				uuid: SERVICE_ID,
				characteristics: [
					// Overview
					new bleno.Characteristic({
						uuid: OVERVIEW_CHAR_ID,
						properties: ['read'],
						secure: [],
						descriptors: [],
						onReadRequest: async (offset, callback) => {
							if (offset === 0) {
								dataBuff = Buffer.from(data, 'utf-8');
							}

							callback(bleno.Characteristic.RESULT_SUCCESS, dataBuff.slice(offset));
						}
					})
				]
			})
		],
		(err) => console.log('services', err)
	);

	bleno.startAdvertising(ADVERTISING_NAME, [SERVICE_ID]);
});
bleno.on('advertisingStart', () => console.log('Advertising started'));
bleno.on('advertisingStop', () => console.log('Advertising stopped'));
bleno.on('accept', (clientAddress) => console.log('Connected', clientAddress));
bleno.on('disconnect', (clientAddress) => console.log('Disonnected', clientAddress));
bleno.on('error', (err) => console.error(err));
