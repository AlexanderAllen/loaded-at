/// <reference types="chrome-types" />

function app () {
    chrome.tabs.onActivated.addListener(tabListener);
}

/**
 * Update the UI components of the extension.
 *
 * https://stackoverflow.com/a/3552493/467453
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 *
 * @param {number} tabId
 * @param {number} timestamp
 */
function updateUI (tabId: number, timestamp: number) {
    const date = new Date(timestamp);
    // '6:42 in the morning Eastern Standard Time'
    const longTime = Intl.DateTimeFormat('en', { hour: 'numeric', dayPeriod: 'long', hourCycle: 'h12', hour12: true, minute: 'numeric', timeZoneName: 'long'}).format(date);
    const longDate = Intl.DateTimeFormat('en', { dateStyle: 'long', hourCycle: 'h12', hour12: true}).format(date);
    const shortTime = Intl.DateTimeFormat('en', { hour: 'numeric', hourCycle: 'h12', hour12: true, minute: 'numeric'}).format(date).slice(0, 4);

    chrome.action.setBadgeText({tabId: tabId, text: shortTime});
    chrome.action.setTitle({tabId: tabId, title: `Loaded on ${longDate} at ${longTime}`})
}

/**
 * Searches History API for given tabID.
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
 * https://developer.chrome.com/docs/extensions/reference/tabs/#method-get
 *
 * @param {number} tabId
 */
async function tabListener ({tabId}: {tabId: number}) {

    // Get the current tab URL to query History API.
    let tab = await chrome.tabs.get(tabId);
    const { id, title, url = '' } = tab;

    // Query History API.
    const query = {
        maxResults: 10,
        text: url
    };
    const HistoryItems = await chrome.history.search(query);
    if (HistoryItems == undefined) {
        return;
    }

    // Destructure each search result until a URL match is found.
    for (let {lastVisitTime = 0, title: historyTitle, url: historyUrl} of HistoryItems) {
        if (url === historyUrl) {
            updateUI(tabId, lastVisitTime);
            break;
        }
    }

}

export { app };