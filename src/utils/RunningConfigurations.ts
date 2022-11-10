import {Logger} from "./Logger";
import {VariablesExtractor} from "./VariablesExtractor";

export class RunningConfigurations {
    private static readonly instance: RunningConfigurations = new RunningConfigurations();

    // General
    private bootstrapServers: string = "";
    private configPropertiesFilePath: string = "";
    private schemaRegistryServer: string = "";
    private zookeeperServers: string = "";
    private elasticIndex: string = "";
    private calculationRequestSuffix: string = "";
    private calculationResultSuffix: string = "";
    private calculationsListenerGroupID: string = "";
    private calculationsLinkIDPath: string = "";
    private calculationsSecondsLimitWaitResult: number = 600;
    private enabledScrapings: boolean = false;
    private enabledTimeCalculations: boolean = false;

    // Productions + lag
    private regexExcludeGroups: RegExp[] = [];
    private regexForceIncludeGroups: RegExp[] = [];

    // Calculations

    private constructor() {
        this.assertVars();
    }

    public static getInstance(): RunningConfigurations {
        return this.instance;
    }

    public getEnableScraping(): boolean {
        return this.enabledScrapings;
    }

    public getEnableTimeCalculations(): boolean {
        return this.enabledTimeCalculations;
    }

    public getBootstrapServers(): string {
        return this.bootstrapServers;
    }

    public getConfigPropertiesFilePath(): string {
        return this.configPropertiesFilePath;
    }

    public getSchemaRegistryServer(): string {
        return this.schemaRegistryServer;
    }

    public getZookeeperServers(): string {
        return this.zookeeperServers;
    }

    public getElasticIndex(): string {
        return this.elasticIndex;
    }

    public getCalculationRequestSuffix(): string {
        return this.calculationRequestSuffix;
    }

    public getCalculationResultSuffix(): string {
        return this.calculationResultSuffix;
    }

    public getCalculationsListenerGroupID(): string {
        return this.calculationsListenerGroupID;
    }

    public getCalculationLinkIDPath(): string {
        return this.calculationsLinkIDPath;
    }

    public getCalculationsSecondsLimitWaitResult(): number {
        return this.calculationsSecondsLimitWaitResult;
    }

    public getRegexExcludeGroups(): RegExp[] {
        return this.regexExcludeGroups;
    }

    public getRegexForceIncludeGroups(): RegExp[] {
        return this.regexForceIncludeGroups;
    }

    private assertVars() {
        {
            const enabledScrapings = VariablesExtractor.getEnableScraping();
            this.enabledScrapings = enabledScrapings === true;
        }

        {
            const enabledTimeCalculations = VariablesExtractor.getEnableTimeCalculations();
            this.enabledTimeCalculations = enabledTimeCalculations === true;
        }

        this.bootstrapServers = VariablesExtractor.getKafkaBootstrapServers();
        if (this.bootstrapServers.length === 0) {
            Logger.error("Required variable not set");
            process.exit(-1);
        }

        {
            this.configPropertiesFilePath = VariablesExtractor.getConfigPropertiesFilePath();
        }

        {
            this.zookeeperServers = VariablesExtractor.getZookeeperServers();
            if (this.zookeeperServers.length === 0) {
                Logger.error("Required variable not set");
                process.exit(-1);
            }
        }

        {
            this.schemaRegistryServer = VariablesExtractor.getKafkaSchemaRegistry();
        }

        {
            const elasticServer = VariablesExtractor.getElasticServer();
            if (elasticServer.length === 0) {
                Logger.error("Required variable not set");
                process.exit(-1);
            }
        }

        {
            this.elasticIndex = VariablesExtractor.getElasticExportIndex();
            if (this.elasticIndex.length === 0) {
                this.elasticIndex = "kafka-real-time-data-scrapper";
            }
        }

        {
            const calculationRequestSuffix = VariablesExtractor.getCalculationRequestTopicSuffix();
            if (calculationRequestSuffix.length === 0) {
                Logger.error("Required variable not set");
                process.exit(-1);
            }
            this.calculationRequestSuffix = calculationRequestSuffix;
        }

        {
            const calculationResultSuffix = VariablesExtractor.getCalculationResultTopicSuffix();
            if (calculationResultSuffix.length === 0) {
                Logger.error("Required variable not set");
                process.exit(-1);
            }
            this.calculationResultSuffix = calculationResultSuffix;
        }

        {
            let calculationsListenerGroupID = VariablesExtractor.getCalculationsListenerGroupID();
            if (calculationsListenerGroupID.length === 0) {
                calculationsListenerGroupID = "kafka-real-time-data-scrapper";
            }
            this.calculationsListenerGroupID = calculationsListenerGroupID;
        }

        {
            const calculationsLinkIDPath = VariablesExtractor.getCalculationsLinkIDPath();
            if (calculationsLinkIDPath.length === 0) {
                Logger.warn("Required variable not set");
            }
            this.calculationsLinkIDPath = calculationsLinkIDPath;
        }

        {
            const calculationsSecondsLimitWaitResult = VariablesExtractor.getCalculationsSecondsLimitWaitResult();
            if (calculationsSecondsLimitWaitResult) {
                this.calculationsSecondsLimitWaitResult = calculationsSecondsLimitWaitResult;
            }
        }

        const regexExcludedGroups = VariablesExtractor.getRegexExcludedGroups();
        if (regexExcludedGroups.length > 0) {
            const groups: string[] = JSON.parse(regexExcludedGroups);
            groups.forEach((groupExclusion) => {
                this.regexExcludeGroups.push(new RegExp(groupExclusion));
            });
        }

        const regexForceIncludeGroups = VariablesExtractor.getRegexForceIncludeGroups();
        if (regexForceIncludeGroups.length > 0) {
            const groups: string[] = JSON.parse(regexForceIncludeGroups);
            groups.forEach((groupInclusion) => {
                this.regexForceIncludeGroups.push(new RegExp(groupInclusion));
            });
        }
    }
}
