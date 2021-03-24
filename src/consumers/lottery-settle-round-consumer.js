import { SettleGameRoundConsumer } from "sc-game-base/src/core/event-consumers";
import lotteryBetResultCalculator from "./lottery-bet-result-calculator";

export default class LotterySettleRoundConsumer extends SettleGameRoundConsumer {
    calculateBetResult(settlementResult, bet, odds) {
        const betResult = Object.entries(bet.choices).reduce(
            (result, [betType, betChoices]) => {
                const originalOdds = odds[betType] || 1;
                const effectiveOdds = bet.freeBet ? originalOdds - 1 : originalOdds;
                lotteryBetResultCalculator[betType](result, betChoices, settlementResult, effectiveOdds);
                
                return result;
            },
            {
                totalBetAmount: bet.totalAmount,
                totalWin: 0,
                netWin: 0,
                totalLost: 0,
                winningByChoices: {},
            }
        );

        betResult.totalWin = parseFloat(betResult.totalWin.toFixed(2));
        betResult.netWin = parseFloat(betResult.netWin.toFixed(2));

        return betResult;
    }
}
