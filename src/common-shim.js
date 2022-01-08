
// Shim for asset requests that need to go through the submodule path, or for custom path requests from club code
const shimAssetPaths = new Map();
const submodulePath = 'Bondage-Club/BondageClub/';

shimAssetPaths.set('Screens/KinkyDungeon/KinkyDungeonMain/Text_KinkyDungeonMain.csv', 'assets/empty.csv');

_CommonGet = CommonGet
CommonGet = function(Path, Callback, RetriesLeft) {
    if (shimAssetPaths.has(Path)) {
        return _CommonGet(shimAssetPaths.get(Path), Callback, RetriesLeft);
    }
    return _CommonGet(submodulePath + Path, Callback, RetriesLeft);
}

_GLDrawLoadImage = GLDrawLoadImage
GLDrawLoadImage = function(gl, url) {
    return _GLDrawLoadImage(gl, submodulePath + url);
}

_DrawGetImage = DrawGetImage
DrawGetImage = function(src) {
    return _DrawGetImage(submodulePath + src)
}