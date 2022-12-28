import { device, expect } from "detox";
import PortfolioPage from "../models/wallet/portfolioPage";
import SettingsPage from "../models/settings/settingsPage";
import GeneralSettingsPage from "../models/settings/generalSettingsPage";
import { loadConfig } from "../bridge/server";
import { delay } from "../helpers";

let portfolioPage: PortfolioPage;
let settingsPage: SettingsPage;
let generalSettingsPage: GeneralSettingsPage;

describe("Change Language", () => {
  beforeAll(async () => {
    await loadConfig("1AccountBTC1AccountETH", true);
    portfolioPage = new PortfolioPage();
    settingsPage = new SettingsPage();
    generalSettingsPage = new GeneralSettingsPage();
  });

  it("should go to Settings", async () => {
    await portfolioPage.navigateToSettings();
  });

  it("should go navigate to General settings", async () => {
    await settingsPage.navigateToGeneralSettings();
  });

  it("Settings page should be in English", async () => {
    await expect(generalSettingsPage.isEnglish()).toBeVisible();
  });

  it("should open language selection page", async () => {
    await generalSettingsPage.navigateToLanguageSelect();
  });

  it("should select French", async () => {
    await generalSettingsPage.selectFrenchLanguage();
  });

  it("Settings page should be in French", async () => {
    await expect(generalSettingsPage.isFrench()).toBeVisible();
  });
});
