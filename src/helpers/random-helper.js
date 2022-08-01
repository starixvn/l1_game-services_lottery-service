import Chance from "chance";
import { randomInt } from "mathjs";
import random from "random";

const random1 = (max) => {
    const chance = new Chance();
    return chance.integer({ min: 0, max: max });
};

const random2 = (max) => {
    return random.int(0, max);
};

const random3 = (max) => {
    return randomInt(0, max);
};

function random4(max) {
    const chance = new Chance();
    const mode = chance.integer({ min: 1, max: 3 });

    switch (mode) {
        case 2:
            return random2(max);
        case 3:
            return random3(max);
        case 1:
        default:
            return random1(max);
    }
}

function random5(max) {
    const chance = new Chance();
    const mode = chance.integer({ min: 1, max: 3 });

    switch (mode) {
        case 2:
            return random3(max);
        case 3:
            return random1(max);
        case 1:
        default:
            return random2(max);
    }
}

function random6(max) {
    const chance = new Chance();
    const mode = chance.integer({ min: 1, max: 3 });

    switch (mode) {
        case 2:
            return random1(max);
        case 3:
            return random2(max);
        case 1:
        default:
            return random3(max);
    }
}

const randomModes = {
    1: [random4],
    2: [random5],
    3: [random6],
};

export const randomNumber = (max, randomMode) => {
    const randomFuncs = randomModes[randomMode] || randomModes[1];
    const chance = new Chance();
    const randomFunc = chance.pickone(randomFuncs);
    return randomFunc(max);
};
