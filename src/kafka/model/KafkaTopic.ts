import {KafkaPartition} from "./KafkaPartition";

export class KafkaTopic {
    private id: string;
    private name: string;
    private replicationFactor: number;
    private configs: string;
    private partitions: KafkaPartition[];
    private partitionCount: number


    constructor() {
        this.id = "";
        this.name = "";
        this.replicationFactor = -1;
        this.configs = "";
        this.partitions = [];
        this.partitionCount = -1;
    }


    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getReplicationFactor(): number {
        return this.replicationFactor;
    }

    public getConfigs(): string {
        return this.configs;
    }

    public getPartitions(): KafkaPartition[] {
        return this.partitions;
    }

    public setId(value: string) {
        this.id = value;
    }

    public setName(value: string) {
        this.name = value;
    }

    public setReplicationFactor(value: number) {
        this.replicationFactor = value;
    }

    public setConfigs(value: string) {
        this.configs = value;
    }

    public setPartitions(value: KafkaPartition[]) {
        this.partitions = value;
    }


    public getPartitionCount(): number {
        return this.partitionCount;
    }

    public setPartitionCount(value: number) {
        this.partitionCount = value;
    }
}
