import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";
import type { Account, TokenAccount } from "@ledgerhq/types-live";
import type {
  EvmTransactionEIP1559,
  EvmTransactionLegacy,
  FeeData,
  Transaction as EvmTransaction,
  TransactionRaw as EvmTransactionRaw,
} from "./types";
import {
  formatTransactionStatusCommon as formatTransactionStatus,
  fromTransactionCommonRaw,
  fromTransactionStatusRawCommon as fromTransactionStatusRaw,
  toTransactionCommonRaw,
  toTransactionStatusRawCommon as toTransactionStatusRaw,
} from "../../transaction/common";
import ERC20ABI from "./abis/erc20.abi.json";
import { getAccountUnit } from "../../account";
import { getTransactionCount } from "./api/rpc";
import { formatCurrencyUnit } from "../../currencies";

/**
 * Format the transaction for the CLI
 */
export const formatTransaction = (
  { mode, amount, recipient, useAllAmount }: EvmTransaction,
  account: Account
): string =>
  `
${mode.toUpperCase()} ${
    useAllAmount
      ? "MAX"
      : amount.isZero()
      ? ""
      : " " +
        formatCurrencyUnit(getAccountUnit(account), amount, {
          showCode: true,
          disableRounding: true,
        })
  }${recipient ? `\nTO ${recipient}` : ""}`;

/**
 * Serializer raw to transaction
 */
export const fromTransactionRaw = (
  rawTx: EvmTransactionRaw
): EvmTransaction => {
  const common = fromTransactionCommonRaw(rawTx);
  const tx: Partial<EvmTransaction> = {
    ...common,
    family: rawTx.family,
    mode: rawTx.mode,
    chainId: rawTx.chainId,
    nonce: rawTx.nonce,
    gasLimit: new BigNumber(rawTx.gasLimit),
    feesStrategy: rawTx.feesStrategy,
    type: Number(rawTx.type), // if rawTx.type is undefined, transaction will be considered legacy and therefore type 0
  };

  if (rawTx.data) {
    tx.data = Buffer.from(rawTx.data, "hex");
  }

  if (rawTx.gasPrice) {
    tx.gasPrice = new BigNumber(rawTx.gasPrice);
  }

  if (rawTx.maxFeePerGas) {
    tx.maxFeePerGas = new BigNumber(rawTx.maxFeePerGas);
  }

  if (rawTx.maxPriorityFeePerGas) {
    tx.maxPriorityFeePerGas = new BigNumber(rawTx.maxPriorityFeePerGas);
  }

  return tx as EvmTransaction;
};

/**
 * Serializer transaction to raw
 */
export const toTransactionRaw = (tx: EvmTransaction): EvmTransactionRaw => {
  const common = toTransactionCommonRaw(tx);
  const txRaw: Partial<EvmTransactionRaw> = {
    ...common,
    family: tx.family,
    mode: tx.mode,
    chainId: tx.chainId,
    nonce: tx.nonce,
    gasLimit: tx.gasLimit.toFixed(),
    feesStrategy: tx.feesStrategy,
    type: tx.type,
  };

  if (tx.data) {
    txRaw.data = Buffer.from(tx.data).toString("hex");
  }

  if (tx.gasPrice) {
    txRaw.gasPrice = tx.gasPrice?.toFixed();
  }

  if (tx.maxFeePerGas) {
    txRaw.maxFeePerGas = tx.maxFeePerGas?.toFixed();
  }

  if (tx.maxPriorityFeePerGas) {
    txRaw.maxPriorityFeePerGas = tx.maxPriorityFeePerGas?.toFixed();
  }

  return txRaw as EvmTransactionRaw;
};

/**
 * Create an unsigned transaction from a Ledger Live transaction.
 * Usually called "buildTransaction"
 */
export const transactionToUnsignedTransaction = async (
  account: Account,
  tx: EvmTransaction
): Promise<EvmTransaction> => {
  const { currency, freshAddress } = account;
  const nonce = await getTransactionCount(currency, freshAddress);

  return {
    ...tx,
    nonce,
  };
};

export const getTransactionData = (
  transaction: EvmTransaction
): Buffer | undefined => {
  const contract = new ethers.utils.Interface(ERC20ABI);
  console.warn("transaction.amount", transaction.amount.toFixed());
  const data = contract.encodeFunctionData("transfer", [
    transaction.recipient,
    transaction.amount.toFixed(),
  ]);

  console.warn({ data });

  return data ? Buffer.from(data.slice(2), "hex") : undefined;
};

export const getTypedTransaction = (
  transaction: EvmTransaction,
  feeData: FeeData
): EvmTransaction => {
  // If the blockchain is supporting EIP-1559, use maxFeePerGas & maxPriorityFeePerGas
  if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
    delete transaction.gasPrice;
    return {
      ...transaction,
      maxFeePerGas: feeData.maxFeePerGas || undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
      type: 2,
    } as EvmTransactionEIP1559;
  }

  // Else just use a legacy transaction
  delete transaction.maxFeePerGas;
  delete transaction.maxPriorityFeePerGas;
  return {
    ...transaction,
    gasPrice: feeData.gasPrice || new BigNumber(0),
    type: 0,
  } as EvmTransactionLegacy;
};

export default {
  formatTransaction,
  fromTransactionRaw,
  toTransactionRaw,
  toTransactionStatusRaw,
  transactionToUnsignedTransaction,
  formatTransactionStatus,
  fromTransactionStatusRaw,
};
