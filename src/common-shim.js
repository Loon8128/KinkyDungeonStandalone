patch(CommonGet, {
    'CommonGet(Path, Callback, RetriesLeft) {': 'CommonGet(Path, Callback, RetriesLeft) {\nPath = remap(Path);'
});

patch(AudioPlayInstantSound, {
    'audio.src = src;': 'audio.crossOrigin = "Anonymous";\naudio.src = remap(src);'
});
