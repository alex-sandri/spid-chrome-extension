let activeServices = {};

chrome.tabs.onUpdated.addListener(async (_, __, tab) => {
  const services = await fetch(chrome.runtime.getURL('data/services.json'))
    .then(response => response.json());

  const { hostname } = new URL(tab.url);

  const segments = hostname.split('.').reverse();

  let lastServiceMatch = { ...services };

  for (const segment of segments) {
    const temp = lastServiceMatch[segment];

    if (temp === undefined) {
      lastServiceMatch = {};

      break;
    }

    lastServiceMatch = temp;
  }

  if (typeof lastServiceMatch.url !== 'string') {
    return;
  }

  activeServices[tab.id] = lastServiceMatch;

  await chrome.action.setBadgeText({ tabId: tab.id, text: '1' });
});

chrome.action.onClicked.addListener(async tab => {
  let service = activeServices[tab.id];

  if (service === undefined) {
    return;
  }

  await chrome.tabs.update({ url: service.url });
});

