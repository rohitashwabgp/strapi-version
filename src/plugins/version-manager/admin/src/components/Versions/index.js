import React, { useCallback, useEffect, useState, memo } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import _ from "lodash";
import { useIntl } from "react-intl";
import { Box } from "@strapi/design-system/Box";
import { Stack } from "@strapi/design-system/Stack";
import { Divider } from "@strapi/design-system/Divider";
import { Select, Option } from "@strapi/design-system/Select";
import { Typography } from "@strapi/design-system/Typography";
import { useCMEditViewDataManager, useNotification } from "@strapi/helper-plugin";
import { Button } from "@strapi/design-system/Button";
import moment from "moment";
import { request } from "@strapi/helper-plugin";
import { getTrad } from "../../utils";
import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog';
import { Flex } from "@strapi/design-system/Flex";
import ExclamationMarkCircle from "@strapi/icons/ExclamationMarkCircle";

const Versions = () => {
  const { formatMessage } = useIntl();
  const { push, replace } = useHistory();
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  const version = params.version;
  const { initialData, modifiedData, isCreatingEntry, slug, hasDraftAndPublish, layout, isDuplicatingEntry } = useCMEditViewDataManager();
  const toggleNotification = useNotification();
  if (!_.get(layout, "pluginOptions.versions.versioned", false)) {
    return null;
  }

  const { path } = useRouteMatch();
  const [data, setData] = useState([]);
  const [publishedVersion, setPublishedVersion] = useState(undefined);
  const [isSuccessfullyActivated, setIsSuccessfullyActivated] = useState(undefined);
  const [isSuccessfullySaved, setIsSuccessfullySaved] = useState(undefined);
  const [activationMessage, setActivationMessage] = useState(undefined);
  const [saveMessage, setSaveMessage] = useState(undefined);
  const [selectedVersion, setSelectedVersion] = useState(version ? version : String(initialData.versionNumber));
  const [isPublishedErrorDialogVisible, setIsPublishedErrorDialogVisible] = useState(false);
  useEffect(() => processVersions(initialData), []);
  const processVersions = useCallback(async () => {
    await listAllVersions();
    if (hasDraftAndPublish) {
      const publishedVersions = data.filter((v) => v.publishedAt);
      if (data.publishedAt) {
        publishedVersions.push({ versionNumber: data.versionNumber, publishedAt: data.publishedAt });
      }
      const publishedVersion = _.maxBy(publishedVersions, (v) => v.versionNumber);
      setPublishedVersion(publishedVersion);
    }
  }, [_, hasDraftAndPublish, data, publishedVersion]);


  const listAllVersions = useCallback(async () => {
    if (initialData && initialData.id) {
      const versionData = await request(`/version-manager/${slug}/${initialData.id}`, { method: "GET" });
      const versions = (versionData || []).map((v) => ({
        id: Number(v.contentId),
        versionNumber: v.versionNumber,
        label: `v${v.versionNumber}`,
        publishedAt: v.publishedAt,
        createdAt: v.createdAt,
      }));
      const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
      setData(sortedVersions);
    }
  }, [data, onSaveClick]);

  const onSaveClick = useCallback(async () => {
    try {
      await request(`/version-manager/${slug}/save`, { method: "POST", body: modifiedData });
      setSaveMessage("Saved Succesfully . Please Activate to use. At a time only one version will be activated . ")
      setIsSuccessfullySaved(true);
      await listAllVersions();
      // replace({ pathname: `${path.replace(/:id\s*$/,initialData.id)}?version=${initialData.versionNumber}`});
    } catch (e) {
      const name = _.get(e, "response.payload.error.name");
      const message = _.get(e, "response.payload.error.message");
      setSaveMessage("Save failed. ")
      setIsSuccessfullySaved(true);
      let notificationMessage = "Error";
      if (name && message) {
        notificationMessage = `${name}: ${message}`;
      }
      toggleNotification({ type: "warning", message: notificationMessage });
    }
  }, [modifiedData, push, request, slug, saveMessage, isSuccessfullySaved]);


  const onChangeSelectedVersion = (value) => {
    if (path.includes("singleType")) {
      replace({ pathname: `${path.replace(/:id\s*$/, initialData.id)}?version=${value}&contentId=${initialData.id}` });
      window.location.reload(false);
    } else {
      replace({ pathname: `${path.replace(/:id\s*$/, initialData.id)}?version=${value}` });
    }
    setSelectedVersion(value);
  }


  const checkPublishedAndActivate = async () => {
    if (modifiedData.publishedAt) {
      setIsPublishedErrorDialogVisible(true);
    } else {
      await onActivateClick();
    }
  };

  const onActivateClick = useCallback(async () => {
    try {
      if (selectedVersion && data && data.length > 0) {
        let requestPayload = data.find((v) => Number(v.versionNumber) === Number(selectedVersion));
        const result = await request(`/version-manager/${slug}/activate`, { method: "PUT", body: requestPayload });
        setActivationMessage("Activation Success.");
        setIsSuccessfullyActivated(true);
        replace({ pathname: `${path.replace(/:id\s*$/, initialData.id)}` });
        setIsPublishedErrorDialogVisible(false);
      }
    } catch (e) {
      setActivationMessage("Activation Failed.");
      setIsSuccessfullyActivated(true);
      const name = _.get(e, "response.payload.error.name");
      const message = _.get(e, "response.payload.error.message");
      let notificationMessage = "Error";
      if (name && message) {
        notificationMessage = `${name}: ${message}`;
      }
      toggleNotification({ type: "warning", message: notificationMessage });
    }
  }, [push, request, slug, data, activationMessage, isSuccessfullyActivated, selectedVersion]);

  return (
    <Box as="aside" aria-labelledby="versioning-informations" background="neutral0"
      borderColor="neutral150" hasRadius paddingBottom={4} paddingLeft={4}
      paddingRight={4} paddingTop={6} shadow="tableShadow" >
      <Typography variant="sigma" textColor="neutral600" id="versioning-informations">
        {formatMessage({ id: getTrad("components.Edit.versions"), defaultMessage: "Versions" })}
      </Typography>
      <Box paddingTop={2} paddingBottom={6}>
        <Divider />
      </Box>

      <Stack size={4}>
        {publishedVersion && (
          <div>
            <Typography fontWeight="bold">
              {formatMessage({ id: getTrad("containers.Edit.currentPublishedVersion"), defaultMessage: "Published version" })}
            </Typography>
            <div>
              <Typography variant="pi">{`v${publishedVersion.versionNumber}`}</Typography>{" "}
              <Typography variant="pi" color="Neutral600">
                {moment(publishedVersion.publishedAt).format("MMM D, YYYY HH:mm")}
              </Typography>
            </div>
          </div>
        )}
        {!isCreatingEntry && (
          <div style={{ marginBottom: 20 }}>
            <Typography fontWeight="bold">
              {formatMessage({
                id: getTrad("containers.Edit.currentShowedVersion"),
                defaultMessage: "Currently shown version",
              })}
            </Typography>
            <div>
              <Typography variant="pi">v{initialData.versionNumber}</Typography>{" "}
              <Typography variant="pi" textColor="neutral600">
                {moment(initialData.createdAt).format("MMM D, YYYY HH:mm")}
              </Typography>
            </div>
          </div>
        )}
        {!isDuplicatingEntry && data.length > 0 && (
          <Select name={"version-select"} placeholder={formatMessage({ id: getTrad("components.Edit.versionSelectPlaceholder"), defaultMessage: "Select version" })}
            label={formatMessage({ id: getTrad("components.Edit.versionChangeVersion"), defaultMessage: "Change to version" })}
            onChange={onChangeSelectedVersion} value={selectedVersion} >
            {data.map((option) => (
              <Option key={option.versionNumber} value={option.versionNumber}
                startIcon={
                  <div style={{ height: "6px", borderRadius: "50%", width: "6px", background: option.publishedAt ? "rgb(50, 128, 72)" : "rgb(12, 117, 175)" }} />} >
                {`${option.label} ${moment(option.createdAt).format("MMM D, YYYY HH:mm")}`}
              </Option>
            ))}
          </Select>
        )}
        <Dialog onClose={() => setIsPublishedErrorDialogVisible(false)} title="Confirmation" isOpen={isPublishedErrorDialogVisible}>
          <DialogBody icon={<ExclamationMarkCircle />}>
            <Stack spacing={2}>
              <Flex justifyContent="center">
                <Typography id="confirm-description"> Published content type. Are you sure you want to activate this version?</Typography>
              </Flex>
            </Stack>
          </DialogBody>
          <DialogFooter startAction={<Button onClick={() => setIsPublishedErrorDialogVisible(false)} variant="tertiary">
            Cancel
          </Button>} endAction={<Button variant="danger-light" onClick={onActivateClick}>
            Confirm
          </Button>} />
        </Dialog>
        <Dialog onClose={() => setIsSuccessfullyActivated(false)} title="Confirmation" isOpen={isSuccessfullyActivated}>
          <DialogBody icon={<ExclamationMarkCircle />}>
            <Stack spacing={2}>
              <Flex justifyContent="center">
                <Typography id="confirm-description"> {activationMessage} </Typography>
              </Flex>
            </Stack>
          </DialogBody>
          <DialogFooter endAction={<Button variant="Primary-500" onClick={() => setIsSuccessfullyActivated(false)}>
            OK
          </Button>} />
        </Dialog>
        <Dialog onClose={() => setIsSuccessfullySaved(false)} title="Confirmation" isOpen={isSuccessfullySaved}>
          <DialogBody icon={<ExclamationMarkCircle />}>
            <Stack spacing={2}>
              <Flex justifyContent="center">
                <Typography id="confirm-description"> {saveMessage} </Typography>
              </Flex>
            </Stack>
          </DialogBody>
          <DialogFooter endAction={<Button variant="Primary-500" onClick={() => setIsSuccessfullySaved(false)}>
            OK
          </Button>} />
        </Dialog>
        <Button variant="secondary" fullWidth onClick={onSaveClick} disabled={!modifiedData.id}>
          {formatMessage({ id: getTrad("containers.Edit.buttonSave"), defaultMessage: "Save new version" })}
        </Button>

        <Button variant="secondary" fullWidth onClick={checkPublishedAndActivate} disabled={!modifiedData.id || !selectedVersion}>
          {formatMessage({ id: getTrad("containers.Activate.buttonSave"), defaultMessage: "Activate version" })}
        </Button>
      </Stack>
    </Box>
  );
};

export default memo(Versions);
