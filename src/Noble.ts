import { BaseAdapter } from './Adapter';

export abstract class BaseNoble {
	public abstract async init(): Promise<void>;
	public abstract async dispose(): Promise<void>;

	public abstract async getAdapters(): Promise<BaseAdapter[]>;
}
