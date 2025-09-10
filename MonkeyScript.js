// ==UserScript==
// @name         Animepahe · Pahe · Kwik (Batch Download)
// @namespace    https://PHCorner.net/
// @version      0.2.4
// @downloadURL  https://raw.githubusercontent.com/Ysilven/animepahe-auto-download-script/main/Animepahe%20%C2%B7%20Pahe%20%C2%B7%20Kwik.js
// @updateURL    https://raw.githubusercontent.com/Ysilven/animepahe-auto-download-script/main/Animepahe%20%C2%B7%20Pahe%20%C2%B7%20Kwik.js
// @description  Auto download script for Animepahe with batch episode range support.
// @author       Arjien Ysilven (modified by ChatGPT)
// @match        https://pahe.win/*
// @match        https://kwik.si/f/*
// @match        https://kwik.si/d/*
// @match        https://kwik.cx/f/*
// @match        https://kwik.cx/d/*
// @match        https://animepahe.ru/*
// @match        https://animepahe.org/*
// @match        https://animepahe.com/*
// @match        https://animepahe.si/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animepahe.ru
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const url = window.location.href;
    let settings = load_settings();
    let enable_script = settings['Enable·Script'] ? true : false;

    // --- Main Script Logic ---
    switch (true) {
        case /animepahe\.(ru|org|com)\/?$/.test(url):
        case /animepahe\.(ru|org|com)(\/\?page=\d+)?$/.test(url):
            menu(1);
            break;
        case /animepahe\.(ru|org|com)\/play\/.+\/.+/.test(url):
            menu(1);
            if (enable_script) {
                script();
            } else {
                console.log('script disabled');
            }
            break;
        case /animepahe\.(ru|org|com)\/anime\/.+/.test(url):
            menu(2);
            // Setup batch UI for anime listing pages
            setupBatchUI();
            break;
        case /pahe\.win\/.+/.test(url):
            pahe_win();
            break;
        case /kwik\.(si|cx)\/f\/.+/.test(url):
            kwik();
            break;
        case /kwik\.(si|cx)\/d\/.+/.test(url): {
            let newUrlLink = url.replace('/d/', '/f/');
            window.location = newUrlLink;
            break;
        }
        default:
            console.log('no matches found for url_link');
    }

    // --- Animepahe Play Page Functions ---
    function clear_selection() {
        let a = document.getElementById('pickDownload');
        let b = a.getElementsByTagName('a');
        for (let i = 0; i < b.length; i++) {
            b[i].style.backgroundColor = '';
            b[i].style.color = '';
        }
    }

    function script() {
        console.log('Animepahe · Pahe · Kwik', 'v0.1.1');

        let index = settings['Resolution·Value'];
        let sub_dub = settings['Subtitle·Dubbed'] ? true : false;
        let resolution_checker = settings['Resolution·Checker'] ? true : false;
        let all_links = settings['All·Links'] ? true : false;
        // enable_script is already checked globally

        let expand_menu = document.getElementById('downloadMenu');
        if (expand_menu && expand_menu.getAttribute('aria-expanded') == 'false') {
            expand_menu.click();
        }

        let pickDownloadDiv = document.getElementById('pickDownload');
        if (!pickDownloadDiv) {
            console.error("Element 'pickDownload' not found.");
            return;
        }
        let b = pickDownloadDiv.querySelectorAll('a');
        let links = Array.from(b).map((link, index) => {
            return {
                index: index + 1,
                href: link.href,
                text: link.textContent
            };
        });

        console.log('resolution·index:', index);

        let text = ['eng']; // Assuming 'eng' means English subtitles, adjust if needed.
        let sub = links.filter(link => {
            return !text.some(t => link.text.toLowerCase().includes(t.toLowerCase()));
        });

        let dub = links.filter(link => {
            return text.some(t => link.text.toLowerCase().includes(t.toLowerCase()));
        });

        let resolutions = { 1: '360p', 2: '720p', 3: '1080p' };
        let res_checker = (sub_dub ? sub : dub).some(link => link.text.toLowerCase().includes(resolutions[index].toLowerCase()));

        if (resolution_checker) {
            if (index > 3 || all_links) {
                play();
            } else {
                if (res_checker) {
                    console.log(`resolution·checker: ${resolutions[index]} · found.`);
                    play();
                } else {
                    console.log(`resolution·checker: ${resolutions[index]} · not found.`);
                    console.log('5 seconds reload.');
                    clear_selection();
                    setTimeout(() => window.location.reload(), 5000);
                }
            }
        } else {
            play();
        }

        function play() {
            function filter(array, resolution) {
                return array.filter(link => link.text.toLowerCase().includes(resolution.toLowerCase()));
            }

            let count = sub_dub ? sub.length : dub.length;
            if (!all_links) {
                let type = sub_dub ? sub : dub;
                let _720p = filter(type, '720p');
                let _1080p = filter(type, '1080p');

                if (count === 1 || index <= 0) {
                    index = 1;
                }
                if (index === 2 && count === 2) {
                    if (_720p.length > 0) {
                        index = _720p[0].index;
                    } else if (_1080p.length > 0) {
                        index = _1080p[0].index;
                    } else {
                        index = 1;
                    }
                }
                if (index === 3 && count === 2) {
                    index = 2;
                }
                if (index > count) {
                    index = count;
                }
            } else {
                if (index > links.length) {
                    index = links.length;
                }
            }

            let index_link, info;
            let type = sub_dub ? sub : dub;
            let data = !all_links ? type : links;
            if (data.length > 0) {
                index_link = data[index - 1].href;
                info = data[index - 1].index + ' · ' + data[index - 1].href + ' · ' + data[index - 1].text;
                console.log(!all_links ? 'auto·resolution: ' + (sub_dub ? 'sub · count: ' + sub.length : 'dub · count: ' + dub.length) : 'all·links · count: ' + links.length);
            } else {
                index_link = null;
            }

            if (index_link === null) {
                console.log('resolution = value? · ' + index + ' · not found.');
                clear_selection();
            } else {
                clear_selection();
                let select = pickDownloadDiv.getElementsByTagName('a')[info[0] - 1];
                select.style.backgroundColor = '#505050';
                select.style.color = 'white';
                console.log(info);

                if (enable_script) {
                    pahe_win_x(index_link);
                } else {
                    console.log('enable script: no');
                }
            }
        }
    }

    // --- Menu and Settings Functions ---
    function menu(type) {
        let li = Object.assign(document.createElement('li'), { className: 'nav-item' }),
            a = Object.assign(li.appendChild(document.createElement('a')), {
                className: 'nav-link',
                textContent: 'menu',
                title: 'Menu',
                onclick: function (e) {
                    e.preventDefault();
                    open_menu();
                }
            });

        // Ensure the navbar exists before appending
        const navbarNav = document.querySelector('.navbar-nav.mr-auto.main-nav');
        if (navbarNav) {
            navbarNav.appendChild(li);
        } else {
            console.warn("Could not find the main navigation bar to append the menu button.");
            // Optionally, try a fallback or skip menu creation
            return;
        }

        create_menu();

        var media = window.matchMedia("(max-width: 1100px)");
        function toggle(e) {
            var menu = document.getElementById('settings_menu');
            if (!menu) return; // Menu might not be created yet
            if (e.matches) {
                menu.style.paddingLeft = '10px';
            } else {
                menu.style.paddingLeft = '0px';
            }
        }
        toggle(media);
        media.addListener(toggle); // This is deprecated but commonly used. For modern browsers, consider 'media.addEventListener('change', toggle)'

        let initialSettings = load_settings();
        if (initialSettings['Expand·Menu']) {
            open_menu();
        }

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Re-create menu and re-apply styles if tab becomes visible
                const existingMenu = document.getElementById('settings_menu');
                if (existingMenu) {
                    existingMenu.remove();
                }
                create_menu();
                if (load_settings()['Expand·Menu']) {
                    open_menu();
                }
                toggle(media);
                media.addListener(toggle);
            }
        });

        function create_menu() {
            let currentSettings = load_settings();
            let menu = document.createElement('div');
            let enable_script_btn = document.createElement('button');
            let minus = document.createElement('button');
            let input = document.createElement('input');
            let plus = document.createElement('button');
            let test_entry = document.createElement('button');
            let info = document.createElement('input');
            let subtitle_dubbed_btn = document.createElement('button');
            let resolution_checker_btn = document.createElement('button');
            let all_links_btn = document.createElement('button');
            let expand_menu_btn = document.createElement('button');

            function settings_button(element, json_value, yes, no) {
                element.innerText = currentSettings[json_value] ? yes : no;
                element.onclick = function () {
                    currentSettings[json_value] = !currentSettings[json_value];
                    element.innerText = currentSettings[json_value] ? yes : no;
                    save_settings(currentSettings);
                    update_display(); // Update display when a toggle button is clicked
                };
            }

            settings_button(enable_script_btn, 'Enable·Script', 'Enable Script · Yes', 'Enable Script · No');
            settings_button(subtitle_dubbed_btn, 'Subtitle·Dubbed', 'Sub · English', 'Dub · English');
            settings_button(resolution_checker_btn, 'Resolution·Checker', 'Resolution Checker · Yes', 'Resolution Checker · No');
            settings_button(all_links_btn, 'All·Links', 'All Links · Yes', 'All Links · No');
            settings_button(expand_menu_btn, 'Expand·Menu', 'Expand Menu · Yes', 'Expand Menu · No');

            minus.innerText = '-';
            minus.style.width = '35px';
            plus.innerText = '+';
            plus.style.width = '35px';
            test_entry.innerText = '↻ Test Entry';
            input.readOnly = true;
            input.value = currentSettings['Resolution·Value'];
            input.id = 'id_input';
            input.style.border = 'none';
            input.style.background = '#202020';
            input.style.borderRadius = '2px';
            input.style.color = '#FFF';
            input.style.width = '35px';
            input.style.height = '35px';
            input.style.textAlign = 'center';
            input.style.fontSize = '12px';
            input.style.margin = '2px 2px 0px -3px';

            info.readOnly = true;
            function info_input() {
                if (!menu.contains(info)) return; // If info input was removed by 'All Links' setting

                switch (currentSettings['Resolution·Value']) {
                    case 1: info.value = '360p'; break;
                    case 2: info.value = '720p'; break;
                    case 3: info.value = '1080p'; break;
                    default: info.value = ''; break;
                }
            }
            info.id = 'info_input';
            info.style.border = 'none';
            info.style.background = '#151515';
            info.style.borderRadius = '2px';
            info.style.color = '#FFF';
            info.style.width = '50px';
            info.style.height = '35px';
            info.style.textAlign = 'center';
            info.style.fontSize = '12px';
            info.style.margin = '0px 5px 0px 0px';

            menu.id = 'settings_menu';
            menu.style.display = 'none'; // Initially hidden
            menu.style.backgroundColor = '#000';
            menu.style.color = '#fff';
            menu.style.minHeight = '10px';
            menu.style.transition = 'all 0.3s ease';

            menu.appendChild(enable_script_btn);
            menu.appendChild(minus);
            menu.appendChild(input);
            menu.appendChild(plus);
            menu.appendChild(test_entry);
            menu.appendChild(info); // Add info input
            menu.appendChild(subtitle_dubbed_btn);
            menu.appendChild(resolution_checker_btn);
            menu.appendChild(all_links_btn);
            menu.appendChild(expand_menu_btn);

            minus.addEventListener('click', function () {
                let currentValue = Number(input.value);
                if (currentValue > 1) {
                    input.value = --currentValue;
                    currentSettings['Resolution·Value'] = currentValue;
                    save_settings(currentSettings);
                }
                update_display();
            });

            plus.addEventListener('click', function () {
                let currentValue = Number(input.value);
                if (currentValue < 15) { // Arbitrary max, adjust if needed
                    input.value = ++currentValue;
                    currentSettings['Resolution·Value'] = currentValue;
                    save_settings(currentSettings);
                }
                update_display();
            });

            resolution_checker_btn.addEventListener('click', () => {
                update_display(); // Update display to reflect changes
            });

            all_links_btn.addEventListener('click', () => {
                update_display(); // Update display to reflect changes
            });

            test_entry.addEventListener('click', () => {
                if (/animepahe\.(ru|org|com)\/play\/.+\/.+/.test(url)) {
                    script();
                    // Small delay to allow script to run before potentially clicking menu again
                    setTimeout(() => {
                        const downloadMenu = document.getElementById('downloadMenu');
                        if (downloadMenu) downloadMenu.click();
                    }, 50);
                } else {
                    console.log('test entry: only available at animepahe.(ru|org|com)/play/xxx');
                }
            });

            function update_display() {
                // Logic for conditionally showing/hiding elements based on settings
                if (currentSettings['Resolution·Checker']) {
                    info.style.backgroundColor = '#202020';
                } else {
                    info.style.backgroundColor = '#101010';
                }

                if (currentSettings['All·Links']) {
                    // Hide resolution-specific controls if 'All Links' is enabled
                    if (menu.contains(info)) menu.removeChild(info);
                    if (menu.contains(subtitle_dubbed_btn)) menu.removeChild(subtitle_dubbed_btn);
                    if (menu.contains(resolution_checker_btn)) menu.removeChild(resolution_checker_btn);
                } else {
                    // Show resolution-specific controls
                    // Ensure elements are added only if they don't exist
                    if (!menu.contains(subtitle_dubbed_btn)) menu.insertBefore(subtitle_dubbed_btn, menu.children[5]); // Adjust index if new elements are added
                    if (Number(input.value) <= 3) {
                        if (!menu.contains(resolution_checker_btn)) menu.insertBefore(resolution_checker_btn, menu.children[6]); // Adjust index
                    } else if (menu.contains(resolution_checker_btn)) {
                        menu.removeChild(resolution_checker_btn);
                    }
                    if (!menu.contains(info)) menu.insertBefore(info, menu.children[5]); // Re-insert info if it was removed
                }
                info_input(); // Update the value of the info input
            }
            update_display(); // Initial call to set up the display correctly

            let main = document.querySelector('.content-wrapper');
            if (main) {
                if (type === 1) { // Animepahe main pages (list, play)
                    menu.className = 'latest-release'; // Or adjust as needed
                    main.insertBefore(menu, main.firstChild);
                } else if (type === 2) { // Animepahe anime detail pages
                    menu.style.position = 'relative';
                    menu.style.maxWidth = '1100px';
                    menu.style.margin = '0 auto';
                    // Insert menu after the 3rd child element in content-wrapper
                    if (main.children.length >= 3) {
                        main.insertBefore(menu, main.children[3]);
                    } else {
                        main.appendChild(menu); // Fallback if structure is unexpected
                    }
                }
            } else {
                console.warn("Could not find '.content-wrapper' to append the settings menu.");
            }


            let buttons = [enable_script_btn, minus, plus, test_entry, subtitle_dubbed_btn, resolution_checker_btn, all_links_btn, expand_menu_btn];
            for (let button of buttons) {
                button.style.backgroundColor = '#101010';
                button.style.color = '#fff';
                button.style.border = 'none';
                button.style.borderRadius = '2px';
                button.style.margin = '0px 5px 5px 0px';
                button.style.padding = '0px 10px 0px 10px';
                button.style.cursor = 'pointer';
                button.style.transition = 'all 0.3s ease';
                button.style.fontSize = '12px';
                button.style.height = '35px';
                button.onmouseover = function () { this.style.backgroundColor = '#252525'; };
                button.onmouseout = function () { this.style.backgroundColor = '#101010'; };
                button.onmousedown = function () { this.style.backgroundColor = '#1a1a1a'; };
                button.onmouseup = function () { this.style.backgroundColor = '#252525'; };
            }
        }

        function open_menu() {
            let menu = document.getElementById('settings_menu');
            if (!menu) return; // Should not happen if create_menu has run
            if (menu.style.display === 'block') {
                menu.style.display = 'none';
            } else {
                menu.style.display = 'block';
            }
        }

        // Helper to add element to menu (not strictly needed with current structure but good practice)
        // function add_element(menuId, elementId, position){
        //     let menu = document.getElementById(menuId);
        //     let element = document.getElementById(elementId);
        //     if (menu && element) {
        //         menu.insertBefore(element, menu.children[position]);
        //     }
        // }
    }

    // --- Settings Management ---
    function load_settings() {
        let settings = localStorage.getItem('animepahe_settings'); // Use a unique key
        if (settings) {
            return JSON.parse(settings);
        } else {
            console.log('loading default settings');
            settings = {
                'Enable·Script': true,
                'Resolution·Value': 2,
                'Subtitle·Dubbed': true,
                'Resolution·Checker': false,
                'All·Links': false,
                'Expand·Menu': false,
            };
            localStorage.setItem('animepahe_settings', JSON.stringify(settings));
            return settings;
        }
    }

    function save_settings(settings) {
        console.log('saving settings');
        localStorage.setItem('animepahe_settings', JSON.stringify(settings));
    }

    // --- Pahe.win Redirect ---
    function pahe_win() {
        const content = document.querySelector('script').textContent;
        const link = content.match(/https?:\/\/[^'"]+/);
        if (link) {
            window.location = link[0];
        } else {
            // Fallback if no link is found
            setInterval(() => window.location.reload(), 3000);
        }
    }

    // --- Kwik Redirect Functions ---
    async function process_link(link) {
        try {
            console.log('fetching link: kwik');
            // Add a timeout to fetch to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            let response = await fetch(link + '/i', { signal: controller.signal });
            clearTimeout(timeoutId); // Clear the timeout if fetch completes

            if (response.redirected) {
                let url = response.url;
                if (url.includes('kwik.')) { // Check for kwik.si or kwik.cx
                    let prefix = url.match(/https:\/\/kwik\.(si|cx)\//);
                    if (prefix) {
                        let split = url.split(prefix[0])[1];
                        return prefix[0] + split;
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching link for kwik:', error);
            // Handle abort signal specifically
            if (error.name === 'AbortError') {
                console.error('Fetch aborted due to timeout.');
            }
        }
        return null; // Return null if an error occurred or no valid URL was found
    }

    var isProcessing = false;
    var retryCount = 0;
    const maxRetries = 3;
    async function pahe_win_x(link) {
        if (isProcessing) return;
        isProcessing = true;
        try {
            let url = await process_link(link);
            if (url) {
                let currentSettings = load_settings();
                let enable_script = currentSettings['Enable·Script'];

                if (enable_script) {
                    console.log('Redirecting to:', url);
                    window.location = url;
                } else {
                    console.log('enable·script: false, not redirecting.');
                }
            } else {
                // If process_link failed or timed out, retry or fall back
                if (retryCount < maxRetries) {
                    retryCount++;
                    console.log(`Retrying to process link ${retryCount}/${maxRetries}...`);
                    setTimeout(() => pahe_win_x(link), 1000 * retryCount); // Exponential backoff for retries
                } else {
                    console.log(`Maximum retries (${maxRetries}) reached. Falling back to original link.`);
                    window.location = link;
                }
            }
        } catch (error) {
            console.error('Unexpected error in pahe_win_x:', error);
            // Fallback on any unexpected error
            window.location = link;
        } finally {
            isProcessing = false;
        }
    }

    function kwik() {
        const form = document.querySelector('form');
        if (form) {
            form.submit();
        } else {
            // Fallback if form is not found
            setInterval(() => window.location.reload(), 3000);
        }
    }

    // --- Batch Download Functions (for Animepahe Anime Pages) ---
    function setupBatchUI() {
        const interval = setInterval(() => {
            // Look for the content-wrapper, which is usually where the episode list is
            const main = document.querySelector('.content-wrapper');
            if (main && main.children.length >= 3) { // Check if the main content area is loaded
                clearInterval(interval);
                createBatchMenu(main);
            }
        }, 300);
    }

    function createBatchMenu(main) {
        const menu = document.createElement('div');
        menu.style.position = 'relative';
        menu.style.background = '#000';
        menu.style.color = '#fff';
        menu.style.padding = '10px';
        menu.style.marginBottom = '10px';
        menu.style.border = '1px solid #222';
        menu.style.borderRadius = '5px';
        menu.style.fontSize = '14px';
        menu.style.zIndex = '9999';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'e.g. 1-3,5,8';
        input.style.marginRight = '10px';
        input.style.padding = '6px';
        input.style.width = '200px';
        input.style.borderRadius = '4px';
        input.style.border = '1px solid #333';
        input.style.background = '#111';
        input.style.color = '#fff';

        const button = document.createElement('button');
        button.innerText = '📥 Batch Download';
        button.style.background = '#101010';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.padding = '8px 12px';
        button.style.cursor = 'pointer';
        button.style.borderRadius = '4px';

        button.onclick = function () {
            const pattern = input.value.trim();
            if (!pattern) {
                alert('Please enter episode numbers or ranges.');
                return;
            }

            const wanted = parsePattern(pattern);
            // Filter for links that are actual play links and have episode numbers
            const links = [...document.querySelectorAll('a')].filter(a =>
                a.href.includes('/play/') && a.textContent.match(/\b\d+\b/)
            );

            const selected = links.filter(a => {
                const match = a.textContent.match(/\b(\d+)\b/);
                return match && wanted.includes(Number(match[1]));
            });

            if (selected.length === 0) {
                alert('❌ No matching episodes found!');
                return;
            }

            if (!confirm(`Open ${selected.length} episode(s) in new tabs?\nThis may trigger popup blockers.`)) {
                return;
            }

            selected.forEach((a, i) => {
                // Open tabs with a small delay to avoid overwhelming the browser/triggering pop-up blockers
                setTimeout(() => {
                    window.open(a.href, '_blank');
                }, i * 500); // 500ms delay between tabs
            });
        };

        const tip = document.createElement('div');
        tip.innerText = '💡 Tip: Use middle-click to open individual episodes. Enter e.g. "1-3,5,8" above.';
        tip.style.marginTop = '10px';
        tip.style.fontSize = '12px';
        tip.style.color = '#ccc';

        menu.appendChild(input);
        menu.appendChild(button);
        menu.appendChild(tip);

        menu.style.maxWidth = '1100px';
        menu.style.margin = '0 auto';
        // Insert the batch menu at a specific position in the main content
        if (main.children.length >= 3) {
            main.insertBefore(menu, main.children[3]);
        } else {
            main.appendChild(menu); // Fallback
        }
    }

    function parsePattern(pattern) {
        const parts = pattern.split(',');
        const episodes = new Set();

        for (const part of parts) {
            if (part.includes('-')) {
                const rangeParts = part.split('-').map(p => p.trim());
                if (rangeParts.length === 2) {
                    const start = parseInt(rangeParts[0], 10);
                    const end = parseInt(rangeParts[1], 10);
                    if (!isNaN(start) && !isNaN(end) && start <= end) {
                        for (let i = start; i <= end; i++) {
                            episodes.add(i);
                        }
                    } else {
                        console.warn(`Invalid range format: ${part}`);
                    }
                } else {
                    console.warn(`Invalid range format: ${part}`);
                }
            } else {
                const num = parseInt(part.trim(), 10);
                if (!isNaN(num)) {
                    episodes.add(num);
                } else {
                    console.warn(`Invalid episode number: ${part}`);
                }
            }
        }
        return [...episodes];
    }
})();

