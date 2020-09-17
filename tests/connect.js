const { HCINoble } = require('../lib');

const UUID = process.argv[2];

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

	const peripheral = peripherals.find((p) => p.uuid === UUID);
	if (!peripheral) {
		throw new Error(`Could not find peripheral with UUID ${UUID}.\n${peripherals.map((p) => p.uuid).join(', ')}`);
	}

	console.log(`Using peripheral ${peripheral.uuid}`);

	for (let i = 0; i < 10; i++) {
		console.log(`Connecting ${i}...`);

		await peripheral.connect();

		console.log(`Connected, ${peripheral.mtu}`);

		console.log('Disconnecting...');

		await peripheral.disconnect();

		console.log('Disconnected');
	}
};

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
