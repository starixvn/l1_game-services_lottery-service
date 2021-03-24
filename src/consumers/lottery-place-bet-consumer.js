import noticeHelper from "sc-common/helpers/notice-helper";
import { Core } from "sc-game-base";
import constants from "../constants";

export default class LotteryPlaceBetConsumer extends Core.BaseEventConsumers
  .PlaceBetConsumer {
  hasNegativeAmount(betChoices) {
    return Object.values(betChoices).some((amount) => amount < 0);
  }

  composeBetAmountValidationCriteria(player, bet) {
    const configs = this.gameData.gameConfigs;
    const betType = Object.keys(bet)[0];
    const betTypeObj = bet[betType];

    const { betTracks } = this.gameData.ingame[player.profile.name] || {
      betTracks: {},
    };

    const currentTotalAmount = betTracks.totalAmount || 0;
    const currentBetTypeTotalAmount = betTracks[betType]
      ? Object.values(betTracks[betType]).reduce(
          (total, amountOnChoice) => total + amountOnChoice,
          0
        )
      : 0;

    const betTypeTotalAmount = Object.values(betTypeObj).reduce(
      (total, amountOnChoice) => total + amountOnChoice,
      0
    );

    const minBet = Math.max(player.profile.minBet, configs.minbet);
    const maxBet = Math.min(player.profile.maxBet, configs.maxbet);
    const maxBetPerType = Math.min(
      player.profile.maxBet,
      configs.choices_maxbet[betType]
    );

    return [
      {
        failure: this.hasNegativeAmount(betTypeObj),
        notice: noticeHelper.invalidBet,
      },
      {
        failure: currentBetTypeTotalAmount + betTypeTotalAmount > maxBetPerType,
        notice: noticeHelper.maxBetForChoice(maxBetPerType),
      },
      {
        failure: betTypeTotalAmount < minBet,
        notice: noticeHelper.minBet(minBet),
      },
      {
        failure: currentTotalAmount + betTypeTotalAmount > maxBet,
        notice: noticeHelper.maxBet(maxBet),
      },
    ];
  }

  composeBetChoiceValidationCriteria(bet) {
    const criterons = [];
    const betType = Object.keys(bet)[0];

    if (this.definition.betTypes.includes(betType)) {
      const choices = Object.keys(bet[betType]);

      criterons.push({
        failure:
          choices.length < 1 || choices.length > constants.maxChoices[betType],
        notice: noticeHelper.invalidBet,
      });
    } else {
      criterons.push({
        failure: true,
        notice: noticeHelper.invalidBet,
      });
    }

    return criterons;
  }

  composeValidationCriteria(player, betChoice) {
    const bettingTimeValidationCriteria = this.composeBettingTimeValidationCriteria();

    const betChoiceValidationCriteria = this.composeBetChoiceValidationCriteria(
      betChoice
    );

    if (betChoiceValidationCriteria.some((x) => x.failure)) {
      return bettingTimeValidationCriteria.concat(betChoiceValidationCriteria);
    }

    const betAmountValidationCriteria = this.composeBetAmountValidationCriteria(
      player,
      betChoice
    );

    return bettingTimeValidationCriteria.concat(
      betAmountValidationCriteria,
      betChoiceValidationCriteria
    );
  }

  validateBetRequest(player, betChoice) {
    if (!betChoice) {
      return false;
    }

    const criteria = this.composeValidationCriteria(player, betChoice);
    const failedCriterion = criteria.find((criterion) => criterion.failure);

    if (failedCriterion) {
      this.publisher.publishToUser(player.UID, {
        endBet: -1,
        notice: failedCriterion.notice,
      });

      return false;
    }

    return true;
  }

  adjustBetTracks(playerName, bet) {
    const { betChoice } = bet;
    const betType = Object.keys(betChoice)[0];

    if (this.gameData.ingame?.[playerName]) {
      const { betTracks } = this.gameData.ingame[playerName];

      if (!betTracks[betType]) {
        betTracks[betType] = {};
      }

      for (const [choice, amountOnChoice] of Object.entries(betChoice[betType])) {
        betTracks[betType][choice] =
          (betTracks[betType][choice] || 0) + amountOnChoice;

        betTracks.totalAmount = (betTracks.totalAmount || 0) + amountOnChoice;
      }
    }
  }

  adjustPayload(payload) {
    const { betChoice } = payload;
    for (const betTypeObj of Object.values(betChoice)) {
      for (const choice of Object.keys(betTypeObj)) {
        betTypeObj[choice] = betTypeObj[choice] >> 0;
      }
    }
  }

  consume(player, payload) {
    this.adjustPayload(payload);

    const { betChoice } = payload;
    const name = player.profile.name;

    if (!this.validateBetRequest(player, betChoice)) {
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
