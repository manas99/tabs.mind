import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
    manifest_version: 3,
    name: "tabs.mind",
    version: "0.1.0",
    description: "Semantic search for your browsing history.",
    action: {
        default_popup: "src/popup/index.html",
        default_icon: {
            "512": "src/assets/icons/icon512.png",
        },
    },
    icons: { "512": "src/assets/icons/icon512.png" },
    background: {
        service_worker: "src/background/index.ts",
        type: "module",
    },
    content_scripts: [
        {
            matches: ["<all_urls>"],
            js: ["src/content/index.ts"],
            run_at: "document_idle",
        },
    ],
    permissions: [
        "storage",
        "scripting",
        "tabs",
        "activeTab",
        "alarms",
        "contextMenus",
        "webNavigation",
        "idle",
    ],
    host_permissions: ["<all_urls>"],
});
