import {BrokerWeightSpecification} from "./BrokerWeightSpecification";
import {ExecListAllBrokers} from "../executors/ExecListAllBrokers";
import {ExecDescribeAllPartition} from "../executors/ExecDescribeAllPartition";
import {KafkaTopic} from "../kafka/model/KafkaTopic";
import {AssignerDistributor} from "./AssignerDistributor";
import {Logger} from "../utils/Logger";
import {ReassigningDocument} from "./model/ReassigningDocument";
import {ReassignerUtils} from "./ReassignerUtils";
import {ReassignerApplier} from "./applying/ReassignerApplier";
import {ReassignerLeadership} from "./ReassignerLeadership";
import {ByBrokersReports} from "../reports/ByBrokersReports";

export class Reassigner {
    public static async reassignEvenly() {
        const brokers = await ExecListAllBrokers.exec();
        console.log(`brokers: ${brokers.length}`);
        const brokerWeights: BrokerWeightSpecification[] = [];
        brokers.forEach(broker => {
            brokerWeights.push(new BrokerWeightSpecification(broker.brokerID, 1));
        });

        await this.reassignByWeight(brokerWeights);
    }

    public static async reassignByWeight(brokerWeights: BrokerWeightSpecification[]) {
        Logger.debug(`Reassigning using weights: ${JSON.stringify(brokerWeights)}`);
        const topics: KafkaTopic[] = await ExecDescribeAllPartition.exec();
        const brokerReports = ByBrokersReports.gen(topics);
        const partitionDocuments: Map<string, ReassigningDocument> = ReassignerUtils.mapExisting(topics);
        const totalPartitions = brokerReports.totalPartitions;
        let totalReplicas = 0;

        const brokerLeaderMap: Map<string, number> = new Map<string, number>();
        const brokerReplicaMap: Map<string, number> = new Map<string, number>();
        brokerReports.brokerReports.forEach(brokerReport => {
            brokerLeaderMap.set(brokerReport.getId(), brokerReport.getShouldBeTheLeaderPartitionsCount());
            brokerReplicaMap.set(brokerReport.getId(), brokerReport.getResponsibleForPartitionReplicasCount());
            totalReplicas += brokerReport.getResponsibleForPartitionReplicasCount();
        });

        // Leader
        const partitionIdealLeaderNumbers = AssignerDistributor.calculateIdealProportion(brokerWeights, totalPartitions);
        this.logProportionFound(partitionIdealLeaderNumbers, brokerLeaderMap, "leaders", "partition(s)");
        await ReassignerLeadership.reassignLeaders(topics, partitionIdealLeaderNumbers, partitionDocuments);

        // Replicas
        const replicasIdealLeaderNumbers = AssignerDistributor.calculateIdealProportion(brokerWeights, totalReplicas);
        this.logProportionFound(replicasIdealLeaderNumbers, brokerReplicaMap, "replicas", "replica(s)");
        console.log(`I should have replicas: ${totalReplicas}`);

        // count
        const topicsToReassign = ReassignerUtils.countTopicsToReassign(partitionDocuments);
        if (topicsToReassign == 0) {
            Logger.info(`No topic changes. Nothing to do...`);
            return;
        }

        await ReassignerApplier.apply(partitionDocuments);
    }

    private static logProportionFound(proportionFound: Map<string, number>, brokerRealInfoMap: Map<string, number>, context: string, objectName: string): void {
        Logger.info(`When looking for ${context}, calculated the following proportion for the brokers:`);
        proportionFound.forEach((number, brokerID) => {
            Logger.info(`Broker[${brokerID}] ${objectName}: estimated=[${number}], current=[${brokerRealInfoMap.get(brokerID) ?? 0}]`);
        });
    }
}
