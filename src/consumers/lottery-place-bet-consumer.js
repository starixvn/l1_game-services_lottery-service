import noticeHelper from "sc-common/helpers/notice-helper";
import { PlaceBetConsumer } from "sc-game-base/src/core/event-consumers";

import constants from "../constants";

export default class LotteryPlaceBetConsumer extends PlaceBetConsumer {
    betChoiceValidateor = {
        "4Sets": function (betChoiceKeys) {
            return betChoiceKeys.every((choice) => !isNaN(choice) && choice.length === 2);
        },
        special: function (betChoiceKeys) {
            return betChoiceKeys.every((choice) => !isNaN(choice) && choice.length === 2);
        },
        head: function (betChoiceKeys) {
            return betChoiceKeys.every((choice) => !isNaN(choice) && choice.length === 1);
        },
        tail: function (betChoiceKeys) {
            return betChoiceKeys.every((choice) => !isNaN(choice) && choice.length === 1);
        },
        "27Sets": function (betChoiceKeys) {
            return betChoiceKeys.every((choice) => !isNaN(choice) && choice.length === 2);
        },
        parlay2: function (betChoiceKeys) {
            return betChoiceKeys.every((choice) => {
                const numbers = choice.split("-");

                return numbers.length === 2 && numbers.every((x) => !isNaN(x) && x.length === 2);
            });
        },
        parlay3: function (betChoiceKeys) {
            return betChoiceKeys.every((choice) => {
                const numbers = choice.split("-");

                return numbers.length === 3 && numbers.every((x) => !isNaN(x) && x.length === 2);
            });
        },
        parlay4: function (betChoiceKeys) {
            return betChoiceKeys.every((choice) => {
                const numbers = choice.split("-");

                return numbers.length === 4 && numbers.every((x) => !isNaN(x) && x.length === 2);
            });
        },
        others: function (betChoiceKeys) {
            const availableChoices = ["odd", "even", "big", "small"];
            return betChoiceKeys.every((choice) => availableChoices.includes(choice));
        },
    };

    hasZeroOrNegativeAmount(betType) {
        return Object.values(betType).some((amount) => amount <= 0);
    }

    hasChoiceExceedMaxBet(player, betTracks, bet) {
        const configs = this.gameData.gameConfigs;

        const betTypeKey = Object.keys(bet)[0];
        const betType = bet[betTypeKey];
        const maxBetPerType = Math.min(player.profile.maxBet, configs.choices_maxbet[betTypeKey]);

        return Object.entries(betType).some(([betChoice, amountOnChoice]) => {
            const currentBetAmount = betTracks[betTypeKey]?.[betChoice] ?? 0;
            return currentBetAmount + amountOnChoice > maxBetPerType;
        });
    }

    composeBetAmountValidationCriteria(player, bet, amount, freeBet) {
        const configs = this.gameData.gameConfigs;
        const betTypeKey = Object.keys(bet)[0];
        const betType = bet[betTypeKey];

        const { betTracks } = this.gameData.ingame[player.profile.name] || {
            betTracks: {},
        };

        const currentTotalAmount = betTracks.totalAmount || 0;

        const minBet = Math.max(player.profile.minBet, configs.minbet);
        const maxBet = Math.min(player.profile.maxBet, configs.maxbet);
        const maxBetPerType = Math.min(player.profile.maxBet, configs.choices_maxbet[betTypeKey]);

        return [
            {
                failure: freeBet && !configs.enableFreeBet,
                notice: this.getNoticeObj(noticeHelper.invalidBet),
            },
            {
                failure: this.hasZeroOrNegativeAmount(betType),
                notice: this.getNoticeObj(noticeHelper.invalidBet),
            },
            {
                failure: this.hasChoiceExceedMaxBet(player, betTracks, bet),
                notice: this.getNoticeObj(noticeHelper.maxBetForChoice, { maxBet: maxBetPerType }),
            },
            {
                failure: amount < minBet,
                notice: this.getNoticeObj(noticeHelper.minBet, { minBet }),
            },
            {
                failure: currentTotalAmount + amount > maxBet,
                notice: this.getNoticeObj(noticeHelper.maxBet, { maxBet }),
            },
        ];
    }

    composeBetChoiceValidationCriteria(bet) {
        const criterons = [];

        if (Object.keys(bet).length === 1) {
            const betType = Object.keys(bet)[0];

            if (this.definition.betTypes.includes(betType)) {
                const betChoiceKeys = Object.keys(bet[betType]);

                criterons.push({
                    failure:
                        betChoiceKeys.length < 1 ||
                        betChoiceKeys.length > constants.maxChoices[betType] ||
                        !this.betChoiceValidateor[betType](betChoiceKeys),
                    notice: this.getNoticeObj(noticeHelper.invalidBet),
                });
            } else {
                criterons.push({
                    failure: true,
                    notice: this.getNoticeObj(noticeHelper.invalidBet),
                });
            }
        } else {
            criterons.push({
                failure: true,
                notice: this.getNoticeObj(noticeHelper.invalidBet),
            });
        }

        return criterons;
    }

    composeValidationCriteria(player, betChoice, amount, freeBet) {
        const bettingTimeValidationCriteria = this.composeBettingTimeValidationCriteria();

        const betChoiceValidationCriteria = this.composeBetChoiceValidationCriteria(betChoice);

        if (betChoiceValidationCriteria.some((x) => x.failure)) {
            return bettingTimeValidationCriteria.concat(betChoiceValidationCriteria);
        }

        const betAmountValidationCriteria = this.composeBetAmountValidationCriteria(player, betChoice, amount, freeBet);

        return bettingTimeValidationCriteria.concat(betAmountValidationCriteria, betChoiceValidationCriteria);
    }

    adjustBetTracks(playerName, bet) {
        const { betChoice } = bet;
        const betTypeKey = Object.keys(betChoice)[0];

        if (this.gameData.ingame?.[playerName]) {
            const { betTracks } = this.gameData.ingame[playerName];

            if (!betTracks[betTypeKey]) {
                betTracks[betTypeKey] = {};
            }

            for (const [choice, amountOnChoice] of Object.entries(betChoice[betTypeKey])) {
                betTracks[betTypeKey][choice] = (betTracks[betTypeKey][choice] || 0) + amountOnChoice;

                betTracks.totalAmount = (betTracks.totalAmount || 0) + amountOnChoice;
            }
        }
    }

    adjustPayload(payload) {
        const { betChoice } = payload;
        payload.amount = 0;
        payload.freeBet = payload.freeBet ?? false;
        payload.roundId = this.gameData.roundId,

        for (const betType of Object.values(betChoice)) {
            for (const choice of Object.keys(betType)) {
                betType[choice] = betType[choice] >> 0;
                payload.amount += betType[choice];
            }
        }
    }

    consume(player, payload) {
        this.adjustPayload(payload);

        const { amount, betChoice, freeBet } = payload;
        const name = player.profile.name;

        if (!this.validateBetRequest(player, betChoice, amount, freeBet)) {
            return;
        }

        if (!this.gameData.ingame[name]) {
            const newPlayer = {
                name: player.profile.name,
                currency: player.session.currency,
                betTracks: {},
                betQueue: [],
            };

            this.gameData.ingame[name] = newPlayer;
        }

        this.adjustBetTracks(player.profile.name, payload);
        this.gameData.ingame[name].betQueue.push({ player, payload });
    }
}
