import { RandomHelper } from "./../helpers/";
import generatorDefinition from "./generator-definition";

export default class LotteryNumberGenerator {
    /**
     * @param {generatorDefinition} boardDefinition
     * @param {RandomHelper} randomHelper
     */
    constructor(boardDefinition, randomHelper, gameData) {
        this.randomHelper = randomHelper;
        this.definition = boardDefinition ?? generatorDefinition;
        this.gameData = gameData;
    }

    generate() {
        const { prizes } = this.definition;
        const generatedBoard = this.initEmptyBoard();

        Object.keys(prizes).forEach((name) => {
            const { max, total } = prizes[name];
            const { randomMode } = this.gameData.gameConfigs;

            for (let index = 0; index < total; index++) {
                const number = this.randomHelper.randomNumber(max, randomMode);

                this.updateStatistics(generatedBoard, name, number);
            }
        });

        return generatedBoard;
    }

    reload(board) {
        const generatedBoard = this.initEmptyBoard();

        Object.keys(board).forEach((name) => {
            board[name].forEach((number) => {
                this.updateStatistics(generatedBoard, name, number);
            });
        });

        return generatedBoard;
    }

    updateStatistics(generatedBoard, name, number) {
        const { all, seventh } = generatedBoard.occurrences;
        const { length } = this.definition.prizes[name];
        const formatNumber = this.formatNumber(number, length);

        generatedBoard.board[name].push(formatNumber.number);
        generatedBoard.twoDigitNumbers.push(formatNumber.twoDigitNumber);

        all[formatNumber.twoDigitNumber] = all[formatNumber.twoDigitNumber] ? all[formatNumber.twoDigitNumber] + 1 : 1;

        if (name === "seventh") {
            seventh[formatNumber.twoDigitNumber] = seventh[formatNumber.twoDigitNumber] ? seventh[formatNumber.twoDigitNumber] + 1 : 1;
        }
    }

    initEmptyBoard() {
        return {
            board: {
                special: [],
                first: [],
                second: [],
                third: [],
                fourth: [],
                fifth: [],
                sixth: [],
                seventh: [],
            },
            twoDigitNumbers: [],
            occurrences: {
                all: {},
                seventh: {},
            },
        };
    }

    formatNumber(number, requiredLength) {
        let formatNumber = number.toString();
        const currentLength = formatNumber.length;
        const totalNumbersNeedToAdd = requiredLength - currentLength;

        if (totalNumbersNeedToAdd > 0) {
            for (let index = 0; index < totalNumbersNeedToAdd; index++) {
                formatNumber = "0".concat(formatNumber);
            }
        }

        return {
            number: formatNumber,
            twoDigitNumber: requiredLength === 2 ? formatNumber : formatNumber.substring(requiredLength - 2),
        };
    }
}
