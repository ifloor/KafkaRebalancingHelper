export class KafkaConsumerPartitionLag {
    private readonly _group: string;
    private readonly _topic: string;
    private readonly _partition: number;
    private readonly _currentOffset: number;
    private readonly _logEndOffset: number;
    private readonly _lag: number;
    private readonly _consumerID: string;
    private readonly _host: string;
    private readonly _clientID: string;

    constructor(group: string, topic: string, partition: number, currentOffset: number, logEndOffset: number, lag: number, consumerID: string, host: string, clientID: string) {
        this._group = group;
        this._topic = topic;
        this._partition = partition;
        this._currentOffset = currentOffset;
        this._logEndOffset = logEndOffset;
        this._lag = lag;
        this._consumerID = consumerID;
        this._host = host;
        this._clientID = clientID;
    }

    get group(): string {
        return this._group;
    }

    get topic(): string {
        return this._topic;
    }

    get partition(): number {
        return this._partition;
    }

    get currentOffset(): number {
        return this._currentOffset;
    }

    get logEndOffset(): number {
        return this._logEndOffset;
    }

    get lag(): number {
        return this._lag;
    }

    get consumerID(): string {
        return this._consumerID;
    }

    get host(): string {
        return this._host;
    }

    get clientID(): string {
        return this._clientID;
    }
}
