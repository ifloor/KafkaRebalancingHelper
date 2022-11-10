export class Logger {
    public static LogLevelEnum = {
        TRACE: 0,
        // tslint:disable-next-line:object-literal-sort-keys
        DEBUG: 1,
        INFO: 2,
        WARN: 3,
        ERROR: 4,
    };

    public static setLevelAsString(newLevel: string): void {
        this.setLevel(this.fromString(newLevel));
    }

    public static setLevel(newLevel: number): void {
        this.logLevelInt = newLevel;
        Logger.info(`Running on log level: [ + ${newLevel} ]`);
    }

    public static getLevel(): number {
        return this.logLevelInt;
    }

    public static trace(message: string): void {
        if (this.logLevelInt <= this.LogLevelEnum.TRACE) {
            this.writeMessage("TRACE", message);
        }
    }

    public static debug(message: string): void {
        if (this.logLevelInt <= this.LogLevelEnum.DEBUG) {
            this.writeMessage("DEBUG", message);
        }
    }

    public static info(message: string): void {
        if (this.logLevelInt <= this.LogLevelEnum.INFO) {
            this.writeMessage("INFO", message);
        }
    }

    public static warn(message: string): void {
        if (this.logLevelInt <= this.LogLevelEnum.WARN) {
            this.writeMessage("WARN", message);
        }
    }

    public static error(message: string): void {
        if (this.logLevelInt <= this.LogLevelEnum.ERROR) {
            this.writeMessage("ERROR", message);
        }
    }

    public static writeMessage(loglevel: string, message: string): void {
        const dateObject = new Date();
        let output = dateObject.toISOString();
        output += " | " + loglevel;
        output += " | " + message;

        if (loglevel === "ERROR") {
            // tslint:disable-next-line:no-console
            console.log(output);
            // tslint:disable-next-line:no-console
            console.error(output);
        } else {
            // tslint:disable-next-line:no-console
            console.log(output);
        }
    }

    private static logLevelInt: number = 0;

    private static fromString(levelAsString: string): number {
        switch (levelAsString) {
            case "TRACE":
                return 0;
            case "DEBUG":
                return 1;
            case "INFO":
                return 2;
            case "WARN":
                return 3;
            case "ERROR":
                return 4;
            default:
                return 3;
        }
    }
}
