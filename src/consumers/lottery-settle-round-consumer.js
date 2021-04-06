import { SettleGameRoundConsumer } from "sc-game-base/src/core/event-consumers";
import lotteryBetResultCalculator from "./lottery-bet-result-calculator";

export default class LotterySettleRoundConsumer extends SettleGameRoundConsumer {
    constructor({
        definition,
        gameData,
        roundResultPublisher,
        userBetResultPublisher,
        endGame,
        roundsRepository,
        betsRepository,
        lotteryNumberGenerator,
    }) {
        super({ definition, gameData, roundResultPublisher, userBetResultPublisher, endGame, roundsRepository, betsRepository });
        this.lotteryNumberGenerator = lotteryNumberGenerator;
    }

    async settleRound() {
        const generatedResult = this.generateResult();
        const settlementResult = this.definition.settle(generatedResult);
        const newRound = await this.roundsRepository.create({
            id: this.gameData.roundId,
            result: generatedResult.board,
            settlementResult,
            time: new Date(),
        });

        if (newRound) {
            const finish = {
                settlementResult,
                result: generatedResult.board,
                roundId: newRound.id,
                time: newRound.time,
            };

            this.gameData.roundId = finish.roundId + 1;

            await this.settleBets(finish);
        }
    }

    calculateBetResult(settlementResult, bet, odds) {
        const { choices } = bet.toObject();
        const betResult = Object.entries(choices).reduce(
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

    generateResult() {
        const resultFromAdmin = this.gameData.settlementResultFromAdmin;

        return this.gameData.roundId === resultFromAdmin.roundId
            ? this.lotteryNumberGenerator.reload(resultFromAdmin.result)
            : this.lotteryNumberGenerator.generate();
    }
}
