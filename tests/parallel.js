const { HciMODblue } = require('../lib/hci');
const { DbusMODblue } = require('../lib/dbus');
const { MacMODblue } = require('../lib/mac');
const { WinMODblue } = require('../lib/win');

const MAC_ADDRESS = /(?:[0-9a-f]{2}:?){6}/i;

const USAGE = `
Usage:
	node ./tests/connect.js <bindings> <devices> <service> <characteristic>
Arguments:
	bindings:        Bindings to use: "hci", "dbus", "win" or "mac"
	devices:         Peripheral MAC addresses seperated by one of ,|; Eg. "AA:AA:AA:AA:AA:AA|BB:BB:BB:BB:BB:BB" (at least 2)
	service:         Service UUID without dashes
	characteristic:  Characteristic UUID without dashes
`;

const BINDINGS = process.argv[2];
const PERIPHERAL_ADDRESSES = (process.argv[3] || '')
	.split(/[,|;]/g)
	.filter((p) => !!p && MAC_ADDRESS.test(p))
	.map((a) => a.toLowerCase());
const SERVICE_UUID = process.argv[4];
const CHAR_UUID = process.argv[5];

const printUsage = () => console.log(USAGE);

const main = async () => {
	if (!BINDINGS || !PERIPHERAL_ADDRESSES || PERIPHERAL_ADDRESSES.length < 2) {
		throw new Error(printUsage());
	}

	console.log('Initializing MODblue...');

	const modblue =
		BINDINGS === 'hci'
			? new HciMODblue()
			: BINDINGS === 'dbus'
			? new DbusMODblue()
			: BINDINGS === 'mac'
			? new MacMODblue()
			: BINDINGS === 'win'
			? new WinMODblue()
			: null;
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

	console.log('Starting scan...');

	await adapter.startScanning();

	console.log('Waiting to scan a bit...');

	// Scan for 3 seconds
	await new Promise((resolve) => setTimeout(resolve, 3000));

	console.log('Getting peripherals...');

	console.time('Connect');
	let total = 0;
	let success = 0;

	const testDevice = async (targetAddress) => {
		const peripherals = await adapter.getScannedPeripherals();
		const peripheral = peripherals.find((p) => p.address === targetAddress);
		if (!peripheral) {
			throw new Error(`Missing peripheral ${targetAddress}`);
		}

		console.log(targetAddress, `Connecting ${total}...`);

		try {
			const gatt = await peripheral.connect();

			console.log(targetAddress, `Connected (mtu: ${gatt.mtu}), discovering services...`);

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
			console.log(targetAddress, 'Disconnecting...');

			await peripheral.disconnect();

			console.log(targetAddress, 'Disconnected');
		}

		total++;

		console.timeLog('Connect');
		console.log(`Finished ${success}/${total} connects`);
	};

	for (let i = 0; i < PERIPHERAL_ADDRESSES.length; i++) {
		testDevice(PERIPHERAL_ADDRESSES[i]);
		setInterval(() => testDevice(PERIPHERAL_ADDRESSES[i]), 10000);
	}

	// Keep this process running
	setInterval(() => {}, 60000);
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
