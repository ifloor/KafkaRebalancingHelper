import {BrokerWithSimplifiedInfo} from "./BrokerWithSimplifiedInfo";

export class ByBrokersReport {
    private readonly _brokerReports: BrokerWithSimplifiedInfo[];
    private readonly _totalPartitions: number;
    private readonly _offlinePartitions: number;

    constructor(brokerReports: BrokerWithSimplifiedInfo[], totalPartitions: number, offlinePartitions: number) {
        this._brokerReports = brokerReports;
        this._totalPartitions = totalPartitions;
        this._offlinePartitions = offlinePartitions;
    }

    get brokerReports(): BrokerWithSimplifiedInfo[] {
        return this._brokerReports;
    }

    get totalPartitions(): number {
        return this._totalPartitions;
    }

    get offlinePartitions(): number {
        return this._offlinePartitions;
    }
}
