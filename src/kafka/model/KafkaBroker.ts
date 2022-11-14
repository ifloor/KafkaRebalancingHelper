export class KafkaBroker {
    private readonly _listeningEndpoint: string;
    private readonly _brokerID: string;
    private readonly _rackID: string;

    constructor(listeningEndpoint: string, brokerID: string, rackID: string) {
        this._listeningEndpoint = listeningEndpoint;
        this._brokerID = brokerID;
        this._rackID = rackID;
    }

    get listeningEndpoint(): string {
        return this._listeningEndpoint;
    }

    get brokerID(): string {
        return this._brokerID;
    }


    get rackID(): string {
        return this._rackID;
    }
}
