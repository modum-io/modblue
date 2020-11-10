import { Adapter } from './Adapter';

export abstract class Noble {
	public abstract init(): Promise<void>;
	public abstract dispose(): Promise<void>;

	public abstract getAdapters(): Promise<Adapter[]>;
}
