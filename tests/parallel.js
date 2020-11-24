const { HciNoble, DbusNoble } = require('../lib');

const MAC_ADDRESS = /(?:[0-9A-F]{2}:?){6}/i;

const USAGE = `
Usage:
	node ./tests/connect.js <bindings> <loggers>
Arguments:
	bindings:        Bindings to use: "hci" or "dbus"
	loggers:         Logger MAC addresses seperated by pipe. Eg. "AA:AA:AA:AA:AA:AA|BB:BB:BB:BB:BB:BB" (at least 2)
`;

const BINDINGS = process.argv[2];
const PERIPHERAL_ADDRESSES = (process.argv[3] || '').split(/[,|;]/g).filter((p) => !!p && MAC_ADDRESS.test(p));

const printUsage = () => console.log(USAGE);

const main = async () => {
	if (!BINDINGS || !PERIPHERAL_ADDRESSES || PERIPHERAL_ADDRESSES.length < 2) {
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
	await new Promise((resolve) => setTimeout(resolve, 3000));

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

	const testLogger = async (targetAddress) => {
		while (true) {
			try {
				const peripheral = peripherals.find((p) => p.address === targetAddress);
				console.log(targetAddress, `Connecting ${total}...`);

				await peripheral.connect();

				console.log(targetAddress, `Connected, setting up gatt...`);

				const gatt = await peripheral.setupGatt();

				console.log(targetAddress, `Setup (mtu: ${gatt.mtu}), discovering services...`);

				await gatt.discoverServices();

				console.log(targetAddress, 'Staying connected for a while...');

				await new Promise((resolve) => setTimeout(resolve, 10000));

				console.log(targetAddress, 'Disconnecting...');

				await peripheral.disconnect();

				console.log(targetAddress, 'Disconnected');

				success++;
			} catch (err) {
				console.error(err);
				await new Promise((resolve) => setTimeout(() => resolve(), 1000));
			}

			total++;

			console.timeLog('Connect');
			console.log(`Finished ${success}/${total} connects`);
		}
	};

	for (let i = 0; i < PERIPHERAL_ADDRESSES.length; i++) {
		testLogger(PERIPHERAL_ADDRESSES[i]);
	}

	// Keep this process running
	setInterval(() => {}, 60000);
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
