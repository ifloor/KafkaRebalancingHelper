import {KafkaConsumerPartitionLag} from "./KafkaConsumerPartitionLag";

export class KafkaConsumerLag {
    private readonly groupName: string;
    private partitionLags: KafkaConsumerPartitionLag[] = [];

    constructor(groupName: string) {
        this.groupName = groupName;
    }

    public getPartitionLags(): KafkaConsumerPartitionLag[] {
        return this.partitionLags;
    }

    public setPartitionLags(value: KafkaConsumerPartitionLag[]) {
        this.partitionLags = value;
    }

    public getGroupName(): string {
        return this.groupName;
    }
}
