import {KafkaTopic} from "./KafkaTopic";

export class KafkaPartition {
    private topic: KafkaTopic = new KafkaTopic();
    private partitionNumber: number = -1;
    private brokerLeader: number = -1;
    private replicasStatus: string = "";
    private inSyncReplicasStatus: string = "";


    constructor() {}

    public getTopic(): KafkaTopic {
        return this.topic;
    }

    public setTopic(value: KafkaTopic) {
        this.topic = value;
    }

    public getPartitionNumber(): number {
        return this.partitionNumber;
    }

    public setPartitionNumber(value: number) {
        this.partitionNumber = value;
    }

    public getBrokerLeader(): number {
        return this.brokerLeader;
    }

    public setBrokerLeader(value: number) {
        this.brokerLeader = value;
    }

    public getReplicasStatus(): string {
        return this.replicasStatus;
    }

    public setReplicasStatus(value: string) {
        this.replicasStatus = value;
    }

    public getInSyncReplicasStatus(): string {
        return this.inSyncReplicasStatus;
    }

    public setInSyncReplicasStatus(value: string) {
        this.inSyncReplicasStatus = value;
    }
}
