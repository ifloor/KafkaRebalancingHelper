import {BrokerWithSimplifiedInfo} from "./BrokerWithSimplifiedInfo";
import {ByBrokersReport} from "./ByBrokersReport";
import {KafkaTopic} from "../kafka/model/KafkaTopic";
import {ExecListAllBrokers} from "../executors/ExecListAllBrokers";

export class ByBrokersReports {
    public static async gen(topics: KafkaTopic[]): Promise<ByBrokersReport> {
        const existingBrokers: Set<string> = new Set<string>();
        const mappingLeaders: Map<string, number> = new Map<string, number>();
        const mappingReplicas: Map<string, number> = new Map<string, number>();
        const mappingPreferreds: Map<string, number> = new Map<string, number>();
        const mappingNotPreferreds: Map<string, number> = new Map<string, number>();
        const mappingServingNotPreferreds: Map<string, number> = new Map<string, number>();
        const mappingInSyncs: Map<string, number> = new Map<string, number>();

        let totalPartitions = 0;
        topics.forEach(topic => {
            topic.getPartitions().forEach(partition => {
                totalPartitions++;

                // Preferred leader
                const replicas = partition.getReplicasStatus().split(",");
                const preferredBroker = replicas[0];
                replicas.forEach(replicatingOnBroker => {
                    if (! existingBrokers.has(replicatingOnBroker)) existingBrokers.add(replicatingOnBroker);
                });

                const isPreferredBroker = preferredBroker === partition.getBrokerLeader().toString();
                if (isPreferredBroker) {
                    this.increaseMap(mappingPreferreds, preferredBroker,1);
                    this.increaseMap(mappingNotPreferreds, preferredBroker,0);
                } else {
                    this.increaseMap(mappingPreferreds, preferredBroker,0);
                    this.increaseMap(mappingNotPreferreds, preferredBroker,1);
                    this.increaseMap(mappingServingNotPreferreds, partition.getBrokerLeader().toString(),1);
                }

                // Leader
                this.increaseMap(mappingLeaders, preferredBroker, 1);

                // Replicas
                for (let i = 0; i < replicas.length; i++) {
                    this.increaseMap(mappingReplicas, replicas[i], 1); // TODO here
                }

                // ISR
                const inSyncReplicas = partition.getInSyncReplicasStatus().split(",");
                for (let i = 0; i < inSyncReplicas.length; i++) {
                    this.increaseMap(mappingInSyncs, inSyncReplicas[i], 1);
                }
            })
        });


        let onlinePartitions = 0;
        let brokerReports: BrokerWithSimplifiedInfo[] = [];
        existingBrokers.forEach(brokerID => {
            const isPreferred: number = mappingPreferreds.get(brokerID) ?? 0;
            const isNotPreferred: number = mappingNotPreferreds.get(brokerID) ?? 0;
            const servingNotPreferred: number = mappingServingNotPreferreds.get(brokerID) ?? 0;

            const shouldBeLeaderCount: number = mappingLeaders.get(brokerID) ?? 0
            const replicateCount: number = mappingReplicas.get(brokerID) ?? 0
            const inSyncReplicasCount: number = mappingInSyncs.get(brokerID) ?? 0

            brokerReports.push(new BrokerWithSimplifiedInfo(
                brokerID,
                isPreferred,
                isNotPreferred,
                servingNotPreferred,
                shouldBeLeaderCount,
                replicateCount,
                inSyncReplicasCount
            ));

            onlinePartitions += isPreferred + servingNotPreferred;
        });
        const offlinePartitions = totalPartitions - onlinePartitions;

        brokerReports = await this.enrichWithPossibleMissingBrokerReplicaless(brokerReports);


        return new ByBrokersReport(brokerReports, totalPartitions, offlinePartitions);
    }

    private static increaseMap(map: Map<string, number>, forKey: string, byAmount: number) {
        if (map.has(forKey)) {
            map.set(forKey, (map.get(forKey)! + byAmount));
        } else {
            map.set(forKey, byAmount);
        }
    }

    private static async enrichWithPossibleMissingBrokerReplicaless(brokersList: BrokerWithSimplifiedInfo[]): Promise<BrokerWithSimplifiedInfo[]> {
        const simplifiedInfoMap: Map<string, BrokerWithSimplifiedInfo> = new Map<string, BrokerWithSimplifiedInfo>();
        brokersList.forEach((brokerInfo, index) => {
            simplifiedInfoMap.set(brokerInfo.getId(), brokerInfo);
        });

        const brokers = await ExecListAllBrokers.exec();
        brokers.forEach(kafkaBroker => {
            if (! simplifiedInfoMap.has(kafkaBroker.brokerID)) {
                brokersList.push(new BrokerWithSimplifiedInfo(
                    kafkaBroker.brokerID,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0)
                );
            }
        });

        return brokersList;
    }
}
