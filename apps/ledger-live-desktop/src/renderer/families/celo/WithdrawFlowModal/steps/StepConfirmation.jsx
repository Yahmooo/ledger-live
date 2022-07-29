// @flow

import React from "react";
import { Trans } from "react-i18next";
import { withTheme } from "styled-components";
import { SyncOneAccountOnMount } from "@ledgerhq/live-common/bridge/react/index";
import TrackPage from "~/renderer/analytics/TrackPage";
import { multiline } from "~/renderer/styles/helpers";
import Box from "~/renderer/components/Box";
import Button from "~/renderer/components/Button";
import RetryButton from "~/renderer/components/RetryButton";
import ErrorDisplay from "~/renderer/components/ErrorDisplay";
import SuccessDisplay from "~/renderer/components/SuccessDisplay";
import BroadcastErrorDisclaimer from "~/renderer/components/BroadcastErrorDisclaimer";
import { setDrawer } from "~/renderer/drawers/Provider";
import { OperationDetails } from "~/renderer/drawers/OperationDetails";
import * as S from "./StepConfirmation.styles";
import type { StepProps } from "../types";

export const StepConfirmationFooter = ({
  account,
  parentAccount,
  onRetry,
  error,
  onClose,
  optimisticOperation,
}: StepProps) => {
  return (
    <Box horizontal alignItems="right">
      <Button data-test-id="modal-close-button" ml={2} onClick={onClose}>
        <Trans i18nKey="common.close" />
      </Button>
      {optimisticOperation ? (
        <Button
          primary
          ml={2}
          event="Withdraw Flow Step 3 View OpD Clicked"
          onClick={() => {
            onClose();
            if (account && optimisticOperation) {
              setDrawer(OperationDetails, {
                operationId: optimisticOperation.id,
                accountId: account.id,
                parentId: parentAccount && parentAccount.id,
              });
            }
          }}
        >
          <Trans i18nKey="celo.withdraw.steps.confirmation.success.cta" />
        </Button>
      ) : error ? (
        <RetryButton primary ml={2} onClick={onRetry} />
      ) : null}
    </Box>
  );
};

const StepConfirmation = ({
  t,
  transaction,
  optimisticOperation,
  error,
  signed,
}: StepProps & { theme: * }) => {
  if (optimisticOperation) {
    return (
      <S.Container>
        <TrackPage category="Celo Withdraw" name="Step Confirmed" />
        <SyncOneAccountOnMount priority={10} accountId={optimisticOperation.accountId} />
        <SuccessDisplay
          title={<Trans i18nKey="celo.withdraw.steps.confirmation.success.title" />}
          description={multiline(
            t("celo.withdraw.steps.confirmation.success.text", {
              resource: transaction && transaction.resource && transaction.resource.toLowerCase(),
            }),
          )}
        />
      </S.Container>
    );
  }

  if (error) {
    return (
      <S.Container shouldSpace={signed}>
        <TrackPage category="Celo Withdraw" name="Step Confirmation Error" />
        {signed ? (
          <BroadcastErrorDisclaimer
            title={<Trans i18nKey="celo.withdraw.steps.confirmation.broadcastError" />}
          />
        ) : null}
        <ErrorDisplay error={error} withExportLogs />
      </S.Container>
    );
  }

  return null;
};

export default withTheme(StepConfirmation);