import { RandomHelper } from "../../helpers";
import generatorDefinition from "../generator-definition";
import LotteryNumberGenerator from "../lottery-number-generator";

describe("lottery number generate test", () => {
    it("should generate total of prizes correctly", () => {
        // arrange
        const generator = new LotteryNumberGenerator(generatorDefinition, RandomHelper);
        const { prizes } = generatorDefinition;

        // act
        const generatedBoard = generator.generate();

        // assert
        Object.keys(generatedBoard.board).forEach((name) => {
            expect(generatedBoard.board[name].length).toEqual(prizes[name].total);
        });
    });

    it("result of specific prize should match required length", () => {
        // arrange
        const generator = new LotteryNumberGenerator(generatorDefinition, RandomHelper);
        const { prizes } = generatorDefinition;

        // act
        const generatedBoard = generator.generate();

        // assert
        Object.keys(generatedBoard.board).forEach((name) => {
            expect(generatedBoard.board[name].every((number) => number.length === prizes[name].length)).toBeTrue();
        });
    });

    it("total of two digit numbers should be correct", () => {
        // arrange
        const generator = new LotteryNumberGenerator(generatorDefinition, RandomHelper);

        // act
        const generatedBoard = generator.generate();

        // assert
        expect(generatedBoard.twoDigitNumbers.every((number) => number.length === 2)).toBeTrue();
        expect(generatedBoard.twoDigitNumbers.length).toEqual(27);
    });
});

describe("generator format number test", () => {
    it("should format digits according to required length", () => {
        // arrange
        const generator = new LotteryNumberGenerator(generatorDefinition, RandomHelper);
        const arrangements = [
            { number: 3, requiredLength: 2, expectedNumber: "03", expectedTwoDigits: "03", actualResult: null },
            { number: 7, requiredLength: 3, expectedNumber: "007", expectedTwoDigits: "07", actualResult: null },
            { number: 1, requiredLength: 4, expectedNumber: "0001", expectedTwoDigits: "01", actualResult: null },
            { number: 2, requiredLength: 5, expectedNumber: "00002", expectedTwoDigits: "02", actualResult: null },
            { number: 13, requiredLength: 2, expectedNumber: "13", expectedTwoDigits: "13", actualResult: null },
            { number: 27, requiredLength: 3, expectedNumber: "027", expectedTwoDigits: "27", actualResult: null },
            { number: 81, requiredLength: 4, expectedNumber: "0081", expectedTwoDigits: "81", actualResult: null },
            { number: 52, requiredLength: 5, expectedNumber: "00052", expectedTwoDigits: "52", actualResult: null },
            { number: 274, requiredLength: 3, expectedNumber: "274", expectedTwoDigits: "74", actualResult: null },
            { number: 811, requiredLength: 4, expectedNumber: "0811", expectedTwoDigits: "11", actualResult: null },
            { number: 520, requiredLength: 5, expectedNumber: "00520", expectedTwoDigits: "20", actualResult: null },
            { number: 8113, requiredLength: 4, expectedNumber: "8113", expectedTwoDigits: "13", actualResult: null },
            { number: 5208, requiredLength: 5, expectedNumber: "05208", expectedTwoDigits: "08", actualResult: null },
            { number: 82113, requiredLength: 5, expectedNumber: "82113", expectedTwoDigits: "13", actualResult: null },
            { number: 52078, requiredLength: 5, expectedNumber: "52078", expectedTwoDigits: "78", actualResult: null },
        ];

        // act
        arrangements.forEach((arrangement) => {
            arrangement.actualResult = generator.formatNumber(arrangement.number, arrangement.requiredLength);
        });

        // assert
        arrangements.forEach((arrangement) => {
            expect(arrangement.actualResult.number).toEqual(arrangement.expectedNumber);
            expect(arrangement.actualResult.twoDigitNumber).toEqual(arrangement.expectedTwoDigits);
        });
    });
});

describe("generator reload test", () => {
    it("should update statistics correctly", () => {
        // arrange
        const generator = new LotteryNumberGenerator(generatorDefinition, RandomHelper);
        const generatedBoard = generator.generate();

        // act
        const reloadBoard = generator.reload(generatedBoard.board);

        // assert
        expect(reloadBoard).toEqual(generatedBoard);
    });
});
