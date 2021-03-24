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
};
