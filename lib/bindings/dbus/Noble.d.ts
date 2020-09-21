import { MessageBus } from 'dbus-next';
import { BaseNoble } from '../../Noble';
import { Adapter } from './Adapter';
export declare class Noble extends BaseNoble {
    private readonly dbus;
    private bluezObject;
    private adapters;
    constructor(dbus: MessageBus);
    init(): Promise<void>;
    dispose(): Promise<void>;
    getAdapters(): Promise<Adapter[]>;
}
