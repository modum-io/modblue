export class HciError extends Error {
    constructor(message, details) {
        super(message);
        this.name = 'HciError';
        this.details = details;
    }
}
//# sourceMappingURL=HciError.js.map