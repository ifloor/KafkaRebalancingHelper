import {KafkaPartition} from "../../kafka/model/KafkaPartition";

export class ReassigningPartition {
    private readonly topic: string;
    private readonly partition: number;
    private replicas: number[];
    private changed: boolean;

    constructor(existingPartition: KafkaPartition) {
        this.changed = false;
        this.topic = existingPartition.getTopic().getName();
        this.partition = existingPartition.getPartitionNumber();
        this.replicas = ReassigningPartition.parseReplicas(existingPartition.getReplicasStatus());
    }

    private static parseReplicas(replicaString: string): number[] {
        const replicasAsNumbers: number[] = [];
        const replicas: string[] = replicaString.split(",");
        replicas.forEach(replicaAsString => {
           replicasAsNumbers.push(Number.parseInt(replicaAsString));
        });

        return replicasAsNumbers;
    }

    public setLeaderTo(newLeaderBrokerID: string): void {
        if (this.doesToBrokerAlreadyReplicate(newLeaderBrokerID)) {
            // Reverse the leader with a replica
            const replicaIndex = this.replicas.indexOf(Number.parseInt(newLeaderBrokerID));
            this.replicas.splice(replicaIndex, 1, this.replicas[0]);
        }

        // Change the leadership
        this.replicas[0] = Number.parseInt(newLeaderBrokerID);
        this.changed = true;
    }

    public doesToBrokerAlreadyReplicate(otherBrokerID: string): boolean {
        for (let i = 0; i < this.replicas.length; i++) {
            if (this.replicas[i].toString() === otherBrokerID) return true;
        }
        return false;
    }

    public getTopic(): string {
        return this.topic;
    }

    public getPartition(): number {
        return this.partition;
    }

    public getReplicas(): number[] {
        return this.replicas;
    }

    public setReplicas(replicas: number[]): void {
        this.replicas = replicas;
        this.changed =  true;
    }

    public getChanged(): boolean {
        return this.changed;
    }
}
