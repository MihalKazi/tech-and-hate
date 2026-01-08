/* =========================================
   ROBUST PREDICTIONS SCRIPT
   Fixes: "Jump to First Card" Bug (Uses Hard Offsets)
   ========================================= */

// --- LIBRARY 1: FitVids ---
if (window.jQuery) { (function($){"use strict";$.fn.fitVids=function(options){var settings={customSelector:null,ignore:null};if(!document.getElementById('fit-vids-style')){var head=document.head||document.getElementsByTagName('head')[0];var css='.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';var div=document.createElement('div');div.innerHTML='<p>x</p><style id="fit-vids-style">'+css+'</style>';head.appendChild(div.childNodes[1])}if(options){$.extend(settings,options)}return this.each(function(){var selectors=["iframe[src*='player.vimeo.com']","iframe[src*='youtube.com']","iframe[src*='youtube-nocookie.com']","iframe[src*='kickstarter.com'][src*='video.html']","object","embed"];if(settings.customSelector){selectors.push(settings.customSelector)}var ignoreList='.fitvidsignore';if(settings.ignore){ignoreList=ignoreList+', '+settings.ignore}var $allVideos=$(this).find(selectors.join(','));$allVideos=$allVideos.not("object object");$allVideos=$allVideos.not(ignoreList);$allVideos.each(function(){var $this=$(this);if($this.parents(ignoreList).length>0){return}if(this.tagName.toLowerCase()==='embed'&&$this.parent('object').length||$this.parent('.fluid-width-video-wrapper').length){return}if((!$this.css('height')&&!$this.css('width'))&&(isNaN($this.attr('height'))||isNaN($this.attr('width')))){$this.attr('height',9);$this.attr('width',16)}var height=(this.tagName.toLowerCase()==='object'||($this.attr('height')&&!isNaN(parseInt($this.attr('height'),10))))?parseInt($this.attr('height'),10):$this.height(),width=!isNaN(parseInt($this.attr('width'),10))?parseInt($this.attr('width'),10):$this.width(),aspectRatio=height/width;if(!$this.attr('id')){var videoID='fitvid'+Math.floor(Math.random()*999999);$this.attr('id',videoID)}$this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top',(aspectRatio*100)+"%");$this.removeAttr('height').removeAttr('width')})})}})(window.jQuery); }

// --- LIBRARY 2: Text Balancer ---
var textBalancer=(function(){var candidates=[];var initialize=function(selectors){if(!selectors){candidates=document.querySelectorAll('.balance-text')}else{createSelectors(selectors)}balanceText();var rebalanceText=debounce(function(){balanceText()},100);window.addEventListener('resize',rebalanceText)};var balanceText=function(){var element;var i;for(i=0;i<candidates.length;i+=1){element=candidates[i];if(textElementIsMultipleLines(element)){element.style.maxWidth='';squeezeContainer(element,element.clientHeight,0,element.clientWidth)}}};var debounce=function(func,wait,immediate){var timeout;return function(){var context=this,args=arguments;var later=function(){timeout=null;if(!immediate)func.apply(context,args)};var callNow=immediate&&!timeout;clearTimeout(timeout);timeout=setTimeout(later,wait);if(callNow)func.apply(context,args)}};function squeezeContainer(headline,originalHeight,bottomRange,topRange){var mid;if(bottomRange>=topRange){headline.style.maxWidth=topRange+'px';return}mid=(bottomRange+topRange)/2;headline.style.maxWidth=mid+'px';if(headline.clientHeight>originalHeight){squeezeContainer(headline,originalHeight,mid+1,topRange)}else{squeezeContainer(headline,originalHeight,bottomRange+1,mid)}}var createSelectors=function(selectors){selectorArray=selectors.split(',');for(var i=0;i<selectorArray.length;i+=1){var currentSelectorElements=document.querySelectorAll(selectorArray[i].trim());for(var j=0;j<currentSelectorElements.length;j+=1){var currentSelectorElement=currentSelectorElements[j];candidates.push(currentSelectorElement)}}};var textElementIsMultipleLines=function(element){var firstWordHeight;var elementHeight;var HEIGHT_OFFSET;var elementWords;var firstWord;var ORIGINAL_ELEMENT_TEXT;ORIGINAL_ELEMENT_TEXT=element.innerHTML;HEIGHT_OFFSET=10;elementWords=element.innerHTML.split(' ');firstWord=document.createElement('span');firstWord.id='element-first-word';firstWord.innerHTML=elementWords[0];elementWords=elementWords.slice(1);element.innerHTML='';element.appendChild(firstWord);element.innerHTML+=' '+elementWords.join(' ');firstWord=document.getElementById('element-first-word');firstWordHeight=firstWord.offsetHeight;elementHeight=element.offsetHeight;element.innerHTML=ORIGINAL_ELEMENT_TEXT;return elementHeight-HEIGHT_OFFSET>firstWordHeight};return{initialize:initialize}})();

// --- LIBRARY 3: Picturefill ---
/*! Picturefill - v2.1.0 */
window.matchMedia||(window.matchMedia=function(){"use strict";var a=window.styleMedia||window.media;if(!a){var b=document.createElement("style"),c=document.getElementsByTagName("script")[0],d=null;b.type="text/css",b.id="matchmediajs-test",c.parentNode.insertBefore(b,c),d="getComputedStyle"in window&&window.getComputedStyle(b,null)||b.currentStyle,a={matchMedium:function(a){var c="@media "+a+"{ #matchmediajs-test { width: 1px; } }";return b.styleSheet?b.styleSheet.cssText=c:b.textContent=c,"1px"===d.width}}}return function(b){return{matches:a.matchMedium(b||"all"),media:b||"all"}}}()),function(a,b){"use strict";function c(a){var b,c,d,f,g,h=a||{};b=h.elements||e.getAllElements();for(var i=0,j=b.length;j>i;i++)if(c=b[i],d=c.parentNode,f=void 0,g=void 0,c[e.ns]||(c[e.ns]={}),h.reevaluate||!c[e.ns].evaluated){if("PICTURE"===d.nodeName.toUpperCase()){if(e.removeVideoShim(d),f=e.getMatch(c,d),f===!1)continue}else f=void 0;("PICTURE"===d.nodeName.toUpperCase()||c.srcset&&!e.srcsetSupported||!e.sizesSupported&&c.srcset&&c.srcset.indexOf("w")>-1)&&e.dodgeSrcset(c),f?(g=e.processSourceSet(f),e.applyBestCandidate(g,c)):(g=e.processSourceSet(c),(void 0===c.srcset||c[e.ns].srcset)&&e.applyBestCandidate(g,c)),c[e.ns].evaluated=!0}}function d(){c();var d=setInterval(function(){return c(),/^loaded|^i|^c/.test(b.readyState)?void clearInterval(d):void 0},250);if(a.addEventListener){var e;a.addEventListener("resize",function(){a._picturefillWorking||(a._picturefillWorking=!0,a.clearTimeout(e),e=a.setTimeout(function(){c({reevaluate:!0}),a._picturefillWorking=!1},60))},!1)}}if(a.HTMLPictureElement)return void(a.picturefill=function(){});b.createElement("picture");var e={};e.ns="picturefill",e.srcsetSupported="srcset"in b.createElement("img"),e.sizesSupported=a.HTMLImageElement.sizes,e.trim=function(a){return a.trim?a.trim():a.replace(/^\s+|\s+$/g,"")},e.endsWith=function(a,b){return a.endsWith?a.endsWith(b):-1!==a.indexOf(b,a.length-b.length)},e.matchesMedia=function(b){return a.matchMedia&&a.matchMedia(b).matches},e.getDpr=function(){return a.devicePixelRatio||1},e.getWidthFromLength=function(a){return a=a&&(parseFloat(a)>0||a.indexOf("calc(")>-1)?a:"100vw",a=a.replace("vw","%"),e.lengthEl||(e.lengthEl=b.createElement("div"),b.documentElement.insertBefore(e.lengthEl,b.documentElement.firstChild)),e.lengthEl.style.cssText="position: absolute; left: 0; width: "+a+";",e.lengthEl.offsetWidth<=0&&(e.lengthEl.style.cssText="width: 100%;"),e.lengthEl.offsetWidth},e.types={},e.types["image/jpeg"]=!0,e.types["image/gif"]=!0,e.types["image/png"]=!0,e.types["image/svg+xml"]=b.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image","1.1"),e.types["image/webp"]=function(){var b=new a.Image,d="image/webp";b.onerror=function(){e.types[d]=!1,c()},b.onload=function(){e.types[d]=1===b.width,c()},b.src="data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA="},e.verifyTypeSupport=function(a){var b=a.getAttribute("type");return null===b||""===b?!0:"function"==typeof e.types[b]?(e.types[b](),"pending"):e.types[b]},e.parseSize=function(a){var b=/(\([^)]+\))?\s*(.+)/g.exec(a);return{media:b&&b[1],length:b&&b[2]}},e.findWidthFromSourceSize=function(a){for(var b,c=e.trim(a).split(/\s*,\s*/),d=0,f=c.length;f>d;d++){var g=c[d],h=e.parseSize(g),i=h.length,j=h.media;if(i&&(!j||e.matchesMedia(j))){b=i;break}}return e.getWidthFromLength(b)},e.parseSrcset=function(a){for(var b=[];""!==a;){a=a.replace(/^\s+/g,"");var c,d=a.search(/\s/g),e=null;if(-1!==d){c=a.slice(0,d);var f=c[c.length-1];if((","===f||""===c)&&(c=c.replace(/,+$/, ""),e=""),a=a.slice(d+1),null===e){var g=a.indexOf(",");-1!==g?(e=a.slice(0,g),a=a.slice(g+1)):(e=a,a="")}}else c=a,a="";(c||e)&&b.push({url:c,descriptor:e})}return b},e.parseDescriptor=function(a,b){var c,d=b||"100vw",f=a&&a.replace(/(^\s+|\s+$)/g,""),g=e.findWidthFromSourceSize(d);if(f)for(var h=f.split(" "),i=h.length+1;i>=0;i--)if(void 0!==h[i]){var j=h[i],k=j&&j.slice(j.length-1);if("h"!==k&&"w"!==k||e.sizesSupported){if("x"===k){var l=j&&parseFloat(j,10);c=l&&!isNaN(l)?l:1}}else c=parseFloat(parseInt(j,10)/g)}return c||1},e.getCandidatesFromSourceSet=function(a,b){for(var c=e.parseSrcset(a),d=[],f=0,g=c.length;g>f;f++){var h=c[f];d.push({url:h.url,resolution:e.parseDescriptor(h.descriptor,b)})}return d},e.dodgeSrcset=function(a){a.srcset&&(a[e.ns].srcset=a.srcset,a.removeAttribute("srcset"))},e.processSourceSet=function(a){var b=a.getAttribute("srcset"),c=a.getAttribute("sizes"),d=[];return"IMG"===a.nodeName.toUpperCase()&&a[e.ns]&&a[e.ns].srcset&&(b=a[e.ns].srcset),b&&(d=e.getCandidatesFromSourceSet(b,c)),d},e.applyBestCandidate=function(a,b){var c,d,f;a.sort(e.ascendingSort),d=a.length,f=a[d-1];for(var g=0;d>g;g++)if(c=a[g],c.resolution>=e.getDpr()){f=c;break}f&&!e.endsWith(b.src,f.url)&&(b.src=f.url,b.currentSrc=b.src)},e.ascendingSort=function(a,b){return a.resolution-b.resolution},e.removeVideoShim=function(a){var b=a.getElementsByTagName("video");if(b.length){for(var c=b[0],d=c.getElementsByTagName("source");d.length;)a.insertBefore(d[0],c);c.parentNode.removeChild(c)}},e.getAllElements=function(){for(var a=[],c=b.getElementsByTagName("img"),d=0,f=c.length;f>d;d++){var g=c[d];("PICTURE"===g.parentNode.nodeName.toUpperCase()||null!==g.getAttribute("srcset")||g[e.ns]&&null!==g[e.ns].srcset)&&a.push(g)}return a},e.getMatch=function(a,b){for(var c,d=b.childNodes,f=0,g=d.length;g>f;f++){var h=d[f];if(1===h.nodeType){if(h===a)return c;if("SOURCE"===h.nodeName.toUpperCase()){null!==h.getAttribute("src")&&void 0!==typeof console&&console.warn("The `src` attribute is invalid on `picture` `source` element; instead, use `srcset`.");var i=h.getAttribute("media");if(h.getAttribute("srcset")&&(!i||e.matchesMedia(i))){var j=e.verifyTypeSupport(h);if(j===!0){c=h;break}if("pending"===j)return!1}}}}return c},d(),c._=e,"object"==typeof module&&"object"==typeof module.exports?module.exports=c:"function"==typeof define&&define.amd?define(function(){return c}):"object"==typeof a&&(a.picturefill=c)}(this,this.document);

// --- LIBRARY 4: Exit Intent ---
(function() {
    let hasShown = false;
    function shouldShowPopup() {
        const lastShown = localStorage.getItem('nlepLastShown');
        if (!lastShown) return true;
        const diff = new Date() - new Date(lastShown);
        return (diff / (1000 * 60 * 60 * 24)) >= 30;
    }
    function showPopup() {
        const popup = document.getElementById('nlep-exit-popup');
        if (popup) {
            popup.classList.add('nlep-visible');
            popup.classList.remove('nlep-hidden');
            localStorage.setItem('nlepLastShown', new Date().toISOString());
        }
    }
    function hidePopup() {
        const popup = document.getElementById('nlep-exit-popup');
        if (popup) {
            popup.classList.remove('nlep-visible');
            popup.classList.add('nlep-hidden');
        }
    }
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY < 0 && !hasShown && shouldShowPopup()) {
            hasShown = true;
            setTimeout(showPopup, 100);
        }
    });
    document.addEventListener('click', function(e) {
        if (e.target.closest('#nlep-close-btn') || e.target.classList.contains('nlep-overlay')) {
            hidePopup();
        }
    });
})();


/* =========================================
   MAIN LOGIC
   ========================================= */
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. INITIALIZE TOOLS
    try { textBalancer.initialize('.hero-title, .prediction-title, .back-content h3'); } catch(e){}
    if (window.jQuery) { try { window.jQuery(".scrollable-text").fitVids(); } catch(e){} }

    // 2. ISOTOPE GRID
    var grid = document.querySelector('.prediction-grid');
    var iso;
    if (grid) {
        setTimeout(() => {
            if (typeof Isotope !== 'undefined') {
                iso = new Isotope( grid, { itemSelector: '.prediction-card', layoutMode: 'fitRows' });
                window.addEventListener('resize', function(){ iso.layout(); });
            }
        }, 100);
    }

    // 3. HERO ANIMATION (Fixed Coordinates)
    let activeCard = null;
    let spacer = document.createElement('div');
    spacer.className = 'card-spacer';
    let overlay = document.querySelector('.overlay-backdrop');
    if (!overlay) { overlay = document.createElement('div'); overlay.className = 'overlay-backdrop'; document.body.appendChild(overlay); }

    document.querySelectorAll('.prediction-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (this.classList.contains('is-expanded') || activeCard || e.target.closest('.close-btn')) return;
            activeCard = this;
            
            // --- A. SAVE EXACT OFFSET COORDINATES (The Fix) ---
            // offsetLeft/Top are reliable relative to the parent (the grid)
            this.dataset.gridTop = this.offsetTop + 'px';
            this.dataset.gridLeft = this.offsetLeft + 'px';
            this.dataset.gridWidth = this.offsetWidth + 'px';
            this.dataset.gridHeight = this.offsetHeight + 'px';
            
            // --- B. SETUP ANIMATION ---
            const rect = this.getBoundingClientRect(); // Screen coords
            
            spacer.style.width = this.offsetWidth + 'px';
            spacer.style.height = this.offsetHeight + 'px';
            // Copy margins if any (Isotope usually handles spacing via width, but safety first)
            const style = window.getComputedStyle(this);
            spacer.style.margin = style.margin;
            
            this.parentNode.insertBefore(spacer, this);
            
            // --- C. LOCK TO SCREEN ---
            this.style.position = 'fixed';
            this.style.top = rect.top + 'px';
            this.style.left = rect.left + 'px';
            this.style.width = rect.width + 'px';
            this.style.height = rect.height + 'px';
            this.style.margin = '0'; 
            this.style.zIndex = '9999';
            
            // --- D. FLY ---
            requestAnimationFrame(() => {
                this.classList.add('is-expanded'); 
                overlay.classList.add('active');
                
                const vW = window.innerWidth;
                const vH = window.innerHeight;
                const tW = Math.min(800, vW * 0.9);
                const tH = Math.min(600, vH * 0.85);
                
                this.style.top = (vH - tH) / 2 + 'px'; 
                this.style.left = (vW - tW) / 2 + 'px';
                this.style.width = tW + 'px'; 
                this.style.height = tH + 'px';
                
                document.body.style.overflow = 'hidden';
            });
        });
    });

    // Close Logic
    function closeActiveCard(e) {
        if (e) e.stopPropagation();
        if (!activeCard) return;
        
        overlay.classList.remove('active'); 
        document.body.style.overflow = '';
        
        // 1. Fly to Spacer
        const sRect = spacer.getBoundingClientRect();
        activeCard.style.top = sRect.top + 'px'; 
        activeCard.style.left = sRect.left + 'px';
        activeCard.style.width = sRect.width + 'px'; 
        activeCard.style.height = sRect.height + 'px';
        
        // 2. Wait for landing
        setTimeout(() => {
            if (!activeCard) return;
            
            // 3. REMOVE FIXED CLASS
            activeCard.classList.remove('is-expanded');
            
            // 4. INSTANTLY RESTORE GRID POSITION (No "Auto" jump)
            activeCard.style.position = 'absolute'; 
            activeCard.style.margin = '0';
            activeCard.style.zIndex = '';
            
            // Use the offset data we saved
            activeCard.style.top = activeCard.dataset.gridTop; 
            activeCard.style.left = activeCard.dataset.gridLeft; 
            activeCard.style.width = activeCard.dataset.gridWidth; 
            activeCard.style.height = activeCard.dataset.gridHeight; 
            
            if (spacer.parentNode) spacer.parentNode.removeChild(spacer);
            
            // 5. Force Isotope to Acknowledge
            if (iso) iso.layout();
            
            activeCard = null;
        }, 600); 
    }
    overlay.addEventListener('click', closeActiveCard);
    document.querySelectorAll('.close-btn').forEach(btn => btn.addEventListener('click', closeActiveCard));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeActiveCard(); });


    // --- 4. GENERATIVE ART RENDERER ---
    const renderCards = () => {
        if (!window.PatternRenderer || !window.SimplexNoise || !window.PredictionDesign) return;
        
        document.querySelectorAll('.prediction-card').forEach(card => {
            const canvas = card.querySelector('.card-canvas');
            if (!canvas) return;

            const author = card.dataset.name || 'Anonymous';
            const titleElement = card.querySelector('.prediction-title');
            const title = titleElement ? titleElement.innerText : 'Prediction';

            try {
                const design = window.PredictionDesign.generatePredictionDesign(author, title);
                const cardFront = card.querySelector('.card-front');
                if(cardFront) {
                    cardFront.style.backgroundColor = design.bg;
                    cardFront.style.color = design.text;
                    const authorElem = cardFront.querySelector('.author-name');
                    if(authorElem) {
                        authorElem.style.color = design.text;
                        authorElem.style.borderColor = (design.text === '#f5f5f5') ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)';
                    }
                    const titleElem = cardFront.querySelector('.prediction-title');
                    if(titleElem) titleElem.style.color = design.text;
                }

                const ctx = canvas.getContext('2d');
                const dpr = window.devicePixelRatio || 1;
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                ctx.scale(dpr, dpr);

                const noise = new SimplexNoise(design.seed); 
                const colorFunc = (alpha) => {
                    const strokes = design.strokes;
                    const index = Math.floor(Math.abs(alpha) * strokes.length) % strokes.length;
                    return strokes[index];
                };

                if (window.PatternRenderer.patterns[design.pattern]) {
                    let seedVal = design.seed;
                    const seededRandom = () => {
                        let t = seedVal += 0x6D2B79F5;
                        t = Math.imul(t ^ t >>> 15, t | 1);
                        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
                        return ((t ^ t >>> 14) >>> 0) / 4294967296;
                    };
                    const geom = window.PatternRenderer.createGeometry(design.pattern, seededRandom, rect.width, rect.height, 80);
                    window.PatternRenderer.patterns[design.pattern](ctx, geom, 0, colorFunc, noise);
                }
            } catch(e) { console.log(e); }
        });
    };

    renderCards();
    window.addEventListener('resize', debounce(renderCards, 200));

    function debounce(func, wait) {
        let timeout;
        return function() { clearTimeout(timeout); timeout = setTimeout(func, wait); };
    }
});