import {exec} from "child_process";
import {Logger} from "./Logger";

export class CommandRunner {

    private static readonly MAX_BUFFER = 5 * 1024 * 1024; // 5mb
    public static execute(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            Logger.info(`Running command: ${command}`);

            try {
                const childExec = exec(command, {maxBuffer: CommandRunner.MAX_BUFFER}, (error, stdout, stderr) => {
                    Logger.debug("Exec output callback triggered");

                    if (error) {
                        Logger.error(`Error: ${error}, ${JSON.stringify(error)}`);
                        resolve("");
                        return;
                    }

                    let returnOut = "";
                    if (stderr) {
                        Logger.error(`stderr> ${stderr}, ${JSON.stringify(stderr)}`);
                        returnOut = stderr;
                    }
                    if (stdout) {
                        Logger.trace("stdout> " + stdout);
                        returnOut += "\n" + stdout;
                    }

                    if (returnOut) {
                        resolve(returnOut);
                        return;
                    }

                    // Nothing returned
                    Logger.warn("Command didn't result error, stderr or stdout");
                    resolve("");
                });
            } catch (error) {
                Logger.error(`Error executing command: ${JSON.stringify(error)}`);
                resolve("");
            }
        });
    }
}
