export class GeminiError extends Error {
    public readonly code: string;
    constructor(message: string, code: string = 'UNKNOWN') {
        super(message);
        this.name = 'GeminiError';
        this.code = code;
        Object.setPrototypeOf(this, GeminiError.prototype);
    }
}
