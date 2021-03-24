import { RandomHelper } from ".";
import { LotteryNumberGenerator } from "../generators";
import generatorDefinition from "../generators/generator-definition";

export const generateResult = () => {
    var generator = new LotteryNumberGenerator(generatorDefinition, RandomHelper);

    return generator.generate();
};

export const getSettlementResult = (generatedResult) => {
    const special = generatedResult.board.special[0];
    const specialTwoDigit = special.substring(special.length - 2);
    const specialTwoDigitNumber = parseInt(specialTwoDigit);
    return {
        "4Sets": generatedResult.board.seventh,
        special: specialTwoDigit,
        head: specialTwoDigit[0],
        tail: specialTwoDigit[1],
        "27Sets": generatedResult.twoDigitNumbers,
        others: {
            odd: specialTwoDigitNumber % 2 !== 0,
            even: specialTwoDigitNumber % 2 === 0,
            big: specialTwoDigitNumber >= 50,
            small: specialTwoDigitNumber <= 49,
        },
        occurrences: generateResult.occurrences
    };
};
