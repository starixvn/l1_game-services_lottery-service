import Chance from "chance";
import { randomInt } from "mathjs";
import random from "random";

export const randomNumber = (max, mode) => {
    const chance = new Chance();

    switch (mode) {
        case 1:
            return chance.integer({ min: 0, max: max });
        case 2:
            return random.int(0, max);
        case 3:
            return randomInt(0, max);

        default:
            return chance.integer({ min: 0, max: max });
    }
};
