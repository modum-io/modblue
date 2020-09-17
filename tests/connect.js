const { HCINoble } = require('../lib');

const PERIPHERAL_UUIDS = process.argv[2].split('|');
const SERVICE_UUID = process.argv[3];
const CHAR_UUID = process.argv[4];

const main = async () => {
	console.log('Initializing noble...');

	const noble = new HCINoble();
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

	// Scan for 10 seconds
	await new Promise((resolve) => setTimeout(resolve, 2000));

	console.log('Getting peripherals...');

	const peripherals = await adapter.getScannedPeripherals();

	console.time('Connect');
	let total = 0;
	let success = 0;

	while (true) {
		const targetUUID = PERIPHERAL_UUIDS[total % PERIPHERAL_UUIDS.length];

		console.log(`Using peripheral ${targetUUID}`);

		try {
			const peripheral = peripherals.find((p) => p.uuid === targetUUID);
			if (!peripheral) {
				throw new Error(
					`Could not find peripheral with UUID ${targetUUID}.\n${peripherals.map((p) => p.uuid).join(', ')}`
				);
			}

			console.log(`Connecting ${total}...`);

			await peripheral.connect();

			console.log(`Connected (mtu: ${peripheral.mtu}), discovering services...`);

			const services = await peripheral.discoverServices();
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

			console.log(data);

			console.log('Disconnecting...');

			await peripheral.disconnect();

			console.log('Disconnected');

			success++;
		} catch (err) {
			console.error(err);
		}

		total++;

		console.timeEnd('Connect');
		console.log(`Finished ${success}/${total} connects`);
	}
};

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
