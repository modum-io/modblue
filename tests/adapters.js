const { HciNoble, DbusNoble } = require('../lib');

const main = async () => {
	console.log('Initializing noble...');

	const hciNoble = new HciNoble();
	const dbusNoble = new DbusNoble();

	console.log('Getting hci adapters...');

	const hciAdapters = await hciNoble.getAdapters();
	for (const adapter of hciAdapters) {
		console.log(`${adapter}`);
	}

	console.log('Getting dbus adapters...');

	const dbusAdapaters = await dbusNoble.getAdapters();
	for (const adapter of dbusAdapaters) {
		console.log(`${adapter}`);
	}
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
