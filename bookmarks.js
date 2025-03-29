// Bookmark management module
export default class BookmarkManager {
    constructor() {
        this.bookmarks = this.loadBookmarks();
    }

    // Load bookmarks from localStorage
    loadBookmarks() {
        const savedBookmarks = localStorage.getItem('browser_bookmarks');
        return savedBookmarks ? JSON.parse(savedBookmarks) : [];
    }

    // Save bookmarks to localStorage
    saveBookmarks() {
        localStorage.setItem('browser_bookmarks', JSON.stringify(this.bookmarks));
    }

    // Add a new bookmark
    addBookmark(url, title, favicon) {
        // Check if bookmark already exists
        if (!this.isBookmarked(url)) {
            this.bookmarks.push({
                url,
                title,
                favicon,
                dateAdded: new Date().toISOString()
            });
            this.saveBookmarks();
            return true;
        }
        return false;
    }

    // Remove a bookmark
    removeBookmark(url) {
        const index = this.bookmarks.findIndex(bookmark => bookmark.url === url);
        if (index !== -1) {
            this.bookmarks.splice(index, 1);
            this.saveBookmarks();
            return true;
        }
        return false;
    }

    // Check if a URL is bookmarked
    isBookmarked(url) {
        return this.bookmarks.some(bookmark => bookmark.url === url);
    }

    // Get all bookmarks
    getAllBookmarks() {
        return this.bookmarks;
    }
}