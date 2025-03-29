export function extractDomain(url) {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname.replace('www.', '');
    } catch {
        return 'Unknown';
    }
}

export function getFaviconForDomain(domain) {
    const faviconDatabase = {
        'google.com': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M12 11v2h2v2H9v-4h3zm10 4.5c0 4.142-3.358 7.5-7.5 7.5S7 19.642 7 15.5c0-4.142 3.358-7.5 7.5-7.5h7.5v7.5z"/>
            <path fill="#34A853" d="M12 7.5c-4.142 0-7.5 3.358-7.5 7.5H9v-3h3V7.5z"/>
            <path fill="#FBBC05" d="M4.5 12c0-4.142 3.358-7.5 7.5-7.5V9H9v3H4.5z"/>
            <path fill="#EA4335" d="M12 4.5v3h3v3h-3V7.5H9v-3h3z"/>
        </svg>`,
        // Add more domain-specific favicons here
    };

    return faviconDatabase[domain] || `
        <svg width="16" height="16" viewBox="0 0 16 16">
            <rect width="16" height="16" rx="2" fill="#888"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="10">
                ${domain.charAt(0).toUpperCase()}
            </text>
        </svg>
    `;
}