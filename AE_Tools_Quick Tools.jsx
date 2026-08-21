/*
  AE Animation Library 2026
  Dockable ScriptUI panel to copy/save/apply animation templates across layers.
*/
(function AnimationLibrary2026(thisObj) {
    var TOOL_MODE = resolveToolMode();
    var SCRIPT_NAME = resolveScriptDisplayName(TOOL_MODE);
    var LIB_VERSION = "1.0.0";
    var FILE_NAME = "animation_templates.json";
    var QUICK_CONFIG_FILE = "quick_actions_config.json";
    var EPSILON = 0.0001;
    var PREVIEW_LOOP_MS = 900;
    var PREVIEW_TICK_MS = 33;
    var PRESET_COLUMNS = 1;
    var PRESET_GRID_GAP = 4;
    var PRESET_CARD_HEIGHT = 58;
    var PRESET_CARD_MIN_WIDTH = 56;
    var PRESET_CARD_DEFAULT_WIDTH = 96;
    var FEATURED_PRESET_HEIGHT = 44;
    var PRESET_VIEWPORT_HEIGHT = 360;
    var HOVER_BORDER_GREEN = [0.8078, 1.0, 0.0, 1.0]; // #CEFF00
    var QUICK_BTN_FILL = [0.0431, 0.0510, 0.0706, 1.0]; // #0b0d12
    var QUICK_BTN_BORDER = [0.2275, 0.2471, 0.2902, 1.0]; // #3a3f4a
    var QUICK_BTN_TEXT = [0.8471, 0.8588, 0.8824, 1.0]; // #d8dbe1
    var QUICK_BTN_HOVER_FILL = [0.1765, 0.2196, 0.0039, 1.0]; // #2D3801
    var QUICK_BTN_HOVER_BORDER = [0.8078, 1.0, 0.0, 1.0]; // #CEFF00
    var QUICK_BTN_HOVER_TEXT = [1.0, 1.0, 1.0, 1.0];
    var QUICK_BTN_RADIUS = 8;
    var QUICK_BTN_FONT_SIZE = 12;
    var QUICK_SAVE_ICON_FALLBACK_PATH = "/Users/yuno/Codex/AE Save animation/icons/Infity-120x120.png";
    var QUICK_SAVE_ICON_HOVER_FALLBACK_PATH = "/Users/yuno/Codex/AE Save animation/icons/Infity-120x120_hover.png";
    var QUICK_PINGPONG_ICON_FALLBACK_PATH = "/Users/yuno/Codex/AE Save animation/icons/pinpong-120x120.png";
    var QUICK_CLONE_ICON_FALLBACK_PATH = "/Users/yuno/Codex/AE Save animation/icons/clone_160x160-normal.png";
    var QUICK_CLONE_ICON_HOVER_FALLBACK_PATH = "/Users/yuno/Codex/AE Save animation/icons/clone_160x160-hover.png";
    var QUICK_MARKER_ICON_FALLBACK_PATH = "/Users/yuno/Codex/AE Save animation/icons/marker_normal.png";
    var QUICK_MARKER_ICON_HOVER_FALLBACK_PATH = "/Users/yuno/Codex/AE Save animation/icons/marker_hover.png";
    var QUICK_GUIDES_ICON_FALLBACK_PATH = "/Users/yuno/Codex/AE Save animation/icons/margins_normal.png";
    var QUICK_GUIDES_ICON_HOVER_FALLBACK_PATH = "/Users/yuno/Codex/AE Save animation/icons/margins_hover.png";
    var QUICK_CONFIG_ICON_FALLBACK_PATH = "/Users/yuno/Codex/AE Save animation/icons/settings_normal.png";
    var QUICK_CONFIG_ICON_HOVER_FALLBACK_PATH = "/Users/yuno/Codex/AE Save animation/icons/settings_hover_0908c3.png";
    var SAVE_BTN_ICON_FALLBACK_PATH = "/Users/yuno/Codex/AE Save animation/icons/Save_160x160.png";
    var SAVE_BTN_ICON_HOVER_FALLBACK_PATH = "/Users/yuno/Codex/AE Save animation/icons/Save_160x160_hover.png";

    var appState = {
        copiedTemplate: null,
        library: {
            version: LIB_VERSION,
            templates: []
        },
        libraryPath: null,
        libraryFolderPath: null,
        logPath: null,
        ui: null,
        uiLibrary: null,
        uiQuick: null,
        uiEasing: null,
        quickWindow: null,
        easingWindow: null,
        autoMarkerWindow: null,
        resizeCompWindow: null,
        guidesWindow: null,
        quickConfigWindow: null,
        quickActionsConfig: null,
        selectedPresetId: "linear",
        hoverPresetId: null,
        hoverStartMs: 0,
        previewTickerActive: false,
        previewTaskId: null,
        previewScheduleSupported: true,
        previewBridgeReady: false,
        presetCards: [],
        presetRows: [],
        presetRowsPerPage: 0,
        quickSaveIcon: null,
        quickSaveIconHover: null,
        quickPingPongIcon: null,
        quickCloneIcon: null,
        quickCloneIconHover: null,
        quickMarkerIcon: null,
        quickMarkerIconHover: null,
        quickGuidesIcon: null,
        quickGuidesIconHover: null,
        quickConfigIcon: null,
        quickConfigIconHover: null,
        quickActionIconVariantCache: {},
        quickActionBaseIconCache: {},
        saveButtonIcon: null,
        saveButtonIconHover: null
    };

    var EASING_PRESETS = [
        createEasingPreset("linear", "linear", [0.00, 0.00, 1.00, 1.00], true),
        createEasingPreset("sineIn", "sineIn", [0.12, 0.00, 0.39, 0.00], false),
        createEasingPreset("sineOut", "sineOut", [0.61, 1.00, 0.88, 1.00], false),
        createEasingPreset("sineInOut", "sineInOut", [0.37, 0.00, 0.63, 1.00], false),
        createEasingPreset("quadIn", "quadIn", [0.11, 0.00, 0.50, 0.00], false),
        createEasingPreset("quadOut", "quadOut", [0.50, 1.00, 0.89, 1.00], false),
        createEasingPreset("quadInOut", "quadInOut", [0.45, 0.00, 0.55, 1.00], false),
        createEasingPreset("cubicIn", "cubicIn", [0.32, 0.00, 0.67, 0.00], false),
        createEasingPreset("cubicOut", "cubicOut", [0.33, 1.00, 0.68, 1.00], false),
        createEasingPreset("cubicInOut", "cubicInOut", [0.65, 0.00, 0.35, 1.00], false),
        createEasingPreset("quartIn", "quartIn", [0.50, 0.00, 0.75, 0.00], false),
        createEasingPreset("quartOut", "quartOut", [0.25, 1.00, 0.50, 1.00], false),
        createEasingPreset("quartInOut", "quartInOut", [0.76, 0.00, 0.24, 1.00], false),
        createEasingPreset("quintIn", "quintIn", [0.64, 0.00, 0.78, 0.00], false),
        createEasingPreset("quintOut", "quintOut", [0.22, 1.00, 0.36, 1.00], false),
        createEasingPreset("quintInOut", "quintInOut", [0.83, 0.00, 0.17, 1.00], false),
        createEasingPreset("expoIn", "expoIn", [0.70, 0.00, 0.84, 0.00], false),
        createEasingPreset("expoOut", "expoOut", [0.16, 1.00, 0.30, 1.00], false),
        createEasingPreset("expoInOut", "expoInOut", [0.87, 0.00, 0.13, 1.00], false),
        createEasingPreset("circIn", "circIn", [0.55, 0.00, 1.00, 0.45], false),
        createEasingPreset("circOut", "circOut", [0.00, 0.55, 0.45, 1.00], false),
        createEasingPreset("circInOut", "circInOut", [0.85, 0.00, 0.15, 1.00], false)
    ];

    var GUIDE_PRESETS = [
        {
            id: "netflix_9093",
            label: "Netflix (90/93)",
            titlePct: 0.90,
            actionPct: 0.93,
            includeCenter: true,
            includeCut43: false
        },
        {
            id: "hulu_smpte_9093",
            label: "Hulu (SMPTE 90/93)",
            titlePct: 0.90,
            actionPct: 0.93,
            includeCenter: true,
            includeCut43: false
        },
        {
            id: "hbomax_smpte_9093",
            label: "HBO/Max (SMPTE 90/93)",
            titlePct: 0.90,
            actionPct: 0.93,
            includeCenter: true,
            includeCut43: false
        },
        {
            id: "generic_smpte_9093_cut43",
            label: "Generic (SMPTE 90/93 + 4:3)",
            titlePct: 0.90,
            actionPct: 0.93,
            includeCenter: true,
            includeCut43: true
        }
    ];

    var QUICK_ACTION_IDS = [
        "loop",
        "pingpong",
        "clone",
        "nullctrl",
        "organize",
        "guides",
        "automarker",
        "resize_tree",
        "push_layers_05",
        "spacing_025",
        "spacing_05",
        "spacing_075",
        "spacing_1"
    ];
    var QUICK_SEPARATOR_IDS = ["__sep_a__", "__sep_b__", "__sep_c__"];
    var QUICK_SETTINGS_STYLE_ID = "__settings__";
    var QUICK_DEFAULT_PALETTE_ID = "gray";
    var QUICK_COLOR_PALETTES = {
        gray: {
            label: "Gray",
            roundness: 0,
            normal: {
                border: "#454545",
                fill: "#2b2b2b",
                icon: "#454545",
                iconOpacity: 1
            },
            hover: {
                border: "#d4d4d4",
                fill: "#474747",
                icon: "#d4d4d4",
                iconOpacity: 1
            }
        },
        red: {
            label: "Red",
            roundness: 0,
            normal: {
                border: "#970c27",
                fill: "#4a0d19",
                icon: "#970c27",
                iconOpacity: 1
            },
            hover: {
                border: "#ff0a3a",
                fill: "#64071a",
                icon: "#ff0a3a",
                iconOpacity: 1
            }
        },
        walo_green: {
            label: "WALO Green",
            roundness: 0,
            normal: {
                border: "#64890b",
                fill: "#2e3d0b",
                icon: "#64890b",
                iconOpacity: 1
            },
            hover: {
                border: "#b0fa00",
                fill: "#415a07",
                icon: "#b0fa00",
                iconOpacity: 1
            }
        },
        aqua: {
            label: "Aqua",
            roundness: 0,
            normal: {
                border: "#0d6d4d",
                fill: "#08251b",
                icon: "#0d6d4d",
                iconOpacity: 1
            },
            hover: {
                border: "#07d992",
                fill: "#07412d",
                icon: "#07d992",
                iconOpacity: 1
            }
        },
        orange: {
            label: "Orange",
            roundness: 0,
            normal: {
                border: "#be210f",
                fill: "#6d1c13",
                icon: "#be210f",
                iconOpacity: 1
            },
            hover: {
                border: "#ff4834",
                fill: "#71140a",
                icon: "#ff4834",
                iconOpacity: 1
            }
        },
        blue: {
            label: "Blue",
            roundness: 0,
            normal: {
                border: "#0b408e",
                fill: "#0b2141",
                icon: "#0b408e",
                iconOpacity: 1
            },
            hover: {
                border: "#0067ff",
                fill: "#093371",
                icon: "#0067ff",
                iconOpacity: 1
            }
        }
    };
    var QUICK_ICON_BASE_DEFAULTS = {
        loop: "Infity-120x120.png",
        pingpong: "pinpong-120x120.png",
        clone: "clone_160x160-normal.png",
        nullctrl: null,
        organize: "org_icon.png",
        guides: "margins_normal.png",
        automarker: "marker_normal.png",
        resize_tree: null,
        push_layers_05: null,
        spacing_025: null,
        spacing_05: null,
        spacing_075: null,
        spacing_1: null
    };
    var QUICK_ICON_OPACITY_NORMAL_TAG = "a50";
    var QUICK_ICON_OPACITY_HOVER_TAG = "a80";

    function getCurrentScriptBaseName() {
        try {
            if ($.fileName) {
                return File($.fileName).displayName || File($.fileName).name || "";
            }
        } catch (e) {}
        return "";
    }

    function resolveToolMode() {
        var baseName = getCurrentScriptBaseName().toLowerCase();
        if (baseName.indexOf("ae_tools_quick tools") !== -1) {
            return "quick";
        }
        if (baseName.indexOf("ae_tools_easing") !== -1) {
            return "easing";
        }
        if (baseName.indexOf("ae_tools_library animations") !== -1) {
            return "library";
        }
        appendLog("resolveToolMode: no se reconoció el nombre de archivo '" + baseName + "', usando modo por defecto 'library'.");
        return "library";
    }

    function resolveScriptDisplayName(mode) {
        if (mode === "quick") {
            return "AE Tools - Quick Tools";
        }
        if (mode === "easing") {
            return "AE Tools - Easign";
        }
        return "AE Tools - Library Animations";
    }

    function toISODateString() {
        try {
            return (new Date()).toISOString();
        } catch (e) {
            return String(new Date());
        }
    }

    function generateId() {
        return String((new Date()).getTime()) + "_" + Math.floor(Math.random() * 1000000);
    }

    function cloneValue(value) {
        if (value === null || value === undefined) {
            return value;
        }
        if (value.constructor === Array) {
            var arr = [];
            var i;
            for (i = 0; i < value.length; i++) {
                arr.push(cloneValue(value[i]));
            }
            return arr;
        }
        if (typeof value === "object") {
            var out = {};
            var key;
            for (key in value) {
                if (value.hasOwnProperty(key)) {
                    out[key] = cloneValue(value[key]);
                }
            }
            return out;
        }
        return value;
    }

    function clampNumber(value, minValue, maxValue) {
        if (value < minValue) {
            return minValue;
        }
        if (value > maxValue) {
            return maxValue;
        }
        return value;
    }

    function cubicBezierSample(a1, a2, t) {
        var mt = 1 - t;
        return (3 * mt * mt * t * a1) + (3 * mt * t * t * a2) + (t * t * t);
    }

    function cubicBezierSlope(a1, a2, t) {
        var mt = 1 - t;
        return (3 * mt * mt * a1) + (6 * mt * t * (a2 - a1)) + (3 * t * t * (1 - a2));
    }

    function createCubicBezierFunction(x1, y1, x2, y2) {
        if (Math.abs(x1 - y1) < EPSILON && Math.abs(x2 - y2) < EPSILON) {
            return function (t) {
                return clampNumber(t, 0, 1);
            };
        }

        return function (t) {
            var targetX = clampNumber(t, 0, 1);
            var guess = targetX;
            var i;

            for (i = 0; i < 6; i++) {
                var x = cubicBezierSample(x1, x2, guess) - targetX;
                var d = cubicBezierSlope(x1, x2, guess);
                if (Math.abs(d) < 0.0001) {
                    break;
                }
                guess = clampNumber(guess - (x / d), 0, 1);
            }

            var t0 = 0;
            var t1 = 1;
            var sampleX = cubicBezierSample(x1, x2, guess);
            for (i = 0; i < 10 && Math.abs(sampleX - targetX) > 0.0001; i++) {
                if (sampleX > targetX) {
                    t1 = guess;
                } else {
                    t0 = guess;
                }
                guess = (t0 + t1) / 2;
                sampleX = cubicBezierSample(x1, x2, guess);
            }

            return clampNumber(cubicBezierSample(y1, y2, guess), 0, 1);
        };
    }

    function createEasingPreset(id, label, curve, isLinear) {
        return {
            id: id,
            label: label,
            curve: cloneValue(curve),
            isLinear: !!isLinear,
            fn: createCubicBezierFunction(curve[0], curve[1], curve[2], curve[3])
        };
    }

    function getNowMs() {
        return (new Date()).getTime();
    }

    function isJSONAvailable() {
        return (typeof JSON !== "undefined") && JSON && JSON.parse;
    }

    function parseJSON(text) {
        if (isJSONAvailable()) {
            return JSON.parse(text);
        }
        return eval("(" + text + ")");
    }

    function escapeJSONString(value) {
        var out = String(value);
        out = out.replace(/\\/g, "\\\\");
        out = out.replace(/"/g, "\\\"");
        out = out.replace(/\r/g, "\\r");
        out = out.replace(/\n/g, "\\n");
        out = out.replace(/\t/g, "\\t");
        return out;
    }

    function stringifyJSONValue(value) {
        var i;
        var key;
        var parts;
        if (value === null || value === undefined) {
            return "null";
        }
        if (typeof value === "string") {
            return "\"" + escapeJSONString(value) + "\"";
        }
        if (typeof value === "number") {
            if (isFinite(value)) {
                return String(value);
            }
            return "null";
        }
        if (typeof value === "boolean") {
            return value ? "true" : "false";
        }
        if (value.constructor === Array) {
            parts = [];
            for (i = 0; i < value.length; i++) {
                parts.push(stringifyJSONValue(value[i]));
            }
            return "[" + parts.join(",") + "]";
        }
        if (typeof value === "object") {
            parts = [];
            for (key in value) {
                if (value.hasOwnProperty(key)) {
                    parts.push("\"" + escapeJSONString(key) + "\":" + stringifyJSONValue(value[key]));
                }
            }
            return "{" + parts.join(",") + "}";
        }
        return "null";
    }

    function stringifyJSON(obj) {
        if ((typeof JSON !== "undefined") && JSON && JSON.stringify) {
            return JSON.stringify(obj, null, 2);
        }
        return stringifyJSONValue(obj);
    }

    function ensureLibraryShape(data) {
        if (!data || typeof data !== "object") {
            return {
                version: LIB_VERSION,
                templates: []
            };
        }
        if (!data.templates || data.templates.constructor !== Array) {
            data.templates = [];
        }
        if (!data.version) {
            data.version = LIB_VERSION;
        }
        if (!data.storageInfo || typeof data.storageInfo !== "object") {
            data.storageInfo = {
                path: appState.libraryPath || "",
                lastWriteOk: false,
                lastError: ""
            };
        }
        return data;
    }

    function getScriptFolderSafe() {
        try {
            if ($.fileName) {
                return File($.fileName).parent;
            }
        } catch (e) {}
        return null;
    }

    function ensureFolder(folder) {
        if (!folder.exists) {
            return folder.create();
        }
        return true;
    }

    function canWriteInFolder(folder) {
        var probe = new File(folder.fsName + "/.ae_animlib_probe.tmp");
        try {
            probe.encoding = "UTF-8";
            if (!probe.open("w")) {
                return false;
            }
            probe.write("probe");
            probe.close();
            probe.remove();
            return true;
        } catch (e) {
            try {
                if (probe && probe.opened) {
                    probe.close();
                }
            } catch (closeErr) {}
            try {
                if (probe && probe.exists) {
                    probe.remove();
                }
            } catch (removeErr) {}
            return false;
        }
    }

    function resolveWritableLibraryPath() {
        var warnings = [];
        var candidates = [];
        var scriptFolder = getScriptFolderSafe();

        candidates.push(new Folder(Folder.myDocuments.fsName + "/Adobe/After Effects 2026/AnimationLibrary"));
        candidates.push(new Folder(Folder.userData.fsName + "/AE_AnimationLibrary_2026"));
        if (scriptFolder) {
            candidates.push(scriptFolder);
        }

        var i;
        for (i = 0; i < candidates.length; i++) {
            var folder = candidates[i];
            try {
                if (!ensureFolder(folder)) {
                    warnings.push("No se pudo crear carpeta: " + folder.fsName);
                    continue;
                }
                if (!canWriteInFolder(folder)) {
                    warnings.push("Carpeta sin permisos de escritura: " + folder.fsName);
                    continue;
                }
                return {
                    path: folder.fsName + "/" + FILE_NAME,
                    folderPath: folder.fsName,
                    warnings: warnings
                };
            } catch (e) {
                warnings.push("Error validando carpeta: " + folder.fsName);
            }
        }

        return {
            path: Folder.myDocuments.fsName + "/" + FILE_NAME,
            folderPath: Folder.myDocuments.fsName,
            warnings: warnings
        };
    }

    function getLibraryPath() {
        if (!appState.libraryPath) {
            var resolved = resolveWritableLibraryPath();
            appState.libraryPath = resolved.path;
            appState.libraryFolderPath = resolved.folderPath;
        }
        return appState.libraryPath;
    }

    function getLibraryFolderPath() {
        if (!appState.libraryFolderPath) {
            getLibraryPath();
        }
        return appState.libraryFolderPath;
    }

    function getLogPath() {
        if (!appState.logPath) {
            appState.logPath = getLibraryFolderPath() + "/ae_animation_library.log";
        }
        return appState.logPath;
    }

    function getDefaultQuickActionsConfig() {
        var visible = {};
        var paletteByAction = {};
        var iconBaseByAction = {};
        var i;
        for (i = 0; i < QUICK_ACTION_IDS.length; i++) {
            visible[QUICK_ACTION_IDS[i]] = true;
            paletteByAction[QUICK_ACTION_IDS[i]] = QUICK_DEFAULT_PALETTE_ID;
            iconBaseByAction[QUICK_ACTION_IDS[i]] = QUICK_ICON_BASE_DEFAULTS[QUICK_ACTION_IDS[i]];
        }
        return {
            order: [
                "loop",
                "pingpong",
                "__sep_a__",
                "clone",
                "nullctrl",
                "organize",
                "guides",
                "automarker",
                "resize_tree",
                "push_layers_05",
                "__sep_b__",
                "spacing_025",
                "spacing_05",
                "spacing_075",
                "spacing_1"
            ],
            visible: visible,
            paletteByAction: paletteByAction,
            iconBaseByAction: iconBaseByAction
        };
    }

    function getQuickConfigPath() {
        return getLibraryFolderPath() + "/" + QUICK_CONFIG_FILE;
    }

    function iconBaseFileNameExists(fileName) {
        if (!fileName) {
            return false;
        }
        var candidates = [];
        try {
            if ($.fileName) {
                var current = File($.fileName);
                if (current && current.parent) {
                    candidates.push(File(current.parent.fsName + "/icons/" + fileName));
                }
            }
        } catch (e1) {}
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/" + fileName));
        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return true;
                }
            } catch (e2) {}
        }
        return false;
    }

    function validateQuickActionsConfig(config) {
        var fallback = getDefaultQuickActionsConfig();
        if (!config || typeof config !== "object") {
            return fallback;
        }

        var validOrderIds = {};
        var i;
        for (i = 0; i < QUICK_ACTION_IDS.length; i++) {
            validOrderIds[QUICK_ACTION_IDS[i]] = true;
        }
        for (i = 0; i < QUICK_SEPARATOR_IDS.length; i++) {
            validOrderIds[QUICK_SEPARATOR_IDS[i]] = true;
        }

        var finalOrder = [];
        var seen = {};
        var sourceOrder = (config.order && config.order.constructor === Array) ? config.order : [];
        for (i = 0; i < sourceOrder.length; i++) {
            var id = String(sourceOrder[i] || "");
            if (!validOrderIds[id] || seen[id]) {
                continue;
            }
            seen[id] = true;
            finalOrder.push(id);
        }
        for (i = 0; i < fallback.order.length; i++) {
            if (!seen[fallback.order[i]]) {
                finalOrder.push(fallback.order[i]);
            }
        }

        var finalVisible = {};
        var srcVisible = (config.visible && typeof config.visible === "object") ? config.visible : {};
        for (i = 0; i < QUICK_ACTION_IDS.length; i++) {
            var key = QUICK_ACTION_IDS[i];
            if (srcVisible.hasOwnProperty(key)) {
                finalVisible[key] = !!srcVisible[key];
            } else {
                finalVisible[key] = true;
            }
        }

        var validPaletteIds = {};
        for (var paletteId in QUICK_COLOR_PALETTES) {
            if (QUICK_COLOR_PALETTES.hasOwnProperty(paletteId)) {
                validPaletteIds[paletteId] = true;
            }
        }

        var finalPaletteByAction = {};
        var srcPaletteByAction = (config.paletteByAction && typeof config.paletteByAction === "object") ? config.paletteByAction : {};
        for (i = 0; i < QUICK_ACTION_IDS.length; i++) {
            key = QUICK_ACTION_IDS[i];
            var paletteValue = String(srcPaletteByAction[key] || QUICK_DEFAULT_PALETTE_ID).toLowerCase();
            if (!validPaletteIds[paletteValue]) {
                paletteValue = QUICK_DEFAULT_PALETTE_ID;
            }
            finalPaletteByAction[key] = paletteValue;
        }

        var finalIconBaseByAction = {};
        var srcIconBaseByAction = (config.iconBaseByAction && typeof config.iconBaseByAction === "object") ? config.iconBaseByAction : {};
        for (i = 0; i < QUICK_ACTION_IDS.length; i++) {
            key = QUICK_ACTION_IDS[i];
            var iconName = srcIconBaseByAction[key];
            if (iconName === null || iconName === undefined || iconName === "") {
                finalIconBaseByAction[key] = null;
            } else {
                finalIconBaseByAction[key] = String(iconName);
            }
            if (!srcIconBaseByAction.hasOwnProperty(key)) {
                finalIconBaseByAction[key] = QUICK_ICON_BASE_DEFAULTS[key];
            }
            if (finalIconBaseByAction[key] && !iconBaseFileNameExists(finalIconBaseByAction[key])) {
                finalIconBaseByAction[key] = QUICK_ICON_BASE_DEFAULTS[key];
            }
            if (key === "organize" && (finalIconBaseByAction[key] === null || finalIconBaseByAction[key] === undefined || finalIconBaseByAction[key] === "")) {
                finalIconBaseByAction[key] = QUICK_ICON_BASE_DEFAULTS[key];
            }
        }

        return {
            order: finalOrder,
            visible: finalVisible,
            paletteByAction: finalPaletteByAction,
            iconBaseByAction: finalIconBaseByAction
        };
    }

    function loadQuickActionsConfig() {
        var file = new File(getQuickConfigPath());
        if (!file.exists) {
            return getDefaultQuickActionsConfig();
        }
        try {
            file.encoding = "UTF-8";
            if (!file.open("r")) {
                return getDefaultQuickActionsConfig();
            }
            var raw = file.read();
            file.close();
            return validateQuickActionsConfig(parseJSON(raw));
        } catch (e) {
            try {
                if (file && file.opened) {
                    file.close();
                }
            } catch (closeErr) {}
            appendLog("Quick config corrupta. Se restauró default. Error: " + e.toString());
            return getDefaultQuickActionsConfig();
        }
    }

    function saveQuickActionsConfig(config) {
        var normalized = validateQuickActionsConfig(config);
        var file = new File(getQuickConfigPath());
        try {
            file.encoding = "UTF-8";
            if (!file.open("w")) {
                return false;
            }
            file.write(stringifyJSON(normalized));
            file.close();
            return true;
        } catch (e) {
            try {
                if (file && file.opened) {
                    file.close();
                }
            } catch (closeErr) {}
            appendLog("Error guardando quick config: " + e.toString());
            return false;
        }
    }

    function appendLog(message) {
        var file = new File(getLogPath());
        try {
            file.encoding = "UTF-8";
            if (!file.open("a")) {
                return;
            }
            file.writeln("[" + toISODateString() + "] " + message);
            file.close();
        } catch (e) {
            try {
                if (file && file.opened) {
                    file.close();
                }
            } catch (closeErr) {}
        }
    }

    function getTimestampTag() {
        var d = new Date();
        function pad(n) {
            return (n < 10 ? "0" : "") + String(n);
        }
        return String(d.getFullYear()) + pad(d.getMonth() + 1) + pad(d.getDate()) + "_" + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
    }

    function loadLibrary(jsonPath) {
        var file = new File(jsonPath);
        if (!file.exists) {
            return {
                data: {
                    version: LIB_VERSION,
                    templates: [],
                    storageInfo: {
                        path: jsonPath,
                        lastWriteOk: false,
                        lastError: ""
                    }
                },
                warning: ""
            };
        }

        try {
            file.encoding = "UTF-8";
            if (!file.open("r")) {
                return {
                    data: {
                        version: LIB_VERSION,
                        templates: [],
                        storageInfo: {
                            path: jsonPath,
                            lastWriteOk: false,
                            lastError: "No se pudo abrir biblioteca."
                        }
                    },
                    warning: "No se pudo abrir la biblioteca. Se usará una biblioteca vacía."
                };
            }
            var raw = file.read();
            file.close();
            var parsed = parseJSON(raw);
            parsed.storageInfo = parsed.storageInfo || {};
            parsed.storageInfo.path = jsonPath;
            parsed.storageInfo.lastWriteOk = true;
            parsed.storageInfo.lastError = "";
            return {
                data: ensureLibraryShape(parsed),
                warning: ""
            };
        } catch (e) {
            try {
                if (file && file.opened) {
                    file.close();
                }
            } catch (closeErr) {}
            try {
                if (file.exists) {
                    var backup = new File(file.parent.fsName + "/animation_templates.corrupt." + getTimestampTag() + ".json");
                    file.copy(backup.fsName);
                }
            } catch (backupErr) {}
            appendLog("JSON corrupto detectado en " + jsonPath + ". Error: " + e.toString());
            return {
                data: {
                    version: LIB_VERSION,
                    templates: [],
                    storageInfo: {
                        path: jsonPath,
                        lastWriteOk: false,
                        lastError: "JSON inválido/corrupto."
                    }
                },
                warning: "JSON inválido/corrupto. Se creó backup y se reinició la biblioteca."
            };
        }
    }

    function classifySaveError(errorObj) {
        var raw = String(errorObj);
        var lowered = raw.toLowerCase();
        if (lowered.indexOf("permission") !== -1 || lowered.indexOf("denied") !== -1) {
            return "Permiso denegado al escribir biblioteca.";
        }
        if (lowered.indexOf("open") !== -1 || lowered.indexOf("abrir") !== -1) {
            return "Ruta no escribible o archivo bloqueado.";
        }
        return "Error de guardado: " + raw;
    }

    function saveLibrary(jsonPath, data) {
        var target = new File(jsonPath);
        var tmp = new File(jsonPath + ".tmp");
        var normalized = ensureLibraryShape(data);
        normalized.storageInfo.path = jsonPath;
        normalized.storageInfo.lastWriteOk = false;
        normalized.storageInfo.lastError = "";
        var payload = stringifyJSON(normalized);
        var canContinue = true;

        tmp.encoding = "UTF-8";
        if (!tmp.open("w")) {
            canContinue = false;
            appendLog("No se pudo abrir temporal para guardado atómico: " + tmp.fsName);
        }
        if (canContinue) {
            tmp.write(payload);
            tmp.close();
        }

        if (canContinue) {
            if (target.exists && !target.remove()) {
                canContinue = false;
                appendLog("No se pudo remover archivo original: " + target.fsName);
            }
        }

        if (canContinue && !tmp.rename(target.name)) {
            canContinue = false;
            appendLog("No se pudo renombrar temporal a objetivo: " + target.fsName);
        }

        if (!canContinue) {
            // Fallback a escritura directa cuando el guardado atómico no es posible.
            try {
                if (tmp.exists) {
                    tmp.remove();
                }
            } catch (tmpErr) {}

            target.encoding = "UTF-8";
            if (!target.open("w")) {
                normalized.storageInfo.lastWriteOk = false;
                normalized.storageInfo.lastError = "No se pudo abrir archivo para escritura directa.";
                throw new Error("No se pudo guardar biblioteca (temporal y directo fallaron).");
            }
            target.write(payload);
            target.close();
        }

        normalized.storageInfo.lastWriteOk = true;
        normalized.storageInfo.lastError = "";
        data.storageInfo = normalized.storageInfo;
        appendLog("Biblioteca guardada en: " + jsonPath);
    }

    function persistLibrary() {
        try {
            saveLibrary(getLibraryPath(), appState.library);
            return {
                ok: true,
                message: ""
            };
        } catch (e) {
            var friendly = classifySaveError(e);
            appState.library.storageInfo = appState.library.storageInfo || {};
            appState.library.storageInfo.path = getLibraryPath();
            appState.library.storageInfo.lastWriteOk = false;
            appState.library.storageInfo.lastError = friendly;
            appendLog("Error guardando biblioteca: " + e.toString());
            return {
                ok: false,
                message: friendly
            };
        }
    }

    function interpToString(interp) {
        if (interp === KeyframeInterpolationType.LINEAR) {
            return "LINEAR";
        }
        if (interp === KeyframeInterpolationType.BEZIER) {
            return "BEZIER";
        }
        if (interp === KeyframeInterpolationType.HOLD) {
            return "HOLD";
        }
        return "LINEAR";
    }

    function stringToInterp(name) {
        if (name === "BEZIER") {
            return KeyframeInterpolationType.BEZIER;
        }
        if (name === "HOLD") {
            return KeyframeInterpolationType.HOLD;
        }
        return KeyframeInterpolationType.LINEAR;
    }

    function encodeEaseArray(eases) {
        var out = [];
        var i;
        if (!eases || eases.constructor !== Array) {
            return out;
        }
        for (i = 0; i < eases.length; i++) {
            out.push({
                speed: eases[i].speed,
                influence: eases[i].influence
            });
        }
        return out;
    }

    function decodeEaseArray(serialized) {
        var out = [];
        var i;
        if (!serialized || serialized.constructor !== Array) {
            return out;
        }
        for (i = 0; i < serialized.length; i++) {
            out.push(new KeyframeEase(serialized[i].speed, serialized[i].influence));
        }
        return out;
    }

    function isSpatialProperty(prop) {
        var pvt = prop.propertyValueType;
        return (
            pvt === PropertyValueType.TwoD_SPATIAL ||
            pvt === PropertyValueType.ThreeD_SPATIAL
        );
    }

    function serializeProperty(prop, compTimeOrigin, matchNamePath, namePath) {
        var keyframes = [];
        var i;
        for (i = 1; i <= prop.numKeys; i++) {
            var k = {
                t: prop.keyTime(i) - compTimeOrigin,
                value: cloneValue(prop.keyValue(i)),
                inInterp: interpToString(prop.keyInInterpolationType(i)),
                outInterp: interpToString(prop.keyOutInterpolationType(i)),
                inEase: encodeEaseArray(prop.keyInTemporalEase(i)),
                outEase: encodeEaseArray(prop.keyOutTemporalEase(i)),
                temporalAutoBezier: false,
                temporalContinuous: false,
                spatialAutoBezier: false,
                spatialContinuous: false,
                roving: false,
                inSpatialTangent: null,
                outSpatialTangent: null
            };

            try {
                k.temporalAutoBezier = prop.keyTemporalAutoBezier(i);
            } catch (e1) {}
            try {
                k.temporalContinuous = prop.keyTemporalContinuous(i);
            } catch (e2) {}
            try {
                k.spatialAutoBezier = prop.keySpatialAutoBezier(i);
            } catch (e3) {}
            try {
                k.spatialContinuous = prop.keySpatialContinuous(i);
            } catch (e4) {}
            try {
                k.roving = prop.keyRoving(i);
            } catch (e5) {}
            try {
                if (isSpatialProperty(prop)) {
                    k.inSpatialTangent = cloneValue(prop.keyInSpatialTangent(i));
                    k.outSpatialTangent = cloneValue(prop.keyOutSpatialTangent(i));
                }
            } catch (e6) {}

            keyframes.push(k);
        }

        return {
            matchNamePath: cloneValue(matchNamePath),
            propertyPathHint: cloneValue(namePath),
            valueType: prop.propertyValueType,
            isSpatial: isSpatialProperty(prop),
            keyframes: keyframes
        };
    }

    function walkProperties(group, matchNamePath, namePath, outItems) {
        var i;
        var child;
        var childMatchPath;
        var childNamePath;
        for (i = 1; i <= group.numProperties; i++) {
            child = group.property(i);
            if (!child) {
                continue;
            }
            childMatchPath = cloneValue(matchNamePath);
            childNamePath = cloneValue(namePath);
            childMatchPath.push(child.matchName);
            childNamePath.push(child.name);

            if (child.propertyType === PropertyType.PROPERTY) {
                if (child.numKeys && child.numKeys > 0) {
                    outItems.push({
                        prop: child,
                        matchNamePath: childMatchPath,
                        namePath: childNamePath
                    });
                }
            } else if (
                child.propertyType === PropertyType.INDEXED_GROUP ||
                child.propertyType === PropertyType.NAMED_GROUP
            ) {
                walkProperties(child, childMatchPath, childNamePath, outItems);
            }
        }
    }

    function collectAnimatedProperties(layer) {
        var matches = [];
        walkProperties(layer, [], [], matches);
        return matches;
    }

    function createTemplateFromLayer(layer, templateName) {
        var found = collectAnimatedProperties(layer);
        if (found.length === 0) {
            throw new Error("La capa no tiene propiedades con keyframes.");
        }

        var minTime = null;
        var maxTime = null;
        var i;
        var j;
        for (i = 0; i < found.length; i++) {
            var prop = found[i].prop;
            for (j = 1; j <= prop.numKeys; j++) {
                var t = prop.keyTime(j);
                if (minTime === null || t < minTime) {
                    minTime = t;
                }
                if (maxTime === null || t > maxTime) {
                    maxTime = t;
                }
            }
        }

        var items = [];
        for (i = 0; i < found.length; i++) {
            items.push(
                serializeProperty(
                    found[i].prop,
                    minTime,
                    found[i].matchNamePath,
                    found[i].namePath
                )
            );
        }

        return {
            id: generateId(),
            name: templateName,
            createdAt: toISODateString(),
            duration: Math.max(0, (maxTime - minTime)),
            items: items
        };
    }

    function findChildByMatchName(group, matchName) {
        var i;
        for (i = 1; i <= group.numProperties; i++) {
            var child = group.property(i);
            if (child && child.matchName === matchName) {
                return child;
            }
        }
        return null;
    }

    function resolvePropertyByMatchPath(layer, matchNamePath) {
        var current = layer;
        var i;
        for (i = 0; i < matchNamePath.length; i++) {
            if (!current || !current.numProperties) {
                return null;
            }
            current = findChildByMatchName(current, matchNamePath[i]);
            if (!current) {
                return null;
            }
        }
        if (current && current.propertyType === PropertyType.PROPERTY) {
            return current;
        }
        return null;
    }

    function clearKeyframesInWindow(prop, startTime, endTime) {
        var i;
        for (i = prop.numKeys; i >= 1; i--) {
            var t = prop.keyTime(i);
            if (t >= (startTime - EPSILON) && t <= (endTime + EPSILON)) {
                prop.removeKey(i);
            }
        }
    }

    function addAndStyleKey(prop, keyData, targetTime, warnings) {
        var keyIndex;
        try {
            prop.setValueAtTime(targetTime, cloneValue(keyData.value));
        } catch (setErr) {
            warnings.push("No se pudo setear valor en propiedad: " + prop.name);
            return;
        }

        try {
            keyIndex = prop.nearestKeyIndex(targetTime);
            if (Math.abs(prop.keyTime(keyIndex) - targetTime) > EPSILON) {
                return;
            }
        } catch (idxErr) {
            return;
        }

        try {
            prop.setInterpolationTypeAtKey(
                keyIndex,
                stringToInterp(keyData.inInterp),
                stringToInterp(keyData.outInterp)
            );
        } catch (e1) {}

        try {
            prop.setTemporalEaseAtKey(
                keyIndex,
                decodeEaseArray(keyData.inEase),
                decodeEaseArray(keyData.outEase)
            );
        } catch (e2) {}

        try {
            prop.setTemporalAutoBezierAtKey(keyIndex, !!keyData.temporalAutoBezier);
        } catch (e3) {}
        try {
            prop.setTemporalContinuousAtKey(keyIndex, !!keyData.temporalContinuous);
        } catch (e4) {}

        try {
            if (keyData.inSpatialTangent !== null && keyData.outSpatialTangent !== null) {
                prop.setSpatialTangentsAtKey(
                    keyIndex,
                    cloneValue(keyData.inSpatialTangent),
                    cloneValue(keyData.outSpatialTangent)
                );
            }
        } catch (e5) {}

        try {
            prop.setSpatialAutoBezierAtKey(keyIndex, !!keyData.spatialAutoBezier);
        } catch (e6) {}
        try {
            prop.setSpatialContinuousAtKey(keyIndex, !!keyData.spatialContinuous);
        } catch (e7) {}

        try {
            if (keyIndex !== 1 && keyIndex !== prop.numKeys) {
                prop.setRovingAtKey(keyIndex, !!keyData.roving);
            }
        } catch (e8) {}
    }

    function captureKeyDataAtIndex(prop, keyIndex) {
        var k = {
            time: prop.keyTime(keyIndex),
            value: cloneValue(prop.keyValue(keyIndex)),
            inInterp: interpToString(prop.keyInInterpolationType(keyIndex)),
            outInterp: interpToString(prop.keyOutInterpolationType(keyIndex)),
            inEase: encodeEaseArray(prop.keyInTemporalEase(keyIndex)),
            outEase: encodeEaseArray(prop.keyOutTemporalEase(keyIndex)),
            temporalAutoBezier: false,
            temporalContinuous: false,
            spatialAutoBezier: false,
            spatialContinuous: false,
            roving: false,
            inSpatialTangent: null,
            outSpatialTangent: null,
            label: null
        };

        try {
            k.temporalAutoBezier = prop.keyTemporalAutoBezier(keyIndex);
        } catch (e1) {}
        try {
            k.temporalContinuous = prop.keyTemporalContinuous(keyIndex);
        } catch (e2) {}
        try {
            k.spatialAutoBezier = prop.keySpatialAutoBezier(keyIndex);
        } catch (e3) {}
        try {
            k.spatialContinuous = prop.keySpatialContinuous(keyIndex);
        } catch (e4) {}
        try {
            k.roving = prop.keyRoving(keyIndex);
        } catch (e5) {}
        try {
            if (isSpatialProperty(prop)) {
                k.inSpatialTangent = cloneValue(prop.keyInSpatialTangent(keyIndex));
                k.outSpatialTangent = cloneValue(prop.keyOutSpatialTangent(keyIndex));
            }
        } catch (e6) {}
        try {
            k.label = prop.keyLabel(keyIndex);
        } catch (e7) {}
        return k;
    }

    function findKeyIndexAtTime(prop, time) {
        var i;
        for (i = 1; i <= prop.numKeys; i++) {
            if (Math.abs(prop.keyTime(i) - time) <= EPSILON) {
                return i;
            }
        }
        return -1;
    }

    function insertKeyAtTimeFromSnapshot(prop, targetTime, snapshot, lockVisualTransition) {
        prop.setValueAtTime(targetTime, cloneValue(snapshot.value));

        var newIndex = findKeyIndexAtTime(prop, targetTime);
        if (newIndex === -1) {
            throw new Error("No se pudo insertar keyframe en tiempo destino.");
        }

        applySnapshotToKeyIndex(prop, newIndex, snapshot, lockVisualTransition);
        return newIndex;
    }

    function applySnapshotToKeyIndex(prop, keyIndex, snapshot, lockVisualTransition) {
        try {
            prop.setInterpolationTypeAtKey(
                keyIndex,
                stringToInterp(snapshot.inInterp),
                stringToInterp(snapshot.outInterp)
            );
        } catch (e1) {}

        try {
            prop.setTemporalEaseAtKey(
                keyIndex,
                decodeEaseArray(snapshot.inEase),
                decodeEaseArray(snapshot.outEase)
            );
        } catch (e2) {}

        try {
            if (snapshot.inSpatialTangent !== null && snapshot.outSpatialTangent !== null) {
                prop.setSpatialTangentsAtKey(
                    keyIndex,
                    cloneValue(snapshot.inSpatialTangent),
                    cloneValue(snapshot.outSpatialTangent)
                );
            }
        } catch (e3) {}

        if (lockVisualTransition) {
            // Keep icons stable for spacing buttons by preventing AE auto-recalculation.
            try {
                prop.setTemporalContinuousAtKey(keyIndex, false);
            } catch (e4) {}
            try {
                prop.setTemporalAutoBezierAtKey(keyIndex, false);
            } catch (e5) {}
            try {
                prop.setSpatialContinuousAtKey(keyIndex, false);
            } catch (e6) {}
            try {
                prop.setSpatialAutoBezierAtKey(keyIndex, false);
            } catch (e7) {}
        } else {
            try {
                prop.setTemporalContinuousAtKey(keyIndex, !!snapshot.temporalContinuous);
            } catch (e8) {}
            try {
                prop.setTemporalAutoBezierAtKey(keyIndex, !!snapshot.temporalAutoBezier);
            } catch (e9) {}
            try {
                prop.setSpatialContinuousAtKey(keyIndex, !!snapshot.spatialContinuous);
            } catch (e10) {}
            try {
                prop.setSpatialAutoBezierAtKey(keyIndex, !!snapshot.spatialAutoBezier);
            } catch (e11) {}
        }

        try {
            if (keyIndex !== 1 && keyIndex !== prop.numKeys) {
                prop.setRovingAtKey(keyIndex, !!snapshot.roving);
            }
        } catch (e12) {}

        try {
            if (snapshot.label !== null && snapshot.label !== undefined) {
                prop.setLabelAtKey(keyIndex, snapshot.label);
            }
        } catch (e13) {}
    }

    function applySnapshotToKeyAtTime(prop, time, snapshot, lockVisualTransition) {
        var index = findKeyIndexAtTime(prop, time);
        if (index === -1) {
            return false;
        }
        applySnapshotToKeyIndex(prop, index, snapshot, lockVisualTransition);
        return true;
    }

    function removeKeyByOriginalTime(prop, originalTime) {
        var oldIndex = findKeyIndexAtTime(prop, originalTime);
        if (oldIndex === -1) {
            return false;
        }
        prop.removeKey(oldIndex);
        return true;
    }

    function moveKeyByIndexPreservingData(prop, keyIndex, newTime) {
        var snapshot = captureKeyDataAtIndex(prop, keyIndex);
        var oldTime = snapshot.time;
        if (Math.abs(oldTime - newTime) <= EPSILON) {
            return {
                moved: false,
                omitted: false,
                error: ""
            };
        }

        try {
            insertKeyAtTimeFromSnapshot(prop, newTime, snapshot, true);
            if (!removeKeyByOriginalTime(prop, oldTime)) {
                return {
                    moved: false,
                    omitted: true,
                    error: "No se encontró keyframe original para borrar."
                };
            }
            if (findKeyIndexAtTime(prop, newTime) === -1) {
                return {
                    moved: false,
                    omitted: true,
                    error: "No se validó keyframe final en tiempo destino."
                };
            }
            return {
                moved: true,
                omitted: false,
                error: ""
            };
        } catch (e) {
            return {
                moved: false,
                omitted: false,
                error: e.toString()
            };
        }
    }

    function collectSelectedKeyframesByProperty(comp) {
        var selectedProps = comp.selectedProperties;
        var grouped = [];
        var i;
        var j;
        for (i = 0; i < selectedProps.length; i++) {
            var prop = selectedProps[i];
            if (!prop || prop.propertyType !== PropertyType.PROPERTY) {
                continue;
            }
            if (!prop.selectedKeys || prop.selectedKeys.length === 0) {
                continue;
            }

            var keys = [];
            for (j = 0; j < prop.selectedKeys.length; j++) {
                var idx = prop.selectedKeys[j];
                keys.push({
                    index: idx,
                    time: prop.keyTime(idx)
                });
            }
            keys.sort(function (a, b) {
                return a.time - b.time;
            });

            grouped.push({
                prop: prop,
                keys: keys
            });
        }
        return grouped;
    }

    function respacingSelectedKeys(groupedSelection, intervalSeconds) {
        var movedKeys = 0;
        var affectedProps = 0;
        var skippedProps = 0;
        var omittedKeys = 0;
        var restoreErrors = 0;
        var i;
        var k;

        for (i = 0; i < groupedSelection.length; i++) {
            var group = groupedSelection[i];
            var prop = group.prop;
            var keys = group.keys;
            if (!keys || keys.length < 2) {
                skippedProps++;
                continue;
            }

            var t0 = keys[0].time;
            var snapshots = [];
            var targetTimes = [];
            for (k = 0; k < keys.length; k++) {
                var initialIndex = findKeyIndexAtTime(prop, keys[k].time);
                if (initialIndex === -1) {
                    snapshots.push(null);
                    targetTimes.push(t0 + (k * intervalSeconds));
                    continue;
                }
                snapshots.push(captureKeyDataAtIndex(prop, initialIndex));
                targetTimes.push(t0 + (k * intervalSeconds));
            }

            var movedThisProp = false;
            for (k = keys.length - 1; k >= 1; k--) {
                var originalTime = keys[k].time;
                var targetTime = targetTimes[k];
                var currentIndex = findKeyIndexAtTime(prop, originalTime);
                if (currentIndex === -1) {
                    omittedKeys++;
                    continue;
                }
                var moveResult = moveKeyByIndexPreservingData(prop, currentIndex, targetTime);
                if (moveResult.moved) {
                    movedKeys++;
                    movedThisProp = true;
                } else if (moveResult.omitted) {
                    omittedKeys++;
                } else if (moveResult.error) {
                    restoreErrors++;
                    appendLog("Error restaurando keyframe (.5s) en '" + prop.name + "': " + moveResult.error);
                }
            }

            // Re-apply full snapshot on all originally selected keys, including anchor.
            for (k = 0; k < snapshots.length; k++) {
                if (!snapshots[k]) {
                    omittedKeys++;
                    continue;
                }
                if (!applySnapshotToKeyAtTime(prop, targetTimes[k], snapshots[k], true)) {
                    restoreErrors++;
                    appendLog("No se encontró keyframe destino al reaplicar snapshot (.5s) en '" + prop.name + "'.");
                }
            }

            if (movedThisProp) {
                affectedProps++;
            } else {
                skippedProps++;
            }
        }

        return {
            movedKeys: movedKeys,
            affectedProps: affectedProps,
            skippedProps: skippedProps,
            omittedKeys: omittedKeys,
            restoreErrors: restoreErrors
        };
    }

    function isNumber(value) {
        return (typeof value === "number") && isFinite(value);
    }

    function isArray(value) {
        return value && value.constructor === Array;
    }

    function shouldApplyRelativePosition(item) {
        if (!item || !item.matchNamePath || item.matchNamePath.length === 0) {
            return false;
        }
        var last = item.matchNamePath[item.matchNamePath.length - 1];
        return (
            last === "ADBE Position" ||
            last === "ADBE Position_0" ||
            last === "ADBE Position_1" ||
            last === "ADBE Position_2"
        );
    }

    function computeRelativeOffset(baseValue, sourceValue) {
        if (isNumber(baseValue) && isNumber(sourceValue)) {
            return baseValue - sourceValue;
        }
        if (isArray(baseValue) && isArray(sourceValue) && baseValue.length === sourceValue.length) {
            var arr = [];
            var i;
            for (i = 0; i < baseValue.length; i++) {
                if (!isNumber(baseValue[i]) || !isNumber(sourceValue[i])) {
                    return null;
                }
                arr.push(baseValue[i] - sourceValue[i]);
            }
            return arr;
        }
        return null;
    }

    function applyOffsetToValue(value, offset) {
        if (offset === null || offset === undefined) {
            return cloneValue(value);
        }
        if (isNumber(value) && isNumber(offset)) {
            return value + offset;
        }
        if (isArray(value) && isArray(offset) && value.length === offset.length) {
            var arr = [];
            var i;
            for (i = 0; i < value.length; i++) {
                arr.push(value[i] + offset[i]);
            }
            return arr;
        }
        return cloneValue(value);
    }

    function applyTemplateToLayer(template, layer, targetStartTime) {
        var warnings = [];
        var appliedCount = 0;
        var i;
        var j;

        for (i = 0; i < template.items.length; i++) {
            var item = template.items[i];
            var targetProp = resolvePropertyByMatchPath(layer, item.matchNamePath);
            if (!targetProp) {
                warnings.push("No existe propiedad destino: " + item.propertyPathHint.join(" > "));
                continue;
            }

            try {
                if (targetProp.propertyValueType !== item.valueType) {
                    warnings.push("Tipo incompatible: " + item.propertyPathHint.join(" > "));
                    continue;
                }
            } catch (typeErr) {
                warnings.push("No se pudo validar tipo: " + item.propertyPathHint.join(" > "));
                continue;
            }

            if (!item.keyframes || item.keyframes.length === 0) {
                continue;
            }

            var valueOffset = null;
            if (shouldApplyRelativePosition(item)) {
                try {
                    var firstKey = item.keyframes[0];
                    var firstKeyTime = targetStartTime + firstKey.t;
                    var currentValue = targetProp.valueAtTime(firstKeyTime, false);
                    valueOffset = computeRelativeOffset(currentValue, firstKey.value);
                } catch (offsetErr) {
                    warnings.push("No se pudo calcular offset relativo en: " + targetProp.name);
                    valueOffset = null;
                }
            }

            var endTime = targetStartTime + (template.duration || 0);
            try {
                clearKeyframesInWindow(targetProp, targetStartTime, endTime);
            } catch (clearErr) {
                warnings.push("No se pudieron limpiar keyframes en: " + targetProp.name);
            }

            for (j = 0; j < item.keyframes.length; j++) {
                var k = item.keyframes[j];
                var t = targetStartTime + k.t;
                var keyToApply = k;
                if (valueOffset !== null) {
                    keyToApply = cloneValue(k);
                    keyToApply.value = applyOffsetToValue(k.value, valueOffset);
                }
                addAndStyleKey(targetProp, keyToApply, t, warnings);
            }
            appliedCount++;
        }

        return {
            appliedCount: appliedCount,
            warnings: warnings
        };
    }

    function refreshTemplateList(uiRefs) {
        uiRefs.templateList.removeAll();
        var i;
        for (i = 0; i < appState.library.templates.length; i++) {
            var t = appState.library.templates[i];
            var item = uiRefs.templateList.add("item", t.name);
            item.templateId = t.id;
        }
    }

    function findTemplateById(templateId) {
        var i;
        for (i = 0; i < appState.library.templates.length; i++) {
            if (appState.library.templates[i].id === templateId) {
                return appState.library.templates[i];
            }
        }
        return null;
    }

    function templateNameExists(name, excludeTemplateId) {
        var i;
        var target = String(name).toLowerCase();
        for (i = 0; i < appState.library.templates.length; i++) {
            var t = appState.library.templates[i];
            if (excludeTemplateId && t.id === excludeTemplateId) {
                continue;
            }
            if (String(t.name).toLowerCase() === target) {
                return true;
            }
        }
        return false;
    }

    function renameTemplate(templateId, newName) {
        var t = findTemplateById(templateId);
        if (!t) {
            throw new Error("Template no encontrado.");
        }
        t.name = newName;
    }

    function deleteTemplate(templateId) {
        var i;
        for (i = 0; i < appState.library.templates.length; i++) {
            if (appState.library.templates[i].id === templateId) {
                appState.library.templates.splice(i, 1);
                return;
            }
        }
        throw new Error("Template no encontrado.");
    }

    function getActiveComp() {
        var item = app.project ? app.project.activeItem : null;
        if (!item || !(item instanceof CompItem)) {
            return null;
        }
        return item;
    }

    function getSelectedProjectComp() {
        if (!app.project) {
            return null;
        }
        var selected = app.project.selection;
        var i;
        if (selected && selected.length > 0) {
            for (i = 0; i < selected.length; i++) {
                if (selected[i] && (selected[i] instanceof CompItem)) {
                    return selected[i];
                }
            }
        }
        return null;
    }

    function resolveCloneTargetLayer() {
        var activeComp = getActiveComp();
        if (!activeComp) {
            return null;
        }
        var selectedLayers = activeComp.selectedLayers;
        if (!selectedLayers || selectedLayers.length !== 1) {
            return null;
        }
        return selectedLayers[0];
    }

    function isLayerSourceComp(layer) {
        if (!layer || !(layer instanceof AVLayer)) {
            return false;
        }
        try {
            return !!(layer.source && (layer.source instanceof CompItem));
        } catch (e) {}
        return false;
    }

    function folderHasItemWithName(folderItem, itemName) {
        if (!folderItem || !itemName) {
            return false;
        }
        var i;
        for (i = 1; i <= folderItem.numItems; i++) {
            try {
                if (folderItem.item(i) && folderItem.item(i).name === itemName) {
                    return true;
                }
            } catch (e) {}
        }
        return false;
    }

    function padCloneIndex(value) {
        if (value < 10) {
            return "0" + value;
        }
        return String(value);
    }

    function buildUniqueCloneName(baseComp, suffix) {
        var normalizedSuffix = suffix || "_clone";
        var desired = String(baseComp.name || "Comp") + normalizedSuffix;
        var folder = baseComp.parentFolder || app.project.rootFolder;
        if (!folderHasItemWithName(folder, desired)) {
            return desired;
        }
        var i;
        for (i = 1; i <= 9999; i++) {
            var candidate = desired + "_" + padCloneIndex(i);
            if (!folderHasItemWithName(folder, candidate)) {
                return candidate;
            }
        }
        return desired + "_" + String((new Date()).getTime());
    }

    function cloneCompTreeRecursive(originalComp, mapById, isRoot) {
        if (!originalComp || !(originalComp instanceof CompItem)) {
            return null;
        }
        var key = String(originalComp.id);
        if (mapById.hasOwnProperty(key)) {
            return mapById[key];
        }

        var clonedComp = originalComp.duplicate();
        mapById[key] = clonedComp;

        try {
            clonedComp.parentFolder = originalComp.parentFolder;
        } catch (e1) {}

        if (isRoot) {
            clonedComp.name = buildUniqueCloneName(originalComp, "_clone");
        }

        var i;
        for (i = 1; i <= clonedComp.numLayers; i++) {
            var layer = clonedComp.layer(i);
            if (!layer || !(layer instanceof AVLayer)) {
                continue;
            }
            var src = null;
            try {
                src = layer.source;
            } catch (e2) {}
            if (!src || !(src instanceof CompItem)) {
                continue;
            }
            var childClone = cloneCompTreeRecursive(src, mapById, false);
            if (!childClone) {
                continue;
            }
            try {
                layer.replaceSource(childClone, false);
            } catch (e3) {}
        }
        return clonedComp;
    }

    function clearProjectSelection() {
        if (!app.project) {
            return;
        }
        var i;
        for (i = 1; i <= app.project.numItems; i++) {
            try {
                app.project.item(i).selected = false;
            } catch (e) {}
        }
    }

    function cloneSelectedLayer(uiRefs) {
        if (!app.project) {
            notifyStatus(uiRefs, "No hay proyecto activo.", true);
            return;
        }
        var targetLayer = resolveCloneTargetLayer();
        if (!targetLayer) {
            notifyStatus(uiRefs, "Selecciona exactamente 1 capa en la composición activa para clonar.", true);
            return;
        }
        if (!isLayerSourceComp(targetLayer)) {
            return;
        }

        var originalComp = null;
        try {
            originalComp = targetLayer.source;
        } catch (e0) {}
        if (!originalComp || !(originalComp instanceof CompItem)) {
            return;
        }

        var clonedRoot = null;
        var duplicatedLayer = null;
        try {
            app.beginUndoGroup("Clone Composition Total");
            var clonesById = {};
            clonedRoot = cloneCompTreeRecursive(originalComp, clonesById, true);
            if (!clonedRoot) {
                throw new Error("No se pudo clonar la composición.");
            }

            duplicatedLayer = targetLayer.duplicate();
            if (!duplicatedLayer) {
                throw new Error("No se pudo duplicar la capa seleccionada.");
            }
            duplicatedLayer.replaceSource(clonedRoot, false);

            try {
                targetLayer.selected = false;
            } catch (e1) {}
            try {
                duplicatedLayer.selected = true;
            } catch (e2) {}

            notifyStatus(uiRefs, "Composición clonada: " + clonedRoot.name, false);
        } catch (err) {
            notifyStatus(uiRefs, "Error al clonar capa/composición: " + err.toString(), true);
        } finally {
            try {
                app.endUndoGroup();
            } catch (undoErr) {}
        }
    }

    function getLayerAnchorInComp(layer, sampleTime) {
        if (!layer) {
            return null;
        }
        var anchorProp = null;
        try {
            anchorProp = layer.property("Anchor Point");
        } catch (e1) {}
        if (!anchorProp) {
            return null;
        }
        var anchorValue = null;
        try {
            anchorValue = anchorProp.valueAtTime(sampleTime, false);
        } catch (e2) {
            try {
                anchorValue = anchorProp.value;
            } catch (e3) {}
        }
        if (!anchorValue) {
            return null;
        }

        // Prefer AVLayer/sourcePointToComp for reliable layer-space -> comp-space conversion in ExtendScript.
        try {
            if ((layer instanceof AVLayer) && typeof layer.sourcePointToComp === "function") {
                var anchor2D = [
                    (anchorValue.length >= 1 ? anchorValue[0] : 0),
                    (anchorValue.length >= 2 ? anchorValue[1] : 0)
                ];
                var compPoint2D = layer.sourcePointToComp(anchor2D);
                if (compPoint2D && compPoint2D.length >= 2) {
                    var zVal = 0;
                    try {
                        var posProp = layer.property("Position");
                        if (posProp) {
                            var posVal = posProp.valueAtTime(sampleTime, false);
                            if (posVal && posVal.length >= 3 && isNumber(posVal[2])) {
                                zVal = posVal[2];
                            }
                        }
                    } catch (zErr) {}
                    return [compPoint2D[0], compPoint2D[1], zVal];
                }
            }
        } catch (e5) {}

        // Fallback: use layer position if conversion is not available for this layer type.
        try {
            var fallbackPosProp = layer.property("Position");
            if (fallbackPosProp) {
                var fallbackPos = fallbackPosProp.valueAtTime(sampleTime, false);
                if (fallbackPos && fallbackPos.length >= 2) {
                    if (fallbackPos.length >= 3) {
                        return [fallbackPos[0], fallbackPos[1], fallbackPos[2]];
                    }
                    return [fallbackPos[0], fallbackPos[1], 0];
                }
            }
        } catch (e6) {}

        // Last resort for layer types that expose toComp.
        try {
            return layer.toComp(anchorValue);
        } catch (e7) {
            return null;
        }
    }

    function getSelectionAnchorCenterInComp(comp, selectedLayers, sampleTime) {
        var sumX = 0;
        var sumY = 0;
        var sumZ = 0;
        var count = 0;
        var hasAnyZ = false;
        var i;
        for (i = 0; i < selectedLayers.length; i++) {
            var point = getLayerAnchorInComp(selectedLayers[i], sampleTime);
            if (!point || point.length < 2) {
                continue;
            }
            sumX += point[0];
            sumY += point[1];
            if (point.length >= 3 && isNumber(point[2])) {
                sumZ += point[2];
                hasAnyZ = true;
            }
            count++;
        }

        if (count < 1) {
            return [comp.width / 2, comp.height / 2, 0];
        }
        return [
            sumX / count,
            sumY / count,
            hasAnyZ ? (sumZ / count) : 0
        ];
    }

    function createNullWithDurationAndParent(uiRefs) {
        if (!app.project) {
            return;
        }
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            return;
        }
        var sel = comp.selectedLayers;
        if (!sel || sel.length === 0) {
            return;
        }

        var tNow = comp.time;
        var minIn = sel[0].inPoint;
        var maxOut = sel[0].outPoint;
        var hasAny3D = !!sel[0].threeDLayer;
        var i;
        for (i = 1; i < sel.length; i++) {
            if (sel[i].inPoint < minIn) {
                minIn = sel[i].inPoint;
            }
            if (sel[i].outPoint > maxOut) {
                maxOut = sel[i].outPoint;
            }
            if (sel[i].threeDLayer) {
                hasAny3D = true;
            }
        }

        var nullLayer = null;
        try {
            app.beginUndoGroup("Null con misma duración + Parent");

            nullLayer = comp.layers.addNull();
            nullLayer.name = (sel.length === 1 ? sel[0].name : "MULTI") + "_CTRL";
            nullLayer.label = 10;
            nullLayer.inPoint = minIn;
            nullLayer.outPoint = maxOut;
            nullLayer.threeDLayer = hasAny3D;

            var targetCenter = getSelectionAnchorCenterInComp(comp, sel, tNow);
            try {
                if (hasAny3D) {
                    nullLayer.property("Position").setValue([targetCenter[0], targetCenter[1], targetCenter[2]]);
                } else {
                    nullLayer.property("Position").setValue([targetCenter[0], targetCenter[1]]);
                }
                nullLayer.property("Opacity").setValue(100);
            } catch (transformErr) {}

            var topIndex = sel[0].index;
            for (i = 1; i < sel.length; i++) {
                if (sel[i].index < topIndex) {
                    topIndex = sel[i].index;
                }
            }
            nullLayer.moveBefore(comp.layer(topIndex));

            for (i = 0; i < sel.length; i++) {
                if (sel[i] !== nullLayer) {
                    sel[i].parent = nullLayer;
                }
            }

            for (i = 0; i < sel.length; i++) {
                try {
                    sel[i].selected = false;
                } catch (selErr) {}
            }
            try {
                nullLayer.selected = true;
            } catch (finalSelErr) {}
        } catch (err) {
            notifyStatus(uiRefs, "Error al crear null CTRL: " + err.toString(), true);
        } finally {
            try {
                app.endUndoGroup();
            } catch (undoErr) {}
        }
    }

    function organizeProjectItems(uiRefs) {
        if (!app.project) {
            app.newProject();
        }
        if (!app.project) {
            notifyStatus(uiRefs, "No se pudo inicializar proyecto.", true);
            return;
        }

        function normalizeFolderKey(name) {
            var n = String(name || "").toLowerCase();
            n = n.replace(/^\s+|\s+$/g, "");
            n = n.replace(/^\d+\s*[_\-\s]*/, "");
            n = n.replace(/[^a-z0-9]+/g, "");
            return n;
        }

        function getFolderOrderPrefix(name) {
            var match = String(name || "").match(/^\s*(\d+)/);
            if (match && match[1]) {
                return parseInt(match[1], 10);
            }
            return 999;
        }

        function pickBestFolderMatch(matches) {
            if (!matches || !matches.length) {
                return null;
            }
            var best = matches[0];
            var i;
            for (i = 1; i < matches.length; i++) {
                var candidate = matches[i];
                var bestPrefix = getFolderOrderPrefix(best.name);
                var candidatePrefix = getFolderOrderPrefix(candidate.name);
                if (candidatePrefix < bestPrefix) {
                    best = candidate;
                }
            }
            return best;
        }

        function getOrCreateFolder(parentFolder, canonicalName, aliases) {
            var i;
            var matches = [];
            var lookup = {};
            var canonKey = normalizeFolderKey(canonicalName);
            lookup[canonKey] = true;
            for (i = 0; aliases && i < aliases.length; i++) {
                lookup[normalizeFolderKey(aliases[i])] = true;
            }

            for (i = 1; i <= app.project.items.length; i++) {
                var it = app.project.items[i];
                if (!(it instanceof FolderItem) || it.parentFolder !== parentFolder) {
                    continue;
                }
                if (it.name === canonicalName) {
                    return it;
                }
                if (lookup[normalizeFolderKey(it.name)]) {
                    matches.push(it);
                }
            }

            var existing = pickBestFolderMatch(matches);
            if (existing) {
                return existing;
            }

            var created = app.project.items.addFolder(canonicalName);
            created.parentFolder = parentFolder;
            return created;
        }

        function getOrCreateRootFolder(name, aliases) {
            return getOrCreateFolder(app.project.rootFolder, name, aliases || []);
        }

        function getOrCreateChildFolder(parentFolder, name, aliases) {
            return getOrCreateFolder(parentFolder, name, aliases || []);
        }

        function safeSetLabel(item, labelIndex) {
            try { item.label = labelIndex; } catch (e) {}
        }

        function getLowerExt(itemName) {
            var n = String(itemName || "");
            var dot = n.lastIndexOf(".");
            if (dot < 0 || dot === n.length - 1) {
                return "";
            }
            return n.substring(dot).toLowerCase();
        }

        function getItemDurationSeconds(item) {
            try {
                if (item && isFinite(item.duration)) {
                    return Number(item.duration);
                }
            } catch (e0) {}
            try {
                if (item && item.mainSource && isFinite(item.mainSource.duration)) {
                    return Number(item.mainSource.duration);
                }
            } catch (e1) {}
            try {
                if (item && item.mainSource && isFinite(item.mainSource.conformFrameRate) && item.mainSource.conformFrameRate > 0 && isFinite(item.mainSource.displayFrameDuration)) {
                    return Number(item.mainSource.displayFrameDuration) * Number(item.mainSource.conformFrameRate);
                }
            } catch (e2) {}
            return -1;
        }

        function classifyAudioByDuration(item) {
            var duration = getItemDurationSeconds(item);
            if (duration >= 0 && duration < 5.0) {
                return "audio_sfx";
            }
            return "audio_music";
        }

        function classifyItem(item) {
            if (item instanceof CompItem) {
                return "compositions";
            }
            var ext = getLowerExt(item.name);
            if (
                ext === ".mp3" || ext === ".wav" || ext === ".aif" || ext === ".aiff" ||
                ext === ".m4a" || ext === ".aac" || ext === ".flac" || ext === ".ogg"
            ) {
                return "audio";
            }
            if (
                ext === ".mp4" || ext === ".mov" || ext === ".mxf" || ext === ".avi" ||
                ext === ".mpg" || ext === ".mpeg" || ext === ".mkv" || ext === ".webm" || ext === ".wmv"
            ) {
                return "storage";
            }
            return "assets";
        }

        function isIconLogoName(itemName) {
            var n = String(itemName || "").toLowerCase();
            return (
                n.indexOf("icon") !== -1 ||
                n.indexOf("icons") !== -1 ||
                n.indexOf("logo") !== -1 ||
                n.indexOf("brand") !== -1 ||
                n.indexOf("mark") !== -1
            );
        }

        function isNullAdjustmentName(itemName) {
            var n = String(itemName || "").toLowerCase();
            return (
                n.indexOf("null") !== -1 ||
                n.indexOf("adjustment layer") !== -1 ||
                n.indexOf("solid") !== -1
            );
        }

        function classifyAssetItem(item) {
            var ext = getLowerExt(item ? item.name : "");
            var isImage =
                ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".gif" ||
                ext === ".webp" || ext === ".bmp" || ext === ".tif" || ext === ".tiff";
            var isDesign =
                ext === ".psd" || ext === ".ai" || ext === ".svg" || ext === ".pdf" || ext === ".eps";
            var isIconCandidate =
                ext === ".png" || ext === ".svg" || ext === ".ai" || ext === ".psd" || ext === ".pdf";

            if (isNullAdjustmentName(item ? item.name : "")) {
                return "null_adjustment";
            }
            if (isIconCandidate && isIconLogoName(item ? item.name : "")) {
                return "icons_logo";
            }
            if (isImage) {
                return "images";
            }
            if (isDesign) {
                return "design_files";
            }
            return "unsorted";
        }

        function isMainComposition(item) {
            if (!(item instanceof CompItem)) {
                return false;
            }
            var nm = String(item.name || "").toLowerCase();
            return nm.indexOf("main") === 0;
        }

        function moveItemToFolder(item, folder) {
            try {
                if (item && folder && item.parentFolder !== folder) {
                    item.parentFolder = folder;
                    return true;
                }
            } catch (e) {}
            return false;
        }

        function keyInAliases(key, aliases) {
            var i;
            for (i = 0; i < aliases.length; i++) {
                if (key === aliases[i]) {
                    return true;
                }
            }
            return false;
        }

        function folderDepth(folder) {
            var depth = 0;
            var cursor = folder;
            try {
                while (cursor && cursor.parentFolder && cursor !== app.project.rootFolder) {
                    depth++;
                    cursor = cursor.parentFolder;
                }
            } catch (e) {}
            return depth;
        }

        function isDescendantFolder(candidateFolder, ancestorFolder) {
            if (!candidateFolder || !ancestorFolder) {
                return false;
            }
            try {
                var cursor = candidateFolder.parentFolder;
                while (cursor && cursor !== app.project.rootFolder) {
                    if (cursor === ancestorFolder) {
                        return true;
                    }
                    cursor = cursor.parentFolder;
                }
            } catch (e) {}
            return false;
        }

        var fAssets = null;
        var fComps = null;
        var fStorage = null;
        var fAudio = null;
        var fAudioSfx = null;
        var fAudioMusic = null;
        var fAssetsImages = null;
        var fAssetsDesign = null;
        var fAssetsIcons = null;
        var fAssetsImported = null;
        var fAssetsUnsorted = null;
        var fAssetsNullAdj = null;
        var fTrash = null;
        var movedCount = 0;
        var movedComps = 0;
        var movedAudioSfx = 0;
        var movedAudioMusic = 0;
        var movedStorage = 0;
        var movedAssets = 0;
        var movedImages = 0;
        var movedDesign = 0;
        var movedIcons = 0;
        var movedUnsorted = 0;
        var movedNullAdj = 0;
        var movedUnknownFolders = 0;
        var skippedMainCount = 0;
        var foldersMerged = 0;
        var foldersMovedToTrash = 0;
        var folderConflicts = 0;
        var mainMovedToRoot = 0;

        try {
            app.beginUndoGroup("Organizar Proyecto");

            fAssets = getOrCreateRootFolder("00_Assets", ["assets", "asset"]);
            fComps = getOrCreateRootFolder("01_Compositions", ["compositions", "composition", "comp", "comps", "precomp", "precomps"]);
            fStorage = getOrCreateRootFolder("02_Footage", ["footage", "storage", "video", "videos"]);
            fAudio = getOrCreateRootFolder("03_Audio", ["audio", "audios", "sound", "sounds"]);
            fAudioSfx = getOrCreateChildFolder(fAudio, "00_SFX", ["sfx", "fx", "soundfx"]);
            fAudioMusic = getOrCreateChildFolder(fAudio, "01_Music", ["music", "musica"]);
            fAssetsImages = getOrCreateChildFolder(fAssets, "01_Images", ["images", "imgs", "pictures"]);
            fAssetsDesign = getOrCreateChildFolder(fAssets, "02_DesignFiles", ["design", "designfiles", "artfiles", "sourcefiles"]);
            fAssetsIcons = getOrCreateChildFolder(fAssets, "03_Icons_Logo", ["icons", "icon", "logo", "logos", "brand", "marks"]);
            fAssetsImported = getOrCreateChildFolder(fAssets, "04_Imported_AE", ["90_Imported_AE", "importedae", "imported", "aeimport", "import"]);
            fAssetsUnsorted = getOrCreateChildFolder(fAssets, "05_Unsorted", ["99_Unsorted", "unsorted", "misc", "other"]);
            fAssetsNullAdj = getOrCreateChildFolder(fAssets, "06_Nulls_Adjustments", ["06_Nulls_Adjustments", "nullsadjustments"]);
            fTrash = getOrCreateRootFolder("99_Trash", ["trash", "bin", "archive"]);

            safeSetLabel(fAssets, 13);
            safeSetLabel(fComps, 2);
            safeSetLabel(fStorage, 9);
            safeSetLabel(fAudio, 5);
            safeSetLabel(fAudioSfx, 5);
            safeSetLabel(fAudioMusic, 5);
            safeSetLabel(fAssetsImages, 13);
            safeSetLabel(fAssetsDesign, 13);
            safeSetLabel(fAssetsIcons, 13);
            safeSetLabel(fAssetsImported, 13);
            safeSetLabel(fAssetsUnsorted, 13);
            safeSetLabel(fAssetsNullAdj, 13);
            safeSetLabel(fTrash, 1);

            function isCanonicalProtectedFolder(folderItem) {
                return (
                    folderItem === fAssets ||
                    folderItem === fComps ||
                    folderItem === fStorage ||
                    folderItem === fAudio ||
                    folderItem === fAudioSfx ||
                    folderItem === fAudioMusic ||
                    folderItem === fAssetsImages ||
                    folderItem === fAssetsDesign ||
                    folderItem === fAssetsIcons ||
                    folderItem === fAssetsImported ||
                    folderItem === fAssetsUnsorted ||
                    folderItem === fAssetsNullAdj ||
                    folderItem === fTrash
                );
            }

            var compositionKeys = ["composition", "compositions", "comp", "comps", "precomp", "precomps"];
            var footageKeys = ["footage", "storage", "video", "videos"];
            var audioRootKeys = ["audio", "audios", "sound", "sounds"];
            var sfxKeys = ["sfx", "fx", "soundfx"];
            var musicKeys = ["music", "musica"];
            var imagesKeys = ["images", "imgs", "pictures"];
            var designKeys = ["design", "designfiles", "artfiles", "sourcefiles"];
            var iconsKeys = ["icons", "icon", "logo", "logos", "brand", "marks", "iconslogo"];
            var importedKeys = ["importedae", "imported", "aeimport", "import"];
            var unsortedKeys = ["unsorted", "misc", "other"];
            var nullAdjKeys = ["nulls", "null", "adjustments", "adjustment", "solids", "solid", "nullsadjustments"];

            function getFolderCategory(folderItem) {
                if (!folderItem || !(folderItem instanceof FolderItem)) {
                    return "unknown";
                }
                if (folderItem === fAssets) return "assets";
                if (folderItem === fComps) return "compositions";
                if (folderItem === fStorage) return "footage";
                if (folderItem === fAudio) return "audio_root";
                if (folderItem === fAudioSfx) return "audio_sfx";
                if (folderItem === fAudioMusic) return "audio_music";

                var key = normalizeFolderKey(folderItem.name);
                if (key === "assets" || key === "asset") return "assets";
                if (keyInAliases(key, compositionKeys)) return "compositions";
                if (keyInAliases(key, footageKeys)) return "footage";
                if (keyInAliases(key, audioRootKeys)) return "audio_root";
                if (keyInAliases(key, sfxKeys)) return "audio_sfx";
                if (keyInAliases(key, musicKeys)) return "audio_music";
                if (keyInAliases(key, imagesKeys)) return "assets_images";
                if (keyInAliases(key, designKeys)) return "assets_design_files";
                if (keyInAliases(key, iconsKeys)) return "assets_icons_logo";
                if (keyInAliases(key, importedKeys)) return "assets_imported_ae";
                if (keyInAliases(key, unsortedKeys)) return "assets_unsorted";
                if (keyInAliases(key, nullAdjKeys)) return "assets_nulls_adjustments";
                return "unknown";
            }

            function getCanonicalFolderByCategory(category) {
                if (category === "assets") return fAssets;
                if (category === "compositions") return fComps;
                if (category === "footage") return fStorage;
                if (category === "audio_root") return fAudio;
                if (category === "audio_sfx") return fAudioSfx;
                if (category === "audio_music") return fAudioMusic;
                if (category === "assets_images") return fAssetsImages;
                if (category === "assets_design_files") return fAssetsDesign;
                if (category === "assets_icons_logo") return fAssetsIcons;
                if (category === "assets_imported_ae") return fAssetsImported;
                if (category === "assets_unsorted") return fAssetsUnsorted;
                if (category === "assets_nulls_adjustments") return fAssetsNullAdj;
                return null;
            }

            function moveFolderToTrashIfEmpty(folderItem) {
                if (!folderItem || !(folderItem instanceof FolderItem)) {
                    return false;
                }
                if (isCanonicalProtectedFolder(folderItem)) {
                    return false;
                }
                try {
                    if (folderItem.numItems === 0) {
                        if (folderItem.parentFolder === fTrash) {
                            return false;
                        }
                        folderItem.parentFolder = fTrash;
                        return true;
                    }
                } catch (e) {
                    folderConflicts++;
                }
                return false;
            }

            function moveFolderContents(sourceFolder, targetFolder) {
                if (!sourceFolder || !targetFolder || sourceFolder === targetFolder) {
                    return false;
                }
                var movedAny = false;
                var idx;
                for (idx = sourceFolder.numItems; idx >= 1; idx--) {
                    var child = null;
                    try {
                        child = sourceFolder.item(idx);
                    } catch (e0) {
                        child = null;
                    }
                    if (!child) {
                        continue;
                    }
                    if (child === targetFolder) {
                        folderConflicts++;
                        continue;
                    }
                    if (child instanceof FolderItem) {
                        if (isCanonicalProtectedFolder(child)) {
                            continue;
                        }
                        if (isDescendantFolder(targetFolder, child)) {
                            folderConflicts++;
                            continue;
                        }
                        try {
                            child.parentFolder = targetFolder;
                            movedAny = true;
                        } catch (e1) {
                            folderConflicts++;
                        }
                    } else {
                        try {
                            if (child.parentFolder !== targetFolder) {
                                child.parentFolder = targetFolder;
                                movedAny = true;
                            }
                        } catch (e2) {
                            folderConflicts++;
                        }
                    }
                }
                return movedAny;
            }

            var i;
            // Phase A: classify non-folder items.
            for (i = 1; i <= app.project.items.length; i++) {
                var item = app.project.items[i];
                if (!item || item === app.project.rootFolder) {
                    continue;
                }
                if (item instanceof FolderItem) {
                    continue;
                }
                if (isMainComposition(item)) {
                    if (item.parentFolder && item.parentFolder !== app.project.rootFolder) {
                        if (moveItemToFolder(item, app.project.rootFolder)) {
                            movedCount++;
                            mainMovedToRoot++;
                        }
                    }
                    skippedMainCount++;
                    continue;
                }

                var bucket = classifyItem(item);
                var moved = false;
                if (bucket === "compositions") {
                    moved = moveItemToFolder(item, fComps);
                    if (moved) movedComps++;
                } else if (bucket === "audio") {
                    var audioBucket = classifyAudioByDuration(item);
                    if (audioBucket === "audio_sfx") {
                        moved = moveItemToFolder(item, fAudioSfx);
                        if (moved) movedAudioSfx++;
                    } else {
                        moved = moveItemToFolder(item, fAudioMusic);
                        if (moved) movedAudioMusic++;
                    }
                } else if (bucket === "storage") {
                    moved = moveItemToFolder(item, fStorage);
                    if (moved) movedStorage++;
                } else {
                    var assetBucket = classifyAssetItem(item);
                    if (assetBucket === "icons_logo") {
                        moved = moveItemToFolder(item, fAssetsIcons);
                        if (moved) movedIcons++;
                    } else if (assetBucket === "images") {
                        moved = moveItemToFolder(item, fAssetsImages);
                        if (moved) movedImages++;
                    } else if (assetBucket === "design_files") {
                        moved = moveItemToFolder(item, fAssetsDesign);
                        if (moved) movedDesign++;
                    } else if (assetBucket === "null_adjustment") {
                        moved = moveItemToFolder(item, fAssetsNullAdj);
                        if (moved) movedNullAdj++;
                    } else {
                        moved = moveItemToFolder(item, fAssetsUnsorted);
                        if (moved) movedUnsorted++;
                    }
                    if (moved) movedAssets++;
                }
                if (moved) {
                    movedCount++;
                }
            }

            // Phase B: deduplicate folder structure in the whole tree.
            var folderList = [];
            for (i = 1; i <= app.project.items.length; i++) {
                item = app.project.items[i];
                if (item && (item instanceof FolderItem) && item !== app.project.rootFolder) {
                    folderList.push(item);
                }
            }
            folderList.sort(function (a, b) {
                return folderDepth(b) - folderDepth(a);
            });

            for (i = 0; i < folderList.length; i++) {
                var folder = folderList[i];
                if (!folder || !(folder instanceof FolderItem)) {
                    continue;
                }
                if (isCanonicalProtectedFolder(folder)) {
                    continue;
                }

                var category = getFolderCategory(folder);
                var targetFolder = getCanonicalFolderByCategory(category);
                if (category === "unknown") {
                    if (folder.parentFolder !== fAssetsImported) {
                        if (isDescendantFolder(fAssetsImported, folder)) {
                            folderConflicts++;
                        } else {
                            try {
                                folder.parentFolder = fAssetsImported;
                                movedCount++;
                                movedUnknownFolders++;
                            } catch (unknownMoveErr) {
                                folderConflicts++;
                            }
                        }
                    }
                    continue;
                }

                if (!targetFolder || folder === targetFolder) {
                    continue;
                }
                if (isDescendantFolder(targetFolder, folder)) {
                    folderConflicts++;
                    continue;
                }
                if (moveFolderContents(folder, targetFolder)) {
                    foldersMerged++;
                }
                if (moveFolderToTrashIfEmpty(folder)) {
                    foldersMovedToTrash++;
                }
            }

            notifyStatus(
                uiRefs,
                "Proyecto organizado. Movidos: " + movedCount +
                " (Comp: " + movedComps +
                ", SFX: " + movedAudioSfx +
                ", Music: " + movedAudioMusic +
                ", Footage: " + movedStorage +
                ", Assets: " + movedAssets +
                " [Images: " + movedImages +
                ", Design: " + movedDesign +
                ", Icons: " + movedIcons +
                ", Null/Adj: " + movedNullAdj +
                ", Unsorted: " + movedUnsorted + "]" +
                ", UnknownFolders->Imported_AE: " + movedUnknownFolders +
                ", Main omitidas: " + skippedMainCount +
                ", Main->Root: " + mainMovedToRoot +
                ", Folders merged: " + foldersMerged +
                ", Folders->Trash: " + foldersMovedToTrash +
                ", Folder conflicts/skipped: " + folderConflicts + ").",
                false
            );
        } catch (err) {
            notifyStatus(uiRefs, "Error organizando proyecto: " + err.toString(), true);
        } finally {
            try {
                app.endUndoGroup();
            } catch (undoErr) {}
        }
    }
    function roundGuidePosition(value, maxValue) {
        var rounded = Math.round(value);
        if (rounded < 0) {
            return 0;
        }
        if (rounded > maxValue) {
            return maxValue;
        }
        return rounded;
    }

    function addVerticalGuide(comp, positionPx) {
        if (!comp || typeof comp.addGuide !== "function") {
            return;
        }
        var x = roundGuidePosition(positionPx, comp.width);
        comp.addGuide(1, x);
    }

    function addHorizontalGuide(comp, positionPx) {
        if (!comp || typeof comp.addGuide !== "function") {
            return;
        }
        var y = roundGuidePosition(positionPx, comp.height);
        comp.addGuide(0, y);
    }

    function findGuidePresetById(presetId) {
        var id = String(presetId || "");
        var i;
        for (i = 0; i < GUIDE_PRESETS.length; i++) {
            if (GUIDE_PRESETS[i].id === id) {
                return GUIDE_PRESETS[i];
            }
        }
        return null;
    }

    function addGuidesByPreset(uiRefs, presetId) {
        if (!app.project) {
            return;
        }
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            return;
        }

        var preset = findGuidePresetById(presetId) || findGuidePresetById("generic_smpte_9093_cut43");
        if (!preset) {
            return;
        }

        var w = comp.width;
        var h = comp.height;
        var actionMarginX = w * (1 - preset.actionPct) / 2;
        var actionMarginY = h * (1 - preset.actionPct) / 2;
        var titleMarginX = w * (1 - preset.titlePct) / 2;
        var titleMarginY = h * (1 - preset.titlePct) / 2;
        var cut43X = w * 0.125;

        try {
            app.beginUndoGroup("Add TV/Platform Safe Guides");

            // Action safe area
            addVerticalGuide(comp, actionMarginX);
            addVerticalGuide(comp, w - actionMarginX);
            addHorizontalGuide(comp, actionMarginY);
            addHorizontalGuide(comp, h - actionMarginY);

            // Title safe area
            addVerticalGuide(comp, titleMarginX);
            addVerticalGuide(comp, w - titleMarginX);
            addHorizontalGuide(comp, titleMarginY);
            addHorizontalGuide(comp, h - titleMarginY);

            if (preset.includeCut43) {
                addVerticalGuide(comp, cut43X);
                addVerticalGuide(comp, w - cut43X);
            }

            if (preset.includeCenter) {
                addVerticalGuide(comp, w / 2);
                addHorizontalGuide(comp, h / 2);
            }

            notifyStatus(uiRefs, "Safe guides agregadas: " + preset.label, false);
        } catch (err) {
            notifyStatus(uiRefs, "Error al agregar safe guides: " + err.toString(), true);
        } finally {
            try {
                app.endUndoGroup();
            } catch (undoErr) {}
        }
    }

    function addTvSafeZoneGuides(uiRefs) {
        addGuidesByPreset(uiRefs, "generic_smpte_9093_cut43");
    }

    function parseIntFieldValue(input, fieldLabel, minValue) {
        var raw = input ? String(input.text || "") : "";
        raw = raw.replace(/^\s+|\s+$/g, "");
        if (!raw.length) {
            throw new Error(fieldLabel + " vacío.");
        }
        var parsed = Number(raw);
        if (!isFinite(parsed) || Math.floor(parsed) !== parsed || parsed < minValue) {
            throw new Error(fieldLabel + " inválido. Usa un entero >= " + minValue + ".");
        }
        return parsed;
    }

    function addMarginGuidesCustom(uiRefs, margins, columns, rows, gutterX, gutterY) {
        if (!app.project) {
            return;
        }
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            return;
        }

        var top = margins.top;
        var bottom = margins.bottom;
        var left = margins.left;
        var right = margins.right;

        if (!isFinite(top) || !isFinite(bottom) || !isFinite(left) || !isFinite(right)) {
            notifyStatus(uiRefs, "Márgenes inválidos.", true);
            return;
        }
        if (!isFinite(columns) || Math.floor(columns) !== columns || columns < 1) {
            notifyStatus(uiRefs, "Columns inválido. Usa un entero >= 1.", true);
            return;
        }
        if (!isFinite(rows) || Math.floor(rows) !== rows || rows < 1) {
            notifyStatus(uiRefs, "Rows inválido. Usa un entero >= 1.", true);
            return;
        }
        if (!isFinite(gutterX) || Math.floor(gutterX) !== gutterX || gutterX < 0) {
            notifyStatus(uiRefs, "Gutter X inválido. Usa un entero >= 0.", true);
            return;
        }
        if (!isFinite(gutterY) || Math.floor(gutterY) !== gutterY || gutterY < 0) {
            notifyStatus(uiRefs, "Gutter Y inválido. Usa un entero >= 0.", true);
            return;
        }

        var w = comp.width;
        var h = comp.height;
        if ((left + right) >= w || (top + bottom) >= h) {
            notifyStatus(uiRefs, "Márgenes inválidos: el área interna debe ser positiva.", true);
            return;
        }

        var innerLeft = left;
        var innerRight = w - right;
        var innerTop = top;
        var innerBottom = h - bottom;
        var innerWidth = innerRight - innerLeft;
        var innerHeight = innerBottom - innerTop;
        var usableWidth = innerWidth - (Math.max(0, columns - 1) * gutterX);
        var usableHeight = innerHeight - (Math.max(0, rows - 1) * gutterY);
        if (usableWidth <= 0 || usableHeight <= 0) {
            notifyStatus(uiRefs, "Gutter demasiado grande para el área interna.", true);
            return;
        }

        try {
            app.beginUndoGroup("Add Margin Guides");

            // Base guides: margins + comp center.
            addVerticalGuide(comp, innerLeft);
            addVerticalGuide(comp, innerRight);
            addHorizontalGuide(comp, innerTop);
            addHorizontalGuide(comp, innerBottom);
            addVerticalGuide(comp, w / 2);
            addHorizontalGuide(comp, h / 2);

            // Internal column divisions (without duplicating margin borders).
            if (columns > 1) {
                var colWidth = usableWidth / columns;
                var cursorX = innerLeft;
                var i;
                for (i = 1; i <= (columns - 1); i++) {
                    cursorX += colWidth;
                    addVerticalGuide(comp, cursorX); // left edge of gutter
                    cursorX += gutterX;
                    addVerticalGuide(comp, cursorX); // right edge of gutter
                }
            }

            // Internal row divisions (without duplicating margin borders).
            if (rows > 1) {
                var rowHeight = usableHeight / rows;
                var cursorY = innerTop;
                var j;
                for (j = 1; j <= (rows - 1); j++) {
                    cursorY += rowHeight;
                    addHorizontalGuide(comp, cursorY); // top edge of gutter
                    cursorY += gutterY;
                    addHorizontalGuide(comp, cursorY); // bottom edge of gutter
                }
            }

            notifyStatus(
                uiRefs,
                "Guides de margen agregadas. T/B/L/R: " + top + "/" + bottom + "/" + left + "/" + right +
                ", cols: " + columns + ", rows: " + rows +
                ", gutterX: " + gutterX + ", gutterY: " + gutterY + ".",
                false
            );
        } catch (err) {
            notifyStatus(uiRefs, "Error al agregar guides de margen: " + err.toString(), true);
        } finally {
            try {
                app.endUndoGroup();
            } catch (undoErr) {}
        }
    }

    function applyGuidesFromWindow(uiRefs, modeValue, marginInputs, presetDropdown) {
        var mode = String(modeValue || "Margins (px)");
        if (mode === "Preset") {
            var presetId = "generic_smpte_9093_cut43";
            try {
                if (presetDropdown && presetDropdown.selection && presetDropdown.selection.presetId) {
                    presetId = presetDropdown.selection.presetId;
                }
            } catch (presetErr) {}
            addGuidesByPreset(uiRefs, presetId);
            return;
        }

        try {
            var margins = {
                top: parseIntFieldValue(marginInputs.top, "Top", 0),
                bottom: parseIntFieldValue(marginInputs.bottom, "Bottom", 0),
                left: parseIntFieldValue(marginInputs.left, "Left", 0),
                right: parseIntFieldValue(marginInputs.right, "Right", 0)
            };
            var columns = parseIntFieldValue(marginInputs.columns, "Columns", 1);
            var rows = parseIntFieldValue(marginInputs.rows, "Rows", 1);
            var gutterX = parseIntFieldValue(marginInputs.gutterX, "Gutter X", 0);
            var gutterY = parseIntFieldValue(marginInputs.gutterY, "Gutter Y", 0);
            addMarginGuidesCustom(uiRefs, margins, columns, rows, gutterX, gutterY);
        } catch (parseErr) {
            notifyStatus(uiRefs, parseErr.toString(), true);
        }
    }

    function openGuideModeWindow(uiRefs) {
        if (appState.guidesWindow && appState.guidesWindow.visible) {
            try {
                appState.guidesWindow.show();
            } catch (e1) {}
            try {
                appState.guidesWindow.active = true;
            } catch (e2) {}
            return;
        }

        var win = new Window("palette", "Guides", undefined, { resizeable: true });
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 6;
        win.margins = 10;

        var modeGroup = win.add("group");
        modeGroup.orientation = "row";
        modeGroup.alignChildren = ["left", "center"];
        modeGroup.add("statictext", undefined, "Modo:");
        var modeDropdown = modeGroup.add("dropdownlist", undefined, ["Preset", "Margins (px)"]);
        modeDropdown.selection = 1;
        modeDropdown.preferredSize.width = 110;

        var presetGroup = win.add("group");
        presetGroup.orientation = "row";
        presetGroup.alignChildren = ["left", "center"];
        presetGroup.add("statictext", undefined, "Preset:");
        var presetLabels = [];
        var p;
        for (p = 0; p < GUIDE_PRESETS.length; p++) {
            presetLabels.push(GUIDE_PRESETS[p].label);
        }
        var presetDropdown = presetGroup.add("dropdownlist", undefined, presetLabels);
        var i;
        for (i = 0; i < GUIDE_PRESETS.length; i++) {
            presetDropdown.items[i].presetId = GUIDE_PRESETS[i].id;
        }
        presetDropdown.selection = GUIDE_PRESETS.length > 0 ? GUIDE_PRESETS.length - 1 : null;
        presetGroup.enabled = false;

        var marginPanel = win.add("panel", undefined, "Margins");
        marginPanel.orientation = "column";
        marginPanel.alignChildren = ["fill", "top"];
        marginPanel.margins = 10;
        marginPanel.enabled = true;
        marginPanel.spacing = 6;

        function createFieldRow(parent, label, defaultValue, width) {
            var row = parent.add("group");
            row.orientation = "row";
            row.alignChildren = ["left", "center"];
            row.spacing = 6;
            row.add("statictext", undefined, label);
            var input = row.add("edittext", undefined, defaultValue);
            input.characters = 7;
            if (width) {
                input.preferredSize.width = width;
            }
            return input;
        }

        var marginTopBottom = marginPanel.add("group");
        marginTopBottom.orientation = "row";
        marginTopBottom.alignChildren = ["fill", "center"];
        marginTopBottom.spacing = 10;
        var topInput = createFieldRow(marginTopBottom, "Top", "20");
        var bottomInput = createFieldRow(marginTopBottom, "Bottom", "20");

        var marginLeftRight = marginPanel.add("group");
        marginLeftRight.orientation = "row";
        marginLeftRight.alignChildren = ["fill", "center"];
        marginLeftRight.spacing = 10;
        var leftInput = createFieldRow(marginLeftRight, "Left", "20");
        var rightInput = createFieldRow(marginLeftRight, "Right", "20");

        var columnsPanel = win.add("panel", undefined, "Columns");
        columnsPanel.orientation = "column";
        columnsPanel.alignChildren = ["fill", "top"];
        columnsPanel.margins = 10;
        columnsPanel.spacing = 6;

        var colRow = columnsPanel.add("group");
        colRow.orientation = "row";
        colRow.alignChildren = ["left", "center"];
        colRow.spacing = 10;
        var columnsInput = createFieldRow(colRow, "Quantity", "3", 60);
        var colWidthInput = createFieldRow(colRow, "Width", "", 80);
        colWidthInput.enabled = false;
        var gutterXInput = createFieldRow(colRow, "Gutter", "20", 60);

        var rowsPanel = win.add("panel", undefined, "Rows");
        rowsPanel.orientation = "column";
        rowsPanel.alignChildren = ["fill", "top"];
        rowsPanel.margins = 10;
        rowsPanel.spacing = 6;

        var rowRow = rowsPanel.add("group");
        rowRow.orientation = "row";
        rowRow.alignChildren = ["left", "center"];
        rowRow.spacing = 10;
        var rowsInput = createFieldRow(rowRow, "Quantity", "1", 60);
        var rowHeightInput = createFieldRow(rowRow, "Height", "", 80);
        rowHeightInput.enabled = false;
        var gutterYInput = createFieldRow(rowRow, "Gutter", "20", 60);

        var actions = win.add("group");
        actions.orientation = "row";
        actions.alignChildren = ["left", "center"];
        actions.spacing = 8;
        var applyBtn = actions.add("button", undefined, "Add guides");
        applyBtn.preferredSize.width = 100;
        var closeBtn = actions.add("button", undefined, "Cerrar");
        closeBtn.preferredSize.width = 80;

        function updateDerivedMetrics() {
            var comp = app.project ? app.project.activeItem : null;
            if (!comp || !(comp instanceof CompItem)) {
                colWidthInput.text = "";
                rowHeightInput.text = "";
                return;
            }
            var left = Number(String(leftInput.text || "0"));
            var right = Number(String(rightInput.text || "0"));
            var top = Number(String(topInput.text || "0"));
            var bottom = Number(String(bottomInput.text || "0"));
            var cols = Number(String(columnsInput.text || "1"));
            var rows = Number(String(rowsInput.text || "1"));
            var gX = Number(String(gutterXInput.text || "0"));
            var gY = Number(String(gutterYInput.text || "0"));
            if (!isFinite(left) || !isFinite(right) || !isFinite(top) || !isFinite(bottom) || !isFinite(cols) || !isFinite(rows) || !isFinite(gX) || !isFinite(gY)) {
                return;
            }
            if (cols < 1) cols = 1;
            if (rows < 1) rows = 1;
            var innerW = (comp.width - right) - left;
            var innerH = (comp.height - bottom) - top;
            var usableW = innerW - (Math.max(0, cols - 1) * gX);
            var usableH = innerH - (Math.max(0, rows - 1) * gY);
            if (usableW > 0) {
                colWidthInput.text = (usableW / cols).toFixed(1) + "px";
            } else {
                colWidthInput.text = "--";
            }
            if (usableH > 0) {
                rowHeightInput.text = (usableH / rows).toFixed(1) + "px";
            } else {
                rowHeightInput.text = "--";
            }
        }

        modeDropdown.onChange = function () {
            var selected = modeDropdown.selection ? modeDropdown.selection.text : "Margins (px)";
            var isPreset = (selected === "Preset");
            presetGroup.enabled = isPreset;
            marginPanel.enabled = !isPreset;
            columnsPanel.enabled = !isPreset;
            rowsPanel.enabled = !isPreset;
        };

        function bindDigitsOnly(input) {
            input.onChanging = function () {
                var cleaned = String(input.text || "").replace(/[^\d]/g, "");
                if (input.text !== cleaned) {
                    input.text = cleaned;
                }
                updateDerivedMetrics();
            };
        }
        bindDigitsOnly(topInput);
        bindDigitsOnly(bottomInput);
        bindDigitsOnly(leftInput);
        bindDigitsOnly(rightInput);
        bindDigitsOnly(columnsInput);
        bindDigitsOnly(rowsInput);
        bindDigitsOnly(gutterXInput);
        bindDigitsOnly(gutterYInput);
        updateDerivedMetrics();

        applyBtn.onClick = function () {
            var selected = modeDropdown.selection ? modeDropdown.selection.text : "Margins (px)";
            applyGuidesFromWindow(
                uiRefs,
                selected,
                {
                    top: topInput,
                    bottom: bottomInput,
                    left: leftInput,
                    right: rightInput,
                    columns: columnsInput,
                    rows: rowsInput,
                    gutterX: gutterXInput,
                    gutterY: gutterYInput
                },
                presetDropdown
            );
            try {
                win.close();
            } catch (e4) {}
        };

        closeBtn.onClick = function () {
            try {
                win.close();
            } catch (e3) {}
        };

        win.onClose = function () {
            appState.guidesWindow = null;
            return true;
        };

        modeDropdown.onChange();
        appState.guidesWindow = win;
        win.show();
    }

    function setStatus(uiRefs, msg) {
        var target = uiRefs;
        if (!target || !target.statusText) {
            target = appState.uiLibrary || appState.ui;
        }
        if (!target || !target.statusText) {
            return;
        }
        target.statusText.text = msg;
        if (target.storagePathText) {
            target.storagePathText.text = "Datos: " + getLibraryPath();
        }
        try {
            target.statusText.parent.layout.layout(true);
        } catch (e) {}
    }

    function notifyStatus(uiRefs, msg, isError) {
        setStatus(uiRefs, msg);
        try {
            appendLog(msg);
        } catch (e1) {}
        var hasStatusText = false;
        try {
            var target = uiRefs;
            if (!target || !target.statusText) {
                target = appState.uiLibrary || appState.ui;
            }
            hasStatusText = !!(target && target.statusText);
        } catch (e2) {}
        if (!hasStatusText && isError) {
            try {
                alert(msg);
            } catch (e3) {}
        }
    }

    function parseSlidesInput(rawValue) {
        var text = String(rawValue || "").replace(/^\s+|\s+$/g, "");
        if (!text) {
            throw new Error("input vacío/no numérico");
        }
        var numeric = Number(text);
        if (!isFinite(numeric)) {
            throw new Error("input vacío/no numérico");
        }
        if (Math.floor(numeric) !== numeric) {
            throw new Error("input vacío/no numérico");
        }
        return numeric;
    }

    function clearCompMarkers(comp) {
        var markerProp = comp.markerProperty;
        var k;
        for (k = markerProp.numKeys; k >= 1; k--) {
            markerProp.removeKey(k);
        }
    }

    function insertAutoMarkersBySlides(slides) {
        if (!app.project) {
            throw new Error("sin proyecto");
        }
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            throw new Error("sin comp activa válida");
        }
        if (slides < 2) {
            throw new Error("slides < 2");
        }
        if (!isFinite(comp.duration) || comp.duration <= 0) {
            throw new Error("duración inválida");
        }

        var step = comp.duration / slides;
        var markerProp = comp.markerProperty;
        var i;
        try {
            app.beginUndoGroup("AutoMarker por slides");
            clearCompMarkers(comp);
            for (i = 1; i <= slides - 1; i++) {
                markerProp.setValueAtTime(i * step, new MarkerValue(""));
            }
        } finally {
            try {
                app.endUndoGroup();
            } catch (undoErr) {}
        }

        return {
            slides: slides,
            created: slides - 1,
            step: step
        };
    }

    function runAutoMarkerFromInput(inputField) {
        try {
            var slides = parseSlidesInput(inputField ? inputField.text : "");
            var result = insertAutoMarkersBySlides(slides);
            alert(
                "AutoMarker:\n" +
                "Slides: " + result.slides + "\n" +
                "Marcadores creados: " + result.created + "\n" +
                "Intervalo promedio: " + result.step.toFixed(3) + "s"
            );
        } catch (err) {
            alert("AutoMarker: " + err.message);
        }
    }

    function openAutoMarkerWindow() {
        if (appState.autoMarkerWindow && appState.autoMarkerWindow.visible) {
            try {
                appState.autoMarkerWindow.show();
            } catch (e1) {}
            try {
                appState.autoMarkerWindow.active = true;
            } catch (e2) {}
            return;
        }

        var win = new Window("palette", "AutoMarker", undefined, { resizeable: true });
        win.orientation = "row";
        win.alignChildren = ["left", "center"];
        win.spacing = 8;
        win.margins = 10;

        var slidesLabel = win.add("statictext", undefined, "No. de slides:");
        var slidesInput = win.add("edittext", undefined, "6");
        slidesInput.characters = 4;
        var insertBtn = win.add("button", undefined, "Insertar marcadores");

        slidesInput.onChanging = function () {
            var cleaned = String(slidesInput.text || "").replace(/[^\d]/g, "");
            if (slidesInput.text !== cleaned) {
                slidesInput.text = cleaned;
            }
        };

        insertBtn.onClick = function () {
            runAutoMarkerFromInput(slidesInput);
        };

        win.onClose = function () {
            appState.autoMarkerWindow = null;
            return true;
        };

        appState.autoMarkerWindow = win;
        win.show();
    }

    function parseResizeDimension(rawValue, label) {
        var text = String(rawValue || "").replace(/^\s+|\s+$/g, "");
        if (!text) {
            throw new Error(label + " vacío");
        }
        if (!/^\d+$/.test(text)) {
            throw new Error(label + " no numérico");
        }
        var value = parseInt(text, 10);
        if (!isFinite(value) || value < 4) {
            throw new Error(label + " debe ser >= 4");
        }
        if (value > 30000) {
            throw new Error(label + " debe ser <= 30000");
        }
        return value;
    }

    function collectCompTree(rootComp, visitedMap, outList) {
        if (!rootComp || !(rootComp instanceof CompItem)) {
            return;
        }
        var compId = String(rootComp.id);
        if (visitedMap[compId]) {
            return;
        }
        visitedMap[compId] = true;
        outList.push(rootComp);

        var i;
        for (i = 1; i <= rootComp.numLayers; i++) {
            var layer = null;
            try {
                layer = rootComp.layer(i);
            } catch (e0) {
                layer = null;
            }
            if (!layer) {
                continue;
            }
            var src = null;
            try {
                src = layer.source;
            } catch (e1) {
                src = null;
            }
            if (src && (src instanceof CompItem)) {
                collectCompTree(src, visitedMap, outList);
            }
        }
    }

    function applyResizeToCompTree(rootComp, targetW, targetH, uiRefs) {
        var visited = {};
        var comps = [];
        collectCompTree(rootComp, visited, comps);

        var changed = 0;
        var i;
        for (i = 0; i < comps.length; i++) {
            try {
                comps[i].width = targetW;
                comps[i].height = targetH;
                changed++;
            } catch (e) {}
        }

        notifyStatus(uiRefs, "Resize aplicado a " + changed + " comps: " + targetW + "x" + targetH, false);
        return changed;
    }

    function resizeActiveCompTree(uiRefs, widthText, heightText) {
        if (!app.project) {
            notifyStatus(uiRefs, "Resize: sin proyecto.", true);
            try { alert("Resize Comp Tree: sin proyecto."); } catch (e0) {}
            return false;
        }
        var rootComp = app.project.activeItem;
        if (!rootComp || !(rootComp instanceof CompItem)) {
            notifyStatus(uiRefs, "Resize: abre/activa una composición.", true);
            try { alert("Resize Comp Tree: abre/activa una composición."); } catch (e1) {}
            return false;
        }

        var targetW;
        var targetH;
        try {
            targetW = parseResizeDimension(widthText, "Width");
            targetH = parseResizeDimension(heightText, "Height");
        } catch (parseErr) {
            notifyStatus(uiRefs, "Resize: " + parseErr.message, true);
            try { alert("Resize Comp Tree: " + parseErr.message); } catch (e2) {}
            return false;
        }

        try {
            app.beginUndoGroup("Resize Comp Tree");
            applyResizeToCompTree(rootComp, targetW, targetH, uiRefs);
            return true;
        } catch (err) {
            notifyStatus(uiRefs, "Resize error: " + err.toString(), true);
            try { alert("Resize Comp Tree: " + err.toString()); } catch (e3) {}
            return false;
        } finally {
            try {
                app.endUndoGroup();
            } catch (undoErr) {}
        }
    }

    function openResizeCompTreeWindow(uiRefs) {
        if (appState.resizeCompWindow && appState.resizeCompWindow.visible) {
            try { appState.resizeCompWindow.show(); } catch (e1) {}
            try { appState.resizeCompWindow.active = true; } catch (e2) {}
            return;
        }

        var comp = (app.project && app.project.activeItem && (app.project.activeItem instanceof CompItem))
            ? app.project.activeItem
            : null;
        var defaultW = comp ? String(comp.width) : "1920";
        var defaultH = comp ? String(comp.height) : "1080";

        var win = new Window("palette", "Resize Comp Tree", undefined, { resizeable: true });
        win.orientation = "row";
        win.alignChildren = ["left", "center"];
        win.spacing = 8;
        win.margins = 10;

        var wLabel = win.add("statictext", undefined, "Width:");
        var wInput = win.add("edittext", undefined, defaultW);
        wInput.characters = 6;

        var hLabel = win.add("statictext", undefined, "Height:");
        var hInput = win.add("edittext", undefined, defaultH);
        hInput.characters = 6;

        var applyBtn = win.add("button", undefined, "Aplicar");
        var closeBtn = win.add("button", undefined, "Cerrar");

        function digitsOnly(input) {
            var cleaned = String(input.text || "").replace(/[^\d]/g, "");
            if (input.text !== cleaned) {
                input.text = cleaned;
            }
        }

        wInput.onChanging = function () { digitsOnly(wInput); };
        hInput.onChanging = function () { digitsOnly(hInput); };

        applyBtn.onClick = function () {
            resizeActiveCompTree(uiRefs, wInput.text, hInput.text);
        };
        closeBtn.onClick = function () {
            try { win.close(); } catch (e4) {}
        };

        win.onClose = function () {
            appState.resizeCompWindow = null;
            return true;
        };

        appState.resizeCompWindow = win;
        win.show();
    }

    function copyFromSelection(uiRefs) {
        var comp = getActiveComp();
        if (!comp) {
            setStatus(uiRefs, "No hay una composición activa.");
            return;
        }
        var selected = comp.selectedLayers;
        if (!selected || selected.length !== 1) {
            setStatus(uiRefs, "Selecciona exactamente 1 capa para copiar.");
            return;
        }

        try {
            app.beginUndoGroup("Copy Animation Template");
            var layer = selected[0];
            appState.copiedTemplate = createTemplateFromLayer(layer, "Unsaved");
            uiRefs.templateName.text = layer.name + "_anim";
            setStatus(
                uiRefs,
                "Animación copiada (" + appState.copiedTemplate.items.length + " propiedades). Ahora guarda el template."
            );
        } catch (e) {
            setStatus(uiRefs, "Error al copiar: " + e.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    function saveCopiedTemplate(uiRefs) {
        var name = String(uiRefs.templateName.text || "");
        name = name.replace(/^\s+|\s+$/g, "");
        if (!appState.copiedTemplate) {
            setStatus(uiRefs, "Primero usa 'Copiar Animación'.");
            return;
        }
        if (!name) {
            setStatus(uiRefs, "El nombre del template no puede estar vacío.");
            return;
        }
        if (templateNameExists(name, null)) {
            setStatus(uiRefs, "Ya existe un template con ese nombre.");
            return;
        }

        var t = cloneValue(appState.copiedTemplate);
        t.id = generateId();
        t.name = name;
        t.createdAt = toISODateString();

        try {
            appState.library.templates.push(t);
            var saveResult = persistLibrary();
            if (!saveResult.ok) {
                appState.library.templates.pop();
                setStatus(uiRefs, "Error al guardar template: " + saveResult.message);
                return;
            }
            refreshTemplateList(uiRefs);
            setStatus(uiRefs, "Template guardado: " + name);
        } catch (e) {
            setStatus(uiRefs, "Error al guardar template: " + e.toString());
        }
    }

    function applySelectedTemplate(uiRefs) {
        var selectedItem = uiRefs.templateList.selection;
        if (!selectedItem) {
            setStatus(uiRefs, "Selecciona un template de la biblioteca.");
            return;
        }
        var template = findTemplateById(selectedItem.templateId);
        if (!template) {
            setStatus(uiRefs, "El template seleccionado ya no existe. Refresca.");
            refreshTemplateList(uiRefs);
            return;
        }

        var comp = getActiveComp();
        if (!comp) {
            setStatus(uiRefs, "No hay una composición activa.");
            return;
        }
        var layers = comp.selectedLayers;
        if (!layers || layers.length === 0) {
            setStatus(uiRefs, "Selecciona al menos 1 capa destino.");
            return;
        }

        var startTime = comp.time;
        var totalAppliedLayers = 0;
        var totalAppliedProps = 0;
        var warnings = [];
        var i;

        app.beginUndoGroup("Apply Animation Template");
        try {
            for (i = 0; i < layers.length; i++) {
                if (layers[i].locked) {
                    warnings.push("Capa bloqueada omitida: " + layers[i].name);
                    continue;
                }
                var result = applyTemplateToLayer(template, layers[i], startTime);
                if (result.appliedCount > 0) {
                    totalAppliedLayers++;
                    totalAppliedProps += result.appliedCount;
                }
                if (result.warnings.length > 0) {
                    warnings = warnings.concat(result.warnings);
                }
            }
        } catch (e) {
            setStatus(uiRefs, "Error al aplicar: " + e.toString());
            app.endUndoGroup();
            return;
        }
        app.endUndoGroup();

        var msg = "Aplicado en " + totalAppliedLayers + " capa(s), " + totalAppliedProps + " propiedad(es).";
        if (warnings.length > 0) {
            msg += " Advertencias: " + warnings.length + ".";
        }
        setStatus(uiRefs, msg);
    }

    function renameSelectedTemplate(uiRefs) {
        var selectedItem = uiRefs.templateList.selection;
        if (!selectedItem) {
            setStatus(uiRefs, "Selecciona un template para renombrar.");
            return;
        }
        var t = findTemplateById(selectedItem.templateId);
        if (!t) {
            setStatus(uiRefs, "Template no encontrado.");
            refreshTemplateList(uiRefs);
            return;
        }

        var newName = prompt("Nuevo nombre para el template:", t.name);
        if (newName === null) {
            return;
        }
        newName = String(newName).replace(/^\s+|\s+$/g, "");
        if (!newName) {
            setStatus(uiRefs, "El nombre no puede estar vacío.");
            return;
        }
        if (templateNameExists(newName, t.id)) {
            setStatus(uiRefs, "Ya existe un template con ese nombre.");
            return;
        }

        try {
            renameTemplate(t.id, newName);
            var saveResult = persistLibrary();
            if (!saveResult.ok) {
                setStatus(uiRefs, "Error al renombrar: " + saveResult.message);
                return;
            }
            refreshTemplateList(uiRefs);
            setStatus(uiRefs, "Template renombrado a: " + newName);
        } catch (e) {
            setStatus(uiRefs, "Error al renombrar: " + e.toString());
        }
    }

    function deleteSelectedTemplate(uiRefs) {
        var selectedItem = uiRefs.templateList.selection;
        if (!selectedItem) {
            setStatus(uiRefs, "Selecciona un template para eliminar.");
            return;
        }
        var t = findTemplateById(selectedItem.templateId);
        if (!t) {
            setStatus(uiRefs, "Template no encontrado.");
            refreshTemplateList(uiRefs);
            return;
        }

        var confirmed = confirm("¿Eliminar template '" + t.name + "'?");
        if (!confirmed) {
            return;
        }

        try {
            deleteTemplate(t.id);
            var saveResult = persistLibrary();
            if (!saveResult.ok) {
                setStatus(uiRefs, "Error al eliminar: " + saveResult.message);
                return;
            }
            refreshTemplateList(uiRefs);
            setStatus(uiRefs, "Template eliminado: " + t.name);
        } catch (e) {
            setStatus(uiRefs, "Error al eliminar: " + e.toString());
        }
    }

    function openDataFolder(uiRefs) {
        var folder = new Folder(getLibraryFolderPath());
        try {
            if (!folder.exists) {
                folder.create();
            }
            if (!folder.execute()) {
                setStatus(uiRefs, "No se pudo abrir la carpeta de datos.");
                return;
            }
            setStatus(uiRefs, "Carpeta de datos abierta.");
        } catch (e) {
            setStatus(uiRefs, "Error al abrir carpeta: " + e.toString());
        }
    }

    function applyExpressionToSelection(uiRefs, expressionText) {
        var comp = getActiveComp();
        if (!comp) {
            setStatus(uiRefs, "No hay una composición activa.");
            return;
        }

        var selectedProps = comp.selectedProperties;
        if (!selectedProps || selectedProps.length === 0) {
            setStatus(uiRefs, "Selecciona una o más propiedades para aplicar la expresión.");
            return;
        }

        var applied = 0;
        var skipped = 0;
        var i;
        app.beginUndoGroup("Apply Quick Expression");
        try {
            for (i = 0; i < selectedProps.length; i++) {
                var prop = selectedProps[i];
                if (!prop || prop.propertyType !== PropertyType.PROPERTY) {
                    skipped++;
                    continue;
                }
                try {
                    if (prop.canSetExpression) {
                        prop.expression = expressionText;
                        prop.expressionEnabled = true;
                        applied++;
                    } else {
                        skipped++;
                    }
                } catch (e) {
                    skipped++;
                }
            }
        } finally {
            app.endUndoGroup();
        }

        setStatus(uiRefs, "Expresión aplicada en " + applied + " propiedad(es). Omitidas: " + skipped + ".");
    }

    function applyKeySpacing(uiRefs, intervalSeconds, labelText) {
        var comp = getActiveComp();
        if (!comp) {
            setStatus(uiRefs, "No hay una composición activa.");
            return;
        }

        var grouped = collectSelectedKeyframesByProperty(comp);
        if (!grouped || grouped.length === 0) {
            setStatus(uiRefs, "Selecciona keyframes en una o más propiedades.");
            return;
        }

        var hasValidGroup = false;
        var i;
        for (i = 0; i < grouped.length; i++) {
            if (grouped[i].keys && grouped[i].keys.length >= 2) {
                hasValidGroup = true;
                break;
            }
        }
        if (!hasValidGroup) {
            setStatus(uiRefs, "Necesitas al menos 2 keyframes seleccionados por propiedad.");
            return;
        }

        app.beginUndoGroup("Respace Selected Keys " + labelText);
        var result;
        try {
            result = respacingSelectedKeys(grouped, intervalSeconds);
        } catch (e) {
            app.endUndoGroup();
            setStatus(uiRefs, "Error reespaciando keyframes: " + e.toString());
            return;
        }
        app.endUndoGroup();

        setStatus(
            uiRefs,
            "Reespaciado " + labelText + ": propiedades " + result.affectedProps +
            ", keyframes movidos " + result.movedKeys +
            ", keys omitidos " + result.omittedKeys +
            ", props omitidas " + result.skippedProps +
            ", errores " + result.restoreErrors + "."
        );
    }

    function pushSelectedLayersByOffset(uiRefs, offsetSeconds) {
        var comp = getActiveComp();
        if (!comp) {
            notifyStatus(uiRefs, "Push layers: no hay composición activa.", true);
            return;
        }

        var layers = comp.selectedLayers;
        if (!layers || layers.length === 0) {
            notifyStatus(uiRefs, "Push layers: selecciona una o más capas.", true);
            return;
        }

        var moved = 0;
        var skippedLocked = 0;
        var skippedError = 0;
        var i;

        app.beginUndoGroup("Push Selected Layers");
        try {
            for (i = 0; i < layers.length; i++) {
                var layer = layers[i];
                if (!layer) {
                    skippedError++;
                    continue;
                }
                var isLocked = false;
                try {
                    isLocked = !!layer.locked;
                } catch (lockErr) {
                    isLocked = false;
                }
                if (isLocked) {
                    skippedLocked++;
                    continue;
                }
                try {
                    layer.startTime = layer.startTime + offsetSeconds;
                    moved++;
                } catch (moveErr) {
                    skippedError++;
                }
            }
        } finally {
            try {
                app.endUndoGroup();
            } catch (undoErr) {}
        }

        notifyStatus(
            uiRefs,
            "Push +" + offsetSeconds + "s: movidas " + moved +
            ", bloqueadas " + skippedLocked +
            ", omitidas " + skippedError + ".",
            false
        );
    }

    function findEasingPresetById(presetId) {
        var i;
        for (i = 0; i < EASING_PRESETS.length; i++) {
            if (EASING_PRESETS[i].id === presetId) {
                return EASING_PRESETS[i];
            }
        }
        return null;
    }

    function getSelectedEasingPreset() {
        var preset = findEasingPresetById(appState.selectedPresetId);
        if (!preset && EASING_PRESETS.length > 0) {
            preset = EASING_PRESETS[0];
        }
        return preset;
    }

    function getEasingInfluencePair(preset) {
        var curve = preset && preset.curve ? preset.curve : [0, 0, 1, 1];
        return {
            outInfluence: clampNumber(curve[0] * 100, 1, 99),
            inInfluence: clampNumber((1 - curve[2]) * 100, 1, 99)
        };
    }

    function getEaseDimensionCountForProperty(prop) {
        var pvt = prop.propertyValueType;
        if (pvt === PropertyValueType.OneD) {
            return 1;
        }
        if (pvt === PropertyValueType.TwoD || pvt === PropertyValueType.TwoD_SPATIAL) {
            return 2;
        }
        if (pvt === PropertyValueType.ThreeD || pvt === PropertyValueType.ThreeD_SPATIAL) {
            return 3;
        }
        if (pvt === PropertyValueType.COLOR) {
            return 4;
        }
        return 1;
    }

    function isEasingCompatibleProperty(prop) {
        if (!prop || prop.propertyType !== PropertyType.PROPERTY) {
            return false;
        }
        var pvt;
        try {
            pvt = prop.propertyValueType;
        } catch (e) {
            return false;
        }

        return (
            pvt === PropertyValueType.OneD ||
            pvt === PropertyValueType.TwoD ||
            pvt === PropertyValueType.ThreeD ||
            pvt === PropertyValueType.TwoD_SPATIAL ||
            pvt === PropertyValueType.ThreeD_SPATIAL ||
            pvt === PropertyValueType.COLOR
        );
    }

    function buildEaseArrayWithInfluence(existingEaseArray, influence, dimensions) {
        var out = [];
        var count = dimensions;
        var i;
        if (existingEaseArray && existingEaseArray.constructor === Array && existingEaseArray.length > 0) {
            count = existingEaseArray.length;
        }
        if (!count || count < 1) {
            count = 1;
        }

        for (i = 0; i < count; i++) {
            var speed = 0;
            if (existingEaseArray && existingEaseArray.constructor === Array && existingEaseArray.length > 0) {
                var source = existingEaseArray[Math.min(i, existingEaseArray.length - 1)];
                if (source && isNumber(source.speed)) {
                    speed = source.speed;
                }
            }
            out.push(new KeyframeEase(speed, influence));
        }
        return out;
    }

    function applyPresetToSegment(prop, startKeyIndex, endKeyIndex, preset, influencePair) {
        var desiredType = preset.isLinear ? KeyframeInterpolationType.LINEAR : KeyframeInterpolationType.BEZIER;
        var dimensions = getEaseDimensionCountForProperty(prop);
        var startInType = desiredType;
        var endOutType = desiredType;
        var ok = true;

        try {
            startInType = prop.keyInInterpolationType(startKeyIndex);
        } catch (e1) {}
        try {
            endOutType = prop.keyOutInterpolationType(endKeyIndex);
        } catch (e2) {}

        try {
            prop.setInterpolationTypeAtKey(startKeyIndex, startInType, desiredType);
        } catch (e3) {
            ok = false;
        }
        try {
            prop.setInterpolationTypeAtKey(endKeyIndex, desiredType, endOutType);
        } catch (e4) {
            ok = false;
        }

        if (!preset.isLinear) {
            var startInEase = [];
            var startOutEase = [];
            var endInEase = [];
            var endOutEase = [];

            try {
                startInEase = prop.keyInTemporalEase(startKeyIndex);
            } catch (e5) {}
            try {
                startOutEase = prop.keyOutTemporalEase(startKeyIndex);
            } catch (e6) {}
            try {
                prop.setTemporalEaseAtKey(
                    startKeyIndex,
                    startInEase,
                    buildEaseArrayWithInfluence(startOutEase, influencePair.outInfluence, dimensions)
                );
            } catch (e7) {
                ok = false;
            }

            try {
                endInEase = prop.keyInTemporalEase(endKeyIndex);
            } catch (e8) {}
            try {
                endOutEase = prop.keyOutTemporalEase(endKeyIndex);
            } catch (e9) {}
            try {
                prop.setTemporalEaseAtKey(
                    endKeyIndex,
                    buildEaseArrayWithInfluence(endInEase, influencePair.inInfluence, dimensions),
                    endOutEase
                );
            } catch (e10) {
                ok = false;
            }
        }

        try {
            prop.setTemporalAutoBezierAtKey(startKeyIndex, false);
        } catch (e11) {}
        try {
            prop.setTemporalContinuousAtKey(startKeyIndex, false);
        } catch (e12) {}
        try {
            prop.setTemporalAutoBezierAtKey(endKeyIndex, false);
        } catch (e13) {}
        try {
            prop.setTemporalContinuousAtKey(endKeyIndex, false);
        } catch (e14) {}

        return ok;
    }

    function applySelectedEasingPreset(uiRefs) {
        var preset = getSelectedEasingPreset();
        if (!preset) {
            setStatus(uiRefs, "No hay presets de easing disponibles.");
            return;
        }

        var comp = getActiveComp();
        if (!comp) {
            setStatus(uiRefs, "No hay una composición activa.");
            return;
        }

        var grouped = collectSelectedKeyframesByProperty(comp);
        if (!grouped || grouped.length === 0) {
            setStatus(uiRefs, "Selecciona keyframes en una o más propiedades.");
            return;
        }

        var hasValidGroup = false;
        var i;
        for (i = 0; i < grouped.length; i++) {
            if (grouped[i].keys && grouped[i].keys.length >= 2) {
                hasValidGroup = true;
                break;
            }
        }
        if (!hasValidGroup) {
            setStatus(uiRefs, "Necesitas al menos 2 keyframes seleccionados por propiedad.");
            return;
        }

        var influencePair = getEasingInfluencePair(preset);
        var affectedProps = 0;
        var appliedSegments = 0;
        var omittedProps = 0;
        var errors = 0;
        var fatalError = null;
        var k;

        app.beginUndoGroup("Apply Easing Preset");
        try {
            for (i = 0; i < grouped.length; i++) {
                var group = grouped[i];
                var prop = group.prop;
                var keys = group.keys;

                if (!keys || keys.length < 2) {
                    omittedProps++;
                    continue;
                }
                if (!isEasingCompatibleProperty(prop)) {
                    omittedProps++;
                    continue;
                }

                var propAppliedSegments = 0;
                for (k = 0; k < keys.length - 1; k++) {
                    var startIndex = findKeyIndexAtTime(prop, keys[k].time);
                    var endIndex = findKeyIndexAtTime(prop, keys[k + 1].time);

                    if (startIndex === -1 || endIndex === -1) {
                        errors++;
                        continue;
                    }

                    if (applyPresetToSegment(prop, startIndex, endIndex, preset, influencePair)) {
                        appliedSegments++;
                        propAppliedSegments++;
                    } else {
                        errors++;
                    }
                }

                if (propAppliedSegments > 0) {
                    affectedProps++;
                } else {
                    omittedProps++;
                }
            }
        } catch (e) {
            fatalError = e;
        } finally {
            app.endUndoGroup();
        }

        if (fatalError) {
            setStatus(uiRefs, "Error aplicando easing: " + fatalError.toString());
            return;
        }

        setStatus(
            uiRefs,
            "Easing '" + preset.label + "' aplicado: propiedades " + affectedProps +
            ", segmentos " + appliedSegments +
            ", omitidas " + omittedProps +
            ", errores " + errors + "."
        );
    }

    function findPresetCardById(presetId) {
        var i;
        for (i = 0; i < appState.presetCards.length; i++) {
            if (appState.presetCards[i] && appState.presetCards[i].presetId === presetId) {
                return appState.presetCards[i];
            }
        }
        return null;
    }

    function redrawPresetCard(card) {
        if (!card) {
            return;
        }
        try {
            card.notify("onDraw");
        } catch (e1) {}
        try {
            if (card.window) {
                card.window.update();
            }
        } catch (e2) {}
    }

    function redrawPresetCards() {
        var i;
        for (i = 0; i < appState.presetCards.length; i++) {
            redrawPresetCard(appState.presetCards[i]);
        }
    }

    function ensurePreviewBridge() {
        if (!appState.previewScheduleSupported) {
            return false;
        }
        if (appState.previewBridgeReady) {
            return true;
        }
        if (!app || (typeof app.scheduleTask !== "function")) {
            appState.previewScheduleSupported = false;
            return false;
        }

        try {
            $.global.__AEAnimLibrary2026PreviewTick = function () {
                onPreviewTick();
            };
            appState.previewBridgeReady = true;
            return true;
        } catch (e) {
            appState.previewScheduleSupported = false;
            return false;
        }
    }

    function scheduleNextPreviewTick() {
        if (!appState.previewTickerActive || !appState.hoverPresetId) {
            return;
        }
        try {
            appState.previewTaskId = app.scheduleTask(
                "try{$.global.__AEAnimLibrary2026PreviewTick&&$.global.__AEAnimLibrary2026PreviewTick();}catch(e){}",
                PREVIEW_TICK_MS,
                false
            );
        } catch (e) {
            appState.previewScheduleSupported = false;
            appState.previewTickerActive = false;
            appState.previewTaskId = null;
            redrawPresetCards();
        }
    }

    function onPreviewTick() {
        appState.previewTaskId = null;
        if (!appState.previewTickerActive) {
            return;
        }
        if (!appState.hoverPresetId) {
            appState.previewTickerActive = false;
            return;
        }
        redrawPresetCard(findPresetCardById(appState.hoverPresetId));
        scheduleNextPreviewTick();
    }

    function startPreviewTicker() {
        if (!appState.hoverPresetId) {
            return;
        }
        if (!ensurePreviewBridge()) {
            return;
        }
        if (appState.previewTickerActive) {
            return;
        }
        appState.previewTickerActive = true;
        appState.hoverStartMs = getNowMs();
        scheduleNextPreviewTick();
    }

    function stopPreviewTicker() {
        appState.previewTickerActive = false;
        if (appState.previewTaskId !== null && appState.previewTaskId !== undefined && (typeof app.cancelTask === "function")) {
            try {
                app.cancelTask(appState.previewTaskId);
            } catch (e) {}
        }
        appState.previewTaskId = null;
    }

    function setHoveredPreset(presetId) {
        var previous = appState.hoverPresetId;
        if (previous === presetId) {
            return;
        }

        appState.hoverPresetId = presetId;
        appState.hoverStartMs = getNowMs();

        if (presetId) {
            startPreviewTicker();
        } else {
            stopPreviewTicker();
        }

        redrawPresetCard(findPresetCardById(previous));
        redrawPresetCard(findPresetCardById(presetId));
    }

    function toDisplayPresetLabel(label) {
        if (!label || !label.length) {
            return "";
        }
        return String(label.charAt(0)).toUpperCase() + String(label.substring(1));
    }

    function setSelectedEasingPreset(uiRefs, presetId, silentStatus) {
        var preset = findEasingPresetById(presetId);
        if (!preset) {
            return;
        }
        appState.selectedPresetId = preset.id;
        if (uiRefs.selectedPresetText) {
            uiRefs.selectedPresetText.text = "Preset: " + toDisplayPresetLabel(preset.label);
        }
        redrawPresetCards();

        if (!silentStatus) {
            setStatus(uiRefs, "Preset de easing seleccionado: " + toDisplayPresetLabel(preset.label) + ".");
        }
    }

    function drawCircle(graphics, x, y, radius, brush) {
        graphics.newPath();
        if (typeof graphics.ellipsePath === "function") {
            graphics.ellipsePath(x - radius, y - radius, radius * 2, radius * 2);
        } else {
            graphics.rectPath(x - radius, y - radius, radius * 2, radius * 2);
        }
        graphics.fillPath(brush);
    }

    function drawEasingPresetCard(card, preset, isFeatured) {
        var graphics = card.graphics;
        var bounds = card.bounds;
        var width = bounds[2] - bounds[0];
        var height = bounds[3] - bounds[1];
        if (width <= 0 || height <= 0) {
            width = isFeatured ? 320 : PRESET_CARD_DEFAULT_WIDTH;
            height = isFeatured ? FEATURED_PRESET_HEIGHT : PRESET_CARD_HEIGHT;
        }

        var isSelected = appState.selectedPresetId === preset.id;
        var isHovered = appState.hoverPresetId === preset.id;
        var canAnimate = isHovered && appState.previewTickerActive && appState.previewScheduleSupported;

        var bgColor = [0.14, 0.14, 0.15, 1];
        var borderColor = isSelected ? [0.45, 0.45, 0.45, 1] : [0.30, 0.30, 0.30, 1];
        if (isHovered) {
            borderColor = HOVER_BORDER_GREEN;
        }

        var railColor = [0.58, 0.58, 0.58, 1];
        var dotColor = [0.90, 0.90, 0.90, 1];
        var labelColor = isSelected ? [0.95, 0.95, 0.95, 1] : [0.90, 0.90, 0.90, 1];

        graphics.newPath();
        graphics.rectPath(0, 0, width, height);
        graphics.fillPath(graphics.newBrush(graphics.BrushType.SOLID_COLOR, bgColor));

        graphics.newPath();
        graphics.rectPath(0.5, 0.5, width - 1, height - 1);
        graphics.strokePath(graphics.newPen(graphics.PenType.SOLID_COLOR, borderColor, 1));

        var railLeft = 6;
        var railRight = width - 6;
        var railY = 30;
        var railWidth = railRight - railLeft;

        graphics.newPath();
        graphics.moveTo(railLeft, railY);
        graphics.lineTo(railRight, railY);
        graphics.strokePath(graphics.newPen(graphics.PenType.SOLID_COLOR, railColor, 1));

        var i;
        if (canAnimate) {
            var loopT = ((getNowMs() - appState.hoverStartMs) % PREVIEW_LOOP_MS) / PREVIEW_LOOP_MS;
            var easedT = preset.fn(loopT);
            var dotX = railLeft + (railWidth * easedT);
            drawCircle(graphics, dotX, railY, 4.0, graphics.newBrush(graphics.BrushType.SOLID_COLOR, dotColor));
        } else {
            var dots = 6;
            for (i = 0; i < dots; i++) {
                var sampleT = i / (dots - 1);
                var sampleX = railLeft + (railWidth * preset.fn(sampleT));
                drawCircle(
                    graphics,
                    sampleX,
                    railY,
                    3.6,
                    graphics.newBrush(graphics.BrushType.SOLID_COLOR, dotColor)
                );
            }
        }

        graphics.drawString(
            toDisplayPresetLabel(preset.label),
            graphics.newPen(graphics.PenType.SOLID_COLOR, labelColor, 1),
            7,
            7
        );
    }

    function getControlWidth(control) {
        var width = 0;
        try {
            if (control && control.size && control.size.length > 0) {
                width = control.size[0];
            }
        } catch (e1) {}
        if (width > 0) {
            return width;
        }
        try {
            if (control && control.bounds) {
                width = control.bounds[2] - control.bounds[0];
            }
        } catch (e2) {}
        return (width > 0) ? width : 0;
    }

    function getControlHeight(control) {
        var height = 0;
        try {
            if (control && control.size && control.size.length > 1) {
                height = control.size[1];
            }
        } catch (e1) {}
        if (height > 0) {
            return height;
        }
        try {
            if (control && control.bounds) {
                height = control.bounds[3] - control.bounds[1];
            }
        } catch (e2) {}
        return (height > 0) ? height : 0;
    }

    function layoutEasingPresetGrid(uiRefs) {
        if (!uiRefs || !uiRefs.easingGrid || !appState.presetRows || appState.presetRows.length === 0) {
            return;
        }

        var availableWidth = getControlWidth(uiRefs.easingViewport);
        if (availableWidth <= 0) {
            availableWidth = PRESET_CARD_DEFAULT_WIDTH;
        }
        var targetWidth = Math.floor(availableWidth - 2);
        if (targetWidth < PRESET_CARD_MIN_WIDTH) {
            targetWidth = PRESET_CARD_MIN_WIDTH;
        }

        var i;
        var j;
        for (i = 0; i < appState.presetRows.length; i++) {
            var row = appState.presetRows[i];
            for (j = 0; j < row.children.length; j++) {
                var child = row.children[j];
                child.minimumSize = [targetWidth, PRESET_CARD_HEIGHT];
                child.maximumSize = [targetWidth, PRESET_CARD_HEIGHT];
                child.preferredSize = [targetWidth, PRESET_CARD_HEIGHT];
            }
        }
    }

    function applyPresetScroll(uiRefs, requestedValue) {
        if (!uiRefs || !appState.presetRows || appState.presetRows.length === 0) {
            return;
        }

        var rowsPerPage = appState.presetRowsPerPage;
        if (!rowsPerPage || rowsPerPage < 1) {
            rowsPerPage = appState.presetRows.length;
        }
        var maxStart = Math.max(0, appState.presetRows.length - rowsPerPage);
        var startRow = 0;
        if (isNumber(requestedValue)) {
            startRow = requestedValue;
        } else if (uiRefs.easingScrollBar) {
            startRow = uiRefs.easingScrollBar.value;
        }
        startRow = Math.round(clampNumber(startRow, 0, maxStart));

        if (uiRefs.easingScrollBar) {
            uiRefs.easingScrollBar.value = startRow;
        }

        var i;
        for (i = 0; i < appState.presetRows.length; i++) {
            appState.presetRows[i].visible = (i >= startRow && i < (startRow + rowsPerPage));
        }

        try {
            uiRefs.easingGrid.layout.layout(true);
        } catch (e1) {}
        try {
            uiRefs.easingViewport.layout.layout(true);
        } catch (e2) {}
    }

    function updatePresetScrollbar(uiRefs) {
        if (!uiRefs || !uiRefs.easingScrollBar) {
            return;
        }

        var totalRows = appState.presetRows ? appState.presetRows.length : 0;
        var viewportHeight = getControlHeight(uiRefs.easingViewport);
        if (viewportHeight <= 0) {
            viewportHeight = PRESET_VIEWPORT_HEIGHT;
        }

        var rowUnit = PRESET_CARD_HEIGHT + PRESET_GRID_GAP;
        var rowsPerPage = Math.max(1, Math.floor((viewportHeight + PRESET_GRID_GAP) / rowUnit));
        appState.presetRowsPerPage = rowsPerPage;

        var maxStart = Math.max(0, totalRows - rowsPerPage);
        uiRefs.easingScrollBar.minvalue = 0;
        uiRefs.easingScrollBar.maxvalue = maxStart;
        uiRefs.easingScrollBar.stepdelta = 1;
        uiRefs.easingScrollBar.jumpdelta = Math.max(1, rowsPerPage - 1);
        uiRefs.easingScrollBar.enabled = maxStart > 0;

        if (uiRefs.easingScrollBar.value > maxStart) {
            uiRefs.easingScrollBar.value = maxStart;
        }
        if (uiRefs.easingScrollBar.value < 0) {
            uiRefs.easingScrollBar.value = 0;
        }

        applyPresetScroll(uiRefs, uiRefs.easingScrollBar.value);
    }

    function buildEasingPresetGrid(container, uiRefs) {
        var i;
        for (i = container.children.length - 1; i >= 0; i--) {
            container.remove(container.children[i]);
        }

        appState.presetCards = [];
        appState.presetRows = [];

        for (i = 0; i < EASING_PRESETS.length; i++) {
            var row = container.add("group");
            row.orientation = "row";
            row.alignChildren = ["fill", "top"];
            row.spacing = 0;
            row.alignment = ["fill", "top"];
            appState.presetRows.push(row);

            var preset = EASING_PRESETS[i];
            var card = row.add("button", undefined, "");
            card.minimumSize = [PRESET_CARD_MIN_WIDTH, PRESET_CARD_HEIGHT];
            card.maximumSize = [10000, PRESET_CARD_HEIGHT];
            card.preferredSize = [PRESET_CARD_DEFAULT_WIDTH, PRESET_CARD_HEIGHT];
            card.helpTip = "Preview " + preset.label;
            card.presetId = preset.id;

            card.onDraw = function () {
                var currentPreset = findEasingPresetById(this.presetId);
                if (currentPreset) {
                    drawEasingPresetCard(this, currentPreset, false);
                }
            };

            card.onClick = function () {
                setSelectedEasingPreset(uiRefs, this.presetId, false);
            };

            try {
                card.addEventListener("mouseover", function () {
                    setHoveredPreset(this.presetId);
                });
            } catch (mouseoverErr) {}

            try {
                card.addEventListener("mouseout", function () {
                    if (appState.hoverPresetId === this.presetId) {
                        setHoveredPreset(null);
                    }
                });
            } catch (mouseoutErr) {}

            appState.presetCards.push(card);
        }

        layoutEasingPresetGrid(uiRefs);
        updatePresetScrollbar(uiRefs);
    }

    function closeQuickWindow() {
        if (appState.quickWindow && appState.quickWindow.visible) {
            try {
                appState.quickWindow.close();
            } catch (e) {}
        }
        appState.quickWindow = null;
        appState.uiQuick = null;
    }

    function closeEasingWindow() {
        if (appState.easingWindow && appState.easingWindow.visible) {
            try {
                appState.easingWindow.close();
            } catch (e) {}
        }
        appState.easingWindow = null;
        appState.uiEasing = null;
    }

    function createQuickSeparator(container) {
        var sep = container.add("group");
        sep.minimumSize = [2, 34];
        sep.preferredSize = [2, 34];
        sep.maximumSize = [2, 34];
        sep.alignment = ["left", "center"];
        sep.onDraw = function () {
            var g = this.graphics;
            var w = this.size[0] || 2;
            var h = this.size[1] || 34;
            var x = Math.round(w / 2);
            var pen = g.newPen(g.PenType.SOLID_COLOR, QUICK_BTN_BORDER, 1);
            g.newPath();
            g.moveTo(x, 1);
            g.lineTo(x, h - 1);
            g.strokePath(pen);
        };
        return sep;
    }

    function clearContainerChildren(container) {
        if (!container || !container.children) {
            return;
        }
        var i;
        for (i = container.children.length - 1; i >= 0; i--) {
            try {
                container.remove(container.children[i]);
            } catch (e) {}
        }
    }

    function hexToRgbaArray(hex) {
        var value = String(hex || "").replace("#", "");
        if (value.length === 3) {
            value = value.charAt(0) + value.charAt(0) + value.charAt(1) + value.charAt(1) + value.charAt(2) + value.charAt(2);
        }
        if (value.length !== 6) {
            return QUICK_BTN_TEXT;
        }
        var r = parseInt(value.substring(0, 2), 16) / 255;
        var g = parseInt(value.substring(2, 4), 16) / 255;
        var b = parseInt(value.substring(4, 6), 16) / 255;
        if (!isNumber(r) || !isNumber(g) || !isNumber(b)) {
            return QUICK_BTN_TEXT;
        }
        return [r, g, b, 1.0];
    }

    function getQuickPaletteDisplayName(paletteId) {
        var p = QUICK_COLOR_PALETTES[paletteId];
        return p ? p.label : String(paletteId || "");
    }

    function normalizeQuickPaletteId(paletteId) {
        var id = String(paletteId || QUICK_DEFAULT_PALETTE_ID).toLowerCase();
        if (!QUICK_COLOR_PALETTES[id]) {
            return QUICK_DEFAULT_PALETTE_ID;
        }
        return id;
    }

    function isQuickActionId(actionId) {
        var i;
        for (i = 0; i < QUICK_ACTION_IDS.length; i++) {
            if (QUICK_ACTION_IDS[i] === actionId) {
                return true;
            }
        }
        return false;
    }

    function getPaletteSwatchFillColor(paletteId) {
        var id = normalizeQuickPaletteId(paletteId);
        var palette = QUICK_COLOR_PALETTES[id];
        if (!palette || !palette.hover) {
            return QUICK_BTN_TEXT;
        }
        return hexToRgbaArray(palette.hover.icon);
    }

    function getPaletteSwatchBorderColor(paletteId) {
        var id = normalizeQuickPaletteId(paletteId);
        var palette = QUICK_COLOR_PALETTES[id];
        if (!palette || !palette.normal) {
            return QUICK_BTN_BORDER;
        }
        return hexToRgbaArray(palette.normal.border);
    }

    function openQuickPalettePicker(anchorControl, currentPaletteId, onPick) {
        var win = new Window("dialog", "Paletas", undefined, { resizeable: false });
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 8;
        win.margins = 8;

        var paletteIds = [];
        var seenPalette = {};
        var preferredPaletteOrder = ["gray", "red", "walo_green", "aqua", "orange", "blue"];
        var p;
        for (p = 0; p < preferredPaletteOrder.length; p++) {
            var preferredId = preferredPaletteOrder[p];
            if (QUICK_COLOR_PALETTES.hasOwnProperty(preferredId)) {
                paletteIds.push(preferredId);
                seenPalette[preferredId] = true;
            }
        }
        var id;
        for (id in QUICK_COLOR_PALETTES) {
            if (QUICK_COLOR_PALETTES.hasOwnProperty(id) && !seenPalette[id]) {
                paletteIds.push(id);
                seenPalette[id] = true;
            }
        }

        var normalizedCurrent = normalizeQuickPaletteId(currentPaletteId);
        var items = [];
        var selectedIndex = 0;
        var i;
        for (i = 0; i < paletteIds.length; i++) {
            var paletteId = paletteIds[i];
            items.push(getQuickPaletteDisplayName(paletteId) + " (" + paletteId + ")");
            if (paletteId === normalizedCurrent) {
                selectedIndex = i;
            }
        }

        var list = win.add("dropdownlist", undefined, items);
        list.preferredSize = [240, 26];
        if (items.length > 0) {
            list.selection = selectedIndex;
        }

        var actionsRow = win.add("group", undefined);
        actionsRow.orientation = "row";
        actionsRow.alignChildren = ["right", "center"];
        var okBtn = actionsRow.add("button", undefined, "OK");
        var cancelBtn = actionsRow.add("button", undefined, "Cancelar");

        okBtn.onClick = function () {
            try {
                if (list.selection && onPick) {
                    onPick(paletteIds[list.selection.index]);
                }
            } catch (e5) {}
            try { win.close(1); } catch (e6) {}
        };
        cancelBtn.onClick = function () {
            try { win.close(0); } catch (e3) {}
        };
        try { win.cancelElement = cancelBtn; } catch (e4) {}
        try { win.defaultElement = okBtn; } catch (e7) {}

        try { win.center(); } catch (e2) {}
        win.show();
    }

    function resolveActionPaletteId(actionId) {
        if (!actionId) {
            return QUICK_DEFAULT_PALETTE_ID;
        }
        var config = validateQuickActionsConfig(appState.quickActionsConfig || loadQuickActionsConfig());
        appState.quickActionsConfig = config;
        var paletteId = String(config.paletteByAction[actionId] || QUICK_DEFAULT_PALETTE_ID).toLowerCase();
        if (!QUICK_COLOR_PALETTES[paletteId]) {
            paletteId = QUICK_DEFAULT_PALETTE_ID;
        }
        return paletteId;
    }

    function resolveQuickButtonTheme(actionId, hovered) {
        var neutral = {
            fill: hovered ? QUICK_BTN_HOVER_FILL : QUICK_BTN_FILL,
            border: hovered ? QUICK_BTN_HOVER_BORDER : QUICK_BTN_BORDER,
            icon: hovered ? QUICK_BTN_HOVER_TEXT : QUICK_BTN_TEXT,
            text: hovered ? QUICK_BTN_HOVER_TEXT : QUICK_BTN_TEXT
        };
        if (actionId === QUICK_SETTINGS_STYLE_ID) {
            var grayPalette = QUICK_COLOR_PALETTES.gray;
            if (grayPalette) {
                var grayState = hovered ? grayPalette.hover : grayPalette.normal;
                return {
                    fill: hexToRgbaArray(grayState.fill),
                    border: hexToRgbaArray(grayState.border),
                    icon: hexToRgbaArray(grayState.icon),
                    text: hexToRgbaArray(grayState.icon)
                };
            }
            return neutral;
        }
        if (!actionId) {
            return neutral;
        }
        var palette = QUICK_COLOR_PALETTES[resolveActionPaletteId(actionId)];
        if (!palette) {
            return neutral;
        }
        var state = hovered ? palette.hover : palette.normal;
        return {
            fill: hexToRgbaArray(state.fill),
            border: hexToRgbaArray(state.border),
            icon: hexToRgbaArray(state.icon),
            text: hexToRgbaArray(state.icon)
        };
    }

    function getQuickIconBaseFileName(actionId) {
        if (!actionId) {
            return null;
        }
        var config = validateQuickActionsConfig(appState.quickActionsConfig || loadQuickActionsConfig());
        appState.quickActionsConfig = config;
        if (config.iconBaseByAction.hasOwnProperty(actionId)) {
            return config.iconBaseByAction[actionId];
        }
        return QUICK_ICON_BASE_DEFAULTS[actionId];
    }

    function resolveQuickActionIconBaseFile(actionId) {
        var baseFileName = getQuickIconBaseFileName(actionId);
        if (!baseFileName) {
            return null;
        }
        var candidates = [];
        try {
            var current = File($.fileName);
            if (current && current.parent) {
                candidates.push(File(current.parent.fsName + "/icons/" + baseFileName));
            }
        } catch (e1) {}
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/" + baseFileName));
        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return candidates[i];
                }
            } catch (e2) {}
        }
        return null;
    }

    function getQuickActionBaseIcon(actionId) {
        if (!actionId) {
            return null;
        }
        var cacheKey = "base|" + actionId;
        if (appState.quickActionBaseIconCache.hasOwnProperty(cacheKey)) {
            return appState.quickActionBaseIconCache[cacheKey];
        }
        var file = resolveQuickActionIconBaseFile(actionId);
        if (!file) {
            appState.quickActionBaseIconCache[cacheKey] = null;
            return null;
        }
        try {
            appState.quickActionBaseIconCache[cacheKey] = ScriptUI.newImage(file);
        } catch (e) {
            appState.quickActionBaseIconCache[cacheKey] = null;
        }
        return appState.quickActionBaseIconCache[cacheKey];
    }

    function resolveQuickActionIconVariantFile(actionId, paletteId, state) {
        if (!actionId || !paletteId || !state) {
            return null;
        }
        var candidates = [];
        var relative = "icons/generated/" + actionId + "/" + paletteId + "_" + state + ".png";
        try {
            var current = File($.fileName);
            if (current && current.parent) {
                candidates.push(File(current.parent.fsName + "/" + relative));
            }
        } catch (e1) {}
        candidates.push(File("/Users/yuno/Codex/AE Save animation/" + relative));
        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return candidates[i];
                }
            } catch (e2) {}
        }
        return null;
    }

    function getQuickActionIconVariant(actionId, paletteId, state) {
        if (!actionId || !paletteId || !state) {
            return null;
        }
        var cacheKey = actionId + "|" + paletteId + "|" + state;
        if (appState.quickActionIconVariantCache.hasOwnProperty(cacheKey)) {
            return appState.quickActionIconVariantCache[cacheKey];
        }
        var file = resolveQuickActionIconVariantFile(actionId, paletteId, state);
        if (!file) {
            appState.quickActionIconVariantCache[cacheKey] = null;
            return null;
        }
        try {
            appState.quickActionIconVariantCache[cacheKey] = ScriptUI.newImage(file);
        } catch (e) {
            appState.quickActionIconVariantCache[cacheKey] = null;
        }
        return appState.quickActionIconVariantCache[cacheKey];
    }

    function resolveQuickActionIconOpacityFile(actionId, hovered) {
        if (!actionId) {
            return null;
        }
        var baseName = getQuickIconBaseFileName(actionId);
        if (!baseName) {
            return null;
        }
        var dot = baseName.lastIndexOf(".");
        var baseStem = (dot > 0) ? baseName.substring(0, dot) : baseName;
        var stateTag = hovered ? QUICK_ICON_OPACITY_HOVER_TAG : QUICK_ICON_OPACITY_NORMAL_TAG;
        var generatedName = baseStem + "_" + stateTag + ".png";
        var candidates = [];
        try {
            if ($.fileName) {
                var current = File($.fileName);
                if (current && current.parent) {
                    candidates.push(File(current.parent.fsName + "/icons/generated/" + actionId + "/" + generatedName));
                }
            }
        } catch (e1) {}
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/generated/" + actionId + "/" + generatedName));
        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return candidates[i];
                }
            } catch (e2) {}
        }
        return null;
    }

    function getQuickActionIconOpacityVariant(actionId, hovered) {
        if (!actionId) {
            return null;
        }
        var cacheKey = actionId + "|opacity|" + (hovered ? "hover" : "normal");
        if (appState.quickActionIconVariantCache.hasOwnProperty(cacheKey)) {
            return appState.quickActionIconVariantCache[cacheKey];
        }
        var file = resolveQuickActionIconOpacityFile(actionId, hovered);
        if (!file) {
            appState.quickActionIconVariantCache[cacheKey] = null;
            return null;
        }
        try {
            appState.quickActionIconVariantCache[cacheKey] = ScriptUI.newImage(file);
        } catch (e) {
            appState.quickActionIconVariantCache[cacheKey] = null;
        }
        return appState.quickActionIconVariantCache[cacheKey];
    }

    function pickQuickActionIcon(button, hovered, legacyNormalIcon, legacyHoverIcon) {
        var actionId = button ? button._qaActionId : null;
        if (actionId) {
            var paletteId = resolveActionPaletteId(actionId);
            var state = "normal";
            var fromVariant = getQuickActionIconVariant(actionId, paletteId, state);
            if (fromVariant) return fromVariant;
            fromVariant = getQuickActionIconOpacityVariant(actionId, false);
            if (fromVariant) return fromVariant;
            var baseIcon = getQuickActionBaseIcon(actionId);
            if (baseIcon) return baseIcon;
        }
        return legacyNormalIcon || null;
    }

    function getQuickActionDisplayLabel(actionId) {
        if (actionId === "__sep_a__") return "Separador A";
        if (actionId === "__sep_b__") return "Separador B";
        if (actionId === "__sep_c__") return "Separador C";
        if (actionId === "loop") return "Loop";
        if (actionId === "pingpong") return "Pingpong";
        if (actionId === "clone") return "Clone";
        if (actionId === "nullctrl") return "Null Ctrl";
        if (actionId === "organize") return "Organize";
        if (actionId === "guides") return "Guides";
        if (actionId === "automarker") return "AutoMarker";
        if (actionId === "resize_tree") return "Resize Tree";
        if (actionId === "push_layers_05") return "Push +0.5s";
        if (actionId === "spacing_025") return ".25s";
        if (actionId === "spacing_05") return ".5s";
        if (actionId === "spacing_075") return ".75s";
        if (actionId === "spacing_1") return "1s";
        return String(actionId || "");
    }

    function getQuickActionDefinitions(uiRefs, preferLibraryContext) {
        var clickUi = preferLibraryContext ? (appState.uiLibrary || uiRefs) : uiRefs;
        return {
            loop: {
                id: "loop",
                group: "core",
                label: "",
                helpTip: "Aplicar loopOut(\"cycle\")",
                glyphDrawer: drawInfinityGlyph,
                onClick: function () { applyExpressionToSelection(clickUi, "loopOut(\"cycle\")"); }
            },
            pingpong: {
                id: "pingpong",
                group: "core",
                label: "",
                helpTip: "Aplicar loopOut(\"pingpong\")",
                glyphDrawer: drawPingPongGlyph,
                onClick: function () { applyExpressionToSelection(clickUi, "loopOut(\"pingpong\")"); }
            },
            clone: {
                id: "clone",
                group: "util",
                label: "",
                helpTip: "Clonar composición (total)",
                glyphDrawer: drawCloneCompGlyph,
                onClick: function () { cloneSelectedLayer(clickUi); }
            },
            nullctrl: {
                id: "nullctrl",
                group: "util",
                label: "N",
                helpTip: "Crear Null CTRL (duración + parent)",
                glyphDrawer: null,
                onClick: function () { createNullWithDurationAndParent(clickUi); }
            },
            organize: {
                id: "organize",
                group: "util",
                label: "",
                helpTip: "Organizar Project Panel por tipo",
                glyphDrawer: drawOrganizeGlyph,
                onClick: function () { organizeProjectItems(clickUi); }
            },
            guides: {
                id: "guides",
                group: "util",
                label: "",
                helpTip: "Guides: Presets (Netflix/Hulu/HBO/Generic) o Margins (px)",
                glyphDrawer: drawGuidesGlyph,
                onClick: function () { openGuideModeWindow(clickUi); }
            },
            automarker: {
                id: "automarker",
                group: "util",
                label: "",
                helpTip: "AutoMarker por slides",
                glyphDrawer: drawAutoMarkerGlyph,
                onClick: function () { openAutoMarkerWindow(); }
            },
            resize_tree: {
                id: "resize_tree",
                group: "util",
                label: "SZ",
                helpTip: "Resize comp activa + precomps",
                glyphDrawer: null,
                onClick: function () { openResizeCompTreeWindow(clickUi); }
            },
            push_layers_05: {
                id: "push_layers_05",
                group: "util",
                label: "+L",
                helpTip: "Push selected layers +0.5s",
                glyphDrawer: null,
                onClick: function () { pushSelectedLayersByOffset(clickUi, 0.5); }
            },
            spacing_025: {
                id: "spacing_025",
                group: "timing",
                label: ".25s",
                helpTip: "Separar keyframes seleccionados cada 0.25s",
                glyphDrawer: null,
                onClick: function () { applyKeySpacing(clickUi, 0.25, ".25s"); }
            },
            spacing_05: {
                id: "spacing_05",
                group: "timing",
                label: ".5s",
                helpTip: "Separar keyframes seleccionados cada 0.5s",
                glyphDrawer: null,
                onClick: function () { applyKeySpacing(clickUi, 0.5, ".5s"); }
            },
            spacing_075: {
                id: "spacing_075",
                group: "timing",
                label: ".75s",
                helpTip: "Separar keyframes seleccionados cada 0.75s",
                glyphDrawer: null,
                onClick: function () { applyKeySpacing(clickUi, 0.75, ".75s"); }
            },
            spacing_1: {
                id: "spacing_1",
                group: "timing",
                label: "1s",
                helpTip: "Separar keyframes seleccionados cada 1.0s",
                glyphDrawer: null,
                onClick: function () { applyKeySpacing(clickUi, 1.0, "1s"); }
            }
        };
    }

    function buildConfiguredQuickButtons(container, uiRefs, preferLibraryContext) {
        var defs = getQuickActionDefinitions(uiRefs, preferLibraryContext);
        var config = validateQuickActionsConfig(appState.quickActionsConfig || getDefaultQuickActionsConfig());
        appState.quickActionsConfig = config;

        uiRefs.quickActionButtons = [];
        uiRefs.quickActionSeparators = [];
        uiRefs.quickActionButtonsById = {};

        var orderIds = config.order.slice(0);

        function addAction(id) {
            var def = defs[id];
            if (!def) return;
            var btn = container.add("button", undefined, def.label || "");
            btn.preferredSize = [40, 40];
            btn.helpTip = def.helpTip;
            btn._qaActionId = id;
            styleQuickActionButton(btn, def.label || "", def.glyphDrawer, id);
            btn.onClick = def.onClick;
            uiRefs.quickActionButtons.push(btn);
            uiRefs.quickActionButtonsById[id] = btn;
        }

        function hasVisibleActionBefore(index) {
            var i;
            for (i = index - 1; i >= 0; i--) {
                var id = orderIds[i];
                if (defs[id] && config.visible[id]) {
                    return true;
                }
            }
            return false;
        }

        function hasVisibleActionAfter(index) {
            var i;
            for (i = index + 1; i < orderIds.length; i++) {
                var id = orderIds[i];
                if (defs[id] && config.visible[id]) {
                    return true;
                }
            }
            return false;
        }

        uiRefs.quickSepA = null;
        uiRefs.quickSepB = null;
        uiRefs.quickSepC = null;
        var i;
        for (i = 0; i < orderIds.length; i++) {
            var id = orderIds[i];
            if (defs[id]) {
                if (config.visible[id]) {
                    addAction(id);
                }
                continue;
            }
            if (id === "__sep_a__" || id === "__sep_b__" || id === "__sep_c__") {
                if (hasVisibleActionBefore(i) && hasVisibleActionAfter(i)) {
                    var sep = createQuickSeparator(container);
                    uiRefs.quickActionSeparators.push(sep);
                    if (id === "__sep_a__") {
                        uiRefs.quickSepA = sep;
                    } else if (id === "__sep_b__") {
                        uiRefs.quickSepB = sep;
                    } else {
                        uiRefs.quickSepC = sep;
                    }
                }
            }
        }

        var manageBtn = container.add("button", undefined, "CFG");
        manageBtn.preferredSize = [40, 40];
        manageBtn.helpTip = "Configurar Quick Tools";
        manageBtn._qaActionId = null;
        styleQuickActionButton(manageBtn, "", drawQuickConfigGlyph, QUICK_SETTINGS_STYLE_ID);
        manageBtn.onClick = function () { openQuickActionsConfigWindow(uiRefs); };
        uiRefs.quickManageBtn = manageBtn;
        uiRefs.quickActionButtons.push(manageBtn);
    }

    function refreshQuickLayoutsFromConfig() {
        if (appState.quickWindow && appState.quickWindow.visible) {
            buildQuickWindow();
        }
        if (appState.uiQuick && appState.uiQuick.panel && (appState.uiQuick.panel instanceof Panel)) {
            var panel = appState.uiQuick.panel;
            clearContainerChildren(panel);
            appState.uiQuick = buildQuickUI(panel);
            try {
                panel.layout.layout(true);
            } catch (e) {}
        }
    }

    function openQuickActionsConfigWindow(uiRefs) {
        if (appState.quickConfigWindow && appState.quickConfigWindow.visible) {
            try { appState.quickConfigWindow.show(); } catch (e1) {}
            try { appState.quickConfigWindow.active = true; } catch (e2) {}
            return;
        }

        var config = validateQuickActionsConfig(appState.quickActionsConfig || loadQuickActionsConfig());
        appState.quickActionsConfig = config;
        var localPaletteByAction = cloneValue(config.paletteByAction || {});
        var localVisibleByAction = cloneValue(config.visible || {});

        var win = new Window("palette", "Quick Tools Config", undefined, { resizeable: true });
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 8;
        win.margins = 10;

        var row = win.add("group");
        row.orientation = "row";
        row.alignChildren = ["fill", "fill"];

        var orderPanel = row.add("panel", undefined, "Orden");
        orderPanel.orientation = "column";
        orderPanel.alignChildren = ["fill", "top"];

        var orderContent = orderPanel.add("group");
        orderContent.orientation = "row";
        orderContent.alignChildren = ["fill", "top"];
        orderContent.spacing = 8;

        var orderList = orderContent.add("listbox", undefined, [], { multiselect: false });
        orderList.preferredSize = [220, 280];

        var swatchColumn = orderContent.add("group");
        swatchColumn.orientation = "column";
        swatchColumn.alignChildren = ["left", "top"];
        swatchColumn.spacing = 3;
        swatchColumn.margins = [0, 4, 0, 0];

        var moveGroup = orderPanel.add("group");
        moveGroup.orientation = "row";
        var upBtn = moveGroup.add("button", undefined, "↑");
        var downBtn = moveGroup.add("button", undefined, "↓");
        var addSepBtn = moveGroup.add("button", undefined, "+");
        addSepBtn.helpTip = "Agregar separador";

        function drawSwatchButton(btn) {
            btn.onDraw = function () {
                var g = this.graphics;
                var w = this.size[0] || 30;
                var h = this.size[1] || 18;
                var enabled = !!this._qaColorEnabled;
                var paletteId = normalizeQuickPaletteId(this._qaPaletteId);
                var fill = enabled ? getPaletteSwatchFillColor(paletteId) : QUICK_BTN_FILL;
                var border = enabled ? getPaletteSwatchBorderColor(paletteId) : QUICK_BTN_BORDER;
                g.newPath();
                drawRoundedRectPath(g, 0, 0, w, h, 3);
                g.fillPath(g.newBrush(g.BrushType.SOLID_COLOR, fill));
                g.newPath();
                drawRoundedRectPath(g, 0.5, 0.5, w - 1, h - 1, 3);
                g.strokePath(g.newPen(g.PenType.SOLID_COLOR, border, 1));
            };
        }

        function rebuildSwatchColumn() {
            clearContainerChildren(swatchColumn);
            var i;
            for (i = 0; i < orderList.items.length; i++) {
                var actionId = orderList.items[i].actionId;
                var rowGroup = swatchColumn.add("group");
                rowGroup.orientation = "row";
                rowGroup.alignChildren = ["left", "center"];
                rowGroup.preferredSize = [58, 23];
                var swatchBtn = rowGroup.add("button", undefined, "");
                swatchBtn.preferredSize = [30, 18];
                swatchBtn._qaActionId = actionId;
                swatchBtn._qaColorEnabled = isQuickActionId(actionId);
                swatchBtn._qaPaletteId = normalizeQuickPaletteId(localPaletteByAction[actionId]);
                swatchBtn.enabled = swatchBtn._qaColorEnabled;
                drawSwatchButton(swatchBtn);
                swatchBtn.onClick = function () {
                    if (!this._qaColorEnabled) {
                        return;
                    }
                    var self = this;
                    try {
                        openQuickPalettePicker(self, self._qaPaletteId, function (newPaletteId) {
                            var normalized = normalizeQuickPaletteId(newPaletteId);
                            localPaletteByAction[self._qaActionId] = normalized;
                            self._qaPaletteId = normalized;
                            try { self.notify("onDraw"); } catch (e1) {}
                        });
                    } catch (openErr) {
                        var detail = "";
                        try { detail = openErr ? String(openErr) : ""; } catch (detailErr) {}
                        try { alert("No se pudo abrir el selector de paleta." + (detail ? "\n" + detail : "")); } catch (alertErr) {}
                    }
                };

                var visibleCb = rowGroup.add("checkbox", undefined, "");
                visibleCb.preferredSize = [18, 18];
                visibleCb._qaActionId = actionId;
                visibleCb.enabled = isQuickActionId(actionId);
                if (visibleCb.enabled) {
                    visibleCb.value = !!localVisibleByAction[actionId];
                    visibleCb.helpTip = "Visible en Quick Bar";
                    visibleCb.onClick = function () {
                        localVisibleByAction[this._qaActionId] = !!this.value;
                    };
                } else {
                    visibleCb.value = false;
                    visibleCb.helpTip = "Separador";
                }
            }
            try { swatchColumn.layout.layout(true); } catch (e3) {}
        }

        function populateFromConfig(localConfig) {
            orderList.removeAll();
            var oi;
            localPaletteByAction = cloneValue(localConfig.paletteByAction || {});
            localVisibleByAction = cloneValue(localConfig.visible || {});
            for (oi = 0; oi < localConfig.order.length; oi++) {
                var item = orderList.add("item", getQuickActionDisplayLabel(localConfig.order[oi]));
                item.actionId = localConfig.order[oi];
            }
            for (oi = 0; oi < QUICK_ACTION_IDS.length; oi++) {
                var id = QUICK_ACTION_IDS[oi];
                if (!localPaletteByAction.hasOwnProperty(id)) {
                    localPaletteByAction[id] = QUICK_DEFAULT_PALETTE_ID;
                }
                if (!localVisibleByAction.hasOwnProperty(id)) {
                    localVisibleByAction[id] = true;
                } else {
                    localVisibleByAction[id] = !!localVisibleByAction[id];
                }
            }
            rebuildSwatchColumn();
        }

        function getCurrentOrderIds() {
            var ids = [];
            var oi;
            for (oi = 0; oi < orderList.items.length; oi++) {
                ids.push(orderList.items[oi].actionId);
            }
            return ids;
        }

        function rebuildOrderListFromIds(ids, selectedIndex) {
            orderList.removeAll();
            var oi;
            for (oi = 0; oi < ids.length; oi++) {
                var item = orderList.add("item", getQuickActionDisplayLabel(ids[oi]));
                item.actionId = ids[oi];
            }
            if (orderList.items.length > 0) {
                var idx = selectedIndex;
                if (idx < 0) idx = 0;
                if (idx >= orderList.items.length) idx = orderList.items.length - 1;
                orderList.selection = orderList.items[idx];
            }
            rebuildSwatchColumn();
        }

        function swapSelected(delta) {
            var sel = orderList.selection;
            if (!sel) return;
            var idx = sel.index;
            var target = idx + delta;
            if (target < 0 || target >= orderList.items.length) return;
            var ids = getCurrentOrderIds();
            var tmp = ids[idx];
            ids[idx] = ids[target];
            ids[target] = tmp;
            rebuildOrderListFromIds(ids, target);
        }

        function getNextMissingSeparatorId(ids) {
            var hasSeparator = {};
            var i;
            for (i = 0; i < ids.length; i++) {
                hasSeparator[ids[i]] = true;
            }
            for (i = 0; i < QUICK_SEPARATOR_IDS.length; i++) {
                if (!hasSeparator[QUICK_SEPARATOR_IDS[i]]) {
                    return QUICK_SEPARATOR_IDS[i];
                }
            }
            return null;
        }

        upBtn.onClick = function () { swapSelected(-1); };
        downBtn.onClick = function () { swapSelected(1); };
        addSepBtn.onClick = function () {
            var ids = getCurrentOrderIds();
            var separatorId = getNextMissingSeparatorId(ids);
            if (!separatorId) {
                try { alert("Ya existen todos los separadores disponibles."); } catch (e4) {}
                return;
            }
            var insertIndex = ids.length;
            if (orderList.selection) {
                insertIndex = orderList.selection.index + 1;
            }
            ids.splice(insertIndex, 0, separatorId);
            rebuildOrderListFromIds(ids, insertIndex);
        };

        var actions = win.add("group");
        actions.orientation = "row";
        actions.alignChildren = ["fill", "center"];
        var applyBtn = actions.add("button", undefined, "Aplicar");
        var resetBtn = actions.add("button", undefined, "Reset");
        var closeBtn = actions.add("button", undefined, "Cerrar");

        applyBtn.onClick = function () {
            var next = getDefaultQuickActionsConfig();
            if (config && config.iconBaseByAction) {
                next.iconBaseByAction = cloneValue(config.iconBaseByAction);
            }
            next.order = [];
            var i;
            for (i = 0; i < orderList.items.length; i++) {
                next.order.push(orderList.items[i].actionId);
            }
            for (i = 0; i < QUICK_ACTION_IDS.length; i++) {
                var id = QUICK_ACTION_IDS[i];
                next.visible[id] = !!localVisibleByAction[id];
                next.paletteByAction[id] = normalizeQuickPaletteId(localPaletteByAction[id]);
            }
            next = validateQuickActionsConfig(next);
            appState.quickActionsConfig = next;
            if (!saveQuickActionsConfig(next)) {
                notifyStatus(uiRefs, "No se pudo guardar configuración de Quick Tools.", true);
            } else {
                notifyStatus(uiRefs, "Configuración de Quick Tools guardada.", false);
            }
            refreshQuickLayoutsFromConfig();
        };

        resetBtn.onClick = function () {
            var resetCfg = getDefaultQuickActionsConfig();
            appState.quickActionsConfig = resetCfg;
            saveQuickActionsConfig(resetCfg);
            populateFromConfig(resetCfg);
            refreshQuickLayoutsFromConfig();
            notifyStatus(uiRefs, "Quick Tools restaurado a default.", false);
        };

        closeBtn.onClick = function () {
            try { win.close(); } catch (e3) {}
        };

        win.onClose = function () {
            appState.quickConfigWindow = null;
            return true;
        };

        populateFromConfig(config);
        appState.quickConfigWindow = win;
        win.show();
    }

    function buildQuickWindow() {
        closeQuickWindow();
        var win = new Window("palette", SCRIPT_NAME + " - Expresiones Rápidas", undefined, { resizeable: true });
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 8;
        win.margins = 10;

        var quickPanel = win.add("panel", undefined, "Expresiones Rápidas");
        quickPanel.orientation = "row";
        quickPanel.alignChildren = ["left", "center"];
        quickPanel.margins = 10;

        var uiRefs = {
            panel: win,
            quickPanel: quickPanel
        };
        buildConfiguredQuickButtons(quickPanel, uiRefs, true);

        win.onClose = function () {
            appState.quickWindow = null;
            appState.uiQuick = null;
            return true;
        };

        appState.quickWindow = win;
        appState.uiQuick = uiRefs;
        win.show();
    }

    function buildEasingWindow() {
        closeEasingWindow();
        var win = new Window("palette", SCRIPT_NAME + " - Easing Presets", undefined, { resizeable: true });
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 8;
        win.margins = 10;

        var easingPanel = win.add("panel", undefined, "Easing Presets");
        easingPanel.orientation = "column";
        easingPanel.alignChildren = ["fill", "top"];
        easingPanel.margins = 10;

        var easingGridHost = easingPanel.add("group");
        easingGridHost.orientation = "stack";
        easingGridHost.alignChildren = ["fill", "fill"];
        easingGridHost.spacing = 0;

        var easingViewport = easingGridHost.add("group");
        easingViewport.orientation = "column";
        easingViewport.alignChildren = ["fill", "top"];
        easingViewport.minimumSize = [0, PRESET_VIEWPORT_HEIGHT];
        easingViewport.preferredSize = [0, PRESET_VIEWPORT_HEIGHT];

        var easingGrid = easingViewport.add("group");
        easingGrid.orientation = "column";
        easingGrid.alignChildren = ["fill", "top"];
        easingGrid.spacing = PRESET_GRID_GAP;

        var easingScrollBar = easingGridHost.add("scrollbar", undefined, 0, 0, 0);
        easingScrollBar.alignment = ["right", "fill"];
        easingScrollBar.preferredSize = [10, PRESET_VIEWPORT_HEIGHT];
        easingScrollBar.stepdelta = 1;
        easingScrollBar.jumpdelta = 3;
        easingScrollBar.enabled = false;

        var easingActions = easingPanel.add("group");
        easingActions.orientation = "row";
        easingActions.alignChildren = ["fill", "center"];
        var applyEasingBtn = easingActions.add("button", undefined, "Aplicar Easing");
        applyEasingBtn.preferredSize.width = 170;
        var selectedPresetText = easingActions.add("statictext", undefined, "Preset: Linear");
        selectedPresetText.alignment = ["fill", "center"];

        var uiRefs = {
            panel: win,
            easingGridHost: easingGridHost,
            easingViewport: easingViewport,
            easingGrid: easingGrid,
            easingScrollBar: easingScrollBar,
            applyEasingBtn: applyEasingBtn,
            selectedPresetText: selectedPresetText
        };

        buildEasingPresetGrid(easingGrid, uiRefs);
        try {
            uiRefs.panel.layout.layout(true);
        } catch (layoutErr) {}
        layoutEasingPresetGrid(uiRefs);
        updatePresetScrollbar(uiRefs);
        setSelectedEasingPreset(uiRefs, appState.selectedPresetId, true);

        easingScrollBar.onChanging = function () {
            applyPresetScroll(uiRefs, this.value);
        };
        easingScrollBar.onChange = function () {
            applyPresetScroll(uiRefs, this.value);
        };
        applyEasingBtn.onClick = function () {
            applySelectedEasingPreset(appState.uiLibrary || uiRefs);
        };

        win.onResizing = win.onResize = function () {
            this.layout.resize();
            layoutEasingPresetGrid(uiRefs);
            updatePresetScrollbar(uiRefs);
        };
        win.onClose = function () {
            stopPreviewTicker();
            appState.easingWindow = null;
            appState.uiEasing = null;
            return true;
        };

        try {
            easingPanel.addEventListener("mouseout", function () {
                if (appState.hoverPresetId) {
                    setHoveredPreset(null);
                }
            });
            easingPanel.addEventListener("mousewheel", function (evt) {
                if (!uiRefs.easingScrollBar || !uiRefs.easingScrollBar.enabled) {
                    return;
                }
                var delta = 0;
                try {
                    if (evt && isNumber(evt.wheelDelta)) {
                        delta = (evt.wheelDelta > 0) ? -1 : 1;
                    } else if (evt && isNumber(evt.detail)) {
                        delta = (evt.detail > 0) ? 1 : -1;
                    }
                } catch (wheelErr) {}
                if (delta !== 0) {
                    applyPresetScroll(uiRefs, uiRefs.easingScrollBar.value + delta);
                }
            });
        } catch (e) {}

        appState.easingWindow = win;
        appState.uiEasing = uiRefs;
        win.show();
    }

    function toggleQuickWindow() {
        if (appState.quickWindow && appState.quickWindow.visible) {
            closeQuickWindow();
            return;
        }
        buildQuickWindow();
    }

    function toggleEasingWindow() {
        if (appState.easingWindow && appState.easingWindow.visible) {
            closeEasingWindow();
            return;
        }
        buildEasingWindow();
    }

    function reflowSecondaryWindows() {
        var base = appState.uiLibrary ? appState.uiLibrary.panel : null;
        if (!base || !base.location || !base.size) {
            return;
        }
        var x = base.location[0] + base.size[0] + 16;
        var y = base.location[1];
        if (appState.quickWindow && appState.quickWindow.visible) {
            appState.quickWindow.location = [x, y];
            y += appState.quickWindow.size[1] + 12;
        }
        if (appState.easingWindow && appState.easingWindow.visible) {
            appState.easingWindow.location = [x, y];
        }
    }

    function ensureSecondaryWindows(autoOpen) {
        if (!autoOpen) {
            return;
        }
        if (!appState.quickWindow || !appState.quickWindow.visible) {
            buildQuickWindow();
        }
        if (!appState.easingWindow || !appState.easingWindow.visible) {
            buildEasingWindow();
        }
        reflowSecondaryWindows();
    }

    function getContainerWidth(container, fallback) {
        try {
            if (container && container.size && container.size.length > 0 && isNumber(container.size[0]) && container.size[0] > 0) {
                return container.size[0];
            }
        } catch (e) {}
        return fallback || 320;
    }

    function applyLibraryResponsiveLayout(uiRefs) {
        if (!uiRefs || !uiRefs.panel) {
            return;
        }
        var panelWidth = getContainerWidth(uiRefs.panel, 520);
        var compact = panelWidth < 430;

        uiRefs.saveGroup.orientation = compact ? "column" : "row";
        uiRefs.saveGroup.alignChildren = ["fill", "center"];
        uiRefs.templateName.alignment = ["fill", "center"];
        uiRefs.saveBtn.alignment = ["fill", "center"];

        uiRefs.actions.orientation = compact ? "column" : "row";
        uiRefs.actions.alignChildren = ["fill", "center"];
        uiRefs.applyBtn.alignment = ["fill", "center"];
        uiRefs.renameBtn.alignment = ["fill", "center"];
        uiRefs.deleteBtn.alignment = ["fill", "center"];

        if (compact) {
            uiRefs.saveBtn.minimumSize = [40, 40];
            uiRefs.saveBtn.preferredSize = [40, 40];
            uiRefs.saveBtn.maximumSize = [40, 40];
            uiRefs.applyBtn.preferredSize.width = -1;
            uiRefs.renameBtn.preferredSize.width = -1;
            uiRefs.deleteBtn.preferredSize.width = -1;
        } else {
            uiRefs.saveBtn.minimumSize = [40, 40];
            uiRefs.saveBtn.preferredSize = [40, 40];
            uiRefs.saveBtn.maximumSize = [40, 40];
            uiRefs.applyBtn.preferredSize.width = 170;
            uiRefs.renameBtn.preferredSize.width = 90;
            uiRefs.deleteBtn.preferredSize.width = 90;
        }

        try {
            uiRefs.panel.layout.layout(true);
        } catch (e) {}
    }

    function applyQuickResponsiveLayout(uiRefs) {
        if (!uiRefs || !uiRefs.panel) {
            return;
        }
        var size = 40;

        var buttons = uiRefs.quickActionButtons || [];
        var i;
        for (i = 0; i < buttons.length; i++) {
            if (!buttons[i]) {
                continue;
            }
            buttons[i].minimumSize = [size, size];
            buttons[i].preferredSize = [size, size];
            buttons[i].maximumSize = [size, size];
        }

        var separators = uiRefs.quickActionSeparators || [uiRefs.quickSepA, uiRefs.quickSepB];
        for (i = 0; i < separators.length; i++) {
            if (!separators[i]) {
                continue;
            }
            separators[i].minimumSize = [2, 34];
            separators[i].preferredSize = [2, 34];
            separators[i].maximumSize = [2, 34];
        }

        try {
            uiRefs.panel.layout.layout(true);
        } catch (e) {}
    }

    function drawPingPongGlyph(graphics, width, height, color, hovered, button) {
        var iconSize = 20;
        var ox = Math.round((width - iconSize) / 2);
        var oy = Math.round((height - iconSize) / 2);
        var icon = pickQuickActionIcon(button, hovered, getQuickPingPongIcon(), null);
        if (icon && typeof graphics.drawImage === "function") {
            try {
                graphics.drawImage(icon, ox, oy, iconSize, iconSize);
                return;
            } catch (e0) {}
        }
        var iw = iconSize;
        var ih = iconSize;
        var pen = graphics.newPen(graphics.PenType.SOLID_COLOR, color, 2);
        var y1 = oy + Math.round(ih * 0.30);
        var y2 = oy + Math.round(ih * 0.70);
        var left = ox + Math.round(iw * 0.10);
        var right = ox + Math.round(iw * 0.90);
        var arrow = Math.max(3, Math.round(iw * 0.20));

        graphics.newPath();
        graphics.moveTo(left, y1);
        graphics.lineTo(right, y1);
        graphics.moveTo(right - arrow, y1 - arrow);
        graphics.lineTo(right, y1);
        graphics.lineTo(right - arrow, y1 + arrow);

        graphics.moveTo(right, y2);
        graphics.lineTo(left, y2);
        graphics.moveTo(left + arrow, y2 - arrow);
        graphics.lineTo(left, y2);
        graphics.lineTo(left + arrow, y2 + arrow);
        graphics.strokePath(pen);
    }

    function resolveQuickCloneIconFile() {
        var candidates = [];
        try {
            var current = File($.fileName);
            if (current && current.parent) {
                candidates.push(File(current.parent.fsName + "/icons/clone_160x160-normal.png"));
                candidates.push(File(current.parent.fsName + "/icons/clone_comp-120x120.png"));
                candidates.push(File(current.parent.fsName + "/icons/clone_comp.png"));
            }
        } catch (e1) {}
        candidates.push(File(QUICK_CLONE_ICON_FALLBACK_PATH));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/clone_160x160-normal.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/clone_comp-120x120.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/clone_comp.png"));

        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return candidates[i];
                }
            } catch (e2) {}
        }
        return null;
    }

    function getQuickCloneIcon() {
        if (appState.quickCloneIcon) {
            return appState.quickCloneIcon;
        }
        var iconFile = resolveQuickCloneIconFile();
        if (!iconFile) {
            return null;
        }
        try {
            appState.quickCloneIcon = ScriptUI.newImage(iconFile);
        } catch (e) {
            appState.quickCloneIcon = null;
        }
        return appState.quickCloneIcon;
    }

    function resolveQuickCloneHoverIconFile() {
        var candidates = [];
        try {
            var current = File($.fileName);
            if (current && current.parent) {
                candidates.push(File(current.parent.fsName + "/icons/clone_160x160-hover.png"));
                candidates.push(File(current.parent.fsName + "/icons/clone_comp-120x120_hover.png"));
                candidates.push(File(current.parent.fsName + "/icons/clone_comp_hover.png"));
            }
        } catch (e1) {}
        candidates.push(File(QUICK_CLONE_ICON_HOVER_FALLBACK_PATH));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/clone_160x160-hover.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/clone_comp-120x120_hover.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/clone_comp_hover.png"));

        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return candidates[i];
                }
            } catch (e2) {}
        }
        return null;
    }

    function getQuickCloneHoverIcon() {
        if (appState.quickCloneIconHover) {
            return appState.quickCloneIconHover;
        }
        var iconFile = resolveQuickCloneHoverIconFile();
        if (!iconFile) {
            return null;
        }
        try {
            appState.quickCloneIconHover = ScriptUI.newImage(iconFile);
        } catch (e) {
            appState.quickCloneIconHover = null;
        }
        return appState.quickCloneIconHover;
    }

    function drawCloneCompGlyph(graphics, width, height, color, hovered, button) {
        var iconSize = 20;
        var ox = Math.round((width - iconSize) / 2);
        var oy = Math.round((height - iconSize) / 2);
        var icon = pickQuickActionIcon(button, hovered, getQuickCloneIcon(), getQuickCloneHoverIcon());
        if (icon && typeof graphics.drawImage === "function") {
            try {
                graphics.drawImage(icon, ox, oy, iconSize, iconSize);
                return;
            } catch (e1) {}
        }

        // Fallback icon: two overlapped rectangles to communicate "clone".
        var pen = graphics.newPen(graphics.PenType.SOLID_COLOR, color, 1.6);
        var w = iconSize - 6;
        var h = iconSize - 6;
        graphics.newPath();
        graphics.rectPath(ox + 5, oy + 3, w, h);
        graphics.strokePath(pen);
        graphics.newPath();
        graphics.rectPath(ox + 2, oy + 6, w, h);
        graphics.strokePath(pen);
    }

    function resolveQuickMarkerIconFile() {
        var candidates = [];
        try {
            var current = File($.fileName);
            if (current && current.parent) {
                candidates.push(File(current.parent.fsName + "/icons/marker_normal.png"));
                candidates.push(File(current.parent.fsName + "/icons/marker.png"));
            }
        } catch (e1) {}
        candidates.push(File(QUICK_MARKER_ICON_FALLBACK_PATH));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/marker_normal.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/iCons/marker_normal.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/Icons/marker_normal.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/marker.png"));

        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return candidates[i];
                }
            } catch (e2) {}
        }
        return null;
    }

    function getQuickMarkerIcon() {
        if (appState.quickMarkerIcon) {
            return appState.quickMarkerIcon;
        }
        var iconFile = resolveQuickMarkerIconFile();
        if (!iconFile) {
            return null;
        }
        try {
            appState.quickMarkerIcon = ScriptUI.newImage(iconFile);
        } catch (e) {
            appState.quickMarkerIcon = null;
        }
        return appState.quickMarkerIcon;
    }

    function resolveQuickMarkerHoverIconFile() {
        var candidates = [];
        try {
            var current = File($.fileName);
            if (current && current.parent) {
                candidates.push(File(current.parent.fsName + "/icons/marker_hover.png"));
                candidates.push(File(current.parent.fsName + "/icons/marker_hovered.png"));
            }
        } catch (e1) {}
        candidates.push(File(QUICK_MARKER_ICON_HOVER_FALLBACK_PATH));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/marker_hover.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/iCons/marker_hover.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/Icons/marker_hover.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/marker_hovered.png"));

        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return candidates[i];
                }
            } catch (e2) {}
        }
        return null;
    }

    function getQuickMarkerHoverIcon() {
        if (appState.quickMarkerIconHover) {
            return appState.quickMarkerIconHover;
        }
        var iconFile = resolveQuickMarkerHoverIconFile();
        if (!iconFile) {
            return null;
        }
        try {
            appState.quickMarkerIconHover = ScriptUI.newImage(iconFile);
        } catch (e) {
            appState.quickMarkerIconHover = null;
        }
        return appState.quickMarkerIconHover;
    }

    function drawAutoMarkerGlyph(graphics, width, height, color, hovered, button) {
        var iconSize = 20;
        var ox = Math.round((width - iconSize) / 2);
        var oy = Math.round((height - iconSize) / 2);
        var icon = pickQuickActionIcon(button, hovered, getQuickMarkerIcon(), getQuickMarkerHoverIcon());
        if (icon && typeof graphics.drawImage === "function") {
            try {
                graphics.drawImage(icon, ox, oy, iconSize, iconSize);
                return;
            } catch (e1) {}
        }

        // Fallback: bookmark outline + plus sign.
        var pen = graphics.newPen(graphics.PenType.SOLID_COLOR, color, 1.8);
        var left = ox + 3;
        var top = oy + 2;
        var right = ox + iconSize - 3;
        var bottom = oy + iconSize - 3;
        var notchY = oy + iconSize - 8;
        var midX = Math.round((left + right) / 2);

        graphics.newPath();
        graphics.moveTo(left, top);
        graphics.lineTo(right, top);
        graphics.lineTo(right, notchY);
        graphics.lineTo(midX, bottom);
        graphics.lineTo(left, notchY);
        graphics.lineTo(left, top);
        graphics.strokePath(pen);

        var plusPen = graphics.newPen(graphics.PenType.SOLID_COLOR, color, 2);
        var cx = midX;
        var cy = oy + Math.round(iconSize * 0.42);
        var half = 3;
        graphics.newPath();
        graphics.moveTo(cx - half, cy);
        graphics.lineTo(cx + half, cy);
        graphics.moveTo(cx, cy - half);
        graphics.lineTo(cx, cy + half);
        graphics.strokePath(plusPen);
    }

    function resolveQuickGuidesIconFile() {
        var candidates = [];
        try {
            var current = File($.fileName);
            if (current && current.parent) {
                candidates.push(File(current.parent.fsName + "/icons/margins_normal.png"));
                candidates.push(File(current.parent.fsName + "/icons/guides_normal.png"));
            }
        } catch (e1) {}
        candidates.push(File(QUICK_GUIDES_ICON_FALLBACK_PATH));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/margins_normal.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/iCons/margins_normal.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/Icons/margins_normal.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/guides_normal.png"));

        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return candidates[i];
                }
            } catch (e2) {}
        }
        return null;
    }

    function getQuickGuidesIcon() {
        if (appState.quickGuidesIcon) {
            return appState.quickGuidesIcon;
        }
        var iconFile = resolveQuickGuidesIconFile();
        if (!iconFile) {
            return null;
        }
        try {
            appState.quickGuidesIcon = ScriptUI.newImage(iconFile);
        } catch (e) {
            appState.quickGuidesIcon = null;
        }
        return appState.quickGuidesIcon;
    }

    function resolveQuickGuidesHoverIconFile() {
        var candidates = [];
        try {
            var current = File($.fileName);
            if (current && current.parent) {
                candidates.push(File(current.parent.fsName + "/icons/margins_hover.png"));
                candidates.push(File(current.parent.fsName + "/icons/guides_hover.png"));
            }
        } catch (e1) {}
        candidates.push(File(QUICK_GUIDES_ICON_HOVER_FALLBACK_PATH));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/margins_hover.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/iCons/margins_hover.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/Icons/margins_hover.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/guides_hover.png"));

        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return candidates[i];
                }
            } catch (e2) {}
        }
        return null;
    }

    function getQuickGuidesHoverIcon() {
        if (appState.quickGuidesIconHover) {
            return appState.quickGuidesIconHover;
        }
        var iconFile = resolveQuickGuidesHoverIconFile();
        if (!iconFile) {
            return null;
        }
        try {
            appState.quickGuidesIconHover = ScriptUI.newImage(iconFile);
        } catch (e) {
            appState.quickGuidesIconHover = null;
        }
        return appState.quickGuidesIconHover;
    }

    function drawGuidesGlyph(graphics, width, height, color, hovered, button) {
        var iconSize = 20;
        var ox = Math.round((width - iconSize) / 2);
        var oy = Math.round((height - iconSize) / 2);
        var icon = pickQuickActionIcon(button, hovered, getQuickGuidesIcon(), getQuickGuidesHoverIcon());
        if (icon && typeof graphics.drawImage === "function") {
            try {
                graphics.drawImage(icon, ox, oy, iconSize, iconSize);
                return;
            } catch (e1) {}
        }

        // Fallback: square + center cross.
        var pen = graphics.newPen(graphics.PenType.SOLID_COLOR, color, 1.8);
        var left = ox + 3;
        var top = oy + 3;
        var size = iconSize - 6;
        var cx = left + Math.round(size / 2);
        var cy = top + Math.round(size / 2);
        graphics.newPath();
        graphics.rectPath(left, top, size, size);
        graphics.strokePath(pen);
        graphics.newPath();
        graphics.moveTo(cx, top);
        graphics.lineTo(cx, top + size);
        graphics.moveTo(left, cy);
        graphics.lineTo(left + size, cy);
        graphics.strokePath(pen);
    }

    function drawOrganizeGlyph(graphics, width, height, color, hovered, button) {
        var iconSize = 20;
        var ox = Math.round((width - iconSize) / 2);
        var oy = Math.round((height - iconSize) / 2);
        var icon = pickQuickActionIcon(button, hovered, null, null);
        if (icon && typeof graphics.drawImage === "function") {
            try {
                graphics.drawImage(icon, ox, oy, iconSize, iconSize);
                return;
            } catch (e1) {}
        }

        // Fallback: three stacked folder-like blocks.
        var pen = graphics.newPen(graphics.PenType.SOLID_COLOR, color, 1.6);
        var w = 10;
        var h = 4;
        var x = ox + 5;
        var y = oy + 3;
        var gap = 3;
        var i;
        for (i = 0; i < 3; i++) {
            graphics.newPath();
            graphics.rectPath(x, y + (h + gap) * i, w, h);
            graphics.strokePath(pen);
        }
    }

    function resolveQuickConfigIconFile() {
        var candidates = [];
        try {
            var current = File($.fileName);
            if (current && current.parent) {
                candidates.push(File(current.parent.fsName + "/icons/settings_normal.png"));
                candidates.push(File(current.parent.fsName + "/icons/config_normal.png"));
            }
        } catch (e1) {}
        candidates.push(File(QUICK_CONFIG_ICON_FALLBACK_PATH));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/settings_normal.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/config_normal.png"));

        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return candidates[i];
                }
            } catch (e2) {}
        }
        return null;
    }

    function getQuickConfigIcon() {
        if (appState.quickConfigIcon) {
            return appState.quickConfigIcon;
        }
        var iconFile = resolveQuickConfigIconFile();
        if (!iconFile) {
            return null;
        }
        try {
            appState.quickConfigIcon = ScriptUI.newImage(iconFile);
        } catch (e) {
            appState.quickConfigIcon = null;
        }
        return appState.quickConfigIcon;
    }

    function resolveQuickConfigHoverIconFile() {
        var candidates = [];
        try {
            var current = File($.fileName);
            if (current && current.parent) {
                candidates.push(File(current.parent.fsName + "/icons/settings_hover_0908c3.png"));
                candidates.push(File(current.parent.fsName + "/icons/config_hover_0908c3.png"));
            }
        } catch (e1) {}
        candidates.push(File(QUICK_CONFIG_ICON_HOVER_FALLBACK_PATH));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/settings_hover_0908c3.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/config_hover_0908c3.png"));

        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return candidates[i];
                }
            } catch (e2) {}
        }
        return null;
    }

    function getQuickConfigHoverIcon() {
        if (appState.quickConfigIconHover) {
            return appState.quickConfigIconHover;
        }
        var iconFile = resolveQuickConfigHoverIconFile();
        if (!iconFile) {
            return null;
        }
        try {
            appState.quickConfigIconHover = ScriptUI.newImage(iconFile);
        } catch (e) {
            appState.quickConfigIconHover = null;
        }
        return appState.quickConfigIconHover;
    }

    function drawQuickConfigGlyph(graphics, width, height, color, hovered, button) {
        var iconSize = 20;
        var ox = Math.round((width - iconSize) / 2);
        var oy = Math.round((height - iconSize) / 2);
        var icon = pickQuickActionIcon(button, hovered, getQuickConfigIcon(), getQuickConfigHoverIcon());
        if (icon && typeof graphics.drawImage === "function") {
            try {
                graphics.drawImage(icon, ox, oy, iconSize, iconSize);
                return;
            } catch (e1) {}
        }

        // Fallback textual mark if PNG is unavailable.
        var text = "CFG";
        var pen = graphics.newPen(graphics.PenType.SOLID_COLOR, color, 1);
        var size = measureTextSize(graphics, text);
        var tx = Math.round((width - size.width) / 2);
        var ty = Math.round((height - size.height) / 2);
        graphics.drawString(text, pen, tx, ty);
    }

    function resolveQuickPingPongIconFile() {
        var candidates = [];
        try {
            var current = File($.fileName);
            if (current && current.parent) {
                candidates.push(File(current.parent.fsName + "/icons/pinpong-120x120.png"));
            }
        } catch (e1) {}
        candidates.push(File(QUICK_PINGPONG_ICON_FALLBACK_PATH));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/pinpong-120x120.png"));

        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return candidates[i];
                }
            } catch (e2) {}
        }
        return null;
    }

    function getQuickPingPongIcon() {
        if (appState.quickPingPongIcon) {
            return appState.quickPingPongIcon;
        }
        var iconFile = resolveQuickPingPongIconFile();
        if (!iconFile) {
            return null;
        }
        try {
            appState.quickPingPongIcon = ScriptUI.newImage(iconFile);
        } catch (e) {
            appState.quickPingPongIcon = null;
        }
        return appState.quickPingPongIcon;
    }

    function resolveQuickSaveIconFile() {
        var candidates = [];
        try {
            var current = File($.fileName);
            if (current && current.parent) {
                candidates.push(File(current.parent.fsName + "/icons/Infity-120x120.png"));
                candidates.push(File(current.parent.fsName + "/icons/infinity@3x.png"));
                candidates.push(File(current.parent.fsName + "/icons/infinity-80x80.png"));
                candidates.push(File(current.parent.fsName + "/icons/infinity.png"));
            }
        } catch (e1) {}
        candidates.push(File(QUICK_SAVE_ICON_FALLBACK_PATH));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/infinity@3x.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/infinity-80x80.png"));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/infinity.png"));

        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return candidates[i];
                }
            } catch (e2) {}
        }
        return null;
    }

    function getQuickSaveIcon() {
        if (appState.quickSaveIcon) {
            return appState.quickSaveIcon;
        }
        var iconFile = resolveQuickSaveIconFile();
        if (!iconFile) {
            return null;
        }
        try {
            appState.quickSaveIcon = ScriptUI.newImage(iconFile);
        } catch (e) {
            appState.quickSaveIcon = null;
        }
        return appState.quickSaveIcon;
    }

    function resolveQuickSaveHoverIconFile() {
        var candidates = [];
        try {
            var current = File($.fileName);
            if (current && current.parent) {
                candidates.push(File(current.parent.fsName + "/icons/Infity-120x120_hover.png"));
                candidates.push(File(current.parent.fsName + "/icons/infinity@3x_hover.png"));
            }
        } catch (e1) {}
        candidates.push(File(QUICK_SAVE_ICON_HOVER_FALLBACK_PATH));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/infinity@3x_hover.png"));

        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return candidates[i];
                }
            } catch (e2) {}
        }
        return null;
    }

    function getQuickSaveHoverIcon() {
        if (appState.quickSaveIconHover) {
            return appState.quickSaveIconHover;
        }
        var iconFile = resolveQuickSaveHoverIconFile();
        if (!iconFile) {
            return null;
        }
        try {
            appState.quickSaveIconHover = ScriptUI.newImage(iconFile);
        } catch (e) {
            appState.quickSaveIconHover = null;
        }
        return appState.quickSaveIconHover;
    }

    function resolveSaveButtonIconFile() {
        var candidates = [];
        try {
            if ($.fileName) {
                var current = File($.fileName);
                candidates.push(File(current.parent.fsName + "/Save_160x160.png"));
                candidates.push(File(current.parent.fsName + "/icons/Save_160x160.png"));
            }
        } catch (e1) {}
        candidates.push(File(SAVE_BTN_ICON_FALLBACK_PATH));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/Save_160x160.png"));

        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return candidates[i];
                }
            } catch (e2) {}
        }
        return null;
    }

    function getSaveButtonIcon() {
        if (appState.saveButtonIcon) {
            return appState.saveButtonIcon;
        }
        var iconFile = resolveSaveButtonIconFile();
        if (!iconFile) {
            return null;
        }
        try {
            appState.saveButtonIcon = ScriptUI.newImage(iconFile);
        } catch (e) {
            appState.saveButtonIcon = null;
        }
        return appState.saveButtonIcon;
    }

    function resolveSaveButtonHoverIconFile() {
        var candidates = [];
        try {
            if ($.fileName) {
                var current = File($.fileName);
                candidates.push(File(current.parent.fsName + "/Save_160x160_hover.png"));
                candidates.push(File(current.parent.fsName + "/icons/Save_160x160_hover.png"));
            }
        } catch (e1) {}
        candidates.push(File(SAVE_BTN_ICON_HOVER_FALLBACK_PATH));
        candidates.push(File("/Users/yuno/Codex/AE Save animation/icons/Save_160x160_hover.png"));

        var i;
        for (i = 0; i < candidates.length; i++) {
            try {
                if (candidates[i] && candidates[i].exists) {
                    return candidates[i];
                }
            } catch (e2) {}
        }
        return null;
    }

    function getSaveButtonHoverIcon() {
        if (appState.saveButtonIconHover) {
            return appState.saveButtonIconHover;
        }
        var iconFile = resolveSaveButtonHoverIconFile();
        if (!iconFile) {
            return null;
        }
        try {
            appState.saveButtonIconHover = ScriptUI.newImage(iconFile);
        } catch (e) {
            appState.saveButtonIconHover = null;
        }
        return appState.saveButtonIconHover;
    }

    function styleLibrarySaveIconButton(button) {
        if (!button) {
            return;
        }
        var normalIcon = getSaveButtonIcon();
        var hoverIcon = getSaveButtonHoverIcon();
        if (normalIcon) {
            button.image = normalIcon;
            button.text = "";
        } else {
            button.text = "💾";
        }
        try {
            button.addEventListener("mouseover", function () {
                if (hoverIcon) {
                    this.image = hoverIcon;
                }
            });
        } catch (e1) {}
        try {
            button.addEventListener("mouseout", function () {
                if (normalIcon) {
                    this.image = normalIcon;
                }
            });
        } catch (e2) {}
    }

    function drawInfinityGlyph(graphics, width, height, color, hovered, button) {
        var iconSize = 20;
        var ox = Math.round((width - iconSize) / 2);
        var oy = Math.round((height - iconSize) / 2);
        var icon = pickQuickActionIcon(button, hovered, getQuickSaveIcon(), getQuickSaveHoverIcon());
        if (icon && typeof graphics.drawImage === "function") {
            try {
                graphics.drawImage(icon, ox, oy, iconSize, iconSize);
                return;
            } catch (e1) {}
        }
        // Fallback: basic infinity if image can't load.
        var pen = graphics.newPen(graphics.PenType.SOLID_COLOR, color, 2.2);
        var cx = ox + Math.round(iconSize * 0.5);
        var cy = oy + Math.round(iconSize * 0.5);
        var rx = iconSize * 0.42;
        var ry = iconSize * 0.26;
        var steps = 40;
        var i;
        graphics.newPath();
        for (i = 0; i <= steps; i++) {
            var t = (Math.PI * 2 * i) / steps;
            var s = Math.sin(t);
            var c = Math.cos(t);
            var d = 1 + (s * s);
            var x = cx + (rx * c / d);
            var y = cy + (ry * s * c / d);
            if (i === 0) {
                graphics.moveTo(x, y);
            } else {
                graphics.lineTo(x, y);
            }
        }
        graphics.strokePath(pen);
    }

    function measureTextSize(graphics, text) {
        var width = Math.max(8, text.length * 7);
        var height = 12;
        try {
            var m = graphics.measureString(text);
            if (m && m.length >= 2) {
                width = m[0];
                height = m[1];
            }
        } catch (e) {}
        return [width, height];
    }

    function drawRoundedRectPath(graphics, x, y, width, height, radius) {
        if (typeof graphics.roundedRectPath === "function") {
            try {
                graphics.roundedRectPath(x, y, width, height, radius, radius);
                return;
            } catch (e1) {
                try {
                    graphics.roundedRectPath(x, y, width, height, radius);
                    return;
                } catch (e2) {}
            }
        }
        graphics.rectPath(x, y, width, height);
    }

    function createQuickButtonFont() {
        try {
            return ScriptUI.newFont("Adobe Clean", "REGULAR", QUICK_BTN_FONT_SIZE);
        } catch (e) {}
        return null;
    }

    function styleQuickActionButton(button, label, glyphDrawer, actionId) {
        if (!button) {
            return;
        }
        button.text = "";
        button._qaLabel = label || "";
        button._qaActionId = actionId || button._qaActionId || null;
        button._qaHovered = false;
        button._qaFont = createQuickButtonFont();
        button.onDraw = function () {
            var g = this.graphics;
            var bounds = this.bounds;
            var w = bounds[2] - bounds[0];
            var h = bounds[3] - bounds[1];
            if (w <= 0 || h <= 0) {
                w = this.size[0] || 40;
                h = this.size[1] || 40;
            }

            var hovered = !!this._qaHovered;
            var theme = resolveQuickButtonTheme(this._qaActionId, hovered);
            var fillColor = theme.fill;
            var borderColor = theme.border;
            var textColor = theme.text;
            try {
                if (this._qaFont) {
                    g.font = this._qaFont;
                }
            } catch (fontErr) {}

            g.newPath();
            drawRoundedRectPath(g, 0, 0, w, h, QUICK_BTN_RADIUS);
            g.fillPath(g.newBrush(g.BrushType.SOLID_COLOR, fillColor));

            g.newPath();
            drawRoundedRectPath(g, 0.5, 0.5, w - 1, h - 1, QUICK_BTN_RADIUS);
            g.strokePath(g.newPen(g.PenType.SOLID_COLOR, borderColor, 0.5));

            if (glyphDrawer) {
                glyphDrawer(g, w, h, textColor, hovered, this);
                return;
            }

            var text = this._qaLabel || "";
            if (!text) {
                return;
            }
            var textSize = measureTextSize(g, text);
            var textX = Math.round((w - textSize[0]) / 2);
            var textY = Math.round((h - textSize[1]) / 2);
            g.drawString(
                text,
                g.newPen(g.PenType.SOLID_COLOR, textColor, 1),
                textX,
                textY
            );
        };

        try {
            button.addEventListener("mouseover", function () {
                this._qaHovered = true;
                this.notify("onDraw");
            });
        } catch (e1) {}
        try {
            button.addEventListener("mouseout", function () {
                this._qaHovered = false;
                this.notify("onDraw");
            });
        } catch (e2) {}
    }

    function applyEasingResponsiveLayout(uiRefs) {
        if (!uiRefs || !uiRefs.panel) {
            return;
        }
        var panelWidth = getContainerWidth(uiRefs.panel, 480);
        var compact = panelWidth < 420;
        uiRefs.easingActions.orientation = compact ? "column" : "row";
        uiRefs.easingActions.alignChildren = ["fill", "center"];
        uiRefs.applyEasingBtn.alignment = ["fill", "center"];
        uiRefs.selectedPresetText.alignment = ["fill", "center"];
        uiRefs.applyEasingBtn.preferredSize.width = compact ? -1 : 170;

        var panelHeight = 0;
        try {
            panelHeight = uiRefs.panel.size[1];
        } catch (e) {}
        if (!isNumber(panelHeight) || panelHeight <= 0) {
            panelHeight = PRESET_VIEWPORT_HEIGHT + 120;
        }
        var viewportHeight = Math.floor(clampNumber(panelHeight - 120, 120, 10000));
        uiRefs.easingViewport.preferredSize = [0, viewportHeight];
        uiRefs.easingScrollBar.preferredSize = [10, viewportHeight];
    }

    function buildLibraryUI(pal) {
        pal.orientation = "column";
        pal.alignChildren = ["fill", "top"];
        pal.spacing = 8;
        pal.margins = 10;

        var copyGroup = pal.add("group");
        copyGroup.orientation = "row";
        copyGroup.alignChildren = ["fill", "center"];
        var copyBtn = copyGroup.add("button", undefined, "Copiar Animación");
        copyBtn.preferredSize.width = 160;

        var saveGroup = pal.add("group");
        saveGroup.orientation = "row";
        saveGroup.alignChildren = ["fill", "center"];
        var templateName = saveGroup.add("edittext", undefined, "");
        templateName.characters = 24;
        var saveBtn = saveGroup.add("button", undefined, "");
        saveBtn.minimumSize = [40, 40];
        saveBtn.preferredSize = [40, 40];
        saveBtn.maximumSize = [40, 40];
        saveBtn.helpTip = "Guardar Template";
        styleLibrarySaveIconButton(saveBtn);

        var listPanel = pal.add("panel", undefined, "Biblioteca");
        listPanel.orientation = "column";
        listPanel.alignChildren = ["fill", "top"];
        listPanel.margins = 10;
        var templateList = listPanel.add("listbox", undefined, [], { multiselect: false });
        templateList.preferredSize.height = 220;

        var actions = listPanel.add("group");
        actions.orientation = "row";
        actions.alignChildren = ["fill", "center"];
        var applyBtn = actions.add("button", undefined, "Aplicar a Selección");
        applyBtn.preferredSize.width = 170;
        var renameBtn = actions.add("button", undefined, "Renombrar");
        renameBtn.preferredSize.width = 90;
        var deleteBtn = actions.add("button", undefined, "Eliminar");
        deleteBtn.preferredSize.width = 90;

        var statusText = pal.add("statictext", undefined, "Listo.");
        statusText.alignment = ["fill", "top"];
        var storagePathText = pal.add("statictext", undefined, "Datos: " + getLibraryPath());
        storagePathText.alignment = ["fill", "top"];

        var dataActions = pal.add("group");
        dataActions.orientation = "row";
        dataActions.alignChildren = ["left", "center"];
        var openDataFolderBtn = dataActions.add("button", undefined, "Abrir carpeta de datos");

        var uiRefs = {
            panel: pal,
            saveGroup: saveGroup,
            copyBtn: copyBtn,
            templateName: templateName,
            saveBtn: saveBtn,
            actions: actions,
            templateList: templateList,
            applyBtn: applyBtn,
            renameBtn: renameBtn,
            deleteBtn: deleteBtn,
            statusText: statusText,
            storagePathText: storagePathText,
            openDataFolderBtn: openDataFolderBtn
        };

        copyBtn.onClick = function () {
            copyFromSelection(uiRefs);
        };
        saveBtn.onClick = function () {
            saveCopiedTemplate(uiRefs);
        };
        applyBtn.onClick = function () {
            applySelectedTemplate(uiRefs);
        };
        renameBtn.onClick = function () {
            renameSelectedTemplate(uiRefs);
        };
        deleteBtn.onClick = function () {
            deleteSelectedTemplate(uiRefs);
        };
        openDataFolderBtn.onClick = function () {
            openDataFolder(uiRefs);
        };

        pal.onResizing = pal.onResize = function () {
            this.layout.resize();
            applyLibraryResponsiveLayout(uiRefs);
        };
        applyLibraryResponsiveLayout(uiRefs);
        return uiRefs;
    }

    function buildQuickUI(pal) {
        pal.orientation = "column";
        pal.alignChildren = ["fill", "top"];
        pal.spacing = 8;
        pal.margins = 10;

        var quickButtons = pal.add("group");
        quickButtons.orientation = "row";
        quickButtons.alignChildren = ["left", "center"];
        quickButtons.spacing = 10;

        var uiRefs = {
            panel: pal,
            quickButtons: quickButtons
        };
        buildConfiguredQuickButtons(quickButtons, uiRefs, false);

        pal.onResizing = pal.onResize = function () {
            this.layout.resize();
            applyQuickResponsiveLayout(uiRefs);
        };
        applyQuickResponsiveLayout(uiRefs);
        return uiRefs;
    }

    function buildEasingUI(pal) {
        pal.orientation = "column";
        pal.alignChildren = ["fill", "top"];
        pal.spacing = 8;
        pal.margins = 10;

        var easingPanel = pal.add("panel", undefined, "Easing Presets");
        easingPanel.orientation = "column";
        easingPanel.alignChildren = ["fill", "top"];
        easingPanel.margins = 10;

        var easingGridHost = easingPanel.add("group");
        easingGridHost.orientation = "stack";
        easingGridHost.alignChildren = ["fill", "fill"];
        easingGridHost.spacing = 0;

        var easingViewport = easingGridHost.add("group");
        easingViewport.orientation = "column";
        easingViewport.alignChildren = ["fill", "top"];
        easingViewport.minimumSize = [0, 120];
        easingViewport.preferredSize = [0, PRESET_VIEWPORT_HEIGHT];

        var easingGrid = easingViewport.add("group");
        easingGrid.orientation = "column";
        easingGrid.alignChildren = ["fill", "top"];
        easingGrid.spacing = PRESET_GRID_GAP;

        var easingScrollBar = easingGridHost.add("scrollbar", undefined, 0, 0, 0);
        easingScrollBar.alignment = ["right", "fill"];
        easingScrollBar.preferredSize = [10, PRESET_VIEWPORT_HEIGHT];
        easingScrollBar.stepdelta = 1;
        easingScrollBar.jumpdelta = 3;
        easingScrollBar.enabled = false;

        var easingActions = easingPanel.add("group");
        easingActions.orientation = "row";
        easingActions.alignChildren = ["fill", "center"];
        var applyEasingBtn = easingActions.add("button", undefined, "Aplicar Easing");
        applyEasingBtn.preferredSize.width = 170;
        var selectedPresetText = easingActions.add("statictext", undefined, "Preset: Linear");
        selectedPresetText.alignment = ["fill", "center"];

        var uiRefs = {
            panel: pal,
            easingGridHost: easingGridHost,
            easingViewport: easingViewport,
            easingGrid: easingGrid,
            easingScrollBar: easingScrollBar,
            easingActions: easingActions,
            applyEasingBtn: applyEasingBtn,
            selectedPresetText: selectedPresetText
        };

        buildEasingPresetGrid(easingGrid, uiRefs);
        applyEasingResponsiveLayout(uiRefs);
        layoutEasingPresetGrid(uiRefs);
        updatePresetScrollbar(uiRefs);
        setSelectedEasingPreset(uiRefs, appState.selectedPresetId, true);

        easingScrollBar.onChanging = function () {
            applyPresetScroll(uiRefs, this.value);
        };
        easingScrollBar.onChange = function () {
            applyPresetScroll(uiRefs, this.value);
        };
        applyEasingBtn.onClick = function () {
            applySelectedEasingPreset(uiRefs);
        };

        pal.onResizing = pal.onResize = function () {
            this.layout.resize();
            applyEasingResponsiveLayout(uiRefs);
            layoutEasingPresetGrid(uiRefs);
            updatePresetScrollbar(uiRefs);
        };

        try {
            easingPanel.addEventListener("mouseout", function () {
                if (appState.hoverPresetId) {
                    setHoveredPreset(null);
                }
            });
            easingPanel.addEventListener("mousewheel", function (evt) {
                if (!uiRefs.easingScrollBar || !uiRefs.easingScrollBar.enabled) {
                    return;
                }
                var delta = 0;
                try {
                    if (evt && isNumber(evt.wheelDelta)) {
                        delta = (evt.wheelDelta > 0) ? -1 : 1;
                    } else if (evt && isNumber(evt.detail)) {
                        delta = (evt.detail > 0) ? 1 : -1;
                    }
                } catch (wheelErr) {}
                if (delta !== 0) {
                    applyPresetScroll(uiRefs, uiRefs.easingScrollBar.value + delta);
                }
            });
        } catch (e) {}

        return uiRefs;
    }

    function buildUI(thisObj) {
        var pal = (thisObj instanceof Panel)
            ? thisObj
            : new Window("palette", SCRIPT_NAME, undefined, { resizeable: true });

        if (TOOL_MODE === "quick") {
            return buildQuickUI(pal);
        }
        if (TOOL_MODE === "easing") {
            return buildEasingUI(pal);
        }
        return buildLibraryUI(pal);
    }

    function initialize() {
        if (!app.project) {
            app.newProject();
        }

        appState.quickActionsConfig = loadQuickActionsConfig();

        if (TOOL_MODE === "library") {
            var pathInfo = resolveWritableLibraryPath();
            appState.libraryPath = pathInfo.path;
            appState.libraryFolderPath = pathInfo.folderPath;
            var loaded = loadLibrary(getLibraryPath());
            appState.library = loaded.data;
            appState.library.storageInfo = appState.library.storageInfo || {};
            appState.library.storageInfo.path = getLibraryPath();
            if (pathInfo.warnings && pathInfo.warnings.length > 0) {
                appendLog("Warnings de ruta de biblioteca: " + pathInfo.warnings.join(" | "));
            }
        }

        appState.ui = buildUI(thisObj);
        if (TOOL_MODE === "library") {
            appState.uiLibrary = appState.ui;
            refreshTemplateList(appState.uiLibrary);
        } else if (TOOL_MODE === "quick") {
            appState.uiQuick = appState.ui;
        } else if (TOOL_MODE === "easing") {
            appState.uiEasing = appState.ui;
        }

        if (TOOL_MODE === "library") {
            if (loaded.warning) {
                setStatus(appState.uiLibrary, loaded.warning);
            } else if (pathInfo.warnings && pathInfo.warnings.length > 0) {
                setStatus(appState.uiLibrary, "Biblioteca cargada con fallback de ruta.");
            } else {
                setStatus(appState.uiLibrary, "Biblioteca cargada: " + appState.library.templates.length + " template(s).");
            }
        }

        if (appState.ui.panel instanceof Window) {
            appState.ui.panel.onClose = function () {
                stopPreviewTicker();
                return true;
            };
            appState.ui.panel.center();
            appState.ui.panel.show();
        } else {
            appState.ui.panel.layout.layout(true);
        }
    }

    try {
        initialize();
    } catch (fatalErr) {
        try { alert("AE Tools no pudo iniciar: " + fatalErr.toString() + (fatalErr.line ? " (línea " + fatalErr.line + ")" : "")); } catch (e) {}
    }
})(this);
