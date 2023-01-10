import BigNumber from "bignumber.js";
import { Account, TokenAccount } from "@ledgerhq/types-live";
import { validateAmount, validateRecipient } from "./getTransactionStatus";
import { getTransactionData, getTypedTransaction } from "./transaction";
import { getFeesEstimation, getGasEstimation } from "./api/rpc";
import { Transaction as EvmTransaction } from "./types";
import { findSubAccountById } from "../../account";
import { getEstimatedFees } from "./logic";

export const prepareCoinTransaction = async (
  account: Account,
  typedTransaction: EvmTransaction
): Promise<EvmTransaction> => {
  const estimatedFees = getEstimatedFees(typedTransaction);
  const amount = typedTransaction.useAllAmount
    ? account.balance.minus(estimatedFees)
    : typedTransaction.amount;
  const totalSpent = amount.plus(estimatedFees);
  const protoTransaction = { ...typedTransaction, amount };

  const [recipientErrors] = validateRecipient(account, typedTransaction);
  const [amountErrors] = validateAmount(account, protoTransaction, totalSpent);
  if (Object.keys(amountErrors).length || Object.keys(recipientErrors).length) {
    return typedTransaction;
  }

  const gasLimit = await getGasEstimation(account, protoTransaction);

  return {
    ...protoTransaction,
    amount,
    gasLimit,
  };
};

export const prepareTokenTransaction = async (
  account: Account,
  tokenAccount: TokenAccount,
  typedTransaction: EvmTransaction
): Promise<EvmTransaction> => {
  const amount = typedTransaction.useAllAmount
    ? tokenAccount.balance
    : typedTransaction.amount;
  const protoTransaction = {
    ...typedTransaction,
    amount: new BigNumber(0),
  };
  const [recipientErrors] = validateRecipient(account, protoTransaction);
  const [amountErrors] = validateAmount(tokenAccount, protoTransaction, amount);
  if (Object.keys(amountErrors).length || Object.keys(recipientErrors).length) {
    return typedTransaction;
  }

  const data = getTransactionData({ ...typedTransaction, amount });
  // As we're interacting with a smart contract,
  // it's going to be our real recipient for the tx
  const gasLimit = await getGasEstimation(account, {
    ...typedTransaction,
    recipient: tokenAccount.token.contractAddress,
    data,
  });

  return {
    ...typedTransaction,
    data,
    gasLimit,
  };
};

export const prepareTransaction = async (
  account: Account,
  transaction: EvmTransaction
): Promise<EvmTransaction> => {
  console.warn("prepareTransaction", { transaction });
  const { currency } = account;
  // Get the current network status fees
  const feeData = await getFeesEstimation(currency);
  const subAccount = findSubAccountById(
    account,
    transaction.subAccountId || ""
  );
  const isTokenTransaction = subAccount?.type === "TokenAccount";
  const typedTransaction = getTypedTransaction(transaction, feeData);

  return isTokenTransaction
    ? await prepareTokenTransaction(account, subAccount, typedTransaction)
    : await prepareCoinTransaction(account, typedTransaction);
};

export const prepareForSignOperation = (
  account: Account,
  transaction: EvmTransaction
): EvmTransaction => {
  const subAccount = findSubAccountById(
    account,
    transaction.subAccountId || ""
  );
  const isTokenTransaction = subAccount?.type === "TokenAccount";

  return isTokenTransaction
    ? {
        ...transaction,
        recipient: subAccount.token.contractAddress,
      }
    : transaction;
};
