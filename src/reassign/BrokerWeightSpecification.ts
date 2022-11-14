export class BrokerWeightSpecification {
    private readonly brokerID: string;
    private readonly weight: number;

    constructor(brokerID: string, weight: number) {
        this.brokerID = brokerID;
        this.weight = weight;
    }
    
    public getBrokerID(): string {
        return this.brokerID;
    }

    public getWeight(): number {
        return this.weight;
    }
}
