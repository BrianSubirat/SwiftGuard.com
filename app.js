import { createApp, ref, computed, onMounted, watch } from 'vue';
import BookmarkManager from './bookmarks.js';
import { validateAndNormalizeUrl } from './iframe-utils.js';
import { extractDomain, getFaviconForDomain } from './web-utils.js';
import config from './config.js';
import { 
    openInspectFeature, 
    readAloudText, 
    printCurrentPage 
} from './context-utils.js';

createApp({
    setup() {
        // Tab management
        const tabs = ref([]);
        const currentTabIndex = ref(null);
        const canGoBack = ref(false);
        const canGoForward = ref(false);
        const currentUrl = ref('');
        const searchQuery = ref('');
        const isLoading = ref(false);

        // Predefined shortcuts for the new tab page
        const shortcuts = ref([]);

        // Mock web page database for simulation
        const webPages = {
            'youtube.com': { title: 'YouTube', content: 'Watch videos, subscribe to channels, and more.', color: '#FF0000' },
            'wikipedia.org': { title: 'Wikipedia', content: 'The free encyclopedia that anyone can edit.', color: '#333333' },
            'github.com': { title: 'GitHub', content: 'Where the world builds software.', color: '#24292e' },
            'reddit.com': { title: 'Reddit', content: 'The front page of the internet.', color: '#FF4500' },
            'twitter.com': { title: 'Twitter', content: 'See what\'s happening in the world right now.', color: '#1DA1F2' },
            'netflix.com': { title: 'Netflix', content: 'Watch TV shows and movies online.', color: '#E50914' },
            'amazon.com': { title: 'Amazon', content: 'Shop online for electronics, computers, clothing, and more.', color: '#232F3E' },
            'linkedin.com': { title: 'LinkedIn', content: 'Manage your professional identity and build your network.', color: '#0077B5' }
        };

        // Add a new tab
        const addTab = () => {
            const newTab = {
                title: 'New Tab',
                url: '',
                favicon: `
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <rect width="16" height="16" rx="2" fill="#888"/>
                        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="10">
                            N
                        </text>
                    </svg>
                `, 
                history: [],
                historyIndex: -1,
                content: '',
                backgroundColor: '#FFFFFF',
                loading: false,
                useIframe: false,
                animation: 'fadeIn'
            };
            tabs.value.push(newTab);
            currentTabIndex.value = tabs.value.length - 1;
        };

        // Close a tab
        const closeTab = (index) => {
            tabs.value.splice(index, 1);
            if (tabs.value.length === 0) {
                addTab();
                return;
            }
            if (currentTabIndex.value >= tabs.value.length) {
                currentTabIndex.value = tabs.value.length - 1;
            }
        };

        // Switch to a tab
        const switchTab = (index) => {
            currentTabIndex.value = index;
            if (currentTab.value) {
                currentUrl.value = currentTab.value.url;
            }
        };

        // Enhanced loading state
        const loadingState = ref({
            isLoading: false,
            progress: 0,
            message: 'Connecting...'
        });

        // Simulate loading progress
        const simulateLoading = () => {
            loadingState.value.isLoading = true;
            loadingState.value.progress = 0;
            loadingState.value.message = 'Connecting to website...';

            const steps = [
                { progress: 20, message: 'Establishing connection...' },
                { progress: 40, message: 'Retrieving content...' },
                { progress: 60, message: 'Loading resources...' },
                { progress: 80, message: 'Rendering page...' },
                { progress: 100, message: 'Completed' }
            ];

            let currentStep = 0;
            const progressInterval = setInterval(() => {
                if (currentStep < steps.length) {
                    loadingState.value.progress = steps[currentStep].progress;
                    loadingState.value.message = steps[currentStep].message;
                    currentStep++;
                } else {
                    clearInterval(progressInterval);
                    loadingState.value.isLoading = false;
                }
            }, 500);

            return progressInterval;
        };

        // Navigate to a URL
        const navigate = () => {
            if (currentTab.value) {
                let url = validateAndNormalizeUrl(currentUrl.value.trim());

                if (url) {
                    // Update favicon based on domain
                    const domain = extractDomain(url);
                    currentTab.value.favicon = getFaviconForDomain(domain);

                    // Add to history
                    if (currentTab.value.historyIndex < currentTab.value.history.length - 1) {
                        currentTab.value.history = currentTab.value.history.slice(0, currentTab.value.historyIndex + 1);
                    }
                    currentTab.value.history.push(url);
                    currentTab.value.historyIndex = currentTab.value.history.length - 1;

                    // Update tab properties
                    currentTab.value.url = url;
                    currentTab.value.title = extractDomain(url);

                    // Start loading simulation
                    const loadingInterval = simulateLoading();

                    // Simulate page load
                    setTimeout(() => {
                        clearInterval(loadingInterval);
                        currentTab.value.useIframe = true;
                        currentTab.value.loading = false;
                        loadingState.value.isLoading = false;
                        updateNavigationState();
                    }, 2500);
                }
            }
        };

        // Load content for the page
        const loadPageContent = (url) => {
            try {
                const domain = new URL(url).hostname;
                const mainDomain = domain.split('.').slice(-2).join('.');

                for (const key in webPages) {
                    if (domain.includes(key)) {
                        const page = webPages[key];
                        currentTab.value.title = page.title;
                        currentTab.value.content = page.content;
                        currentTab.value.backgroundColor = page.color;
                        return;
                    }
                }

                // Generic page for unknown URLs
                currentTab.value.title = domain;
                currentTab.value.content = `Welcome to ${domain}`;
                currentTab.value.backgroundColor = '#FFFFFF';
            } catch {
                currentTab.value.title = 'Error';
                currentTab.value.content = 'Invalid URL';
                currentTab.value.backgroundColor = '#FFFFFF';
            }
        };

        // Search function
        const search = () => {
            if (searchQuery.value.trim()) {
                if (currentTabIndex.value === null) {
                    addTab();
                }
                
                // Ensure full URL for search
                currentUrl.value = `https://www.bing.com/search?q=${encodeURIComponent(searchQuery.value)}`;
                currentTab.value.useIframe = true;
                navigate();
            }
        };

        // Navigate to a shortcut URL
        const navigateToShortcut = (url) => {
            if (currentTabIndex.value === null) {
                addTab();
            }
            currentUrl.value = url;
            navigate();
        };

        // Go back in history
        const goBack = () => {
            if (currentTab.value && currentTab.value.historyIndex > 0) {
                currentTab.value.historyIndex--;
                currentTab.value.url = currentTab.value.history[currentTab.value.historyIndex];
                
                const loadingInterval = simulateLoading();

                setTimeout(() => {
                    clearInterval(loadingInterval);
                    loadPageContent(currentTab.value.url);
                    currentUrl.value = currentTab.value.url;
                    loadingState.value.isLoading = false;
                    updateNavigationState();
                }, 2500);
            }
        };

        // Go forward in history
        const goForward = () => {
            if (currentTab.value && currentTab.value.historyIndex < currentTab.value.history.length - 1) {
                currentTab.value.historyIndex++;
                currentTab.value.url = currentTab.value.history[currentTab.value.historyIndex];
                
                const loadingInterval = simulateLoading();

                setTimeout(() => {
                    clearInterval(loadingInterval);
                    loadPageContent(currentTab.value.url);
                    currentUrl.value = currentTab.value.url;
                    loadingState.value.isLoading = false;
                    updateNavigationState();
                }, 2500);
            }
        };

        // Reload the current page
        const reloadPage = () => {
            if (currentTab.value && currentTab.value.url) {
                const loadingInterval = simulateLoading();

                setTimeout(() => {
                    clearInterval(loadingInterval);
                    loadPageContent(currentTab.value.url);
                    loadingState.value.isLoading = false;
                }, 2500);
            }
        };

        // Update navigation buttons state
        const updateNavigationState = () => {
            if (currentTab.value) {
                canGoBack.value = currentTab.value.historyIndex > 0;
                canGoForward.value = currentTab.value.historyIndex < currentTab.value.history.length - 1;
            } else {
                canGoBack.value = false;
                canGoForward.value = false;
            }
        };

        // Current tab computed property
        const currentTab = computed(() => {
            return currentTabIndex.value !== null ? tabs.value[currentTabIndex.value] : null;
        });

        const bookmarkManager = new BookmarkManager();

        const toggleBookmark = () => {
            if (currentTab.value && currentTab.value.url) {
                const url = currentTab.value.url;
                const title = currentTab.value.title;
                const favicon = currentTab.value.favicon;

                if (bookmarkManager.isBookmarked(url)) {
                    bookmarkManager.removeBookmark(url);
                } else {
                    bookmarkManager.addBookmark(url, title, favicon);
                }
            }
        };

        const getBookmarks = () => {
            return bookmarkManager.getAllBookmarks();
        };

        const isCurrentUrlBookmarked = computed(() => {
            return currentTab.value ? bookmarkManager.isBookmarked(currentTab.value.url) : false;
        });

        // Add a new reactive property for showing the landing page
        const showLandingPage = ref(true);

        // Add a method to start the browser and hide the landing page
        const startBrowser = () => {
            showLandingPage.value = false;
            addTab(); // Ensures a tab is opened when starting the browser
        };

        const isMenuOpen = ref(false);
        const achievements = ref({
            vpnUsage: {
                title: 'VPN Master',
                description: 'Use VPN for total browsing privacy',
                progress: 0,
                maxProgress: 10,
                icon: '🌐'
            },
            adBlocking: {
                title: 'Ad Ninja',
                description: 'Block ads and trackers',
                progress: 0,
                maxProgress: 100,
                icon: '🛡️'
            },
            securityTasks: {
                title: 'Security Sentinel',
                description: 'Complete security checkpoints',
                progress: 0,
                maxProgress: 5,
                icon: '🔒'
            }
        });

        const toggleMenu = () => {
            isMenuOpen.value = !isMenuOpen.value;
        };

        const closeMenu = () => {
            isMenuOpen.value = false;
        };

        const activateVPN = () => {
            // Simulate VPN activation
            if (achievements.value.vpnUsage.progress < achievements.value.vpnUsage.maxProgress) {
                achievements.value.vpnUsage.progress++;
            }
            closeMenu();
        };

        const blockAds = () => {
            // Simulate ad blocking
            if (achievements.value.adBlocking.progress < achievements.value.adBlocking.maxProgress) {
                achievements.value.adBlocking.progress += 10;
            }
            closeMenu();
        };

        const checkAchievements = () => {
            // Logic to check and potentially award achievements
            const completedAchievements = Object.values(achievements.value).filter(
                achievement => achievement.progress >= achievement.maxProgress
            );
            return completedAchievements;
        };

        const menuIcons = {
            vpn: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4-3.28 7.39-7 8.57V12H5V6.3l7-3.11v8.8z"/>
                </svg>
            `,
            adBlock: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.82.62-3.49 1.64-4.85L16.85 18.36A7.902 7.902 0 0 1 12 20zm6.36-3.15L7.15 5.64A7.902 7.902 0 0 1 12 4c4.41 0 8 3.59 8 8 0 1.82-.62 3.49-1.64 4.85z"/>
                </svg>
            `,
            privacy: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4-3.28 7.39-7 8.57V12H5V6.3l7-3.11v8.8z"/>
                </svg>
            `,
            security: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm7 10.09c-.33 3.81-2.61 7.11-6 8.66V12h5.81l.19-1.98L12 6.3l-6 2.72V12H3V6.3l9-4.11 9 4.11v4.79z"/>
                </svg>
            `
        };

        // Context Menu Management
        const contextMenuRef = ref(null);
        const contextMenuPosition = ref({ x: 0, y: 0 });
        const isContextMenuVisible = ref(false);

        const showContextMenu = (event) => {
            if (contextMenuRef.value) {
                contextMenuRef.value.style.display = 'block';
                contextMenuRef.value.style.left = `${event.clientX}px`;
                contextMenuRef.value.style.top = `${event.clientY}px`;
                isContextMenuVisible.value = true;
            }
        };

        const hideContextMenu = () => {
            if (contextMenuRef.value) {
                contextMenuRef.value.style.display = 'none';
                isContextMenuVisible.value = false;
            }
        };

        // Context Menu Action Methods
        const scanForMalware = () => {
            // Simulate malware scan
            alert('Scanning for malware... No threats detected.');
            hideContextMenu();
            
            // Increment security achievement
            if (achievements.value.securityTasks.progress < achievements.value.securityTasks.maxProgress) {
                achievements.value.securityTasks.progress++;
            }
        };

        const privacyCheck = () => {
            // Simulate privacy check
            alert('Privacy Check:\n- Tracking protection: Enabled\n- VPN: Not connected\n- Ad blocking: Active');
            hideContextMenu();
        };

        const openInspect = () => {
            if (currentTab.value && currentTab.value.url) {
                const iframe = document.querySelector('iframe');
                if (iframe && iframe.contentDocument) {
                    openInspectFeature(iframe.contentDocument);
                } else {
                    openInspectFeature(document);
                }
                hideContextMenu();
            }
        };

        const readAloud = () => {
            if (currentTab.value && currentTab.value.url) {
                const iframe = document.querySelector('iframe');
                if (iframe && iframe.contentDocument) {
                    readAloudText(iframe.contentDocument);
                } else {
                    readAloudText(document);
                }
                hideContextMenu();
            }
        };

        const printPage = () => {
            if (currentTab.value && currentTab.value.url) {
                printCurrentPage();
                hideContextMenu();
            }
        };

        const smartHighlight = () => {
            // Simulate smart highlight feature
            alert('Smart Highlight activated. Key information will be automatically detected and highlighted.');
            hideContextMenu();
        };

        onMounted(() => {
            window.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'navigate') {
                    if (currentTabIndex.value === null) {
                        addTab();
                    }
                    currentUrl.value = event.data.url;
                    navigate();
                }
            });
        });

        // Initialize with one tab
        // addTab();

        return {
            tabs,
            currentTabIndex,
            currentTab,
            currentUrl,
            searchQuery,
            shortcuts,
            canGoBack,
            canGoForward,
            isLoading,
            addTab,
            closeTab,
            switchTab,
            navigate,
            search,
            navigateToShortcut,
            goBack,
            goForward,
            reloadPage,
            toggleBookmark,
            getBookmarks,
            isCurrentUrlBookmarked,
            loadingState,
            simulateLoading,
            showLandingPage,
            startBrowser,
            isMenuOpen,
            achievements,
            toggleMenu,
            closeMenu,
            activateVPN,
            blockAds,
            checkAchievements,
            contextMenuRef,
            showContextMenu,
            hideContextMenu,
            scanForMalware,
            privacyCheck,
            openInspect,
            readAloud,
            printPage,
            smartHighlight,
            isContextMenuVisible,
            menuIcons
        };
    }
}).mount('#app');