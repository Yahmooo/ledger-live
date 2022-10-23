import React from "react";
import { getAccountUnit } from "@ledgerhq/live-common/account/index";
import { Text } from "@ledgerhq/native-ui";
import { useTheme } from "@react-navigation/native";
import { Trans } from "react-i18next";
import { View } from "react-native";
import BigNumber from "bignumber.js";

import CurrencyUnitValue from "../../../../../../../../../components/CurrencyUnitValue";
import FirstLetterIcon from "../../../../../../../../../components/FirstLetterIcon";
import Touchable from "../../../../../../../../../components/Touchable";
import Circle from "../../../../../../../../../components/Circle";
import LedgerLogo from "../../../../../../../../../icons/LiveLogo";

import { ledger } from "../../../../../../../constants";

import type { ItemPropsType } from "./types";

import styles from "./styles";

/*
 * Handle the component declaration.
 */

const Item = (props: ItemPropsType) => {
  const { colors } = useTheme();
  const { onSelect, item, account } = props;
  const name = item.identity.name || item.contract;

  /*
   * Return the rendered component.
   */

  return (
    <Touchable
      event="DelegationFlowChosevalidator"
      onPress={() => onSelect(item)}
      eventProperties={{
        validatorName: name,
      }}
    >
      <View style={styles.validator}>
        <Circle crop={true} size={32}>
          {ledger === item.contract ? (
            <LedgerLogo size={32 * 0.7} color={colors.text} />
          ) : (
            <FirstLetterIcon
              label={name || "-"}
              round={true}
              size={32}
              fontSize={24}
            />
          )}
        </Circle>

        <View style={styles.validatorBody}>
          <Text
            numberOfLines={1}
            fontWeight="semiBold"
            style={styles.validatorName}
          >
            {name}
          </Text>

          <Text
            fontWeight="semiBold"
            numberOfLines={1}
            style={styles.overdelegated}
          >
            <Trans i18nKey="elrond.delegation.commission" />
            {` ${Number(item.serviceFee) / 100}%`}
          </Text>
        </View>

        <Text
          fontWeight="semiBold"
          numberOfLines={1}
          style={styles.validatorYield}
          color="smoke"
        >
          <Text fontWeight="semiBold" numberOfLines={1}>
            <CurrencyUnitValue
              showCode={true}
              unit={getAccountUnit(account)}
              value={new BigNumber(item.totalActiveStake)}
            />
          </Text>
        </Text>
      </View>
    </Touchable>
  );
};

export default Item;
