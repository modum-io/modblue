export class HciError extends Error {
	public readonly details: string;

	public constructor(message: string, details?: string) {
		super(message);

		this.name = 'HciError';
		this.details = details;
	}
}
