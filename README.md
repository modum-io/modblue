# Noble2

Trying to make the world better place by improving the bluetooth experience one library at a time.

## Tests

### Connect test

This test will connect, discover services and characteristics, read a single characteristic value and disconnect.
The test runs indefinatly and rotates between all specified devices.

1. Run tests using

   ```bash
    export $LOGGER_IDS = "AA:AA:AA:AA:AA:AA|BB:BB:BB:BB:BB:BB";
    export $SERVICE_ID = "48ee0000bf49460ca3d77ec7a512a4cd";
    export $CHARACTERISTIC_ID = "48ee000bbf49460ca3d77ec7a512a4cd";
    node tests/connect.js $LOGGER_IDS $SERVICE_ID $CHARACTERISTIC_ID
   ```
