import _ from 'lodash';
import {Promise} from 'bluebird';

const VALID_W3C_CAPS = [
  'platformName',
  'browserName',
  'browserVersion',
  'acceptInsecureCerts',
  'pageLoadStrategy',
  'proxy',
  'setWindowRect',
  'timeouts',
  'unhandledPromptBehavior',
];

export function addVendorPrefixes(caps) {
  return caps.map((cap) => {
    // if we don't have a valid unprefixed cap or a cap with an existing prefix, update it
    if (
      !_.isUndefined(cap.name) &&
      !VALID_W3C_CAPS.includes(cap.name) &&
      !_.includes(cap.name, ':')
    ) {
      cap.name = `appium:${cap.name}`;
    }
    return cap;
  });
}

export function pixelsToPercentage(px, maxPixels) {
  if (!isNaN(px)) {
    return parseFloat(((px / maxPixels) * 100).toFixed(1), 10);
  }
}

export function percentageToPixels(pct, maxPixels) {
  if (!isNaN(pct)) {
    return Math.round(maxPixels * (pct / 100));
  }
}

// Extracts element coordinates from its properties.
// Depending on the platform, this is contained either in the 'bounds' property,
// or the 'x'/'y'/'width'/'height' properties
export function parseCoordinates(element) {
  const {bounds, x, y, width, height} = element.attributes || {};

  if (bounds) {
    const boundsArray = bounds.split(/\[|\]|,/).filter((str) => str !== '');
    const [x1, y1, x2, y2] = boundsArray.map((val) => parseInt(val, 10));
    return {x1, y1, x2, y2};
  } else if (x) {
    const originsArray = [x, y, width, height];
    const [xInt, yInt, widthInt, heightInt] = originsArray.map((val) => parseInt(val, 10));
    return {x1: xInt, y1: yInt, x2: xInt + widthInt, y2: yInt + heightInt};
  } else {
    return {};
  }
}

export function downloadFile(href, filename) {
  let element = document.createElement('a');
  element.setAttribute('href', href);
  element.setAttribute('download', filename);
  element.style.display = 'none';

  document.body.appendChild(element);
  element.click();

  document.body.removeChild(element);
}

export async function readTextFromUploadedFiles(fileList) {
  const fileReaderPromise = fileList.map((file) => {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = (event) =>
        resolve({
          fileName: file.name,
          content: event.target.result,
        });
      reader.onerror = (error) => {
        resolve({
          name: file.name,
          error: error.message,
        });
      };
      reader.readAsText(file);
    });
  });
  return await Promise.all(fileReaderPromise);
}
