const { HciMODblue } = require('../lib/hci');
const { DbusMODblue } = require('../lib/dbus');

const main = async () => {
	console.log('Initializing MODblue...');

	const hciMODblue = new HciMODblue();
	const dbusMODblue = new DbusMODblue();

	console.log('Getting hci adapters...');

	const hciAdapters = await hciMODblue.getAdapters();
	for (const adapter of hciAdapters) {
		console.log(`${adapter}`);
	}

	console.log('Getting dbus adapters...');

	const dbusAdapaters = await dbusMODblue.getAdapters();
	for (const adapter of dbusAdapaters) {
		console.log(`${adapter}`);
	}
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
