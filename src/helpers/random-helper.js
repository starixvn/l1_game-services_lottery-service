import Chance from "chance";
import { randomInt } from "mathjs";
import random from "random";
import { randomInt as randomInt1 } from "crypto";
import { Random as RandomJS, MersenneTwister19937 } from "random-js";

const chance = new Chance();

export const mathRandom = () => {
    return Math.random(); // NOSONAR
};

const random1 = (max) => {
    return Math.floor(mathRandom() * max);
};

const random2 = (max) => {
    return chance.integer({ min: 0, max });
};

const random3 = (max) => {
    return random.int(0, max);
};

const random4 = (max) => {
    return randomInt(0, max);
};

const random5 = (max) => {
    const randomJS = new RandomJS(MersenneTwister19937.autoSeed());

    return randomJS.integer(0, max);
};

const random6 = (max) => {
    return randomInt1(max + 1);
};

const random7 = (max) => {
    const seed = Math.floor(mathRandom() * 100000);
    const randomJS = new RandomJS(MersenneTwister19937.seed(seed));
    return randomJS.integer(0, max);
};

const randomModes = {
    1: [random1, random2, random3, random4],
    2: [random4, random5, random6, random7],
    3: [random1, random3, random5, random7],
};

export const randomNumber = (max, randomMode) => {
    const randomFuncs = randomModes[randomMode] || randomModes[1];
    const chance = new Chance();
    const randomFunc = chance.pickone(randomFuncs);
    return randomFunc(max);
};
