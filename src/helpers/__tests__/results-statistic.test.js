import { RandomHelper } from "..";
import LotteryNumberGenerator from "../../generators/lottery-number-generator";
import { getSettlementResult } from "../result-helper";

const gameData = { gameConfigs: { randomMode: 1 } };
const numberGenerator = new LotteryNumberGenerator(null, RandomHelper, gameData);

describe("Running 100,000 rounds", () => {
    it.each([1, 2, 3])("Mode %d", (mode) => {
        const totalRounds = 100_000;
        gameData.gameConfigs.randomMode = mode;

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

        expect(stats.others.odd / totalRounds).toBeGreaterThanOrEqual(0.49);
        expect(stats.others.even / totalRounds).toBeGreaterThanOrEqual(0.49);
        expect(stats.others.big / totalRounds).toBeGreaterThanOrEqual(0.49);
        expect(stats.others.small / totalRounds).toBeGreaterThanOrEqual(0.49);
        console.log(`======== Run ${totalRounds} rounds for mode ${mode} ========`);
        console.log(stats);
    });
});
