import test from "../../fixtures/common";
import { expect } from "@playwright/test";
import { DeviceAction } from "../../models/DeviceAction";
import { Layout } from "../../models/Layout";
import { AccountsPage } from "../../models/AccountsPage";
import { AccountPage } from "../../models/AccountPage";
import { SendModal } from "../../models/SendModal";

test.use({ userdata: "adaAccount" });

test(`ADA send`, async ({ page }) => {
  const deviceAction = new DeviceAction(page);
  const accountsPage = new AccountsPage(page);
  const layout = new Layout(page);
  const accountsPage = new AccountsPage(page);
  const accountPage = new AccountPage(page);
  const sendModal = new SendModal(page);

  await test.step(`Open Account`, async () => {
    // TODO: Remove changelog modal
    await layout.goToAccounts();
    await accountsPage.goToAccount("cardano-2");
  });

  await test.step(`Open send flow`, async () => {
    await accountPage.clickBtnSend();
  });

  await test.step(`Enter recipient adress`, async () => {
    await sendModal.fillRecipient(
      "addr1q98l4af73mer24cm0q0r9p3gryxlhvhu8clc4psmka7zk9mw9wxqpfjrx4jrte8t3h8xjed78ycyklfcf6pwz08hnuvqk6sncd",
    );

    await sendModal.clickBtnContinue();
  });
});
