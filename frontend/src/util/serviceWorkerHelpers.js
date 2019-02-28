export const defaultPath = {
    controller: "Home",
    action: "Index"
};

export function generateLink(from) {
    // no service worker support currently
    return `#${from}`;
}

export function getPath() {
    // no service worker support currently
    return window.location.hash.substr(1);
}

export function getCurrentPage() {
    const path = getPath();

    if (path === "/") return defaultPath;

    const parsedUrl = /^\/([a-z_-]+)(?:\/([a-z_-]+)\/?)?$/i.exec(path);

    if (parsedUrl === null) return {
        controller: "Error",
        action: "400"
    };

    return {
        controller: parsedUrl[1] || "Home",
        action: parsedUrl[2] || "Index"
    };
}

export function initUrl() {
    if (window.location.hash.length < 2) window.location.hash = "/";
}