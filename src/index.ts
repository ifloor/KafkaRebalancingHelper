import "dotenv/config";
import {MainMenu} from "./menu/MainMenu";
import {Logger} from "./utils/Logger";
import {VariablesExtractor} from "./utils/VariablesExtractor";

Logger.setLevel(1);

Logger.info("Trying to start applications");

Logger.setLevelAsString(VariablesExtractor.getLogLevel());

MainMenu.run();
