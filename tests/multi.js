const { HciNoble, DbusNoble } = require('../lib');

const USAGE = `
Usage:
	node ./tests/multi.js <bindings> [name]
Arguments:
	bindings:        Bindings to use: "hci" or "dbus"
	name:            Advertised device name
`;

const SERVICE_ID = '48ee0000bf49460ca3d77ec7a512a4ce';
const OVERVIEW_CHAR_ID = '48ee0001bf49460ca3d77ec7a512a4ce';
const DYNAMIC_CHAR_ID = '48ee:id:bf49460ca3d77ec7a512a4ce';

const BINDINGS = process.argv[2];
const NAME = process.argv[3] || 'MODblue TEST';

const printUsage = () => console.log(USAGE);

const main = async () => {
	if (!BINDINGS || !NAME) {
		throw new Error(printUsage());
	}

	console.log('Initializing noble...');

	const noble = BINDINGS === 'hci' ? new HciNoble() : BINDINGS === 'dbus' ? new DbusNoble() : null;
	if (!noble) {
		throw new Error(`Could not find requested bindings ${BINDINGS}`);
	}

	console.log('Getting adapters...');

	const adapters = await noble.getAdapters();
	if (adapters.length === 0) {
		throw new Error('No adapters found');
	}

	const adapter = adapters[0];
	console.log(`Using adapter ${adapter.id}`);

	const gatt = await adapter.setupGatt();
	gatt.setData(NAME, [
		{
			uuid: SERVICE_ID,
			characteristics: [
				{
					uuid: OVERVIEW_CHAR_ID,
					properties: ['read'],
					secure: [],
					descriptors: [],
					value: Buffer.from(
						`TEST;1.0.0;HW_ID;ICCID;OPERATOR;7G+;65;100|1;READ;running;|2;WRITE;setup;Ready to write`,
						'utf-8'
					)
				},
				{
					uuid: DYNAMIC_CHAR_ID.replace(':id:', '0001'),
					properties: ['read'],
					secure: [],
					descriptors: [],
					onRead: async (offset) => {
						return [0, Buffer.from('other', 'utf-8').slice(offset)];
					}
				},
				{
					uuid: DYNAMIC_CHAR_ID.replace(':id:', '0002'),
					properties: ['write', 'write-without-response'],
					secure: [],
					descriptors: [],
					onWrite: (offset, data, withoutResponse) => {
						console.log('writing', offset, data, withoutResponse);
					}
				}
			]
		}
	]);

	console.log('Starting advertisement...');

	await adapter.startAdvertising(NAME);

	console.log('Advertising...');

	console.log('Starting scan...');

	await adapter.startScanning();
	adapter.on('discover', (peripheral) => {
		console.log(`Discovered ${peripheral.address}`);
	});

	await new Promise((resolve) => setTimeout(resolve, 10000));

	console.log('Stopping scan...');

	await adapter.stopScanning();

	console.log('Done!');
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
