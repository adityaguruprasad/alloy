import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import createNetworkLogger from "../../helpers/networkLogger";
import orgMainConfigMain from "../../helpers/constants/configParts/orgMainConfigMain";
import reloadPage from "../../helpers/reloadPage";
import flushPromiseChains from "../../helpers/flushPromiseChains";
import cookies from "../../helpers/cookies";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const { ADOBE2_IN } = require("../../helpers/constants/consent");
const { MAIN_CONSENT_COOKIE_NAME } = require("../../helpers/constants/cookies");

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C1472436: Set-consent is called when consent cookie is missing even though consent is the same",
  requestHooks: [
    networkLogger.setConsentEndpointLogs,
    networkLogger.edgeInteractEndpointLogs
  ]
});

test.meta({
  ID: "C1472436",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

const configuration = {
  defaultConsent: "pending",
  debugEnabled: true,
  ...orgMainConfigMain
};

test("C1472436: Set-consent is called when consent cookie is missing even though consent is the same", async () => {
  // set consent to in
  const alloy = createAlloyProxy();
  await alloy.configure(configuration);
  await alloy.setConsent(ADOBE2_IN);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  // delete consent cookie, and reload
  await reloadPage();
  await cookies.remove(MAIN_CONSENT_COOKIE_NAME);
  await alloy.configure(configuration);

  // try to send an event, but it should be queued
  const sendEventResponse = await alloy.sendEventAsync();
  await flushPromiseChains();
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(0);

  // set the consent to IN
  await alloy.setConsent(ADOBE2_IN);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(2);

  // make sure the event goes out
  await sendEventResponse.result;
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(1);
});
