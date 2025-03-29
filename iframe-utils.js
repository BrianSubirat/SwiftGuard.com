// New file for iframe-related utilities
export function injectClickHandler() {
    const iframes = document.querySelectorAll('iframe[is="x-frame-bypass"]');
    iframes.forEach(iframe => {
        try {
            iframe.onload = function() {
                try {
                    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

                    // Enhanced click handler with more robust URL detection
                    iframeDocument.addEventListener('click', (e) => {
                        const link = e.target.closest('a');
                        if (link && link.href) {
                            const url = link.href;

                            // More comprehensive URL validation
                            if (url && 
                                !url.startsWith('javascript:') && 
                                (url.startsWith('http://') || url.startsWith('https://'))
                            ) {
                                e.preventDefault();
                                window.postMessage({ 
                                    type: 'navigate', 
                                    url: url 
                                }, '*');
                            }
                        }
                    }, true);
                } catch (err) {
                    console.error('Error accessing iframe content:', err);
                }
            };
        } catch (err) {
            console.error('Error setting up iframe listener:', err);
        }
    });
}

export function validateAndNormalizeUrl(url) {
    try {
        // If no protocol, default to https
        if (!/^https?:\/\//i.test(url)) {
            // Check if it looks like a domain
            if (/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(url)) {
                return 'https://' + url;
            }
            // If not a domain, treat as search query
            return `https://www.bing.com/search?q=${encodeURIComponent(url)}`;
        }
        return url;
    } catch {
        return `https://www.bing.com/search?q=${encodeURIComponent(url)}`;
    }
}