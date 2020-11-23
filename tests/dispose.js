const { HciNoble, DbusNoble } = require('../lib');

const USAGE = `
Usage:
	node ./tests/dispose.js <bindings>
Arguments:
	bindings:        Bindings to use: "hci" or "dbus"
`;

const BINDINGS = process.argv[2];

const printUsage = () => console.log(USAGE);

const main = async () => {
	if (!BINDINGS) {
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

	console.log('Using all adapters...');

	for (const adapter of adapters) {
		await adapter.startScanning();
		await adapter.stopScanning();
	}

	await noble.dispose();

	console.log('Done');
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
