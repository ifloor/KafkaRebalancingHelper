export class BrokerWithSimplifiedInfo {
    private readonly id: string;
    private readonly isPreferredLeaderCount: number; // Should be the leader and it is
    private readonly isNotPreferredLeaderCount: number; // Should be the leader but it's not
    private readonly servingNotPreferredPartitionsCount: number; // Should not be the leader but it is
    private readonly shouldBeTheLeaderPartitionsCount: number; // Total number of partitions that it should be the leader
    private readonly responsibleForPartitionReplicasCount: number; // Is responsible for replica partitions
    private readonly isInSyncPartitionReplicasCount: number; // Is responsible for replica partitions

    constructor(
        id: string,
        isPreferredLeaderCount: number,
        isNotPreferredLeaderCount: number,
        servingNotPreferredPartitionsCount: number,
        shouldBeTheLeaderPartitionsCount: number,
        responsibleForPartitionReplicasCount: number,
        isInSyncPartitionReplicasCount: number
    ) {
        this.id = id;
        this.isPreferredLeaderCount = isPreferredLeaderCount;
        this.isNotPreferredLeaderCount = isNotPreferredLeaderCount;
        this.servingNotPreferredPartitionsCount = servingNotPreferredPartitionsCount;
        this.shouldBeTheLeaderPartitionsCount = shouldBeTheLeaderPartitionsCount;
        this.responsibleForPartitionReplicasCount = responsibleForPartitionReplicasCount;
        this.isInSyncPartitionReplicasCount = isInSyncPartitionReplicasCount;
    }

    public getId(): string {
        return this.id;
    }

    public getIsPreferredLeaderCount(): number {
        return this.isPreferredLeaderCount;
    }

    public getIsNotPreferredLeaderCount(): number {
        return this.isNotPreferredLeaderCount;
    }

    public getServingNotPreferredPartitionsCount(): number {
        return this.servingNotPreferredPartitionsCount;
    }

    public getShouldBeTheLeaderPartitionsCount(): number {
        return this.shouldBeTheLeaderPartitionsCount;
    }

    public getResponsibleForPartitionReplicasCount(): number {
        return this.responsibleForPartitionReplicasCount;
    }

    public getIsInSyncPartitionReplicasCount(): number {
        return this.isInSyncPartitionReplicasCount;
    }
}
