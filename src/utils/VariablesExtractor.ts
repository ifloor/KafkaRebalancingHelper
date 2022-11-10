import {Logger} from "./Logger";

export class VariablesExtractor {

    public static getEnableScraping(): boolean | undefined {
        const envVar = process.env.ENABLE_SCRAPING;

        if (envVar) {
            return envVar.toLowerCase() === "true";
        }

        Logger.warn("env var ENABLE_SCRAPING not set");

        return undefined;
    }

    public static getEnableTimeCalculations(): boolean | undefined {
        const envVar = process.env.ENABLE_TIME_CALCULATIONS;

        if (envVar) {
            return envVar.toLowerCase() === "true";
        }

        Logger.warn("env var ENABLE_TIME_CALCULATIONS not set");

        return undefined;
    }

    public static getConfigPropertiesFilePath(): string {
        const envVar = process.env.CONFIG_PROPERTIES_FILE_PATH;

        if (envVar) {
            return envVar;
        }

        Logger.info("env var CONFIG_PROPERTIES_FILE_PATH not set");

        return "";
    }

    public static getSSLCertFilePath(): string {
        const envVar = process.env.SSL_CERT_FILE_PATH;

        if (envVar) {
            return envVar;
        }

        Logger.info("env var SSL_CERT_FILE_PATH not set");

        return "";
    }

    public static getSSLKeyPassword(): string {
        const envVar = process.env.SSL_KEY_PASSWORD;

        if (envVar) {
            return envVar;
        }

        Logger.info("env var SSL_KEY_PASSWORD not set");

        return "";
    }

    public static getSSLKeyFilePath(): string {
        const envVar = process.env.SSL_KEY_FILE_PATH;

        if (envVar) {
            return envVar;
        }

        Logger.info("env var SSL_KEY_FILE_PATH not set");

        return "";
    }

    public static getSSLCAFilePath(): string {
        const envVar = process.env.SSL_CA_FILE_PATH;

        if (envVar) {
            return envVar;
        }

        Logger.info("env var SSL_CA_FILE_PATH not set");

        return "";
    }

    public static getLogLevel(): string {
        const envVar = process.env.LOG_LEVEL;

        if (envVar) {
            return envVar;
        }

        Logger.error("env var LOG_LEVEL not set");

        return "";
    }

    public static getKafkaBootstrapServers(): string {
        const envVar = process.env.KAFKA_BOOTSTRAP_SERVERS;

        if (envVar) {
            return envVar;
        }

        Logger.error("env var KAFKA_BOOTSTRAP_SERVERS not set");

        return "";
    }

    public static getKafkaSchemaRegistry(): string {
        const envVar = process.env.KAFKA_SCHEMA_REGISTRY;

        if (envVar) {
            return envVar;
        }

        Logger.error("env var KAFKA_SCHEMA_REGISTRY not set");

        return "";
    }

    public static getZookeeperServers(): string {
        const envVar = process.env.ZOOKEEPER_SERVERS;

        if (envVar) {
            return envVar;
        }

        Logger.error("env var ZOOKEEPER_SERVERS not set");

        return "";
    }

    public static getElasticExportIndex(): string {
        const envVar = process.env.EXPORT_ELASTIC_INDEX;

        if (envVar) {
            return envVar;
        }

        Logger.info("env var EXPORT_ELASTIC_INDEX not set");

        return "";
    }

    public static getElasticServer(): string {
        const envVar = process.env.ELASTIC_SERVER;

        if (envVar) {
            return envVar;
        }

        Logger.error("env var ELASTIC_SERVER not set");

        return "";
    }

    public static getElasticSecUser(): string {
        const envVar = process.env.ELASTIC_SEC_USER;

        if (envVar) {
            return envVar;
        }

        Logger.warn("env var ELASTIC_SEC_USER not set");

        return "";
    }

    public static getElasticSecPass(): string {
        const envVar = process.env.ELASTIC_SEC_PASS;

        if (envVar) {
            return envVar;
        }

        Logger.warn("env var ELASTIC_SEC_PASS not set");

        return "";
    }

    public static getElasticSSLCAPath(): string {
        const envVar = process.env.ELASTIC_SSL_CA_PATH;

        if (envVar) {
            return envVar;
        }

        Logger.warn("env var ELASTIC_SSL_CA_PATH not set");

        return "";
    }

    public static getRegexExcludedGroups(): string {
        const envVar = process.env.REGEX_EXCLUDED_CONSUMER_GROUPS;

        if (envVar) {
            return envVar;
        }

        Logger.info("env var REGEX_EXCLUDED_CONSUMER_GROUPS not set");

        return "";
    }

    public static getRegexForceIncludeGroups(): string {
        const envVar = process.env.REGEX_FORCE_INCLUDE_CONSUMER_GROUPS;

        if (envVar) {
            return envVar;
        }

        Logger.info("env var REGEX_FORCE_INCLUDE_CONSUMER_GROUPS not set");

        return "";
    }

    public static getTimeoutOnQueries(): string {
        const envVar = process.env.TIMEOUT_ON_QUERIES;

        if (envVar) {
            return envVar;
        }

        Logger.info("env var TIMEOUT_ON_QUERIES not set");

        return "";
    }

    public static getSecondsIntervalBetweenScraps(): number {
        const envVar = process.env.INTERVAL_SECONDS_BETWEEN_SCRAPS;

        if (envVar) {
            return Number(envVar);
        }

        Logger.info("env var INTERVAL_SECONDS_BETWEEN_SCRAPS not set");

        return 60;
    }

    public static getCalculationRequestTopicSuffix(): string {
        const envVar = process.env.CALCULATION_REQUEST_TOPIC_SUFFIX;

        if (envVar) {
            return envVar;
        }

        Logger.info("env var CALCULATION_REQUEST_TOPIC_SUFFIX not set");

        return "";
    }

    public static getCalculationResultTopicSuffix(): string {
        const envVar = process.env.CALCULATION_RESULT_TOPIC_SUFFIX;

        if (envVar) {
            return envVar;
        }

        Logger.info("env var CALCULATION_RESULT_TOPIC_SUFFIX not set");

        return "";
    }

    public static getCalculationsListenerGroupID(): string {
        const envVar = process.env.CALCULATIONS_LISTENER_GROUP_ID;

        if (envVar) {
            return envVar;
        }

        Logger.info("env var CALCULATIONS_LISTENER_GROUP_ID not set");

        return "";
    }

    public static getCalculationsSecondsLimitWaitResult(): number | null {
        const envVar = process.env.CALCULATIONS_SECONDS_LIMIT_WAIT_RESULT;

        if (envVar) {
            return Number(envVar);
        }

        Logger.info("env var CALCULATIONS_SECONDS_LIMIT_WAIT_RESULT not set");

        return null;
    }

    public static getCalculationsLinkIDPath(): string {
        const envVar = process.env.CALCULATION_LINK_ID_PATH;

        if (envVar) {
            return envVar;
        }

        Logger.info("env var CALCULATION_LINK_ID_PATH not set");

        return "";
    }
}
