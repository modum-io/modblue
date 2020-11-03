const { HCINoble, DBUSNoble } = require('../lib');

const USAGE = `
Usage:
	node ./tests/connect.js <bindings> <loggers> <service> <characteristic>
Arguments:
	bindings:        Bindings to use: "hci" or "dbus"
	loggers:         Logger MAC addresses seperated by pipe. Eg. "AA:AA:AA:AA:AA:AA|BB:BB:BB:BB:BB:BB"
	service:         Service UUID without dashes
	characteristic:  Characteristic UUID without dashes
`;

const BINDINGS = process.argv[2];
const PERIPHERAL_ADDRESSES = (process.argv[3] || '').split('|');
const SERVICE_UUID = process.argv[4];
const CHAR_UUID = process.argv[5];

const printUsage = () => console.log(USAGE);

const main = async () => {
	if (!BINDINGS || !PERIPHERAL_ADDRESSES || PERIPHERAL_ADDRESSES.length === 0 || !SERVICE_UUID || !CHAR_UUID) {
		throw new Error(printUsage());
	}

	console.log('Initializing noble...');

	const noble = BINDINGS === 'hci' ? new HCINoble() : BINDINGS === 'dbus' ? new DBUSNoble() : null;

	if (!noble) {
		throw new Error(`Could not find requested bindings ${BINDINGS}`);
	}

	await noble.init();

	console.log('Getting adapters...');

	const adapters = await noble.getAdapters();
	if (adapters.length === 0) {
		throw new Error('No adapters found');
	}

	const adapter = adapters[0];
	console.log(`Using adapter ${adapter.id}`);

	console.log('Starting scan...');

	await adapter.startScanning();

	console.log('Waiting to scan a bit...');

	// Scan for 3 seconds
	await new Promise((resolve) => setTimeout(resolve, 5000));

	await adapter.stopScanning();

	console.log('Getting peripherals...');

	const peripherals = await adapter.getScannedPeripherals();
	const missing = PERIPHERAL_ADDRESSES.filter((address) => !peripherals.some((p) => p.address === address));
	if (missing.length > 0) {
		throw new Error(
			`Could not find peripherals.\nAvailable: ${peripherals.map((p) => p.address)}\nMissing: ${missing}`
		);
	}

	console.time('Connect');
	let total = 0;
	let success = 0;

	while (true) {
		const targetAddress = PERIPHERAL_ADDRESSES[total % PERIPHERAL_ADDRESSES.length];

		console.log(`Using peripheral ${targetAddress}`);

		try {
			const peripheral = peripherals.find((p) => p.address === targetAddress);
			console.log(`Connecting ${total}...`);

			await peripheral.connect();

			console.log(`Connected (mtu: ${peripheral.mtu}), discovering services...`);

			const services = await peripheral.discoverServices();
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

			console.log(data);

			console.log('Disconnecting...');

			await peripheral.disconnect();

			console.log('Disconnected');

			success++;
		} catch (err) {
			console.error(err);
		}

		total++;

		console.timeLog('Connect');
		console.log(`Finished ${success}/${total} connects`);
	}
};

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
