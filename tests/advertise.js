const { HciNoble, DbusNoble } = require('../lib');

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
			uuid: '48ee0000bf49460ca3d77ec7a512a4ce',
			characteristics: [
				{
					uuid: '48ee0001bf49460ca3d77ec7a512a4ce',
					properties: ['read'],
					secure: [],
					descriptors: [],
					value: Buffer.from('test', 'utf-8')
				},
				{
					uuid: '48ee0002bf49460ca3d77ec7a512a4ce',
					properties: ['read'],
					secure: [],
					descriptors: [],
					onRead: async (offset) => {
						return [0, Buffer.from('other', 'utf-8').slice(offset)];
					}
				},
				{
					uuid: '48ee0003bf49460ca3d77ec7a512a4cd',
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

	await adapter.startAdvertising(NAME, ['48ee0000bf49460ca3d77ec7a512a4ce']);

	console.log(`Advertising as ${adapter.address}...`);
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
