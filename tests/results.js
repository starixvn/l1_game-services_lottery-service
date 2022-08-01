import { RandomHelper } from "../src/helpers";
import LotteryNumberGenerator from "../src/generators/lottery-number-generator";
import { getSettlementResult } from "../src/helpers/result-helper";

const gameData = { gameConfigs: { randomMode: 1 } };
const numberGenerator = new LotteryNumberGenerator(null, RandomHelper, gameData);

function run(randomMode) {
    const totalRounds = 100_000;
    gameData.gameConfigs.randomMode = randomMode;

    const stats = {
        "4Sets": {},
        special: {},
        head: {},
        tail: {},
        "27Sets": {},
        others: { odd: 0, even: 0, big: 0, small: 0 },
    };

    new Array(100).fill(0).forEach((_, i) => {
        const key = i.toString().padStart(2, "0");
        stats["4Sets"][key] = 0;
        stats.special[key] = 0;
        stats["27Sets"][key] = 0;
    });

    new Array(10).fill(0).forEach((_, i) => {
        const key = i.toString();
        stats.head[key] = 0;
        stats.tail[key] = 0;
    });

    for (let index = 0; index < totalRounds; index++) {
        const board = numberGenerator.generate();
        const result = getSettlementResult(board);

        result["4Sets"].forEach((n) => stats["4Sets"][n]++);
        result["27Sets"].forEach((n) => stats["27Sets"][n]++);

        stats["special"][result.special]++;
        stats["head"][result.head]++;
        stats["tail"][result.tail]++;

        stats.others.odd += result.others.odd ? 1 : 0;
        stats.others.even += result.others.even ? 1 : 0;
        stats.others.big += result.others.big ? 1 : 0;
        stats.others.small += result.others.small ? 1 : 0;
    }

    console.log(`======== Run ${totalRounds} rounds for mode ${randomMode} ========`);
    console.log(stats);
}

const randomModes = [3];
const runNo = 3;

for (let randomMode of randomModes) {
    for (let i = 0; i < runNo; i++) {
        run(randomMode);
    }
}
