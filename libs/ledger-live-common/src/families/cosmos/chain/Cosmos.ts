import CosmosBase from "./cosmosBase";
import { getEnv } from "../../../env";

class Cosmos extends CosmosBase {
  lcd: string;
  stakingDocUrl: string;
  unbondingPeriod: number;
  ledgerValidator: string;
  constructor() {
    super();
    this.unbondingPeriod = 21;
    this.lcd = getEnv("API_COSMOS_BLOCKCHAIN_EXPLORER_API_ENDPOINT");
    this.stakingDocUrl =
      "https://support.ledger.com/hc/en-us/articles/360014339340-Earn-Cosmos-ATOM-staking-rewards-in-Ledger-Live?docs=true";
    this.minGasprice = 0.025;
    this.ledgerValidator =
      "cosmosvaloper10wljxpl03053h9690apmyeakly3ylhejrucvtm";
    CosmosBase.COSMOS_FAMILY_LEDGER_VALIDATOR_ADDRESSES.push(
      this.ledgerValidator
    );
  }
}

export default Cosmos;
