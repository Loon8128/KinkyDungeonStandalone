// Project id for BondageProjects/BondageCollege
const PROJECT = '18180';
const BRANCH = 'master';

let project = PROJECT;
let commit;


// Loading bar
const PROGRESS_ROOT = document.getElementById('load-progress-root');
const PROGRESS_BAR = document.getElementById('load-progress-bar');
const PROGRESS_TEXT = document.getElementById('load-progress-text');

function updateProgress(text, num, div) {
    const pct = 50 * num / div;
    PROGRESS_BAR.style.width = `${pct}%`; 
    PROGRESS_TEXT.innerText = `${text} ${num} / ${div}`;
}


Click = () => {};
TouchStart = () => {};
MouseMove = () => {};
LoseFocus = () => {};

// Exclude certain scripts from loading in KD, as it wastes load time and bandwidth.
function isExcludedInKD(path) {
    return (path.startsWith('Screens/MiniGame') && !path.startsWith('Screens/MiniGame/KinkyDungeon'))
        || path.startsWith('Screens/Cutscene')
        || path.startsWith('Screens/Room');
}


function remap(url) {
    // https://docs.gitlab.com/ee/api/repository_files.html#get-raw-file-from-repository
    // gitgud.io is configured to not accept cross origin requests, so we have to use the files API instead
    // Since we use encodeURLComponent, audio seems to have an issue with putting // in the file path. This has to be resolved as a URL accepts that fine, but a encoded URI does not.
    url = url.replace('//', '/');
    return `https://gitgud.io/api/v4/projects/${project}/repository/files/BondageClub%2F${encodeURIComponent(url)}/raw?ref=${commit}`;
}

function query(url, doRemap = true) {
    if (doRemap) {
        url = remap(url);
    }
    return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.overrideMimeType('text/plain');
        req.open('GET', url);
        req.onload = () => resolve(req);
        req.onerror = () => reject('Error requesting: ' + url);
        req.send();
    });
}

function patch(f, patches) {
    let src = f.toString().replace('\r', '');
    for (const [k, v] of Object.entries(patches)) {
        if (!src.includes(k)) {
            console.warn(`Patch not applied: function ${f.name}, target ${k} -> ${v}`);
        }
        src = src.replaceAll(k, v);
    }
    try {
        (1, eval)(src);
    } catch (e) {
        console.error(`Error ${e} patching ${f.name}, new source:\n${src}`);
        throw e;
    }
}

function addScript(src) {
    let script = document.createElement('script');
    script.innerHTML = src;
    document.body.appendChild(script);
}

function addStyle(src) {
    let style = document.createElement('style');
    style.innerHTML = src;
    document.head.appendChild(style);
}

/**
 * Loads KD through BC's source repo.
 * Loads index.html -> parses it, and identifies scripts to load dynamically
 * Bootstraps KD
 */
async function load() {
    const params = new URLSearchParams(window.location.search);

    updateProgress('Checking Version', 1, 1);
    
    project = params.has('project') ? params.get('project') : PROJECT;
    branch = params.has('branch') ? params.get('branch') : BRANCH;

    if (params.has('commit')) {
        commit = params.get('commit');
        console.log('Using commit: ' + commit);
    } else {
        // gitgud.io is running on gitlab, their API will do
        // https://docs.gitlab.com/ee/api/commits.html#list-repository-commits
        // https://gitgud.io/api/v4/projects/18157/repository/commits?per_page=1&page=1
        // Supports pagination, so we only need the latest
        let api_url = `https://gitgud.io/api/v4/projects/${project}/repository/commits?per_page=1&page=1&ref_name=${branch}`;
        let res;
        try {
            res = await query(api_url, false);
            commit = JSON.parse(res.responseText)[0]['id'];
            console.log(`Using latest commit from project=${project}: ${commit}`);
        } catch (e) {
            console.log(`Failed to query GitLab API. Send: ${api_url} Response: ${res}`);
            return; // Abort
        }
    }

    let index = await query('index.html');

    updateProgress('Loading Index', 1, 1);

    // Parse index.html
    let sourceStyles = [];
    let sourceScripts = [];
    let rawScripts = [];
    let buffer = [];
    let block = false;
    for (let line of index.responseText.split('\n')) {
        let scriptMatch = /<script src="([\w\d/._-]+)"><\/script>/.exec(line);
        if (scriptMatch !== null) {
            if (!isExcludedInKD(scriptMatch[1])) {
                sourceScripts.push(scriptMatch[1]);
            }
            continue;
        }

        let asyncScriptMatch = /<script src="([\w\d/._-]+)"><\/script>/.exec(line);
        if (asyncScriptMatch !== null) {
            sourceScripts.push(asyncScriptMatch[1]);
            continue;
        }

        let styleMatch = /<link rel="stylesheet" href="([\w\d/._-]+)">/.exec(line);
        if (styleMatch !== null) {
            sourceStyles.push(styleMatch[1]);
            continue;
        }

        if (!block && /<script>/.test(line)) {
            block = true;
            buffer = [];
            continue;
        }
        if (block && /<\/script>/.test(line)) {
            block = false;
            rawScripts.push(buffer.join('\n'));
            continue;
        }

        buffer.push(line);
    }

    // Load CSS
    let stylesLoaded = 0;
    sourceStyles = sourceStyles.map(url => query(url));
    updateProgress('Loading Styles', 0, sourceStyles.length);
    for (const style of sourceStyles) {
        style.then(s => {
            stylesLoaded++;
            updateProgress('Loading Styles', stylesLoaded, sourceStyles.length);
        });
    }

    let styles = await Promise.all(sourceStyles);
    
    styles.forEach(req => addStyle(req.responseText));

    // Load all <script src=""> tags

    let scriptsLoaded = 0;
    let sourceScriptNames = sourceScripts;
    sourceScripts = sourceScripts.map(url => query(url));
    updateProgress('Loading Scripts', 0, sourceScripts.length);
    for (const style of sourceScripts) {
        style.then(s => {
            scriptsLoaded++;
            updateProgress('Loading Scripts', scriptsLoaded, sourceScripts.length);
        });
    }

    let sources = await Promise.all(sourceScripts);

    sources.forEach((req, i) => {
        let src = sourceScriptNames[i];

        addScript(req.responseText);

        // Processing that must be immediately after specific scripts
        if (src === 'Scripts/Common.js') {
            loadAfterCommon();
        } else if (src === 'Scripts/ImageCache.js') { // Future proof, for when ImageCache gets re-added
            loadAfterImageCache();
        }
    });

    // Load all <script> tags with raw code
    rawScripts.forEach(src => addScript(src));

    // Remove progress bar
    PROGRESS_ROOT.remove();

    // Bootstrap
    loadKD();
}

function loadAfterCommon() {
    patch(CommonGet, {
        'CommonGet(Path, Callback, RetriesLeft) {': 'CommonGet(Path, Callback, RetriesLeft) {\nPath = remap(Path);'
    });
}

function loadAfterImageCache() {
    patch(CachedImage.prototype._refresh, {
        '_refresh() {': 'CachedImage.prototype._refresh = function() {',
        'this.element.src = this.url;': 'this.element.crossOrigin = "Anonymous"; this.element.src = remap(this.url);',
    });
}

function loadKD() {

    // Patch image loading to redirect to repo
    patch(GLDrawLoadImage, {
        'GLDrawLoadImage(gl, url) {': 'GLDrawLoadImage(gl, url) {\nurl = remap(url);',
        'Img.src =': 'Img.crossOrigin = "Anonymous";\nImg.src ='
    });

    patch(DrawGetImage, {
        'DrawGetImage(Source) {': 'DrawGetImage(Source) {\nSource = remap(Source);',
        'Img.src = ': 'Img.crossOrigin = "Anonymous";\nImg.src = '
    });

    patch(AudioPlayInstantSound, {
        'audio.src =': 'audio.crossOrigin = "Anonymous";\naudio.src ='
    });
    
    // Bootstrap BC enough to be able to run KD
    KinkyDungeonMainRun = () => {};
    KinkyDungeonMainClick = () => {};

    TimerPrivateOwnerBeep = () => {};

    ServerSend = () => {};
    ServerPrivateCharacterSync = () => {};
    ServerPlayerIsInChatRoom = () => false;
    ServerAccountUpdate = {
        SyncToServer: () => {},
        QueueData: () => {}
    };

    PrivateCharacter = [];

    ChatRoomChatLog = [];
    ChatRoomCharacterUpdate = () => {};
    ChatRoomCharacterItemUpdate = () => {};

    AsylumGGTSControlItem = () => false;
    AsylumGGTSCharacterName = () => "";

    ArcadeDeviousChallenge = true;
    ArcadeKinkyDungeonEnd = () => {}

    KinkyDungeonMultiplayerUpdate = () => {};

    // window.onload in index.html
    ServerURL = "foobar";
    CommonIsMobile = CommonDetectMobile();
    TranslationLoad();
    DrawLoad();
    AssetLoadAll();
    ControllerActive = false;
    let _TextLoad = TextLoad; // Avoid nonexistent text query
    TextLoad = () => {};
    CommonSetScreen("KinkyDungeon", "KinkyDungeonMain");
    TextLoad = _TextLoad;
    MainRun(0);

    // LoginLoad
    Character = [];
    CharacterNextId = 1;
    CharacterReset(0, "Female3DCG");
    CharacterLoadCSVDialog(Player);
    ActivityDictionaryLoad();

    Player.ArousalSettings = {};
    Player.ArousalSettings.VFXFilter = "VFXFilterHeavy";
    Player.OnlineSharedSettings = {};
    Player.OnlineSharedSettings.ItemsAffectExpressions = true
    Player.AudioSettings = {};
    Player.AudioSettings.Volume = 1;

    CharacterAppearanceSetDefault(Player);
    CurrentCharacter = null; 
    MiniGameStart("KinkyDungeon", 1, "ArcadeKinkyDungeonEnd");

    // Default keybindings, these are initialized as part of the Player
    KinkyDungeonKeybindings = {
        Down: "KeyS",
        DownLeft: "KeyZ",
        DownRight: "KeyC",
        Left: "KeyA",
        Right: "KeyD",
        Skip: "Space",
        Spell1: "Digit1",
        Spell2: "Digit2",
        Spell3: "Digit3",
        Spell4: "Digit4",
        Spell5: "Digit5",
        Up: "KeyW",
        UpLeft: "KeyQ",
        UpRight: "KeyE",
        Wait: "KeyX",
    };
    if (localStorage.getItem("KinkyDungeonKeybindings") && JSON.parse(localStorage.getItem("KinkyDungeonKeybindings"))) {
        KinkyDungeonKeybindings = JSON.parse(localStorage.getItem("KinkyDungeonKeybindings"));
    }

    GLDrawLoad(); // Normally invoked from window.onload
}

load().then(
    _ => console.log('Loaded successfully'),
    err => console.log(err)
);
