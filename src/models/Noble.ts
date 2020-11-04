import { Adapter } from './Adapter';

export abstract class Noble {
	public abstract async init(): Promise<void>;
	public abstract async dispose(): Promise<void>;

	public abstract async getAdapters(): Promise<Adapter[]>;
}
