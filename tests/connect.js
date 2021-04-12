const { HciMODblue } = require('../lib/hci');
const { DbusMODblue } = require('../lib/dbus');
const { MacMODblue } = require('../lib/mac');

const USAGE = `
Usage:
	node ./tests/connect.js <bindings> <device> <service> <characteristic>
Arguments:
	bindings:        Bindings to use: "hci", "dbus" or "mac"
	device:          Peripheral MAC address, eg. "AA:AA:AA:AA:AA:AA"
	service:         Service UUID without dashes
	characteristic:  Characteristic UUID without dashes
`;

const BINDINGS = process.argv[2];
const ADDRESS = (process.argv[3] || '').replace(/:/g, '');
const SERVICE_UUID = process.argv[4];
const CHAR_UUID = process.argv[5];

const printUsage = () => console.log(USAGE);

const main = async () => {
	if (!BINDINGS || !ADDRESS || !SERVICE_UUID || !CHAR_UUID) {
		throw new Error(printUsage());
	}

	console.log('Initializing MODblue...');

	const modblue = BINDINGS === 'hci' ? new HciMODblue() : BINDINGS === 'dbus' ? new DbusMODblue() : BINDINGS === "mac" ? new MacMODblue() : null;
	if (!modblue) {
		throw new Error(`Could not find requested bindings ${BINDINGS}`);
	}

	console.log('Getting adapters...');

	const adapters = await modblue.getAdapters();
	if (adapters.length === 0) {
		throw new Error('No adapters found');
	}

	const adapter = adapters[0];
	console.log(`Using adapter ${adapter.id}`);

	console.log('Scanning for peripheral...');

	const peripheral = await adapter.scanFor(ADDRESS, 10);

	console.time('Connect');
	let total = 0;
	let success = 0;

	while (true) {
		try {
			console.log(`Connecting ${total}...`);

			const gatt = await peripheral.connect();

			console.log(`Connected (mtu: ${gatt.mtu}), discovering services...`);

			const services = await gatt.discoverServices();
			const service = services.find((s) => s.uuid === SERVICE_UUID);
			if (!service) {
				throw new Error(`Missing service ${SERVICE_UUID}.\nAvailable: ${services.map((s) => s.uuid).join(', ')}`);
			}

			console.log('Discovering characteristics...');

			const chars = await service.discoverCharacteristics();
			const char = chars.find((c) => c.uuid === CHAR_UUID);
			if (!char) {
				throw new Error(`Missing characteristic ${CHAR_UUID}.\nAvailable: ${chars.map((c) => c.uuid).join(', ')}`);
			}

			console.log('Reading...');

			const data = await char.read();

			console.log(`Data: ${data.toString(`hex`)}`);

			success++;
		} catch (err) {
			console.error(err);
		} finally {
			console.log('Disconnecting...');

			await peripheral.disconnect();

			console.log('Disconnected');
		}

		total++;

		console.timeLog('Connect');
		console.log(`Finished ${success}/${total} connects`);

		await new Promise((resolve) => setTimeout(() => resolve(), 1000));
	}
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
