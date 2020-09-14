export { Noble } from './Noble';
export { Characteristic } from './Characteristic';
export { Descriptor } from './Descriptor';
export { Peripheral } from './Peripheral';
export { Service } from './Service';

// tslint:disable: variable-name

import { NobleBindings } from './hci-socket/bindings';
export const HciBindings = NobleBindings;
