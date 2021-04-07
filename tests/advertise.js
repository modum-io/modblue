const { HciMODblue } = require('../lib/hci');
const { DbusMODblue } = require('../lib/dbus');

const USAGE = `
Usage:
	node ./tests/advertise.js <bindings> [name]
Arguments:
	bindings:        Bindings to use: "hci" or "dbus"
	name:            Advertised device name
`;

const BINDINGS = process.argv[2];
const NAME = process.argv[3] || 'MODblue TEST';

const printUsage = () => console.log(USAGE);

const main = async () => {
	if (!BINDINGS || !NAME) {
		throw new Error(printUsage());
	}

	console.log('Initializing MODblue...');

	const modblue = BINDINGS === 'hci' ? new HciMODblue() : BINDINGS === 'dbus' ? new DbusMODblue() : null;
	if (!modblue) {
		throw new Error(`Could not find requested bindings ${BINDINGS}`);
	}

	console.log('Getting adapters...');

	const adapters = await modblue.getAdapters();
	if (adapters.length === 0) {
		throw new Error('No adapters found');
	}

	const adapter = adapters[0];
	adapter.on('connect', (p) => console.log(p.address, 'connected'));
	adapter.on('disconnect', (p) => console.log(p.address, 'disconnected'));
	console.log(`Using adapter ${adapter.id}`);

	const gatt = await adapter.setupGatt();
	const srv = await gatt.addService('48ee0000bf49460ca3d77ec7a512a4ce');
	await srv.addCharacteristic('48ee0001bf49460ca3d77ec7a512a4ce', ['read'], [], Buffer.from('test', 'utf-8'));
	await srv.addCharacteristic('48ee0002bf49460ca3d77ec7a512a4ce', ['read'], [], async (offset) => {
		return [0, Buffer.from('other', 'utf-8').slice(offset)];
	});
	await srv.addCharacteristic(
		'48ee0003bf49460ca3d77ec7a512a4cd',
		['write', 'write-without-response'],
		[],
		null,
		(offset, data, withoutResponse) => {
			console.log('writing', offset, data, withoutResponse);
		}
	);

	console.log('Starting advertisement...');

	await adapter.startAdvertising(NAME, ['48ee0000bf49460ca3d77ec7a512a4ce']);

	console.log(`Advertising as ${adapter.address}...`);
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
