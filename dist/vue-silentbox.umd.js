(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.VueSilentbox = {}));
}(this, function (exports) { 'use strict';

    var VideoUrlDecoderMixin = {
        methods: {
            getYoutubeVideoId: function getYoutubeVideoId(url) { 
                var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
                var match  = url.match(regExp);

                return (match !== undefined && match[7] !== undefined) ? match[7] : false;
            },
            getVimeoVideoId: function getVimeoVideoId(url) {
                return /(vimeo(pro)?\.com)\/(?:[^\d]+)?(\d+)\??(.*)?$/.exec(url)[3];
            }
        }
    };

    var ItemMixin = {
        mixins: [ VideoUrlDecoderMixin ], 
        methods: {
            getThumnail: function getThumnail(src) {
                if (src.includes('youtube.com') || src.includes('youtu.be')) {
                    var videoId = this.getYoutubeVideoId(src);
                    
                    return 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg';
                } else if (src.includes('vimeo.com')) {
                    var videoDetails = this.httpGet('https://vimeo.com/api/v2/video/54802209.json');

                    return videoDetails[0].thumbnail_medium;
                } else {
                    return src;
                }
            },
            httpGet: function httpGet(url) {
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.open("GET", url, false);
                xmlHttp.send(null);

                return JSON.parse(xmlHttp.responseText);
            }
        }
    };

    //

    var script = {
        name: 'SilentboxItem',
        mixins: [ ItemMixin ],
        props: {
            // Media source, it could be an image or a youtube video.
            'src': {
                type: String,
                required: true
            },
            // True if video should be autoplayed.
            'autoplay': {
                type: Boolean,
                default: function default$1() {
                    return false;
                }
            },
            'item': {
                type: Object
            },
            // Short description below image.
            'description': String,
            'position': {},
            'thumbnailWidth': {
                type: String,
                default: '200px'
            },
            'thumbnailHeight': {
                type: String,
                default: '150px'
            },
            // Hide player controls
            'hideControls': {
                type: Boolean,
                default: function default$2() {
                    return false;
                }
            }
        },
        computed: {
            /**
             * Get embed URL.
             * @return {string|null}
             */
            embedUrl: function embedUrl() {
                if (this.src !== null) {
                    return this.src;
                }

                return null;
            }
        },
        methods: {
            /**
             * Emit an event that overlay should be hidden.
             *
             * @return {void}
             */
            closeSilentBoxOverlay: function closeSilentBoxOverlay() {
                this.$parent.$emit('closeSilentboxOverlay');
            },
            /**
             * Emit an event that overlay should be opened.
             *
             * @return {void}
             */
            openSilentBoxOverlay: function openSilentBoxOverlay() {
                var this$1 = this;

                var itemIndex = this.$parent.items.list.findIndex(function (item) { return item.src === this$1.src; });

                this.$parent.$emit('openSilentboxOverlay', {
                    url: this.embedUrl,
                    position: itemIndex,
                    autoplay: this.autoplay,
                    item: this.item,
                    description: this.description
                });
            }
        },
        created: function created() {
            // Push items to the parent component.
            // TODO: do it in parent component
            this.$parent.items.list.push({
                src: this.src,
                autoplay: this.autoplay,
                item: this.item,
                desc: this.description,
                position: this.position
            });
        }
    };

    function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
    /* server only */
    , shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
      } // Vue.extend constructor export interop.


      var options = typeof script === 'function' ? script.options : script; // render functions

      if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true; // functional template

        if (isFunctionalTemplate) {
          options.functional = true;
        }
      } // scopedId


      if (scopeId) {
        options._scopeId = scopeId;
      }

      var hook;

      if (moduleIdentifier) {
        // server build
        hook = function hook(context) {
          // 2.3 injection
          context = context || // cached call
          this.$vnode && this.$vnode.ssrContext || // stateful
          this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
          // 2.2 with runInNewContext: true

          if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
            context = __VUE_SSR_CONTEXT__;
          } // inject component styles


          if (style) {
            style.call(this, createInjectorSSR(context));
          } // register component module identifier for async chunk inference


          if (context && context._registeredComponents) {
            context._registeredComponents.add(moduleIdentifier);
          }
        }; // used by ssr in case component is cached and beforeCreate
        // never gets called


        options._ssrRegister = hook;
      } else if (style) {
        hook = shadowMode ? function () {
          style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
        } : function (context) {
          style.call(this, createInjector(context));
        };
      }

      if (hook) {
        if (options.functional) {
          // register for functional component in vue file
          var originalRender = options.render;

          options.render = function renderWithStyleInjection(h, context) {
            hook.call(context);
            return originalRender(h, context);
          };
        } else {
          // inject component registration as beforeCreate hook
          var existing = options.beforeCreate;
          options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
      }

      return script;
    }

    var normalizeComponent_1 = normalizeComponent;

    var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
    function createInjector(context) {
      return function (id, style) {
        return addStyle(id, style);
      };
    }
    var HEAD = document.head || document.getElementsByTagName('head')[0];
    var styles = {};

    function addStyle(id, css) {
      var group = isOldIE ? css.media || 'default' : id;
      var style = styles[group] || (styles[group] = {
        ids: new Set(),
        styles: []
      });

      if (!style.ids.has(id)) {
        style.ids.add(id);
        var code = css.source;

        if (css.map) {
          // https://developer.chrome.com/devtools/docs/javascript-debugging
          // this makes source maps inside style tags work properly in Chrome
          code += '\n/*# sourceURL=' + css.map.sources[0] + ' */'; // http://stackoverflow.com/a/26603875

          code += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) + ' */';
        }

        if (!style.element) {
          style.element = document.createElement('style');
          style.element.type = 'text/css';
          if (css.media) { style.element.setAttribute('media', css.media); }
          HEAD.appendChild(style.element);
        }

        if ('styleSheet' in style.element) {
          style.styles.push(code);
          style.element.styleSheet.cssText = style.styles.filter(Boolean).join('\n');
        } else {
          var index = style.ids.size - 1;
          var textNode = document.createTextNode(code);
          var nodes = style.element.childNodes;
          if (nodes[index]) { style.element.removeChild(nodes[index]); }
          if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }else { style.element.appendChild(textNode); }
        }
      }
    }

    var browser = createInjector;

    /* script */
    var __vue_script__ = script;

    /* template */
    var __vue_render__ = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "span",
        {
          staticClass: "silentbox-item",
          attrs: { src: _vm.src },
          on: { click: _vm.openSilentBoxOverlay }
        },
        [
          _vm._t("default", [
            _c("img", {
              attrs: {
                src: _vm.getThumnail(_vm.src),
                width: _vm.thumbnailWidth,
                height: _vm.thumbnailHeight
              }
            })
          ])
        ],
        2
      )
    };
    var __vue_staticRenderFns__ = [];
    __vue_render__._withStripped = true;

      /* style */
      var __vue_inject_styles__ = function (inject) {
        if (!inject) { return }
        inject("data-v-3fc77ff6_0", { source: ".silentbox-item {\n  cursor: pointer;\n  text-decoration: underline;\n}\n\n/*# sourceMappingURL=item.vue.map */", map: {"version":3,"sources":["/home/gfrymer/blink/silentbox/components/item.vue","item.vue"],"names":[],"mappings":"AAuGA;EACA,eAAA;EACA,0BAAA;ACtGA;;AAEA,mCAAmC","file":"item.vue","sourcesContent":["<template>\r\n    <span class=\"silentbox-item\" :src=\"src\" @click=\"openSilentBoxOverlay\">\r\n        <slot>\r\n            <img :src=\"getThumnail(src)\" :width=\"thumbnailWidth\" :height=\"thumbnailHeight\" />\r\n        </slot>\r\n    </span>\r\n</template>\r\n\r\n<script>\r\n    import ItemMixin from './../mixins/item';\r\n\r\n    export default {\r\n        name: 'SilentboxItem',\r\n        mixins: [ ItemMixin ],\r\n        props: {\r\n            // Media source, it could be an image or a youtube video.\r\n            'src': {\r\n                type: String,\r\n                required: true\r\n            },\r\n            // True if video should be autoplayed.\r\n            'autoplay': {\r\n                type: Boolean,\r\n                default() {\r\n                    return false;\r\n                }\r\n            },\r\n            'item': {\r\n                type: Object\r\n            },\r\n            // Short description below image.\r\n            'description': String,\r\n            'position': {},\r\n            'thumbnailWidth': {\r\n                type: String,\r\n                default: '200px'\r\n            },\r\n            'thumbnailHeight': {\r\n                type: String,\r\n                default: '150px'\r\n            },\r\n            // Hide player controls\r\n            'hideControls': {\r\n                type: Boolean,\r\n                default() {\r\n                    return false;\r\n                }\r\n            }\r\n        },\r\n        computed: {\r\n            /**\r\n             * Get embed URL.\r\n             * @return {string|null}\r\n             */\r\n            embedUrl() {\r\n                if (this.src !== null) {\r\n                    return this.src;\r\n                }\r\n\r\n                return null;\r\n            }\r\n        },\r\n        methods: {\r\n            /**\r\n             * Emit an event that overlay should be hidden.\r\n             *\r\n             * @return {void}\r\n             */\r\n            closeSilentBoxOverlay() {\r\n                this.$parent.$emit('closeSilentboxOverlay');\r\n            },\r\n            /**\r\n             * Emit an event that overlay should be opened.\r\n             *\r\n             * @return {void}\r\n             */\r\n            openSilentBoxOverlay() {\r\n                let itemIndex = this.$parent.items.list.findIndex(item => item.src === this.src);\r\n\r\n                this.$parent.$emit('openSilentboxOverlay', {\r\n                    url: this.embedUrl,\r\n                    position: itemIndex,\r\n                    autoplay: this.autoplay,\r\n                    item: this.item,\r\n                    description: this.description\r\n                });\r\n            }\r\n        },\r\n        created() {\r\n            // Push items to the parent component.\r\n            // TODO: do it in parent component\r\n            this.$parent.items.list.push({\r\n                src: this.src,\r\n                autoplay: this.autoplay,\r\n                item: this.item,\r\n                desc: this.description,\r\n                position: this.position\r\n            });\r\n        }\r\n    }\r\n</script>\r\n\r\n<style lang=\"scss\">\r\n    .silentbox-item {\r\n        cursor: pointer;\r\n        text-decoration: underline;\r\n    }\r\n</style>",".silentbox-item {\n  cursor: pointer;\n  text-decoration: underline;\n}\n\n/*# sourceMappingURL=item.vue.map */"]}, media: undefined });

      };
      /* scoped */
      var __vue_scope_id__ = undefined;
      /* module identifier */
      var __vue_module_identifier__ = undefined;
      /* functional template */
      var __vue_is_functional_template__ = false;
      /* style inject SSR */
      

      
      var item = normalizeComponent_1(
        { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
        __vue_inject_styles__,
        __vue_script__,
        __vue_scope_id__,
        __vue_is_functional_template__,
        __vue_module_identifier__,
        browser,
        undefined
      );

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var evEmitter = createCommonjsModule(function (module) {
    /**
     * EvEmitter v1.1.0
     * Lil' event emitter
     * MIT License
     */

    /* jshint unused: true, undef: true, strict: true */

    ( function( global, factory ) {
      // universal module definition
      /* jshint strict: false */ /* globals define, module, window */
      if ( module.exports ) {
        // CommonJS - Browserify, Webpack
        module.exports = factory();
      } else {
        // Browser globals
        global.EvEmitter = factory();
      }

    }( typeof window != 'undefined' ? window : commonjsGlobal, function() {

    function EvEmitter() {}

    var proto = EvEmitter.prototype;

    proto.on = function( eventName, listener ) {
      if ( !eventName || !listener ) {
        return;
      }
      // set events hash
      var events = this._events = this._events || {};
      // set listeners array
      var listeners = events[ eventName ] = events[ eventName ] || [];
      // only add once
      if ( listeners.indexOf( listener ) == -1 ) {
        listeners.push( listener );
      }

      return this;
    };

    proto.once = function( eventName, listener ) {
      if ( !eventName || !listener ) {
        return;
      }
      // add event
      this.on( eventName, listener );
      // set once flag
      // set onceEvents hash
      var onceEvents = this._onceEvents = this._onceEvents || {};
      // set onceListeners object
      var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
      // set flag
      onceListeners[ listener ] = true;

      return this;
    };

    proto.off = function( eventName, listener ) {
      var listeners = this._events && this._events[ eventName ];
      if ( !listeners || !listeners.length ) {
        return;
      }
      var index = listeners.indexOf( listener );
      if ( index != -1 ) {
        listeners.splice( index, 1 );
      }

      return this;
    };

    proto.emitEvent = function( eventName, args ) {
      var listeners = this._events && this._events[ eventName ];
      if ( !listeners || !listeners.length ) {
        return;
      }
      // copy over to avoid interference if .off() in listener
      listeners = listeners.slice(0);
      args = args || [];
      // once stuff
      var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

      for ( var i=0; i < listeners.length; i++ ) {
        var listener = listeners[i];
        var isOnce = onceListeners && onceListeners[ listener ];
        if ( isOnce ) {
          // remove listener
          // remove before trigger to prevent recursion
          this.off( eventName, listener );
          // unset once flag
          delete onceListeners[ listener ];
        }
        // trigger listener
        listener.apply( this, args );
      }

      return this;
    };

    proto.allOff = function() {
      delete this._events;
      delete this._onceEvents;
    };

    return EvEmitter;

    }));
    });

    var imagesloaded = createCommonjsModule(function (module) {
    /*!
     * imagesLoaded v4.1.4
     * JavaScript is all like "You images are done yet or what?"
     * MIT License
     */

    ( function( window, factory ) {  // universal module definition

      /*global define: false, module: false, require: false */

      if ( module.exports ) {
        // CommonJS
        module.exports = factory(
          window,
          evEmitter
        );
      } else {
        // browser global
        window.imagesLoaded = factory(
          window,
          window.EvEmitter
        );
      }

    })( typeof window !== 'undefined' ? window : commonjsGlobal,

    // --------------------------  factory -------------------------- //

    function factory( window, EvEmitter ) {

    var $ = window.jQuery;
    var console = window.console;

    // -------------------------- helpers -------------------------- //

    // extend objects
    function extend( a, b ) {
      for ( var prop in b ) {
        a[ prop ] = b[ prop ];
      }
      return a;
    }

    var arraySlice = Array.prototype.slice;

    // turn element or nodeList into an array
    function makeArray( obj ) {
      if ( Array.isArray( obj ) ) {
        // use object if already an array
        return obj;
      }

      var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
      if ( isArrayLike ) {
        // convert nodeList to array
        return arraySlice.call( obj );
      }

      // array of single index
      return [ obj ];
    }

    // -------------------------- imagesLoaded -------------------------- //

    /**
     * @param {Array, Element, NodeList, String} elem
     * @param {Object or Function} options - if function, use as callback
     * @param {Function} onAlways - callback function
     */
    function ImagesLoaded( elem, options, onAlways ) {
      // coerce ImagesLoaded() without new, to be new ImagesLoaded()
      if ( !( this instanceof ImagesLoaded ) ) {
        return new ImagesLoaded( elem, options, onAlways );
      }
      // use elem as selector string
      var queryElem = elem;
      if ( typeof elem == 'string' ) {
        queryElem = document.querySelectorAll( elem );
      }
      // bail if bad element
      if ( !queryElem ) {
        console.error( 'Bad element for imagesLoaded ' + ( queryElem || elem ) );
        return;
      }

      this.elements = makeArray( queryElem );
      this.options = extend( {}, this.options );
      // shift arguments if no options set
      if ( typeof options == 'function' ) {
        onAlways = options;
      } else {
        extend( this.options, options );
      }

      if ( onAlways ) {
        this.on( 'always', onAlways );
      }

      this.getImages();

      if ( $ ) {
        // add jQuery Deferred object
        this.jqDeferred = new $.Deferred();
      }

      // HACK check async to allow time to bind listeners
      setTimeout( this.check.bind( this ) );
    }

    ImagesLoaded.prototype = Object.create( EvEmitter.prototype );

    ImagesLoaded.prototype.options = {};

    ImagesLoaded.prototype.getImages = function() {
      this.images = [];

      // filter & find items if we have an item selector
      this.elements.forEach( this.addElementImages, this );
    };

    /**
     * @param {Node} element
     */
    ImagesLoaded.prototype.addElementImages = function( elem ) {
      // filter siblings
      if ( elem.nodeName == 'IMG' ) {
        this.addImage( elem );
      }
      // get background image on element
      if ( this.options.background === true ) {
        this.addElementBackgroundImages( elem );
      }

      // find children
      // no non-element nodes, #143
      var nodeType = elem.nodeType;
      if ( !nodeType || !elementNodeTypes[ nodeType ] ) {
        return;
      }
      var childImgs = elem.querySelectorAll('img');
      // concat childElems to filterFound array
      for ( var i=0; i < childImgs.length; i++ ) {
        var img = childImgs[i];
        this.addImage( img );
      }

      // get child background images
      if ( typeof this.options.background == 'string' ) {
        var children = elem.querySelectorAll( this.options.background );
        for ( i=0; i < children.length; i++ ) {
          var child = children[i];
          this.addElementBackgroundImages( child );
        }
      }
    };

    var elementNodeTypes = {
      1: true,
      9: true,
      11: true
    };

    ImagesLoaded.prototype.addElementBackgroundImages = function( elem ) {
      var style = getComputedStyle( elem );
      if ( !style ) {
        // Firefox returns null if in a hidden iframe https://bugzil.la/548397
        return;
      }
      // get url inside url("...")
      var reURL = /url\((['"])?(.*?)\1\)/gi;
      var matches = reURL.exec( style.backgroundImage );
      while ( matches !== null ) {
        var url = matches && matches[2];
        if ( url ) {
          this.addBackground( url, elem );
        }
        matches = reURL.exec( style.backgroundImage );
      }
    };

    /**
     * @param {Image} img
     */
    ImagesLoaded.prototype.addImage = function( img ) {
      var loadingImage = new LoadingImage( img );
      this.images.push( loadingImage );
    };

    ImagesLoaded.prototype.addBackground = function( url, elem ) {
      var background = new Background( url, elem );
      this.images.push( background );
    };

    ImagesLoaded.prototype.check = function() {
      var _this = this;
      this.progressedCount = 0;
      this.hasAnyBroken = false;
      // complete if no images
      if ( !this.images.length ) {
        this.complete();
        return;
      }

      function onProgress( image, elem, message ) {
        // HACK - Chrome triggers event before object properties have changed. #83
        setTimeout( function() {
          _this.progress( image, elem, message );
        });
      }

      this.images.forEach( function( loadingImage ) {
        loadingImage.once( 'progress', onProgress );
        loadingImage.check();
      });
    };

    ImagesLoaded.prototype.progress = function( image, elem, message ) {
      this.progressedCount++;
      this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
      // progress event
      this.emitEvent( 'progress', [ this, image, elem ] );
      if ( this.jqDeferred && this.jqDeferred.notify ) {
        this.jqDeferred.notify( this, image );
      }
      // check if completed
      if ( this.progressedCount == this.images.length ) {
        this.complete();
      }

      if ( this.options.debug && console ) {
        console.log( 'progress: ' + message, image, elem );
      }
    };

    ImagesLoaded.prototype.complete = function() {
      var eventName = this.hasAnyBroken ? 'fail' : 'done';
      this.isComplete = true;
      this.emitEvent( eventName, [ this ] );
      this.emitEvent( 'always', [ this ] );
      if ( this.jqDeferred ) {
        var jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
        this.jqDeferred[ jqMethod ]( this );
      }
    };

    // --------------------------  -------------------------- //

    function LoadingImage( img ) {
      this.img = img;
    }

    LoadingImage.prototype = Object.create( EvEmitter.prototype );

    LoadingImage.prototype.check = function() {
      // If complete is true and browser supports natural sizes,
      // try to check for image status manually.
      var isComplete = this.getIsImageComplete();
      if ( isComplete ) {
        // report based on naturalWidth
        this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
        return;
      }

      // If none of the checks above matched, simulate loading on detached element.
      this.proxyImage = new Image();
      this.proxyImage.addEventListener( 'load', this );
      this.proxyImage.addEventListener( 'error', this );
      // bind to image as well for Firefox. #191
      this.img.addEventListener( 'load', this );
      this.img.addEventListener( 'error', this );
      this.proxyImage.src = this.img.src;
    };

    LoadingImage.prototype.getIsImageComplete = function() {
      // check for non-zero, non-undefined naturalWidth
      // fixes Safari+InfiniteScroll+Masonry bug infinite-scroll#671
      return this.img.complete && this.img.naturalWidth;
    };

    LoadingImage.prototype.confirm = function( isLoaded, message ) {
      this.isLoaded = isLoaded;
      this.emitEvent( 'progress', [ this, this.img, message ] );
    };

    // ----- events ----- //

    // trigger specified handler for event type
    LoadingImage.prototype.handleEvent = function( event ) {
      var method = 'on' + event.type;
      if ( this[ method ] ) {
        this[ method ]( event );
      }
    };

    LoadingImage.prototype.onload = function() {
      this.confirm( true, 'onload' );
      this.unbindEvents();
    };

    LoadingImage.prototype.onerror = function() {
      this.confirm( false, 'onerror' );
      this.unbindEvents();
    };

    LoadingImage.prototype.unbindEvents = function() {
      this.proxyImage.removeEventListener( 'load', this );
      this.proxyImage.removeEventListener( 'error', this );
      this.img.removeEventListener( 'load', this );
      this.img.removeEventListener( 'error', this );
    };

    // -------------------------- Background -------------------------- //

    function Background( url, element ) {
      this.url = url;
      this.element = element;
      this.img = new Image();
    }

    // inherit LoadingImage prototype
    Background.prototype = Object.create( LoadingImage.prototype );

    Background.prototype.check = function() {
      this.img.addEventListener( 'load', this );
      this.img.addEventListener( 'error', this );
      this.img.src = this.url;
      // check if image is already complete
      var isComplete = this.getIsImageComplete();
      if ( isComplete ) {
        this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
        this.unbindEvents();
      }
    };

    Background.prototype.unbindEvents = function() {
      this.img.removeEventListener( 'load', this );
      this.img.removeEventListener( 'error', this );
    };

    Background.prototype.confirm = function( isLoaded, message ) {
      this.isLoaded = isLoaded;
      this.emitEvent( 'progress', [ this, this.element, message ] );
    };

    // -------------------------- jQuery -------------------------- //

    ImagesLoaded.makeJQueryPlugin = function( jQuery ) {
      jQuery = jQuery || window.jQuery;
      if ( !jQuery ) {
        return;
      }
      // set local variable
      $ = jQuery;
      // $().imagesLoaded()
      $.fn.imagesLoaded = function( options, callback ) {
        var instance = new ImagesLoaded( this, options, callback );
        return instance.jqDeferred.promise( $(this) );
      };
    };
    // try making plugin
    ImagesLoaded.makeJQueryPlugin();

    // --------------------------  -------------------------- //

    return ImagesLoaded;

    });
    });

    //

        var script$1 = {
            name: 'SilentboxOverlay',
            mixins: [ VideoUrlDecoderMixin ],
            data: function data() {
                return {
                    video: false,
                    loading: false,
                    imgLoad: null
                }
            },
            computed: {
                isSelectable: function isSelectable() {
                    return this.$parent.total > 0;
                },
                loadingColor: function loadingColor() {
                    return getComputedStyle(document.documentElement).getPropertyValue('--white');
                },
                isSelected: {
                    get: function get() {
                        return (this.$parent.selection && this.$parent.selection.indexOf(this.$parent.item) > -1);
                    },
                    set: function set(newVal) {
                    		if (this.$parent.selection && this.$parent.selection.indexOf(this.$parent.item) > -1) {
                    		    if (!newVal) {
                    		        this.$parent.selection.splice(this.$parent.selection.indexOf(this.$parent.item),1);
                    		    }
                    		}
                    		else {
                    		    if (newVal) {
                    		        this.$parent.selection.push(this.$parent.item);
                    		    }
                    		}
                    },
                },
                showImg: function showImg() {
                    if (this.loading) {
                        return "display:none";
                    }
                    return "";
                },
                /**
                 * Get the right embed URL.
                 */
                getEmbedUrl: function getEmbedUrl() {
                    return this.handleUrl(this.$parent.embedUrl);
                },
                /**
                 * Get autoplay state.
                 */
                getAutoplayState: function getAutoplayState() {
                    if (this.$parent.autoplay !== undefined && this.$parent.autoplay !== false) {
                        return "autoplay";
                    }
                     return "";
                },
                /**
                 * Check whether overlay is visible or not.
                 */
                isVisible: function isVisible() {
                    if (this.$parent.overlayVisibility !== undefined && this.$parent.overlayVisibility !== false) {
                        this.loading = true;
                        return true;
                    }

                    return false;
                }
            },
            watch: {
                isVisible: function (value) {
                    if (document !== undefined) {
                        this.bodyScrolling();
                    }
                }
            },
            methods: {
                bodyScrolling: function bodyScrolling() {
                    var this$1 = this;

                    var body = document.body;

                    // add class only if overlay should be visible
                    if (this.isVisible && ! body.classList.contains('silentbox-is-opened')) {
                        this.$nextTick(function () {
                            this$1.$refs.mediaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        });
                        return body.classList.add('silentbox-is-opened');
                    }

                    // remove class only if overlay should be hidden
                    if (! this.isVisible && body.classList.contains('silentbox-is-opened')) {
                        return body.classList.remove('silentbox-is-opened')
                    }
                },
                /**
                 * Move to next item.
                 */
                moveToNextItem: function moveToNextItem() {
                    if (this.loading) {
                        this.imgLoad.off('always',this.imgsLoaded);
                        this.imgLoad = null;
                    }
                    this.loading = true;
                    this.$parent.nextItem();
                },
                /**
                 * Move to previous item.
                 */
                moveToPreviousItem: function moveToPreviousItem()
                {
                    if (this.loading) {
                        this.imgLoad.off('always',this.imgsLoaded);
                        this.imgLoad = null;
                    }
                    this.loading = true;
                    this.$parent.prevItem();
                },
                stopTheEvent: function stopTheEvent(event)
                {
                    event.stopPropagation();
                },
                /**
                 * Hide silentbox overlay.
                 */
                closeSilentboxOverlay: function closeSilentboxOverlay() {
                    this.$parent.$emit('closeSilentboxOverlay');
                },
                /**
                 * Search for known video services URLs and return their players if recognized.
                 * Unrecognized URLs are handled as images.
                 * 
                 * @param  {string} url
                 * @return {string}
                 */
                handleUrl: function handleUrl(url) {
                    if (url.includes('youtube.com') || url.includes('youtu.be')) {
                        this.video = true;
                        return this.getYoutubeVideo(url);
                    } else if (url.includes("vimeo")) {
                        this.video = true;
                        return this.getVimeoVideo(url);
                    } else {
                        // Given url is not a video URL thus return it as it is.
                        this.video = false;
                        return url;
                    }
                },
                /**
                 * Get embed URL for youtube.com
                 * 
                 * @param  {string} url 
                 * @return {string} 
                 */
                getYoutubeVideo: function getYoutubeVideo(url) {
                    var videoUrl = "";
                    var videoId  = this.getYoutubeVideoId(url);

                    if (videoId) {
                        videoUrl = 'https://www.youtube.com/embed/' + videoId + '?rel=0';

                        if (this.$parent.autoplay) {
                            videoUrl += '&amp;autoplay=1';
                        }
                        if (this.$parent.showControls) {
                            videoUrl += '&amp;controls=0';
                        }
                    }

                    return videoUrl;
                },
                /**
                 * Get embed URL for vimeo.com
                 * 
                 * @param  {string} url 
                 * @return {string} 
                 */
                getVimeoVideo: function getVimeoVideo(url) {          
                        var videoUrl = "";
                        var vimoId = /(vimeo(pro)?\.com)\/(?:[^\d]+)?(\d+)\??(.*)?$/.exec(url)[3];

                        if (vimoId !== undefined) {
                            videoUrl = 'https://player.vimeo.com/video/'+ vimoId + '?api=1';
                            if (this.$parent.autoplay) {
                                videoUrl += '&autoplay=1';
                            }
                        }

                        return videoUrl;
                },
    		        imgsLoaded: function imgsLoaded() {
                    this.loading = false;
                    this.imgLoad.off('always',this.imgsLoaded);
                    this.imgLoad = null;
    		        },
            },
            updated: function updated() {
                if ((this.$refs.mediaContainer) && (!this.imgLoad) && (this.loading)) {
                    this.imgLoad = imagesloaded(this.$refs.mediaContainer);
                    this.imgLoad.on('always',this.imgsLoaded);
                }
            }
        };

    /* script */
    var __vue_script__$1 = script$1;

    /* template */
    var __vue_render__$1 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _vm.isVisible
        ? _c("div", { attrs: { id: "silentbox-overlay" } }, [
            _c("div", {
              attrs: { id: "silentbox-overlay__background" },
              on: {
                click: function($event) {
                  $event.stopPropagation();
                  return _vm.closeSilentboxOverlay($event)
                }
              }
            }),
            _vm._v(" "),
            _c(
              "div",
              {
                attrs: { id: "silentbox-overlay__content" },
                on: {
                  click: function($event) {
                    $event.stopPropagation();
                    return _vm.closeSilentboxOverlay($event)
                  }
                }
              },
              [
                _c("div", { attrs: { id: "silentbox-overlay__embed" } }, [
                  _c(
                    "div",
                    {
                      ref: "mediaContainer",
                      attrs: { id: "silentbox-overlay__container" }
                    },
                    [
                      _vm.loading
                        ? _c(
                            "main",
                            { staticClass: "empty-state" },
                            [
                              _c("beat-loader", {
                                attrs: { color: _vm.loadingColor, size: "15px" }
                              })
                            ],
                            1
                          )
                        : _vm._e(),
                      _vm._v(" "),
                      _vm.video
                        ? _c("iframe", {
                            ref: "mediaElement",
                            attrs: {
                              width: "100%",
                              height: "100%",
                              src: _vm.getEmbedUrl,
                              frameborder: "0",
                              allow: _vm.getAutoplayState,
                              allowfullscreen: ""
                            }
                          })
                        : _vm._e(),
                      _vm._v(" "),
                      !_vm.video
                        ? _c("img", {
                            ref: "mediaElement",
                            style: _vm.showImg,
                            attrs: {
                              width: "auto",
                              height: "auto",
                              src: _vm.getEmbedUrl
                            }
                          })
                        : _vm._e()
                    ]
                  ),
                  _vm._v(" "),
                  this.$parent.description
                    ? _c("p", { attrs: { id: "silentbox-overlay__description" } }, [
                        _vm._v(_vm._s(this.$parent.description))
                      ])
                    : _vm._e(),
                  _vm._v(" "),
                  _vm.isSelectable
                    ? _c(
                        "div",
                        {
                          staticClass: "add-to-collection-fullscreen-gallery",
                          on: {
                            click: function($event) {
                              $event.stopPropagation();
                              return _vm.stopTheEvent($event)
                            }
                          }
                        },
                        [
                          _c(
                            "b-checkbox",
                            {
                              staticClass: "form-check-input",
                              attrs: {
                                id: "overlayAssetSelector" + this.$parent.item.id,
                                type: "checkbox",
                                "aria-label": "...",
                                disabled:
                                  this.$parent.total != 999999 &&
                                  this.$parent.selection.length >=
                                    this.$parent.total &&
                                  this.$parent.selection.indexOf(
                                    this.$parent.item
                                  ) == -1
                              },
                              model: {
                                value: _vm.isSelected,
                                callback: function($$v) {
                                  _vm.isSelected = $$v;
                                },
                                expression: "isSelected"
                              }
                            },
                            [
                              _c("span", [
                                _vm._v("Add to selection "),
                                this.$parent.total != 999999
                                  ? _c("strong", [
                                      _vm._v(
                                        "(" +
                                          _vm._s(this.$parent.selection.length) +
                                          "/" +
                                          _vm._s(this.$parent.total) +
                                          ")"
                                      )
                                    ])
                                  : _vm._e()
                              ])
                            ]
                          )
                        ],
                        1
                      )
                    : _vm._e()
                ])
              ]
            ),
            _vm._v(" "),
            _c(
              "div",
              {
                attrs: {
                  id: "silentbox-overlay__close-button",
                  role: "button",
                  tabindex: "3"
                },
                on: {
                  click: function($event) {
                    $event.stopPropagation();
                    return _vm.closeSilentboxOverlay($event)
                  },
                  keyup: function($event) {
                    if (
                      !$event.type.indexOf("key") &&
                      _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")
                    ) {
                      return null
                    }
                    return _vm.closeSilentboxOverlay($event)
                  }
                }
              },
              [_c("div", { staticClass: "icon" })]
            ),
            _vm._v(" "),
            this.$parent.items.total > 0
              ? _c("div", { attrs: { id: "silentbox-overlay__arrow-buttons" } }, [
                  _c("div", {
                    staticClass: "arrow arrow-previous",
                    attrs: { role: "button", tabindex: "2" },
                    on: {
                      click: _vm.moveToPreviousItem,
                      keyup: function($event) {
                        if (
                          !$event.type.indexOf("key") &&
                          _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")
                        ) {
                          return null
                        }
                        return _vm.moveToPreviousItem($event)
                      }
                    }
                  }),
                  _vm._v(" "),
                  _c("div", {
                    staticClass: "arrow arrow-next",
                    attrs: { role: "button", tabindex: "1" },
                    on: {
                      click: _vm.moveToNextItem,
                      keyup: function($event) {
                        if (
                          !$event.type.indexOf("key") &&
                          _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")
                        ) {
                          return null
                        }
                        return _vm.moveToNextItem($event)
                      }
                    }
                  })
                ])
              : _vm._e()
          ])
        : _vm._e()
    };
    var __vue_staticRenderFns__$1 = [];
    __vue_render__$1._withStripped = true;

      /* style */
      var __vue_inject_styles__$1 = function (inject) {
        if (!inject) { return }
        inject("data-v-5553f09c_0", { source: ".silentbox-is-opened {\n  overflow: hidden;\n}\n#silentbox-overlay {\n  display: block;\n  height: 100vh;\n  left: 0;\n  position: fixed;\n  top: 0;\n  width: 100vw;\n  z-index: 999;\n}\n#silentbox-overlay__background {\n  background: rgba(0, 0, 0, 0.75);\n  backdrop-filter: blur(20px);\n  cursor: default;\n  display: block;\n  height: 100%;\n  left: 0;\n  position: absolute;\n  top: 0;\n  width: 100%;\n}\n#silentbox-overlay__content {\n  cursor: default;\n  display: block;\n  height: 100%;\n  position: relative;\n  width: 100%;\n}\n#silentbox-overlay__embed {\n  bottom: 0;\n  cursor: default;\n  display: block;\n  height: 80%;\n  left: 0;\n  margin: auto;\n  position: absolute;\n  right: 0;\n  top: -2.5rem;\n  width: 75%;\n}\n#silentbox-overlay__embed img,\n#silentbox-overlay__embed iframe {\n  background-color: #000;\n  bottom: 0;\n  box-shadow: 0 0 1.5rem rgba(0, 0, 0, 0.45);\n  cursor: default;\n  display: block;\n  left: 0;\n  margin: auto;\n  max-height: 100%;\n  max-width: 100%;\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n#silentbox-overlay__container {\n  cursor: default;\n  height: 100%;\n  margin: 0 0 1.5rem 0;\n  position: relative;\n  text-align: center;\n  width: 100%;\n}\n#silentbox-overlay__description {\n  display: block;\n  padding-top: 1rem;\n  text-align: center;\n  color: #fff;\n}\n#silentbox-overlay__close-button {\n  background: rgba(0, 0, 0, 0);\n  border: none;\n  color: #fff;\n  cursor: pointer;\n  height: 2.5rem;\n  position: absolute;\n  right: 0;\n  top: 0;\n  transition: background-color 250ms ease-out;\n  width: 2.5rem;\n}\n#silentbox-overlay__close-button:hover, #silentbox-overlay__close-button:focus {\n  background-color: rgba(0, 0, 0, 0.5);\n  outline: none;\n}\n#silentbox-overlay__close-button .icon {\n  color: #fff;\n  cursor: pointer;\n  height: 1rem;\n  left: 0.7rem;\n  margin: 50% 50% 0 0;\n  position: absolute;\n  right: 0px;\n  top: -0.5rem;\n  transition: 250ms ease;\n  width: 1rem;\n}\n#silentbox-overlay__close-button .icon:before, #silentbox-overlay__close-button .icon:after {\n  background: #fff;\n  content: \"\";\n  height: 2px;\n  left: 5%;\n  position: absolute;\n  top: 50%;\n  transition: 250ms ease;\n  width: 100%;\n}\n#silentbox-overlay__close-button .icon:before {\n  transform: rotate(-45deg);\n}\n#silentbox-overlay__close-button .icon:after {\n  transform: rotate(45deg);\n}\n#silentbox-overlay__close-button .icon:hover:before, #silentbox-overlay__close-button .icon:hover:after, #silentbox-overlay__close-button .icon:focus:before, #silentbox-overlay__close-button .icon:focus:after {\n  background: #58e8d2;\n  left: 25%;\n  width: 50%;\n}\n#silentbox-overlay__arrow-buttons .arrow {\n  border-left: 2px solid #fff;\n  border-top: 2px solid #fff;\n  cursor: pointer;\n  height: 1.5rem;\n  position: absolute;\n  width: 1.5rem;\n}\n#silentbox-overlay__arrow-buttons .arrow:hover, #silentbox-overlay__arrow-buttons .arrow:focus {\n  outline: none;\n  border-color: #58e8d2;\n}\n#silentbox-overlay__arrow-buttons .arrow-previous {\n  left: 2rem;\n  top: 50%;\n  transform: rotate(-45deg);\n}\n#silentbox-overlay__arrow-buttons .arrow-previous:hover, #silentbox-overlay__arrow-buttons .arrow-previous:focus {\n  animation-duration: 1s;\n  animation-iteration-count: infinite;\n  animation-name: pulsingPrevious;\n}\n#silentbox-overlay__arrow-buttons .arrow-next {\n  right: 2rem;\n  top: 50%;\n  transform: rotate(135deg);\n}\n#silentbox-overlay__arrow-buttons .arrow-next:hover, #silentbox-overlay__arrow-buttons .arrow-next:focus {\n  animation-duration: 1s;\n  animation-iteration-count: infinite;\n  animation-name: pulsingNext;\n}\n@keyframes pulsingNext {\n0% {\n    animation-timing-function: ease-in;\n    right: 2rem;\n}\n25% {\n    animation-timing-function: ease-in;\n    right: 1.75rem;\n}\n75% {\n    animation-timing-function: ease-in;\n    right: 2.25rem;\n}\n100% {\n    animation-timing-function: ease-in;\n    right: 2rem;\n}\n}\n@keyframes pulsingPrevious {\n0% {\n    animation-timing-function: ease-in;\n    left: 2rem;\n}\n25% {\n    animation-timing-function: ease-in;\n    left: 1.75rem;\n}\n75% {\n    animation-timing-function: ease-in;\n    left: 2.25rem;\n}\n100% {\n    animation-timing-function: ease-in;\n    left: 2rem;\n}\n}\n\n/*# sourceMappingURL=overlay.vue.map */", map: {"version":3,"sources":["/home/gfrymer/blink/silentbox/components/overlay.vue","overlay.vue"],"names":[],"mappings":"AAmQA;EACA,gBAAA;AClQA;ADqQA;EACA,cAAA;EACA,aAAA;EACA,OAAA;EACA,eAAA;EACA,MAAA;EACA,YAAA;EACA,YAAA;AClQA;AD6OA;EAwBA,+BAAA;EACA,2BAAA;EACA,eAAA;EACA,cAAA;EACA,YAAA;EACA,OAAA;EACA,kBAAA;EACA,MAAA;EACA,WAAA;AClQA;ADkOA;EAoCA,eAAA;EACA,cAAA;EACA,YAAA;EACA,kBAAA;EACA,WAAA;ACnQA;AD2NA;EA4CA,SAAA;EACA,eAAA;EACA,cAAA;EACA,WAAA;EACA,OAAA;EACA,YAAA;EACA,kBAAA;EACA,QAAA;EACA,YAAA;EACA,UAAA;ACpQA;ADsQA;;EAEA,sBAjDA;EAkDA,SAAA;EACA,0CAAA;EACA,eAAA;EACA,cAAA;EACA,OAAA;EACA,YAAA;EACA,gBAAA;EACA,eAAA;EACA,kBAAA;EACA,QAAA;EACA,MAAA;ACpQA;ADgMA;EAyEA,eAAA;EACA,YAAA;EACA,oBAAA;EACA,kBAAA;EACA,kBAAA;EACA,WAAA;ACtQA;ADwLA;EAkFA,cAAA;EACA,iBAAA;EACA,kBAAA;EACA,WA/EA;ACxLA;ADkLA;EAyFA,4BAAA;EACA,YAAA;EACA,WArFA;EAsFA,eAAA;EACA,cAAA;EACA,kBAAA;EACA,QAAA;EACA,MAAA;EACA,2CAAA;EACA,aAAA;ACxQA;ADyQA;EAEA,oCAAA;EACA,aAAA;ACxQA;AD2QA;EACA,WApGA;EAqGA,eAAA;EACA,YAAA;EACA,YAAA;EACA,mBAAA;EACA,kBAAA;EACA,UAAA;EACA,YAAA;EACA,sBAAA;EACA,WAAA;ACzQA;AD0QA;EAEA,gBAhHA;EAiHA,WAAA;EACA,WAAA;EACA,QAAA;EACA,kBAAA;EACA,QAAA;EACA,sBAAA;EACA,WAAA;ACzQA;AD2QA;EACA,yBAAA;ACzQA;AD2QA;EACA,wBAAA;ACzQA;AD6QA;EAEA,mBAlIA;EAmIA,SAAA;EACA,UAAA;AC5QA;ADmRA;EACA,2BAAA;EACA,0BAAA;EACA,eAAA;EACA,cAAA;EACA,kBAAA;EACA,aAAA;ACjRA;ADkRA;EAEA,aAAA;EACA,qBArJA;AC5HA;ADoRA;EACA,UAAA;EACA,QAAA;EACA,yBAAA;AClRA;ADmRA;EAEA,sBAAA;EACA,mCAAA;EACA,+BAAA;AClRA;ADqRA;EACA,WAAA;EACA,QAAA;EACA,yBAAA;ACnRA;ADoRA;EAEA,sBAAA;EACA,mCAAA;EACA,2BAAA;ACnRA;AD0RA;AACA;IACA,kCAAA;IACA,WAAA;ACvRE;ADyRF;IACA,kCAAA;IACA,cAAA;ACvRE;ADyRF;IACA,kCAAA;IACA,cAAA;ACvRE;ADyRF;IACA,kCAAA;IACA,WAAA;ACvRE;AACF;ADyRA;AACA;IACA,kCAAA;IACA,UAAA;ACvRE;ADyRF;IACA,kCAAA;IACA,aAAA;ACvRE;ADyRF;IACA,kCAAA;IACA,aAAA;ACvRE;ADyRF;IACA,kCAAA;IACA,UAAA;ACvRE;AACF;;AAEA,sCAAsC","file":"overlay.vue","sourcesContent":["<template>\r\n    <div id=\"silentbox-overlay\" v-if=\"isVisible\">\r\n        <div id=\"silentbox-overlay__background\" @click.stop=\"closeSilentboxOverlay\"></div>\r\n\r\n        <div id=\"silentbox-overlay__content\" @click.stop=\"closeSilentboxOverlay\">\r\n            <div id=\"silentbox-overlay__embed\">\r\n                <div ref=\"mediaContainer\" id=\"silentbox-overlay__container\">\r\n\t\t                <main class=\"empty-state\" v-if=\"loading\">\r\n\t\t                    <beat-loader :color=\"loadingColor\" size=\"15px\"></beat-loader>\r\n\t\t                </main>\r\n                    <iframe ref=\"mediaElement\" width=\"100%\" height=\"100%\" v-if=\"video\" :src=\"getEmbedUrl\" frameborder=\"0\" :allow=\"getAutoplayState\" allowfullscreen></iframe>\r\n                    <img :style=\"showImg\" ref=\"mediaElement\" width=\"auto\" height=\"auto\" :src=\"getEmbedUrl\" v-if=\"! video\">\r\n                </div>\r\n\r\n                <p id=\"silentbox-overlay__description\" v-if=\"this.$parent.description\">{{ this.$parent.description }}</p>\r\n                <div class=\"add-to-collection-fullscreen-gallery\" @click.stop=\"stopTheEvent\" v-if=\"isSelectable\">\r\n                <b-checkbox\r\n                    class=\"form-check-input\"\r\n                    :id=\"`overlayAssetSelector${this.$parent.item.id}`\"\r\n                    type=\"checkbox\"\r\n                    aria-label=\"...\"\r\n                    v-model=\"isSelected\"\r\n                    :disabled=\"(this.$parent.total!=999999) && (this.$parent.selection.length >= this.$parent.total) && (this.$parent.selection.indexOf(this.$parent.item) == -1)\"\r\n                >\r\n                <span>Add to selection <strong v-if=\"this.$parent.total!=999999\">({{this.$parent.selection.length}}/{{this.$parent.total}})</strong></span>\r\n                \r\n                </b-checkbox>\r\n                </div>\r\n            </div>\r\n        </div>\r\n\r\n        <div id=\"silentbox-overlay__close-button\" role=\"button\" tabindex=\"3\" @click.stop=\"closeSilentboxOverlay\" @keyup.enter=\"closeSilentboxOverlay\">\r\n            <div class=\"icon\"></div>\r\n        </div>\r\n\r\n        <div id=\"silentbox-overlay__arrow-buttons\" v-if=\"this.$parent.items.total > 0\">\r\n            <div class=\"arrow arrow-previous\" role=\"button\" tabindex=\"2\" @click=\"moveToPreviousItem\" @keyup.enter=\"moveToPreviousItem\"></div>\r\n            <div class=\"arrow arrow-next\" role=\"button\" tabindex=\"1\" @click=\"moveToNextItem\" @keyup.enter=\"moveToNextItem\"></div>\r\n        </div>\r\n    </div>\r\n</template>\r\n\r\n<script>\r\n    import VideoUrlDecoderMixin from './../mixins/videoUrlDecoder';\r\n    import imagesLoaded from 'imagesloaded';\r\n\r\n    export default {\r\n        name: 'SilentboxOverlay',\r\n        mixins: [ VideoUrlDecoderMixin ],\r\n        data() {\r\n            return {\r\n                video: false,\r\n                loading: false,\r\n                imgLoad: null\r\n            }\r\n        },\r\n        computed: {\r\n            isSelectable() {\r\n                return this.$parent.total > 0;\r\n            },\r\n            loadingColor() {\r\n                return getComputedStyle(document.documentElement).getPropertyValue('--white');\r\n            },\r\n            isSelected: {\r\n                get() {\r\n                    return (this.$parent.selection && this.$parent.selection.indexOf(this.$parent.item) > -1);\r\n                },\r\n                set(newVal) {\r\n                \t\tif (this.$parent.selection && this.$parent.selection.indexOf(this.$parent.item) > -1) {\r\n                \t\t    if (!newVal) {\r\n                \t\t        this.$parent.selection.splice(this.$parent.selection.indexOf(this.$parent.item),1);\r\n                \t\t    }\r\n                \t\t}\r\n                \t\telse {\r\n                \t\t    if (newVal) {\r\n                \t\t        this.$parent.selection.push(this.$parent.item);\r\n                \t\t    }\r\n                \t\t}\r\n                },\r\n            },\r\n            showImg() {\r\n                if (this.loading) {\r\n                    return \"display:none\";\r\n                }\r\n                return \"\";\r\n            },\r\n            /**\r\n             * Get the right embed URL.\r\n             */\r\n            getEmbedUrl() {\r\n                return this.handleUrl(this.$parent.embedUrl);\r\n            },\r\n            /**\r\n             * Get autoplay state.\r\n             */\r\n            getAutoplayState() {\r\n                if (this.$parent.autoplay !== undefined && this.$parent.autoplay !== false) {\r\n                    return \"autoplay\";\r\n                }\r\n                 return \"\";\r\n            },\r\n            /**\r\n             * Check whether overlay is visible or not.\r\n             */\r\n            isVisible() {\r\n                if (this.$parent.overlayVisibility !== undefined && this.$parent.overlayVisibility !== false) {\r\n                    this.loading = true;\r\n                    return true;\r\n                }\r\n\r\n                return false;\r\n            }\r\n        },\r\n        watch: {\r\n            isVisible: function (value) {\r\n                if (document !== undefined) {\r\n                    this.bodyScrolling();\r\n                }\r\n            }\r\n        },\r\n        methods: {\r\n            bodyScrolling() {\r\n                let body = document.body;\r\n\r\n                // add class only if overlay should be visible\r\n                if (this.isVisible && ! body.classList.contains('silentbox-is-opened')) {\r\n                    this.$nextTick(() => {\r\n                        this.$refs.mediaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });\r\n                    });\r\n                    return body.classList.add('silentbox-is-opened');\r\n                }\r\n\r\n                // remove class only if overlay should be hidden\r\n                if (! this.isVisible && body.classList.contains('silentbox-is-opened')) {\r\n                    return body.classList.remove('silentbox-is-opened')\r\n                }\r\n            },\r\n            /**\r\n             * Move to next item.\r\n             */\r\n            moveToNextItem() {\r\n                if (this.loading) {\r\n                    this.imgLoad.off('always',this.imgsLoaded);\r\n                    this.imgLoad = null;\r\n                }\r\n                this.loading = true;\r\n                this.$parent.nextItem();\r\n            },\r\n            /**\r\n             * Move to previous item.\r\n             */\r\n            moveToPreviousItem()\r\n            {\r\n                if (this.loading) {\r\n                    this.imgLoad.off('always',this.imgsLoaded);\r\n                    this.imgLoad = null;\r\n                }\r\n                this.loading = true;\r\n                this.$parent.prevItem();\r\n            },\r\n            stopTheEvent(event)\r\n            {\r\n                event.stopPropagation();\r\n            },\r\n            /**\r\n             * Hide silentbox overlay.\r\n             */\r\n            closeSilentboxOverlay() {\r\n                this.$parent.$emit('closeSilentboxOverlay');\r\n            },\r\n            /**\r\n             * Search for known video services URLs and return their players if recognized.\r\n             * Unrecognized URLs are handled as images.\r\n             * \r\n             * @param  {string} url\r\n             * @return {string}\r\n             */\r\n            handleUrl(url) {\r\n                if (url.includes('youtube.com') || url.includes('youtu.be')) {\r\n                    this.video = true;\r\n                    return this.getYoutubeVideo(url);\r\n                } else if (url.includes(\"vimeo\")) {\r\n                    this.video = true;\r\n                    return this.getVimeoVideo(url);\r\n                } else {\r\n                    // Given url is not a video URL thus return it as it is.\r\n                    this.video = false;\r\n                    return url;\r\n                }\r\n            },\r\n            /**\r\n             * Get embed URL for youtube.com\r\n             * \r\n             * @param  {string} url \r\n             * @return {string} \r\n             */\r\n            getYoutubeVideo(url) {\r\n                let videoUrl = \"\";\r\n                let videoId  = this.getYoutubeVideoId(url);\r\n\r\n                if (videoId) {\r\n                    videoUrl = 'https://www.youtube.com/embed/' + videoId + '?rel=0';\r\n\r\n                    if (this.$parent.autoplay) {\r\n                        videoUrl += '&amp;autoplay=1';\r\n                    }\r\n                    if (this.$parent.showControls) {\r\n                        videoUrl += '&amp;controls=0';\r\n                    }\r\n                }\r\n\r\n                return videoUrl;\r\n            },\r\n            /**\r\n             * Get embed URL for vimeo.com\r\n             * \r\n             * @param  {string} url \r\n             * @return {string} \r\n             */\r\n            getVimeoVideo(url) {          \r\n                    let videoUrl = \"\";\r\n                    const vimoId = /(vimeo(pro)?\\.com)\\/(?:[^\\d]+)?(\\d+)\\??(.*)?$/.exec(url)[3];\r\n\r\n                    if (vimoId !== undefined) {\r\n                        videoUrl = 'https://player.vimeo.com/video/'+ vimoId + '?api=1';\r\n                        if (this.$parent.autoplay) {\r\n                            videoUrl += '&autoplay=1';\r\n                        }\r\n                    }\r\n\r\n                    return videoUrl;\r\n            },\r\n\t\t        imgsLoaded() {\r\n                this.loading = false;\r\n                this.imgLoad.off('always',this.imgsLoaded);\r\n                this.imgLoad = null;\r\n\t\t        },\r\n        },\r\n        updated() {\r\n            if ((this.$refs.mediaContainer) && (!this.imgLoad) && (this.loading)) {\r\n                this.imgLoad = imagesLoaded(this.$refs.mediaContainer);\r\n                this.imgLoad.on('always',this.imgsLoaded);\r\n            }\r\n        }\r\n    }\r\n</script>\r\n\r\n<style lang=\"scss\">\r\n@mixin element($element) {\r\n    &__#{$element} {\r\n        @content;\r\n    }\r\n}\r\n\r\n// Colours used in silentbox\r\n$main:   #fff;\r\n$accent: #58e8d2;\r\n$bg: #000;\r\n\r\n.silentbox-is-opened {\r\n    overflow: hidden;\r\n}\r\n\r\n#silentbox-overlay {\r\n    display: block;\r\n    height: 100vh;\r\n    left: 0;\r\n    position: fixed;\r\n    top: 0;\r\n    width: 100vw;\r\n    z-index: 999;\r\n\r\n    @include element(background) {\r\n        background: rgba($bg, .75);\r\n        backdrop-filter: blur(20px);\r\n        cursor: default;\r\n        display: block;\r\n        height: 100%;\r\n        left: 0;\r\n        position: absolute;\r\n        top: 0;\r\n        width: 100%;\r\n    }\r\n\r\n    @include element(content) {\r\n        cursor: default;\r\n        display: block;\r\n        height: 100%;\r\n        position: relative;\r\n        width: 100%;\r\n    }\r\n\r\n    @include element(embed) {\r\n        bottom: 0;\r\n        cursor: default;\r\n        display: block;\r\n        height: 80%;\r\n        left: 0;\r\n        margin: auto;\r\n        position: absolute;\r\n        right: 0;\r\n        top: -2.5rem;\r\n        width: 75%;\r\n\r\n        img,\r\n        iframe {\r\n            background-color: $bg;\r\n            bottom: 0;\r\n            box-shadow: 0 0 1.5rem rgba($bg, .45);\r\n            cursor: default;\r\n            display: block;\r\n            left: 0;\r\n            margin: auto;\r\n            max-height: 100%;\r\n            max-width: 100%;\r\n            position: absolute;\r\n            right: 0;\r\n            top: 0;\r\n        }\r\n    }\r\n\r\n    @include element(container) {\r\n        cursor: default;\r\n        height: 100%;\r\n        margin: 0 0 1.5rem 0;\r\n        position: relative;\r\n        text-align: center;\r\n        width: 100%;\r\n    }\r\n\r\n    @include element(description) {\r\n        display: block;\r\n        padding-top: 1rem;\r\n        text-align: center;\r\n        color: $main;\r\n    }\r\n\r\n    @include element(close-button) {\r\n        background: rgba($bg, .0);\r\n        border: none;\r\n        color: $main;\r\n        cursor: pointer;\r\n        height: 2.5rem;\r\n        position: absolute;\r\n        right: 0;\r\n        top: 0;\r\n        transition: background-color 250ms ease-out;\r\n        width: 2.5rem;\r\n        &:hover,\r\n        &:focus {\r\n            background-color: rgba($bg, .5);\r\n            outline: none;\r\n        }\r\n\r\n        .icon {\r\n            color: $main;\r\n            cursor: pointer;\r\n            height: 1rem;\r\n            left: .7rem;\r\n            margin: 50% 50% 0 0;\r\n            position: absolute;\r\n            right: 0px;\r\n            top: -.5rem;\r\n            transition: 250ms ease;\r\n            width: 1rem;\r\n            &:before,\r\n            &:after {\r\n                background: $main;\r\n                content: \"\";\r\n                height: 2px;\r\n                left: 5%;\r\n                position: absolute;\r\n                top: 50%;\r\n                transition: 250ms ease;\r\n                width: 100%;\r\n            }\r\n            &:before {\r\n                transform: rotate(-45deg);\r\n            }\r\n            &:after {\r\n                transform: rotate(45deg);\r\n            }\r\n            &:hover,\r\n            &:focus {\r\n                &:before,\r\n                &:after {\r\n                    background: $accent;\r\n                    left: 25%;\r\n                    width: 50%;\r\n                }\r\n            }\r\n        }\r\n    }\r\n\r\n    @include element(arrow-buttons) {\r\n        .arrow {\r\n            border-left: 2px solid $main;\r\n            border-top: 2px solid $main;\r\n            cursor: pointer;\r\n            height: 1.5rem;\r\n            position: absolute;\r\n            width: 1.5rem;\r\n            &:hover,\r\n            &:focus {\r\n                outline: none;\r\n                border-color: $accent;\r\n            }\r\n        }\r\n        .arrow-previous {\r\n            left: 2rem;\r\n            top: 50%;\r\n            transform: rotate(-45deg);\r\n            &:hover,\r\n            &:focus {\r\n                animation-duration: 1s;\r\n                animation-iteration-count: infinite;\r\n                animation-name: pulsingPrevious;\r\n            }\r\n        }\r\n        .arrow-next {\r\n            right: 2rem;\r\n            top: 50%;\r\n            transform: rotate(135deg);\r\n            &:hover,\r\n            &:focus {\r\n                animation-duration: 1s;\r\n                animation-iteration-count: infinite;\r\n                animation-name: pulsingNext;\r\n            }\r\n        }\r\n    }\r\n}\r\n\r\n// Animations\r\n@keyframes pulsingNext {\r\n    0%   {\r\n        animation-timing-function: ease-in;\r\n        right: 2rem;\r\n    }\r\n    25%  {\r\n        animation-timing-function: ease-in;\r\n        right: 1.75rem;\r\n    }\r\n    75%  {\r\n        animation-timing-function: ease-in;\r\n        right: 2.25rem;\r\n    }\r\n    100% {\r\n        animation-timing-function: ease-in;\r\n        right: 2rem;\r\n    }\r\n}\r\n@keyframes pulsingPrevious {\r\n    0%   {\r\n        animation-timing-function: ease-in;\r\n        left: 2rem;\r\n    }\r\n    25%  {\r\n        animation-timing-function: ease-in;\r\n        left: 1.75rem;\r\n    }\r\n    75%  {\r\n        animation-timing-function: ease-in;\r\n        left: 2.25rem;\r\n    }\r\n    100% {\r\n        animation-timing-function: ease-in;\r\n        left: 2rem;\r\n    }\r\n}\r\n</style>",".silentbox-is-opened {\n  overflow: hidden;\n}\n\n#silentbox-overlay {\n  display: block;\n  height: 100vh;\n  left: 0;\n  position: fixed;\n  top: 0;\n  width: 100vw;\n  z-index: 999;\n}\n#silentbox-overlay__background {\n  background: rgba(0, 0, 0, 0.75);\n  backdrop-filter: blur(20px);\n  cursor: default;\n  display: block;\n  height: 100%;\n  left: 0;\n  position: absolute;\n  top: 0;\n  width: 100%;\n}\n#silentbox-overlay__content {\n  cursor: default;\n  display: block;\n  height: 100%;\n  position: relative;\n  width: 100%;\n}\n#silentbox-overlay__embed {\n  bottom: 0;\n  cursor: default;\n  display: block;\n  height: 80%;\n  left: 0;\n  margin: auto;\n  position: absolute;\n  right: 0;\n  top: -2.5rem;\n  width: 75%;\n}\n#silentbox-overlay__embed img,\n#silentbox-overlay__embed iframe {\n  background-color: #000;\n  bottom: 0;\n  box-shadow: 0 0 1.5rem rgba(0, 0, 0, 0.45);\n  cursor: default;\n  display: block;\n  left: 0;\n  margin: auto;\n  max-height: 100%;\n  max-width: 100%;\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n#silentbox-overlay__container {\n  cursor: default;\n  height: 100%;\n  margin: 0 0 1.5rem 0;\n  position: relative;\n  text-align: center;\n  width: 100%;\n}\n#silentbox-overlay__description {\n  display: block;\n  padding-top: 1rem;\n  text-align: center;\n  color: #fff;\n}\n#silentbox-overlay__close-button {\n  background: rgba(0, 0, 0, 0);\n  border: none;\n  color: #fff;\n  cursor: pointer;\n  height: 2.5rem;\n  position: absolute;\n  right: 0;\n  top: 0;\n  transition: background-color 250ms ease-out;\n  width: 2.5rem;\n}\n#silentbox-overlay__close-button:hover, #silentbox-overlay__close-button:focus {\n  background-color: rgba(0, 0, 0, 0.5);\n  outline: none;\n}\n#silentbox-overlay__close-button .icon {\n  color: #fff;\n  cursor: pointer;\n  height: 1rem;\n  left: 0.7rem;\n  margin: 50% 50% 0 0;\n  position: absolute;\n  right: 0px;\n  top: -0.5rem;\n  transition: 250ms ease;\n  width: 1rem;\n}\n#silentbox-overlay__close-button .icon:before, #silentbox-overlay__close-button .icon:after {\n  background: #fff;\n  content: \"\";\n  height: 2px;\n  left: 5%;\n  position: absolute;\n  top: 50%;\n  transition: 250ms ease;\n  width: 100%;\n}\n#silentbox-overlay__close-button .icon:before {\n  transform: rotate(-45deg);\n}\n#silentbox-overlay__close-button .icon:after {\n  transform: rotate(45deg);\n}\n#silentbox-overlay__close-button .icon:hover:before, #silentbox-overlay__close-button .icon:hover:after, #silentbox-overlay__close-button .icon:focus:before, #silentbox-overlay__close-button .icon:focus:after {\n  background: #58e8d2;\n  left: 25%;\n  width: 50%;\n}\n#silentbox-overlay__arrow-buttons .arrow {\n  border-left: 2px solid #fff;\n  border-top: 2px solid #fff;\n  cursor: pointer;\n  height: 1.5rem;\n  position: absolute;\n  width: 1.5rem;\n}\n#silentbox-overlay__arrow-buttons .arrow:hover, #silentbox-overlay__arrow-buttons .arrow:focus {\n  outline: none;\n  border-color: #58e8d2;\n}\n#silentbox-overlay__arrow-buttons .arrow-previous {\n  left: 2rem;\n  top: 50%;\n  transform: rotate(-45deg);\n}\n#silentbox-overlay__arrow-buttons .arrow-previous:hover, #silentbox-overlay__arrow-buttons .arrow-previous:focus {\n  animation-duration: 1s;\n  animation-iteration-count: infinite;\n  animation-name: pulsingPrevious;\n}\n#silentbox-overlay__arrow-buttons .arrow-next {\n  right: 2rem;\n  top: 50%;\n  transform: rotate(135deg);\n}\n#silentbox-overlay__arrow-buttons .arrow-next:hover, #silentbox-overlay__arrow-buttons .arrow-next:focus {\n  animation-duration: 1s;\n  animation-iteration-count: infinite;\n  animation-name: pulsingNext;\n}\n\n@keyframes pulsingNext {\n  0% {\n    animation-timing-function: ease-in;\n    right: 2rem;\n  }\n  25% {\n    animation-timing-function: ease-in;\n    right: 1.75rem;\n  }\n  75% {\n    animation-timing-function: ease-in;\n    right: 2.25rem;\n  }\n  100% {\n    animation-timing-function: ease-in;\n    right: 2rem;\n  }\n}\n@keyframes pulsingPrevious {\n  0% {\n    animation-timing-function: ease-in;\n    left: 2rem;\n  }\n  25% {\n    animation-timing-function: ease-in;\n    left: 1.75rem;\n  }\n  75% {\n    animation-timing-function: ease-in;\n    left: 2.25rem;\n  }\n  100% {\n    animation-timing-function: ease-in;\n    left: 2rem;\n  }\n}\n\n/*# sourceMappingURL=overlay.vue.map */"]}, media: undefined });

      };
      /* scoped */
      var __vue_scope_id__$1 = undefined;
      /* module identifier */
      var __vue_module_identifier__$1 = undefined;
      /* functional template */
      var __vue_is_functional_template__$1 = false;
      /* style inject SSR */
      

      
      var overlay = normalizeComponent_1(
        { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
        __vue_inject_styles__$1,
        __vue_script__$1,
        __vue_scope_id__$1,
        __vue_is_functional_template__$1,
        __vue_module_identifier__$1,
        browser,
        undefined
      );

    //

    var script$2 = {
        name: 'SilentboxSingle',
        mixins: [ ItemMixin ],
        props: {
            // Media source, it could be an image or a youtube video.
            'src': {
                type: String,
                required: true
            },
            // Should be video autoplayed.
            'autoplay': {
                type: Boolean,
                default: function default$1() {
                    return false;
                }
            },
            // Short description below image.
            'description': String,
            item: {
                type: Object
            },
            'thumbnailWidth': {
                type: String,
                default: '200px'
            },
            'thumbnailHeight': {
                type: String,
                default: '150px'
            },
            // Hide player controls
            'hideControls': {
                type: Boolean,
                default: function default$2() {
                    return false;
                }
            }
        },
        data: function data() {
            return {
                overlayVisibility: false,
                embedUrl: undefined,
                items: {
                    total: 0,
                    position: 0
                }
            }
        },
        methods: {
            /**
             * Hide the Silenbotx overlay.
             * 
             * @return {void}
             */
            closeSilentBoxOverlay: function closeSilentBoxOverlay() {
                this.overlayVisibility = false;
            },
            /**
             * Open Silentbox with given media.
             * 
             * @return {void}
             */
            openSilentBoxOverlay: function openSilentBoxOverlay() {
                if (this.src !== null) {
                    this.embedUrl = this.src;
                }
                this.overlayVisibility = true;
            }
        },
        components: {
            SilentboxOverlay: overlay,
            SilentboxItem: item
        },
        mounted: function mounted() {
            var this$1 = this;

            this.$on('closeSilentboxOverlay', function () {
                this$1.overlayVisibility = false;
            });

            window.addEventListener('keyup', function (event) {
                if (event.which == 27) {
                    this$1.overlayVisibility = false;
                }
            });
        }
    };

    /* script */
    var __vue_script__$2 = script$2;

    /* template */
    var __vue_render__$2 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "span",
        {
          staticClass: "silentbox-single",
          attrs: { src: _vm.src },
          on: { click: _vm.openSilentBoxOverlay }
        },
        [
          _vm._t("default", [
            _c("img", {
              attrs: {
                src: _vm.getThumnail(_vm.src),
                width: _vm.thumbnailWidth,
                height: _vm.thumbnailHeight
              }
            })
          ]),
          _vm._v(" "),
          _c("silentbox-overlay")
        ],
        2
      )
    };
    var __vue_staticRenderFns__$2 = [];
    __vue_render__$2._withStripped = true;

      /* style */
      var __vue_inject_styles__$2 = function (inject) {
        if (!inject) { return }
        inject("data-v-37d2ad6a_0", { source: ".silentbox-single {\n  cursor: pointer;\n  text-decoration: underline;\n}\n\n/*# sourceMappingURL=single.vue.map */", map: {"version":3,"sources":["/home/gfrymer/blink/silentbox/components/single.vue","single.vue"],"names":[],"mappings":"AAqGA;EACA,eAAA;EACA,0BAAA;ACpGA;;AAEA,qCAAqC","file":"single.vue","sourcesContent":["<template>\r\n    <span class=\"silentbox-single\" :src=\"src\" @click=\"openSilentBoxOverlay\">\r\n        <slot>\r\n            <img :src=\"getThumnail(src)\" :width=\"thumbnailWidth\" :height=\"thumbnailHeight\">\r\n        </slot>\r\n        <silentbox-overlay></silentbox-overlay>\r\n    </span>\r\n</template>\r\n\r\n<script>\r\n    import SilentboxItem from './item.vue';\r\n    import SilentboxOverlay from './overlay.vue';\r\n    import ItemMixin from './../mixins/item';\r\n\r\n    export default {\r\n        name: 'SilentboxSingle',\r\n        mixins: [ ItemMixin ],\r\n        props: {\r\n            // Media source, it could be an image or a youtube video.\r\n            'src': {\r\n                type: String,\r\n                required: true\r\n            },\r\n            // Should be video autoplayed.\r\n            'autoplay': {\r\n                type: Boolean,\r\n                default() {\r\n                    return false;\r\n                }\r\n            },\r\n            // Short description below image.\r\n            'description': String,\r\n            item: {\r\n                type: Object\r\n            },\r\n            'thumbnailWidth': {\r\n                type: String,\r\n                default: '200px'\r\n            },\r\n            'thumbnailHeight': {\r\n                type: String,\r\n                default: '150px'\r\n            },\r\n            // Hide player controls\r\n            'hideControls': {\r\n                type: Boolean,\r\n                default() {\r\n                    return false;\r\n                }\r\n            }\r\n        },\r\n        data() {\r\n            return {\r\n                overlayVisibility: false,\r\n                embedUrl: undefined,\r\n                items: {\r\n                    total: 0,\r\n                    position: 0\r\n                }\r\n            }\r\n        },\r\n        methods: {\r\n            /**\r\n             * Hide the Silenbotx overlay.\r\n             * \r\n             * @return {void}\r\n             */\r\n            closeSilentBoxOverlay() {\r\n                this.overlayVisibility = false;\r\n            },\r\n            /**\r\n             * Open Silentbox with given media.\r\n             * \r\n             * @return {void}\r\n             */\r\n            openSilentBoxOverlay() {\r\n                if (this.src !== null) {\r\n                    this.embedUrl = this.src;\r\n                }\r\n                this.overlayVisibility = true;\r\n            }\r\n        },\r\n        components: {\r\n            SilentboxOverlay,\r\n            SilentboxItem\r\n        },\r\n        mounted() {\r\n            this.$on('closeSilentboxOverlay', () => {\r\n                this.overlayVisibility = false;\r\n            });\r\n\r\n            window.addEventListener('keyup', (event) => {\r\n                if (event.which == 27) {\r\n                    this.overlayVisibility = false;\r\n                }\r\n            });\r\n        }\r\n    }\r\n</script>\r\n\r\n<style lang=\"scss\">\r\n    .silentbox-single {\r\n        cursor: pointer;\r\n        text-decoration: underline;\r\n    }\r\n</style>",".silentbox-single {\n  cursor: pointer;\n  text-decoration: underline;\n}\n\n/*# sourceMappingURL=single.vue.map */"]}, media: undefined });

      };
      /* scoped */
      var __vue_scope_id__$2 = undefined;
      /* module identifier */
      var __vue_module_identifier__$2 = undefined;
      /* functional template */
      var __vue_is_functional_template__$2 = false;
      /* style inject SSR */
      

      
      var single = normalizeComponent_1(
        { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
        __vue_inject_styles__$2,
        __vue_script__$2,
        __vue_scope_id__$2,
        __vue_is_functional_template__$2,
        __vue_module_identifier__$2,
        browser,
        undefined
      );

    //

    var script$3 = {
        name: 'SilentboxGroup',
        props: {
            'selection': {
                type: Array,
                default: function default$1() {
                    return [];
                }
            },
            'total': {
                type: Number,
                default: function default$2() {
                    return 0;
                }
            },
        },
        data: function data() {
            return {
                overlayVisibility: false,
                embedUrl: '',
                items: {
                    total: 0,
                    position: 0,
                    list: []
                },
                autoplay: false,
                item: null,
                description: ''
            }
        },
        watch: {
            /**
             * Update total number of items when object changes.
             *
             * @param  {Object} current
             * @param  {Object} old
             * @return {void}
             */
            'items.list': function (current, old) {
                this.updateTotal(current);
            }
        },
        methods: {
            /**
             * Update count of total items in group.
             *
             * @param  {object} items
             * @return {void}
             */
            updateTotal: function updateTotal(items) {
                this.items.total = this.items.list.length;
            },
            /**
             * Move to next item in a group.
             *
             * @return {void}
             */
            nextItem: function nextItem() {
                if (this.items.position !== (this.items.total - 1)) {
                    this.items.position++;
                } else {
                    this.items.position = 0;
                }

                this.embedUrl = this.items.list[this.items.position].src;

                this.autoplay = (this.items.list[this.items.position].autoplay !== undefined)
                    ? this.items.list[this.items.position].autoplay : false;

                this.description = (this.items.list[this.items.position].desc !== undefined)
                    ? this.items.list[this.items.position].desc : false;

                this.item = (this.items.list[this.items.position].item !== undefined)
                    ? this.items.list[this.items.position].item : null;
            },
            /**
             * Move to previous item in a group.
             *
             * @return {void}
             */
            prevItem: function prevItem() {
                if (this.items.position !== 0) {
                    this.items.position--;
                } else {
                    this.items.position = this.items.total - 1;
                }

                this.embedUrl = this.items.list[this.items.position].src;

                this.autoplay = (this.items.list[this.items.position].autoplay !== undefined)
                    ? this.items.list[this.items.position] : false;

                this.description = (this.items.list[this.items.position].desc !== undefined)
                    ? this.items.list[this.items.position].desc : false;

                this.item = (this.items.list[this.items.position].item !== undefined)
                    ? this.items.list[this.items.position].item : null;
            },
            /**
             * Set item that shuld be displayed.
             *
             * @return {void}
             */
            setOpened: function setOpened(item) {
                this.embedUrl = item.url;
                this.items.position = item.position;
                this.overlayVisibility = true;
                this.autoplay = item.autoplay;
                this.description = item.description;
                this.item = item.item;
            }
        },
        components: {
            'silentbox-overlay': overlay
        },
        mounted: function mounted() {
            var this$1 = this;

            // Hide overlay when user click outside or on close button.
            this.$on('closeSilentboxOverlay', function () {
                this$1.overlayVisibility = false;
            });

            // Set first opened item when overlay opens.
            this.$on('openSilentboxOverlay', function (item) {
                this$1.setOpened(item);
            });

            // Update total number of available items in group.
            this.updateTotal(this.items);

            // Listen to key events.
            window.addEventListener('keyup', function (event) {
                // Escape: 27
                if (event.which === 27) {
                    this$1.overlayVisibility = false;
                }
                // Right arrow: 39
                if (event.which === 39) {
                    this$1.nextItem();
                }
                // Left arrow: 37
                if (event.which === 37) {
                    this$1.prevItem();
                }
            });
        }
    };

    /* script */
    var __vue_script__$3 = script$3;

    /* template */
    var __vue_render__$3 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "section",
        { attrs: { id: "silentbox-group" } },
        [_vm._t("default"), _vm._v(" "), _c("silentbox-overlay")],
        2
      )
    };
    var __vue_staticRenderFns__$3 = [];
    __vue_render__$3._withStripped = true;

      /* style */
      var __vue_inject_styles__$3 = undefined;
      /* scoped */
      var __vue_scope_id__$3 = undefined;
      /* module identifier */
      var __vue_module_identifier__$3 = undefined;
      /* functional template */
      var __vue_is_functional_template__$3 = false;
      /* style inject */
      
      /* style inject SSR */
      

      
      var group = normalizeComponent_1(
        { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
        __vue_inject_styles__$3,
        __vue_script__$3,
        __vue_scope_id__$3,
        __vue_is_functional_template__$3,
        __vue_module_identifier__$3,
        undefined,
        undefined
      );

    var VueSilentbox = {};

    VueSilentbox.install = function(Vue, options) {
      Vue.mixin({
        components: {
          'silentbox-single': single,
          'silentbox-group': group,
          'silentbox-item': item
        }
      });
    };

    exports.default = VueSilentbox;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
