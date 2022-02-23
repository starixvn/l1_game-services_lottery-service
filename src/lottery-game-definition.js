import { Table } from "sc-game-base";

export default class LotteryGameDefinition extends Table.TableGameDefinition {
    constructor({ id = 0, name = "", durations = {}, betTypes = [], hedgeBetGroups = [] }, generateResult, settle, roundRepository, betRepository) {
        super({ id, name, durations, hedgeBetGroups }, generateResult, settle, roundRepository, betRepository, null);

        this.betTypes = betTypes;
    }
}
