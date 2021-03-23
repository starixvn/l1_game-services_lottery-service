import Chance from "chance";

export const randomNumber = (max) => {
    const chance = new Chance();

    return chance.integer({ min: 0, max: max });
};
