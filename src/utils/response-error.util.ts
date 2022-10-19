export class ResponseError implements Error {
    public name: 'ResponseError';
    constructor(public message: string, public statusCode: number) {}
}
