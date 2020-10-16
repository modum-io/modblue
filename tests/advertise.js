const { HciNoble, DbusNoble } = require('../lib');

const USAGE = `
Usage:
	node ./tests/advertise.js <bindings> <name>
Arguments:
	bindings:        Bindings to use: "hci" or "dbus"
	name:            Advertised device name
`;

const BINDINGS = process.argv[2];
const NAME = process.argv[3] || 'Bleno2 Test Device';

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
			uuid: '48ee0000bf49460ca3d77ec7a512a4cd',
			characteristics: [
				{
					uuid: '48ee0001bf49460ca3d77ec7a512a4cd',
					properties: ['read', 'write', 'write-without-response'],
					secure: [],
					descriptors: [],
					value: Buffer.from('1337'),
					onWrite: (offset, data, withoutResponse) => console.log('writing', offset, data, withoutResponse)
				}
			]
		}
	]);

	console.log('Starting advertisement...');

	await adapter.startAdvertising(NAME);

	console.log(adapter.address);

	console.log('Advertising...');
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
