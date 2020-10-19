const { HciNoble, DbusNoble } = require('../lib');

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
const PERIPHERAL_ADDRESSES = (process.argv[3] || '').split(/[,|;]/g);
const SERVICE_UUID = process.argv[4];
const CHAR_UUID = process.argv[5];

const printUsage = () => console.log(USAGE);

const main = async () => {
	if (!BINDINGS || !PERIPHERAL_ADDRESSES || PERIPHERAL_ADDRESSES.length === 0 || !SERVICE_UUID || !CHAR_UUID) {
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
		throw new Error(`Could not find all requested test peripherals after scanning.\nMissing: ${missing}`);
	}

	console.time('Connect');
	let total = 0;
	let success = 0;

	while (true) {
		const targetAddress = PERIPHERAL_ADDRESSES[total % PERIPHERAL_ADDRESSES.length];

		console.log(`Using peripheral ${targetAddress}`);

		try {
			const peripheral = peripherals.find((p) => p.address === targetAddress);
			if (!peripheral) {
				throw new Error(
					`Could not find peripheral with address ${targetAddress}.\n${peripherals.map((p) => p.address).join(', ')}`
				);
			}

			console.log(`Connecting ${total}...`);

			await peripheral.connect();

			console.log(`Connected, setting up gatt...`);

			const gatt = await peripheral.setupGatt();

			console.log(`Setup (mtu: ${gatt.mtu}), discovering services...`);

			const services = await gatt.discoverServices();
			const service = services.find((s) => s.uuid === SERVICE_UUID);
			if (!service) {
				throw new Error(`Could not find service with UUID ${SERVICE_UUID}.\n${services.map((s) => s.uuid).join(', ')}`);
			}

			console.log('Discovering characteristics...');

			const chars = await service.discoverCharacteristics();
			const char = chars.find((c) => c.uuid === CHAR_UUID);
			if (!char) {
				throw new Error(
					`Could not find characteristic with UUID ${CHAR_UUID}.\n${chars.map((c) => c.uuid).join(', ')}`
				);
			}

			console.log('Reading...');

			const data = await char.read();

			console.log(`Data: ${data.toString(`hex`)}`);

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
