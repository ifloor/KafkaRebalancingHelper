import {BrokerWeightSpecification} from "./BrokerWeightSpecification";
import {RandomUtils} from "../utils/RandomUtils";
import {Logger} from "../utils/Logger";

export class AssignerDistributor {
    public static calculateIdealProportion(brokerWeights: BrokerWeightSpecification[], numberToDivide: number): Map<string, number> {
        Logger.debug(`Finding proportion of number: [${numberToDivide}] to brokerWeights: ${JSON.stringify(brokerWeights)}`);

        const idealNumbers: Map<string, number> = new Map<string, number>();

        let totalWeight = 0;
        brokerWeights.forEach(brokerWeight => {
           totalWeight += brokerWeight.getWeight();
        });

        brokerWeights.forEach(brokerWeight => {
           const fullNumber = Math.floor(numberToDivide * (brokerWeight.getWeight() / totalWeight));
           idealNumbers.set(brokerWeight.getBrokerID(), fullNumber);
           Logger.debug(`Floor number of proportion for brokerID: ${brokerWeight.getBrokerID()} -> ${fullNumber}`);
        });

        let totalLeaders = 0;
        idealNumbers.forEach((idealNumber, brokerID) => {
            totalLeaders += idealNumber;
        });

        while (totalLeaders < numberToDivide) {
            // Add 1 to a random broker
            const brokerIDs: string[] = Array.from(idealNumbers.keys());
            const brokerToAddIndex = RandomUtils.getRandomInt(0, brokerIDs.length - 1);
            Logger.debug(`RandomIndex to increase proportion: ${brokerToAddIndex}`);
            const brokerToAddID = brokerIDs[brokerToAddIndex];
            idealNumbers.set(brokerToAddID, (idealNumbers.get(brokerToAddID)! + 1));

            totalLeaders = 0;
            idealNumbers.forEach((idealNumber, brokerID) => {
                totalLeaders += idealNumber;
            });
        }

        return idealNumbers;
    }
}
