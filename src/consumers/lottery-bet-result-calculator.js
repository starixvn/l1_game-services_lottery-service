function calculateParlay(result, betChoices, settlementResult, odds, parlayType) {
    result.winningByChoices[parlayType] = 0;

    for (const [choice, amount] of Object.entries(betChoices)) {
        const numbers = choice.split("-");
        if (numbers.every((x) => settlementResult["27Sets"].includes(x))) {
            const winAmount = amount * odds;

            result.totalWin += winAmount;
            result.winningByChoices[parlayType] += winAmount;
            result.netWin += winAmount - amount;
        } else {
            result.totalLost += amount;
        }
    }
}
export default {
    "4Sets": function (result, betChoices, settlementResult, odds) {
        const { occurrences } = settlementResult;
        result.winningByChoices["4Sets"] = 0;

        for (const [choice, amount] of Object.entries(betChoices)) {
            if (settlementResult["4Sets"].some((x) => x === choice)) {
                const winAmount = amount * odds * occurrences.seventh[choice];

                result.totalWin += winAmount;
                result.winningByChoices["4Sets"] += winAmount;
                result.netWin += winAmount - amount;
            } else {
                result.totalLost += amount;
            }
        }
    },
    special: function (result, betChoices, settlementResult, odds) {
        result.winningByChoices["special"] = 0;

        for (const [choice, amount] of Object.entries(betChoices)) {
            if (settlementResult.special === choice) {
                const winAmount = amount * odds;

                result.totalWin += winAmount;
                result.winningByChoices["special"] += winAmount;
                result.netWin += winAmount - amount;
            } else {
                result.totalLost += amount;
            }
        }
    },
    head: function (result, betChoices, settlementResult, odds) {
        result.winningByChoices["head"] = 0;

        for (const [choice, amount] of Object.entries(betChoices)) {
            if (settlementResult.head === choice) {
                const winAmount = amount * odds;

                result.totalWin += winAmount;
                result.winningByChoices["head"] += winAmount;
                result.netWin += winAmount - amount;
            } else {
                result.totalLost += amount;
            }
        }
    },
    tail: function (result, betChoices, settlementResult, odds) {
        result.winningByChoices["tail"] = 0;

        for (const [choice, amount] of Object.entries(betChoices)) {
            if (settlementResult.tail === choice) {
                const winAmount = amount * odds;

                result.totalWin += winAmount;
                result.winningByChoices["tail"] += winAmount;
                result.netWin += winAmount - amount;
            } else {
                result.totalLost += amount;
            }
        }
    },
    "27Sets": function (result, betChoices, settlementResult, odds) {
        const { occurrences } = settlementResult;
        result.winningByChoices["27Sets"] = 0;

        for (const [choice, amount] of Object.entries(betChoices)) {
            if (settlementResult["27Sets"].some((x) => x === choice)) {
                const winAmount = amount * odds * occurrences.all[choice];

                result.totalWin += winAmount;
                result.winningByChoices["27Sets"] += winAmount;
                result.netWin += winAmount - amount;
            } else {
                result.totalLost += amount;
            }
        }
    },
    parlay2: function (result, betChoices, settlementResult, odds) {
        calculateParlay(result, betChoices, settlementResult, odds, "parlay2");
    },
    parlay3: function (result, betChoices, settlementResult, odds) {
        calculateParlay(result, betChoices, settlementResult, odds, "parlay3");
    },
    parlay4: function (result, betChoices, settlementResult, odds) {
        calculateParlay(result, betChoices, settlementResult, odds, "parlay4");
    },
    others: function (result, betChoices, settlementResult, odds) {
        result.winningByChoices["others"] = 0;

        for (const [choice, amount] of Object.entries(betChoices)) {
            if (settlementResult.others[choice]) {
                const winAmount = amount * odds;

                result.totalWin += winAmount;
                result.winningByChoices["others"] += winAmount;
                result.netWin += winAmount - amount;
            } else {
                result.totalLost += amount;
            }
        }
    },
};
