import { RandomHelper } from "./../../helpers";
import generatorDefinition from "./../generator-definition";
import LotteryNumberGenerator from "./../lottery-number-generator";

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

    it("total of tens digits should be correct", () => {
        // arrange
        const generator = new LotteryNumberGenerator(generatorDefinition, RandomHelper);

        // act
        const generatedBoard = generator.generate();

        // assert
        expect(generatedBoard.lastTwoDigits.every((number) => number.length === 2)).toBeTrue();
        expect(generatedBoard.lastTwoDigits.length).toEqual(27);
    });
});
