import { RandomHelper } from "./../helpers/";
import generatorDefinition from "./generator-definition";

export default class LotteryNumberGenerator {
    /**
     * @param {generatorDefinition} boardDefinition
     * @param {RandomHelper} randomHelper
     */
    constructor(boardDefinition, randomHelper) {
        this.randomHelper = randomHelper;
        this.definition = boardDefinition ?? generatorDefinition;
    }

    generate() {
        const { prizes } = this.definition;
        let generatedBoard = this.initEmptyBoard();

        Object.keys(prizes).forEach((name) => {
            const { max, total, length } = prizes[name];

            for (let index = 0; index < total; index++) {
                const number = this.randomHelper.randomNumber(max);
                const formatNumber = this.formatNumber(number, length);

                generatedBoard.lastTwoDigits.push(formatNumber.tensDigit);
                generatedBoard.board[name].push(formatNumber.number);
                generatedBoard.occurrences[formatNumber.tensDigit] = generatedBoard.occurrences[formatNumber.tensDigit]
                    ? generatedBoard.occurrences[formatNumber.tensDigit] + 1
                    : 1;
            }
        });

        return generatedBoard;
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
            lastTwoDigits: [],
            occurrences: {},
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
            tensDigit: currentLength === 2 ? formatNumber : formatNumber.substring(requiredLength - 2),
        };
    }
}
