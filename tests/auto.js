const { MODblue } = require('../lib');

const main = async () => {
	console.log('Initializing MODblue...');

	const modblue = MODblue.autoDetectBindings();

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

	await adapter.stopScanning();

	console.log('Getting peripherals...');

	const peripherals = await adapter.getScannedPeripherals();
	console.log(peripherals);

	await modblue.dispose();
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
