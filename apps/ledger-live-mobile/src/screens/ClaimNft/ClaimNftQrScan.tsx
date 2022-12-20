import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Linking, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Flex, InfiniteLoader, Text } from "@ledgerhq/native-ui";
import { useTranslation } from "react-i18next";
import { CameraType } from "expo-camera/build/Camera.types";
import { Camera } from "expo-camera";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Svg, Defs, Rect, Mask } from "react-native-svg";
import {
  useIsFocused,
  useRoute,
  useNavigation,
} from "@react-navigation/native";
import { urls } from "../../config/urls";
import FallbackCameraScreen from "../screens/ImportAccounts/FallBackCameraScreen";

const cameraBoxDimensions = {
  width: Dimensions.get("screen").width,
  height: 320,
};

const viewBox = `0 0 ${cameraBoxDimensions.width} ${cameraBoxDimensions.height}`;

const WrappedSvg = () => (
  <Flex
    {...StyleSheet.absoluteFillObject}
    alignItems="center"
    justifyContent="center"
  >
    <Svg {...cameraBoxDimensions} viewBox={viewBox}>
      <Defs>
        <Mask id="qrmask">
          <Rect height="100%" width="100%" fill="#fff" />
          <Rect
            x="50%"
            y="50%"
            height="196"
            width="196"
            transform="translate(-98,-98)"
            fill="#000"
            rx={8}
            ry={8}
          />
        </Mask>
      </Defs>
      <Rect
        x="0%"
        y="0%"
        {...cameraBoxDimensions}
        fill="rgba(54, 54, 54, 0.49)"
        mask="url(#qrmask)"
      />
    </Svg>
  </Flex>
);

const ClaimNftQrScan = () => {
  const { t } = useTranslation();
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const isInFocus = useIsFocused();
  const cameraRef = useRef<Camera>(null);
  const route = useRoute();
  const navigation = useNavigation();
  const [cameraDimensions, setCameraDimensions] = useState<
    | {
        height: number;
        width: number;
      }
    | undefined
  >(Platform.OS === "ios" ? cameraBoxDimensions : undefined);
  const [ratio, setRatio] = useState("1:1");
  useEffect(() => {
    if (Platform.OS === "ios") return;
    cameraRef?.current?.getSupportedRatiosAsync().then(res => {
      const ratio = res[0];
      try {
        const [rh = "1", rw = "1"] = ratio.split(":");
        setCameraDimensions({
          height:
            (cameraBoxDimensions.width * Number.parseInt(rh, 10)) /
            Number.parseInt(rw, 10),
          width: cameraBoxDimensions.width,
        });
        setRatio(ratio);
      } catch (e) {
        setCameraDimensions(cameraBoxDimensions);
      }
    });
  });

  const handleBarCodeScanned = useCallback(({ data }) => {
    try {
      const url = new URL(data);
      const { hostname } = url;
      const code = url.href.substring(url.href.lastIndexOf("/") + 1);
      const deeplink =
        hostname === "staging.claim.ledger.com"
          ? urls.discover.linkDropStaging +
            "?redirectToOnboarding=true&autoClaim=true&code="
          : urls.discover.linkDrop +
            "?redirectToOnboarding=true&autoClaim=true&code=";
      Linking.openURL(deeplink + code);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission?.granted, requestPermission]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <Flex flex={1}>
        <Flex
          backgroundColor="neutral.c40"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
          {...cameraBoxDimensions}
        >
          {isInFocus ? (
            <Camera
              ref={cameraRef}
              type={CameraType.back}
              style={{
                ...cameraDimensions,
                alignSelf: "center",
              }}
              onBarCodeScanned={handleBarCodeScanned}
              barCodeScannerSettings={{
                barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
              }}
              ratio={ratio}
            />
          ) : null}
          {cameraDimensions ? (
            <WrappedSvg />
          ) : (
            <Flex
              {...StyleSheet.absoluteFillObject}
              justifyContent="center"
              bg="constant.black"
            >
              {!permission?.canAskAgain &&
              !permission?.granted &&
              permission?.status === "denied" ? (
                <FallbackCameraScreen route={route} navigation={navigation} />
              ) : (
                <InfiniteLoader />
              )}
            </Flex>
          )}
        </Flex>
        <Flex flex={1} px={7} alignItems="center">
          <Text
            variant="h4"
            fontWeight="semiBold"
            mt={7}
            mb={6}
            textAlign="center"
          >
            {t("claimNft.qrScan.title")}
          </Text>
          <Text color="neutral.c70" textAlign="center">
            {t("claimNft.qrScan.description.1")}
          </Text>
        </Flex>
      </Flex>
    </SafeAreaView>
  );
};

export default ClaimNftQrScan;
