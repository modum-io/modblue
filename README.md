# ModBlue

Trying to make the world better place by improving the bluetooth experience one library at a time.

## Getting started

### Installation

```bash
npm i -E @modum/modblue
```

### Usage

Currently there are the following bindings available:

- `hci` (using [bluetooth-hci-socket](https://github.com/abandonware/node-bluetooth-hci-socket))
- `dbus` (using [dbus-next](https://github.com/dbusjs/node-dbus-next))

Create a new `Noble` object to get started (all bindings have the same interface)

```ts
import { HciNoble, DbusNoble } from '@modum/modblue';

const noble = new HciNoble();    // or: new DbusNoble()
await noble.init();              // Initialize for use, only needed once
```

Now you can scan & use one or multiple of the adapters:

```ts
const adapters = await noble.getAdapters();
const adapter = adapters[0];
```

### Scanning

Use an adapter to scan for devices in proximity:

```ts
const serviceUUIDs: string[] = [];        // Optional: Advertised service UUIDs, without dashes (-)
const allowDuplicates: boolean = true;    // Optional: Allow duplicate 'discover' events for the same device

await adapter.startScanning(serviceUUIDs, allowDuplicates);
```

Now you can either wait for a few seconds to scan and then get all the scanned peripherals

```ts
const peripherals = await adapter.getScannedPeripherals();
```

or you can attach an event to trigger each time a new peripheral is discovered (or more often if `allowDuplicates` is `true`):

```ts
adapter.on('discover', (peripheral) => console.log('Discovered', peripheral.address));
```

Once discovered you can connect to a peripheral and grab it's GATT to discover services and characteristics:

```ts
await peripheral.connect();

// Setup GATT
const requestMtu = 517;    // Optional: Request a specific MTU
const gatt = await peripheral.setupGatt(requestMtu);

// Discover services
const services = await gatt.discoverServices();
const service = services[0];

// Discover characteristics
const characteristics = await service.discoverCharacteristics();
const characteristic = characteristics[0];

// Discover descriptors
const descriptors = await characteristic.discoverDescriptors();
const descriptor = descriptors[0];

// Read value
const buffer = await characteristic.read();
// or
const buffer = await descriptor.readValue();

// Write value
const withoutResponse: boolean = true;    // Tell the peripheral we don't need a response for this write

await characteristic.write(buffer, withoutResponse);
// or
await descriptor.writeValue(buffer);
```

### Advertising

First you have to setup the local GATT and the services and characteristics you want to advertise:

```ts
import { GattServiceInput } from '@modum/modblue';

const maxMtu: number = 517;                             // Optional: Specify the maximum MTU that should be negotiated with connecting devices.
const gatt = await adapter.setupGatt(maxMtu);           // Setup our local GATT server

const deviceName: string = 'MODblue Testing';
const services: GattServiceInput[] = [
   {
      uuid: '48ee0000bf49460ca3d77ec7a512a4ce',          // UUID of the service (without dashes [-])
      characteristics: [
         {
            uuid: '48ee0001bf49460ca3d77ec7a512a4ce',    // UUID of the characteristic
            properties: ['read'],                        // Supported properties on the characteristic
            secure: [],                                  // Which of the supported properties are secured
            descriptors: [],                             // Descriptors on this characteristic
            value: Buffer.from('test', 'utf-8')          // The (constant) data that is returned for this characteristic
         },
      {
         uuid: '48ee0002bf49460ca3d77ec7a512a4ce',
         properties: ['read'],
         secure: [],
         descriptors: [],
         onRead: async (offset) => {
            // This function receives the offset at which to start reading
            if (offset === 0) {
               // Only do your computation when the first bytes are requested.
               // In case of subsequent reads (because of long data / small MTU) we want to return the same data as before, starting at the offset
               }

               // Returns a tuple containing: [error: number, data: Buffer] - Use 0 for the error on success.
               return [0, Buffer.from('other', 'utf-8').slice(offset)];
            }
         },
         {
            uuid: '48ee0003bf49460ca3d77ec7a512a4cd',
            properties: ['write', 'write-without-response'],
            secure: [],
            descriptors: [],
            onWrite: (offset, data, withoutResponse) => {
               // This function handles writing data to the characteristic
               console.log('writing', offset, data, withoutResponse);
            }
         }
      ]
   }
];
gatt.setData(deviceName, services);
```

To advertise services and characteristics use:

```ts
const deviceName: string = 'MODblue Testing';    // You can use a different advertising name then the name in the GATT
const advertisedServiceUUIDs: string[] = [];     // Optional: Advertise specific service UUIDs (without dashes [-])

await adapter.startAdvertising(deviceName, advertisedServiceUUIDs);
```

## Tests

### Adapters

This test will list all available adapters for all available bindings.

1. Run test using

   ```bash
   node tests/adapters.js
   ```

### Connect

This test will connect, discover services and characteristics, read a single characteristic value and disconnect.
The test runs indefinitely and rotates between all specified devices.

1. Run test using

   ```bash
   export BINDINGS="hci";
   export LOGGER_IDS="AA:AA:AA:AA:AA:AA|BB:BB:BB:BB:BB:BB";
   export SERVICE_ID="48ee0000bf49460ca3d77ec7a512a4cd";
   export CHARACTERISTIC_ID = "48ee000bbf49460ca3d77ec7a512a4cd";
   node tests/connect.js $BINDINGS $LOGGER_IDS $SERVICE_ID $CHARACTERISTIC_ID
   ```

### Advertise

This test will advertise some services and characteristics under a specified name.
The test runs indefinitely and waits for connections.

1. Run test using

   ```bash
   export BINDINGS="hci";
   export ADVERTISE_NAME="MODblue Testing";
   node tests/advertise.js $BINDINGS "$ADVERTISE_NAME"
   ```
