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
            // Add 1 to a random broker (among the fewest numbers)
            const brokerIDs: string[] = this.getOnlyBrokersWithFewestNumbers(idealNumbers);
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

    private static getOnlyBrokersWithFewestNumbers(numbers: Map<string, number>): string[] {
        let brokersToConsider: string[] = [];
        let fewestNumberFound = Number.MAX_SAFE_INTEGER;
        numbers.forEach((idealNumber, brokerID) => {
            if (idealNumber === 0) return;

           if (fewestNumberFound > idealNumber) {
               fewestNumberFound = idealNumber;
               brokersToConsider = [];
           }

           if (idealNumber <= fewestNumberFound) {
               brokersToConsider.push(brokerID);
           }
        });

        return brokersToConsider;
    }
}
