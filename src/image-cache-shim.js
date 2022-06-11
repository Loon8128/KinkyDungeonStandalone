patch(CachedImage.prototype._refresh, {
    '_refresh() {': 'CachedImage.prototype._refresh = function() {',
    'this.element.src = this.url;': 'this.element.crossOrigin = "Anonymous"; this.element.src = remap(this.url);',
})