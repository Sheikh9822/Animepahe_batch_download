
# Animepahe · Pahe · Kwik (Batch Download) Userscript

![Animepahe Logo](https://www.google.com/s2/favicons?sz=64&domain=animepahe.ru)

An intelligent Tampermonkey/Greasemonkey script designed to streamline the anime downloading experience on Animepahe, Pahe.win, and Kwik.si/Kwik.cx by automating redirects and offering advanced batch download capabilities.

## Table of Contents

*   [Features](#features)
*   [Usage](#usage)
    *   [General Flow](#general-flow)
    *   [Settings Menu](#settings-menu)
    *   [Automated Download (Play Page)](#automated-download-play-page)
    *   [Batch Download (Anime Detail Page)](#batch-download-anime-detail-page)
*   [Settings Explained](#settings-explained)
*   [How it Works](#how-it-works)
*   [Supported Domains](#supported-domains)
*   [Troubleshooting](#troubleshooting)
*   [Contribution & Support](#contribution--support)
*   [Disclaimer](#disclaimer)

---

## Features

This userscript significantly enhances the Animepahe download process with the following features:

*   **Automated Redirection:** Automatically navigates through `pahe.win` and `kwik.si`/`kwik.cx` redirect pages to initiate the direct download link.
*   **Intelligent Resolution Selection:** Prioritizes your preferred video quality (360p, 720p, 1080p) or a specific link order.
*   **Subtitle/Dubbed Preference:** Choose whether to automatically select English Subtitled or English Dubbed versions.
*   **Resolution Checker:** Optionally reloads the page if your preferred resolution is not immediately available, waiting for it to load.
*   **Batch Download Functionality:** On an anime's main page, specify a range of episodes (e.g., `1-5, 7, 10-12`) to open all corresponding download pages in new tabs simultaneously, enabling mass downloads.
*   **User-Friendly Settings Menu:** A persistent menu on Animepahe pages allows you to customize script behavior on the fly.
*   **`All Links` Option:** Toggle this to prioritize the raw link order on the download page, bypassing resolution/sub/dub preferences.
*   **Auto-Update:** The script automatically checks for and applies updates from the GitHub repository.


## Usage

### General Flow

When visiting an Animepahe episode page (e.g., `animepahe.ru/play/...), the script will:

1.  Automatically expand the download menu.
2.  Select the appropriate download link based on your configured preferences (resolution, sub/dub).
3.  Redirect you through `pahe.win` (if the chosen link is a `pahe.win` one).
4.  Redirect you to `kwik.si` or `kwik.cx`.
5.  On `kwik.si`/`kwik.cx`, automatically submit the form to initiate the download.

### Settings Menu

A "menu" button will appear in the navigation bar of Animepahe pages. Clicking it will reveal the script's settings panel.

The menu might appear in different locations depending on the page type:
*   **Play Page / Home Page:** Top-left, below the Animepahe logo.
*   **Anime Detail Page:** Below the anime details, before the episode list.

### Automated Download (Play Page)

1.  Navigate to any Animepahe episode play page (e.g., `https://animepahe.ru/play/xyz/123`).
2.  Ensure the "Enable Script" setting is `Yes` in the script's menu.
3.  The script will automatically attempt to select and redirect to your preferred download link.
4.  If the "Resolution Checker" is enabled and your desired resolution isn't found, the page will reload after 5 seconds to re-attempt.

### Batch Download (Anime Detail Page)

This feature is available on an anime's main detail page (e.g., `https://animepahe.ru/anime/xyz`).

1.  Go to the Animepahe page for an anime series.
2.  You will see a "Batch Download" input field and button inserted into the page layout.
3.  **Enter episode numbers or ranges** into the input field using commas for separation and hyphens for ranges.
    *   **Examples:**
        *   `1,2,3` - Downloads episodes 1, 2, and 3.
        *   `1-5` - Downloads episodes 1 through 5.
        *   `1-3,5,8` - Downloads episodes 1, 2, 3, 5, and 8.
4.  Click the "📥 Batch Download" button.
5.  A confirmation dialog will appear, showing how many episodes will be opened. Confirm to proceed.
6.  Each selected episode's download page will open in a new tab with a small delay between them (to prevent browser overwhelming/popup blockers). The script will then handle the auto-redirection and download initiation for each tab.
7.  **Note:** Your browser's pop-up blocker might interfere. You may need to allow pop-ups for `animepahe.ru` or temporarily disable the blocker.

## Settings Explained

Access these settings via the "menu" button on Animepahe pages.

*   **Enable Script:**
    *   `Yes`: The script is active and will attempt to automate downloads and redirects.
    *   `No`: The script's core automation (redirects) is disabled, though the menu and batch download UI will still appear.
*   **Resolution Value:**
    *   `1`: Prefers 360p links.
    *   `2`: Prefers 720p links (Default).
    *   `3`: Prefers 1080p links.
    *   `>3`: If "All Links" is off, behaves like `1`. If "All Links" is on, it targets the Nth link in the list. (e.g., `4` targets the 4th link presented).
*   **Sub · English / Dub · English:**
    *   `Sub · English`: Prefers subtitle (original audio) links. (Default)
    *   `Dub · English`: Prefers dubbed (English audio) links.
*   **Resolution Checker:**
    *   `Yes`: If your chosen `Resolution Value` (1, 2, or 3) is not found among the available links, the page will reload after 5 seconds to check again. Useful if links load dynamically or are sometimes delayed.
    *   `No`: The script will proceed with the best available link based on other settings, even if your preferred resolution is missing. (Default)
*   **All Links:**
    *   `Yes`: The script will ignore `Subtitle/Dubbed` and `Resolution Checker` settings and simply select the link at the `Resolution Value` index from *all* available links on the page, regardless of their resolution or language label.
    *   `No`: The script will first filter links by `Subtitle/Dubbed` preference, then try to find the `Resolution Value` within that filtered set, respecting `Resolution Checker`. (Default)
*   **Expand Menu:**
    *   `Yes`: The settings menu will be open by default when you load an Animepahe page.
    *   `No`: The settings menu will be closed by default, and you'll need to click "menu" to open it. (Default)
*   **↻ Test Entry:**
    *   Clicking this button will re-run the download automation logic on the current page. Useful for testing settings changes without reloading the entire page. Only active on Animepahe play pages.

## How it Works

The script operates by monitoring the URL of the current page and applying specific functions based on the domain:

1.  **Animepahe Play Page (`/play/...`):**
    *   The `script()` function is executed.
    *   It reads your saved preferences (resolution, sub/dub, checker, all links).
    *   It inspects the download links available on the page (`#pickDownload`).
    *   Based on your settings, it identifies the target link.
    *   It then calls `pahe_win_x()` to initiate the redirection process.

2.  **Pahe.win Redirect Page (`pahe.win/...`):**
    *   The `pahe_win()` function is triggered.
    *   It extracts the direct Kwik.si/Kwik.cx link embedded in the page's script.
    *   It immediately redirects the browser to this extracted Kwik link.

3.  **Kwik.si / Kwik.cx Page (`kwik.si/f/...` or `kwik.cx/f/...`):**
    *   The `kwik()` function is activated.
    *   It locates the hidden form that triggers the download and programmatically submits it, bypassing the need to click "Continue" or "Download".

4.  **Kwik.si / Kwik.cx `/d/` redirect (`kwik.si/d/...` or `kwik.cx/d/...`):**
    *   If you land on a `/d/` URL, the script simply changes it to `/f/` and redirects, as the `/f/` page is where the form submission is required.

5.  **Animepahe Anime Detail Page (`/anime/...`):**
    *   The `setupBatchUI()` function adds the batch download input field and button to the page.
    *   When the "Batch Download" button is clicked, `parsePattern()` converts the user's input (e.g., "1-3,5") into a list of desired episode numbers.
    *   It then finds all episode links on the page that match the desired numbers and opens each one in a new tab, allowing the auto-download logic to take over in each new tab.

## Supported Domains

The script is active on the following domains:

*   `https://animepahe.ru/*`
*   `https://animepahe.org/*`
*   `https://animepahe.com/*`
*   `https://pahe.win/*`
*   `https://kwik.si/*`
*   `https://kwik.cx/*`

## Troubleshooting

*   **Script not working/No redirects:**
    *   **Check Tampermonkey/Greasemonkey:** Ensure the extension is enabled and the `Animepahe · Pahe · Kwik` script is toggled ON.
    *   **Browser Console:** Open your browser's developer console (F12) and check the "Console" tab for any error messages. These can provide clues.
    *   **Script Enabled Setting:** Make sure "Enable Script" is set to `Yes` in the script's menu on Animepahe.
    *   **Domain Match:** Confirm you are on one of the [supported domains](#supported-domains).
    *   **Website Changes:** Animepahe, Pahe.win, and Kwik can change their site structure. If a major change happens, the script might break. Check the GitHub repository for updates.

*   **Browser warns about pop-ups or blocks new tabs for Batch Download:**
    *   This is expected behavior. You will need to allow pop-ups for `animepahe.ru` in your browser's site settings, or temporarily disable your pop-up blocker.

*   **Downloads the wrong resolution/language:**
    *   Check your `Resolution Value` and `Subtitle/Dubbed` settings in the script's menu.
    *   If "All Links" is enabled, it overrides these preferences, so ensure it's set correctly for your desired behavior.

*   **Page reloads constantly (especially on Animepahe play page):**
    *   This usually happens if `Resolution Checker` is `Yes` and your preferred resolution is repeatedly not found.
    *   Try setting `Resolution Checker` to `No`, or adjust your `Resolution Value` to a more common resolution (e.g., 720p).

*   **Script updates:**
    *   Tampermonkey/Greasemonkey usually check for updates automatically. You can also manually check for updates via your userscript manager's dashboard.

## Contribution & Support

This script was originally created by Arjien Ysilven and modified by Gemini to add features like batch downloading and refined settings.

## Disclaimer

This script automates interactions with third-party websites. Use at your own risk. The author(s) are not responsible for any issues that may arise from its use, including but not limited to, website changes, blocked access, or compliance with any website's terms of service.
