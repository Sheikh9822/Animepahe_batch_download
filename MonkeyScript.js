// ==UserScript==
// @name         Animepahe · Pahe · Kwik (Batch Download) - Original UI + Safe Fixes
// @namespace    https://PHCorner.net/
// @version      0.3.2
// @downloadURL  https://example.invalid/Animepahe%20%C2%B7%20Pahe%20%C2%B7%20Kwik.js
// @updateURL    https://example.invalid/Animepahe%20%C2%B7%20Pahe%20%C2%B7%20Kwik.js
// @description  Original UI preserved. Safe fixes for kwik/thum.io redirects, pahe.win extraction, and robustness improvements. Does NOT bypass protected hosts or captchas.
// @author       Arjien Ysilven (modified by ChatGPT & AI)
// @match        https://pahe.win/*
// @match        https://kwik.si/f/*
// @match        https://kwik.si/d/*
// @match        https://kwik.cx/f/*
// @match        https://kwik.cx/d/*
// @match        https://animepahe.ru/*
// @match        https://animepahe.org/*
// @match        https://animepahe.com/*
// @match        https://animepahe.si/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animepahe.si
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Preserve original UI, but integrate safe fixes.
    const url = window.location.href;
    let settings = load_settings();
    let enable_script = !!settings['Enable·Script'];

    // --- DOM helpers ---
    function $q(sel, root = document) { try { return root.querySelector(sel); } catch (e) { return null; } }
    function $qa(sel, root = document) { try { return Array.from(root.querySelectorAll(sel)); } catch (e) { return []; } }

    // --- Routing (same logic as original) ---
    const animepaheDomainRegex = /animepahe\.(ru|org|com|si)/i;

    switch (true) {
        case animepaheDomainRegex.test(url) && (url.endsWith('/') || url.includes('?page=')):
            menu(1);
            break;
        case animepaheDomainRegex.test(url) && url.includes('/play/'):
            menu(1);
            if (enable_script) {
                script();
            } else {
                console.log('Script is disabled by settings.');
            }
            break;
        case animepaheDomainRegex.test(url) && url.includes('/anime/'):
            menu(2);
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
            console.log('No matches found for URL.');
    }

    // --- Original clear_selection (preserve UI) ---
    function clear_selection() {
        let a = document.getElementById('pickDownload');
        if (!a) return;
        let b = a.getElementsByTagName('a');
        for (let i = 0; i < b.length; i++) {
            b[i].style.backgroundColor = '';
            b[i].style.color = '';
        }
    }

    // --- Play page script (modernized internals, original UI preserved) ---
    function script() {
        console.log('Animepahe · Pahe · Kwik', 'v0.3.2');

        let index = settings['Resolution·Value'];
        let sub_dub = settings['Subtitle·Dubbed'];
        let resolution_checker = settings['Resolution·Checker'];
        let all_links = settings['All·Links'];

        let expand_menu = document.getElementById('downloadMenu');
        if (expand_menu && expand_menu.getAttribute('aria-expanded') == 'false') {
            try { expand_menu.click(); } catch (e) { /* ignore */ }
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
                text: link.textContent ? link.textContent.trim() : ''
            };
        });

        console.log('Resolution index:', index);

        let sub = links.filter(link => !link.text.toLowerCase().includes('eng-dub'));
        let dub = links.filter(link => link.text.toLowerCase().includes('eng-dub'));

        let resolutions = { 1: '360p', 2: '720p', 3: '1080p' };
        let res_checker = (sub_dub ? sub : dub).some(link => link.text.toLowerCase().includes(resolutions[index] ? resolutions[index].toLowerCase() : ''));

        if (resolution_checker) {
            if (index > 3 || all_links) {
                play();
            } else {
                if (res_checker) {
                    console.log(`Resolution checker: ${resolutions[index]} found.`);
                    play();
                } else {
                    console.log(`Resolution checker: ${resolutions[index]} not found. Reloading in 5 seconds.`);
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
                console.log(!all_links ? 'Auto resolution: ' + (sub_dub ? 'sub · count: ' + sub.length : 'dub · count: ' + dub.length) : 'All links · count: ' + links.length);
            } else {
                index_link = null;
            }

            if (index_link === null) {
                console.log(`Resolution value ${index} not found.`);
                clear_selection();
            } else {
                clear_selection();
                let select = pickDownloadDiv.getElementsByTagName('a')[data[index - 1].index - 1];
                if (select) {
                    select.style.backgroundColor = '#505050';
                    select.style.color = 'white';
                }
                console.log(info);

                if (enable_script) {
                    pahe_win_x(index_link);
                } else {
                    console.log('Script is disabled, not redirecting.');
                }
            }
        }
    }

    // --- Menu and Settings Functions (original UI preserved) ---
    function menu(type) {
        let li = Object.assign(document.createElement('li'), { className: 'nav-item' });
        let a = Object.assign(li.appendChild(document.createElement('a')), {
            className: 'nav-link',
            textContent: 'menu',
            title: 'Menu',
            onclick: function (e) {
                e.preventDefault();
                open_menu();
            }
        });

        const navbarNav = document.querySelector('.navbar-nav.mr-auto.main-nav');
        if (navbarNav) {
            navbarNav.appendChild(li);
        } else {
            console.warn("Could not find the main navigation bar to append the menu button.");
            return;
        }

        create_menu();

        var media = window.matchMedia("(max-width: 1100px)");
        function toggle(e) {
            var menu = document.getElementById('settings_menu');
            if (!menu) return;
            if (e.matches) {
                menu.style.paddingLeft = '10px';
            } else {
                menu.style.paddingLeft = '0px';
            }
        }
        toggle(media);
        if (media.addListener) media.addListener(toggle);

        let initialSettings = load_settings();
        if (initialSettings['Expand·Menu']) {
            open_menu();
        }

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                const existingMenu = document.getElementById('settings_menu');
                if (existingMenu) {
                    existingMenu.remove();
                }
                create_menu();
                if (load_settings()['Expand·Menu']) {
                    open_menu();
                }
                toggle(media);
                if (media.addListener) media.addListener(toggle);
            }
        });

        function create_menu() {
            let currentSettings = load_settings();
            let menu = document.createElement('div');
            menu.id = 'settings_menu';
            menu.style.display = 'none';
            menu.style.backgroundColor = '#000';
            menu.style.color = '#fff';
            menu.style.minHeight = '10px';
            menu.style.transition = 'all 0.3s ease';

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
                    update_display();
                };
            }

            settings_button(enable_script_btn, 'Enable·Script', 'Enable Script · Yes', 'Enable Script · No');
            settings_button(subtitle_dubbed_btn, 'Subtitle·Dubbed', 'Sub · English', 'Dub · English');
            settings_button(resolution_checker_btn, 'Resolution·Checker', 'Resolution Checker · Yes', 'Resolution Checker · No');
            settings_button(all_links_btn, 'All·Links', 'All Links · Yes', 'All Links · No');
            settings_button(expand_menu_btn, 'Expand·Menu', 'Expand Menu · Yes', 'Expand Menu · No');

            minus.innerText = '-';
            plus.innerText = '+';
            test_entry.innerText = '⮞ Test Entry';

            input.readOnly = true;
            input.value = currentSettings['Resolution·Value'];
            input.id = 'id_input';
            input.style.cssText = 'border:none;background:#202020;border-radius:2px;color:#FFF;width:35px;height:35px;text-align:center;font-size:12px;margin:2px 2px 0px -3px;';

            info.readOnly = true;
            info.id = 'info_input';
            info.style.cssText = 'border:none;background:#151515;border-radius:2px;color:#FFF;width:50px;height:35px;text-align:center;font-size:12px;margin:0px 5px 0px 0px;';

            function info_input_update() {
                if (!menu.contains(info)) return;
                switch (currentSettings['Resolution·Value']) {
                    case 1: info.value = '360p'; break;
                    case 2: info.value = '720p'; break;
                    case 3: info.value = '1080p'; break;
                    default: info.value = 'Other'; break;
                }
            }

            menu.append(enable_script_btn, minus, input, plus, test_entry, info, subtitle_dubbed_btn, resolution_checker_btn, all_links_btn, expand_menu_btn);

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
                if (currentValue < 15) {
                    input.value = ++currentValue;
                    currentSettings['Resolution·Value'] = currentValue;
                    save_settings(currentSettings);
                }
                update_display();
            });

            test_entry.addEventListener('click', () => {
                if (animepaheDomainRegex.test(url) && url.includes('/play/')) {
                    script();
                    setTimeout(() => {
                        const downloadMenu = document.getElementById('downloadMenu');
                        if (downloadMenu) downloadMenu.click();
                    }, 50);
                } else {
                    console.log('Test entry: only available at animepahe/play/xxx.');
                }
            });

            function update_display() {
                if (currentSettings['Resolution·Checker']) {
                    info.style.backgroundColor = '#202020';
                } else {
                    info.style.backgroundColor = '#101010';
                }

                // Conditionally show/hide elements
                if (currentSettings['All·Links']) {
                    subtitle_dubbed_btn.style.display = 'none';
                    resolution_checker_btn.style.display = 'none';
                } else {
                    subtitle_dubbed_btn.style.display = 'inline-block';
                    resolution_checker_btn.style.display = (Number(input.value) <= 3) ? 'inline-block' : 'none';
                }
                info_input_update();
            }
            update_display();

            let main = document.querySelector('.content-wrapper');
            if (main) {
                if (type === 1) {
                    menu.className = 'latest-release';
                    main.insertBefore(menu, main.firstChild);
                } else if (type === 2) {
                    menu.style.position = 'relative';
                    menu.style.maxWidth = '1100px';
                    menu.style.margin = '0 auto';
                    if (main.children.length >= 3) {
                        main.insertBefore(menu, main.children[3]);
                    } else {
                        main.appendChild(menu);
                    }
                }
            } else {
                console.warn("Could not find '.content-wrapper' to append the settings menu.");
            }

            let buttons = [enable_script_btn, minus, plus, test_entry, subtitle_dubbed_btn, resolution_checker_btn, all_links_btn, expand_menu_btn];
            buttons.forEach(button => {
                button.style.cssText = 'background:#101010;color:#fff;border:none;border-radius:2px;margin:0 5px 5px 0;padding:0 10px;cursor:pointer;transition:all 0.3s ease;font-size:12px;height:35px;';
                button.onmouseover = function () { this.style.backgroundColor = '#252525'; };
                button.onmouseout = function () { this.style.backgroundColor = '#101010'; };
                button.onmousedown = function () { this.style.backgroundColor = '#1a1a1a'; };
                button.onmouseup = function () { this.style.backgroundColor = '#252525'; };
            });
        }

        function open_menu() {
            let menu = document.getElementById('settings_menu');
            if (!menu) return;
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }
    }

    // --- Settings Management (original logic) ---
    function load_settings() {
        let settings = localStorage.getItem('animepahe_settings');
        if (settings) {
            try {
                return JSON.parse(settings);
            } catch (e) {
                console.warn('Failed to parse saved settings, resetting to defaults.', e);
            }
        }
        console.log('Loading default settings');
        settings = {
            'Enable·Script': true,
            'Resolution·Value': 2,
            'Subtitle·Dubbed': true,
            'Resolution·Checker': false,
            'All·Links': false,
            'Expand·Menu': false,
        };
        try { localStorage.setItem('animepahe_settings', JSON.stringify(settings)); } catch (e) { /* ignore */ }
        return settings;
    }

    function save_settings(settings) {
        console.log('Saving settings');
        try { localStorage.setItem('animepahe_settings', JSON.stringify(settings)); } catch (e) { console.error('Failed to save settings', e); }
    }

    // --- Pahe.win Redirect (improved extraction) ---
    function pahe_win() {
        // Try to find kwik link inside scripts (robust search)
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            try {
                const content = scripts[i].textContent || '';
                // match kwik.si or kwik.cx links used by pahe.win
                const match = content.match(/https?:\/\/kwik\.(?:si|cx)\/[fd]\/[A-Za-z0-9_-]{6,}/i);
                if (match && match[0]) {
                    window.location.href = match[0];
                    return;
                }
            } catch (e) { /* ignore malformed scripts */ }
        }

        console.log("No redirect link found on pahe.win. Will retry a few times then reload.");

        // Sometimes the link is injected after a delay; retry a few times
        let attempts = 0;
        const id = setInterval(() => {
            attempts++;
            for (let i = 0; i < scripts.length; i++) {
                try {
                    const content = scripts[i].textContent || '';
                    const match = content.match(/https?:\/\/kwik\.(?:si|cx)\/[fd]\/[A-Za-z0-9_-]{6,}/i);
                    if (match && match[0]) {
                        clearInterval(id);
                        window.location.href = match[0];
                        return;
                    }
                } catch (e) {}
            }
            if (attempts > 8) {
                clearInterval(id);
                console.warn('pahe.win: giving up after multiple attempts.');
                // fallback: reload occasionally to see if dynamic content appears
                setInterval(() => window.location.reload(), 3000);
            }
        }, 700);
    }

    // --- Kwik Redirect Functions (safe) ---
    // Use HEAD + manual redirect to avoid thum.io thumbnails and detect kwik redirects safely.
    async function process_link(link) {
        try {
            console.log('Fetching link: kwik (HEAD, manual redirect)');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            // HEAD prevents some hosts from returning large bodies; redirect: "manual" prevents auto-following
            let response = await fetch(link + '/i', { method: 'HEAD', redirect: 'manual', signal: controller.signal });
            clearTimeout(timeoutId);

            // Get Location header, if present
            const location = response.headers.get('location') || response.headers.get('Location') || null;
            if (!location) {
                console.warn('process_link: no Location header present.');
                return null;
            }

            // Reject thum.io/image.thum.io hijacks
            if (location.includes('thum.io') || location.includes('image.thum.io')) {
                console.warn('Blocked thum.io redirect:', location);
                return null;
            }

            // Accept only kwik domains for auto-redirect safety
            if (!/kwik\.(si|cx)/i.test(location)) {
                console.warn('Unexpected redirect target domain; ignoring:', location);
                return null;
            }

            return location;
        } catch (error) {
            if (error && error.name === 'AbortError') {
                console.warn('process_link: request timed out.');
            } else {
                console.error('Error fetching kwik link:', error);
            }
            return null;
        }
    }

    async function pahe_win_x(link) {
        try {
            let url = await process_link(link);
            let enable_script_local = load_settings()['Enable·Script'];

            if (url && enable_script_local) {
                console.log('Redirecting to:', url);
                window.location.href = url;
            } else if (!url) {
                console.log('Could not process kwik link safely. Navigating to the original link for manual handling.');
                window.location.href = link;
            } else {
                console.log('Script disabled, not redirecting.');
            }
        } catch (error) {
            console.error('Unexpected error in pahe_win_x:', error);
            window.location.href = link;
        }
    }

    function kwik() {
        const form = document.querySelector('form');
        if (form) {
            try {
                form.submit();
            } catch (e) {
                console.warn("Auto-submit of kwik form failed; user interaction may be required.", e);
                // Do not attempt to bypass protections; let user click if needed.
            }
        } else {
            console.log("No form found on kwik page. Reloading.");
            setInterval(() => window.location.reload(), 3000);
        }
    }

    // --- Batch Download Functions (original UI preserved) ---
    function setupBatchUI() {
        const interval = setInterval(() => {
            const main = document.querySelector('.content-wrapper');
            if (main && main.children.length >= 3) {
                clearInterval(interval);
                createBatchMenu(main);
            }
        }, 300);
    }

    function createBatchMenu(main) {
        const menu = document.createElement('div');
        menu.style.cssText = 'position:relative;background:#000;color:#fff;padding:10px;margin-bottom:10px;border:1px solid #222;border-radius:5px;font-size:14px;z-index:9999;max-width:1100px;margin:0 auto;';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'e.g. 1-3,5,8';
        input.style.cssText = 'margin-right:10px;padding:6px;width:200px;border-radius:4px;border:1px solid #333;background:#111;color:#fff;';

        const button = document.createElement('button');
        button.innerText = '✨ Batch Download';
        button.style.cssText = 'background:#101010;color:#fff;border:none;padding:8px 12px;cursor:pointer;border-radius:4px;';

        button.onclick = function () {
            const pattern = input.value.trim();
            if (!pattern) {
                alert('Please enter episode numbers or ranges.');
                return;
            }

            const wanted = parsePattern(pattern);
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
                setTimeout(() => {
                    window.open(a.href, '_blank');
                }, i * 500);
            });
        };

        const tip = document.createElement('div');
        tip.innerText = '💡 Tip: Use middle-click to open individual episodes. Enter e.g. "1-3,5,8" above.';
        tip.style.cssText = 'margin-top:10px;font-size:12px;color:#ccc;';

        menu.append(input, button, tip);

        if (main.children.length >= 3) {
            main.insertBefore(menu, main.children[3]);
        } else {
            main.appendChild(menu);
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

