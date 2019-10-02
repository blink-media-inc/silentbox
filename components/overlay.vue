<template>
    <div id="silentbox-overlay" v-if="isVisible">
        <div id="silentbox-overlay__background" @click.stop="closeSilentboxOverlay"></div>

        <div id="silentbox-overlay__content" @click.stop="closeSilentboxOverlay">
            <div id="silentbox-overlay__embed">
                <div ref="mediaContainer" id="silentbox-overlay__container">
                    <div :style="showImg0" ref="mediaElement0">
		                    <main class="empty-state" v-if="getLoading0">
		                        <beat-loader :color="loadingColor" size="15px"></beat-loader>
		                    </main>
		                    <iframe :style="displayImg0" ref="mediaElement0" width="100%" height="100%" v-if="video0" :src="getEmbedUrl0" frameborder="0" :allow="getAutoplayState" allowfullscreen></iframe>
		                    <img :style="displayImg0" width="auto" height="auto" :src="getEmbedUrl0" v-if="! video0">
		                </div>
                    <div :style="showImg1" ref="mediaElement1">
		                    <main class="empty-state" v-if="getLoading1">
		                        <beat-loader :color="loadingColor" size="15px"></beat-loader>
		                    </main>
		                    <iframe :style="displayImg1" ref="mediaElement0" width="100%" height="100%" v-if="video1" :src="getEmbedUrl1" frameborder="0" :allow="getAutoplayState" allowfullscreen></iframe>
		                    <img :style="displayImg1" width="auto" height="auto" :src="getEmbedUrl1" v-if="! video1">
		                </div>
                    <div :style="showImg2" ref="mediaElement2">
		                    <main class="empty-state" v-if="getLoading2">
		                        <beat-loader :color="loadingColor" size="15px"></beat-loader>
		                    </main>
		                    <iframe :style="displayImg2" ref="mediaElement0" width="100%" height="100%" v-if="video2" :src="getEmbedUrl2" frameborder="0" :allow="getAutoplayState" allowfullscreen></iframe>
		                    <img :style="displayImg2" width="auto" height="auto" :src="getEmbedUrl2" v-if="! video2">
		                </div>
                </div>

                <p id="silentbox-overlay__description" v-if="this.$parent.description">{{ this.$parent.description }}</p>
                <div class="add-to-collection-fullscreen-gallery" @click.stop="stopTheEvent" v-if="isSelectable">
                <b-checkbox
                    class="form-check-input"
                    :id="`overlayAssetSelector${this.$parent.item.id}`"
                    type="checkbox"
                    aria-label="..."
                    v-model="isSelected"
                    :disabled="(this.$parent.total!=999999) && (this.$parent.selection.length >= this.$parent.total) && (this.$parent.selection.indexOf(this.$parent.item) == -1)"
                >
                <span>Add to selection <strong v-if="this.$parent.total!=999999">({{this.$parent.selection.length}}/{{this.$parent.total}})</strong></span>
                
                </b-checkbox>
                </div>
            </div>
        </div>

        <div id="silentbox-overlay__close-button" role="button" tabindex="3" @click.stop="closeSilentboxOverlay" @keyup.enter="closeSilentboxOverlay">
            <div class="icon"></div>
        </div>

        <div id="silentbox-overlay__arrow-buttons" v-if="this.$parent.items.total > 0">
            <div class="arrow arrow-previous" role="button" tabindex="2" @click="moveToPreviousItem" @keyup.enter="moveToPreviousItem"></div>
            <div class="arrow arrow-next" role="button" tabindex="1" @click="moveToNextItem" @keyup.enter="moveToNextItem"></div>
        </div>
    </div>
</template>

<script>
    import VideoUrlDecoderMixin from './../mixins/videoUrlDecoder';
    import imagesLoaded from 'imagesloaded';

    export default {
        name: 'SilentboxOverlay',
        mixins: [ VideoUrlDecoderMixin ],
        data() {
            return {
                video0: false,
                video1: false,
                video2: false,
                imgLoad0: null,
                imgLoad1: null,
                imgLoad2: null,
            }
        },
        computed: {
            isSelectable() {
                return this.$parent.total > 0;
            },
            loadingColor() {
                return getComputedStyle(document.documentElement).getPropertyValue('--white');
            },
            isSelected: {
                get() {
                    return (this.$parent.selection && this.$parent.selection.indexOf(this.$parent.item) > -1);
                },
                set(newVal) {
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
            showImg0() {
                return "justify-content:center;display:flex;flex-direction:column;position:absolute;width:100%;height:100%;" + this.$parent.img[0];
            },
            showImg1() {
                return "justify-content:center;display:flex;flex-direction:column;position:absolute;width:100%;height:100%;" + this.$parent.img[1];
            },
            showImg2() {
                return "justify-content:center;display:flex;flex-direction:column;position:absolute;width:100%;height:100%;" + this.$parent.img[2];
            },
            displayImg0() {
                if (this.getLoading0) {
                    return "display:none;";
                }
                return "";
            },
            displayImg1() {
                if (this.getLoading1) {
                    return "display:none;";
                }
                return "";
            },
            displayImg2() {
                if (this.getLoading2) {
                    return "display:none;";
                }
                return "";
            },
            getLoading0() {
                return this.$parent.loading[0];
            },
            getLoading1() {
                return this.$parent.loading[1];
            },
            getLoading2() {
                return this.$parent.loading[2];
            },
            /**
             * Get the right embed URL.
             */
            getEmbedUrl0() {
                return this.handleUrl(this.$parent.embedUrl[0],0);
            },
            /**
             * Get the right embed URL.
             */
            getEmbedUrl1() {
                return this.handleUrl(this.$parent.embedUrl[1],1);
            },
            /**
             * Get the right embed URL.
             */
            getEmbedUrl2() {
                return this.handleUrl(this.$parent.embedUrl[2],2);
            },
            /**
             * Get autoplay state.
             */
            getAutoplayState() {
                if (this.$parent.autoplay !== undefined && this.$parent.autoplay !== false) {
                    return "autoplay";
                }
                 return "";
            },
            /**
             * Check whether overlay is visible or not.
             */
            isVisible() {
                if (this.$parent.overlayVisibility !== undefined && this.$parent.overlayVisibility !== false) {
                    this.$parent.setLoadingAll();
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
            bodyScrolling() {
                let body = document.body;

                // add class only if overlay should be visible
                if (this.isVisible && ! body.classList.contains('silentbox-is-opened')) {
                    this.$nextTick(() => {
                        switch (this.curr) {
                        	case 0: this.$refs.mediaElement0.scrollIntoView({ behavior: 'smooth', block: 'center' }); break;
                        	case 1: this.$refs.mediaElement1.scrollIntoView({ behavior: 'smooth', block: 'center' }); break;
                        	case 2: this.$refs.mediaElement2.scrollIntoView({ behavior: 'smooth', block: 'center' }); break;
                        }
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
            moveToNextItem() {
                if (this.$parent.loading[0]) {
                    this.imgLoad0.off('always',this.imgsLoaded0);
                    this.imgLoad0 = null;
                }
                if (this.$parent.loading[1]) {
                    this.imgLoad1.off('always',this.imgsLoaded1);
                    this.imgLoad1 = null;
                }
                if (this.$parent.loading[2]) {
                    this.imgLoad2.off('always',this.imgsLoaded2);
                    this.imgLoad2 = null;
                }
/*                if (this.loading) {
                    this.imgLoad.off('always',this.imgsLoaded);
                    this.imgLoad = null;
                }
                this.loading = true;*/
                this.$parent.nextItem();
            },
            /**
             * Move to previous item.
             */
            moveToPreviousItem()
            {
                if (this.$parent.loading[0]) {
                    this.imgLoad0.off('always',this.imgsLoaded0);
                    this.imgLoad0 = null;
                }
                if (this.$parent.loading[1]) {
                    this.imgLoad1.off('always',this.imgsLoaded1);
                    this.imgLoad1 = null;
                }
                if (this.$parent.loading[2]) {
                    this.imgLoad2.off('always',this.imgsLoaded2);
                    this.imgLoad2 = null;
                }
//                this.loading = true;
                this.$parent.prevItem();
            },
            stopTheEvent(event)
            {
                event.stopPropagation();
            },
            /**
             * Hide silentbox overlay.
             */
            closeSilentboxOverlay() {
                this.$parent.$emit('closeSilentboxOverlay');
            },
            /**
             * Search for known video services URLs and return their players if recognized.
             * Unrecognized URLs are handled as images.
             * 
             * @param  {string} url
             * @return {string}
             */
            handleUrl(url,position) {
                if (url.includes('youtube.com') || url.includes('youtu.be')) {
                    switch (position) { case 0: this.video0 = true; break; case 1: this.video1 = true; break; case 2: this.video2 = true; break; };
                    return this.getYoutubeVideo(url);
                } else if (url.includes("vimeo")) {
                    switch (position) { case 0: this.video0 = true; break; case 1: this.video1 = true; break; case 2: this.video2 = true; break; };
                    return this.getVimeoVideo(url);
                } else {
                    // Given url is not a video URL thus return it as it is.
                    switch (position) { case 0: this.video0 = false; break; case 1: this.video1 = false; break; case 2: this.video2 = false; break; };
                    return url;
                }
            },
            /**
             * Get embed URL for youtube.com
             * 
             * @param  {string} url 
             * @return {string} 
             */
            getYoutubeVideo(url) {
                let videoUrl = "";
                let videoId  = this.getYoutubeVideoId(url);

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
            getVimeoVideo(url) {          
                    let videoUrl = "";
                    const vimoId = /(vimeo(pro)?\.com)\/(?:[^\d]+)?(\d+)\??(.*)?$/.exec(url)[3];

                    if (vimoId !== undefined) {
                        videoUrl = 'https://player.vimeo.com/video/'+ vimoId + '?api=1';
                        if (this.$parent.autoplay) {
                            videoUrl += '&autoplay=1';
                        }
                    }

                    return videoUrl;
            },
		        imgsLoaded0() {
                this.$parent.setLoading(false,0);
                this.imgLoad0.off('always',this.imgsLoaded0);
                this.imgLoad0 = null;
		        },
		        imgsLoaded1() {
                this.$parent.setLoading(false,1);
                this.imgLoad1.off('always',this.imgsLoaded1);
                this.imgLoad1 = null;
		        },
		        imgsLoaded2() {
                this.$parent.setLoading(false,2);
                this.imgLoad2.off('always',this.imgsLoaded2);
                this.imgLoad2 = null;
		        },
        },
        updated() {
            if ((this.$refs.mediaElement0) && (!this.imgLoad0) && (this.$parent.loading[0])) {
                this.imgLoad0 = imagesLoaded(this.$refs.mediaElement0);
                this.imgLoad0.on('always',this.imgsLoaded0);
            }
            if ((this.$refs.mediaElement1) && (!this.imgLoad1) && (this.$parent.loading[1])) {
                this.imgLoad1 = imagesLoaded(this.$refs.mediaElement1);
                this.imgLoad1.on('always',this.imgsLoaded1);
            }
            if ((this.$refs.mediaElement2) && (!this.imgLoad2) && (this.$parent.loading[2])) {
                this.imgLoad2 = imagesLoaded(this.$refs.mediaElement2);
                this.imgLoad2.on('always',this.imgsLoaded2);
            }
        }
    }
</script>

<style lang="scss">
@mixin element($element) {
    &__#{$element} {
        @content;
    }
}

// Colours used in silentbox
$main:   #fff;
$accent: #58e8d2;
$bg: #000;

.silentbox-is-opened {
    overflow: hidden;
}

#silentbox-overlay {
    display: block;
    height: 100vh;
    left: 0;
    position: fixed;
    top: 0;
    width: 100vw;
    z-index: 999;

    @include element(background) {
        background: rgba($bg, .75);
        backdrop-filter: blur(20px);
        cursor: default;
        display: block;
        height: 100%;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
    }

    @include element(content) {
        cursor: default;
        display: block;
        height: 100%;
        position: relative;
        width: 100%;
    }

    @include element(embed) {
        bottom: 0;
        cursor: default;
        display: block;
        height: 80%;
        left: 0;
        margin: auto;
        position: absolute;
        right: 0;
        top: -2.5rem;
        width: 75%;

        img,
        iframe {
            background-color: $bg;
            bottom: 0;
            box-shadow: 0 0 1.5rem rgba($bg, .45);
            cursor: default;
            display: block;
            left: 0;
            margin: auto;
            max-height: 100%;
            max-width: 100%;
            position: absolute;
            right: 0;
            top: 0;
        }
    }

    @include element(container) {
        cursor: default;
        height: 100%;
        margin: 0 0 1.5rem 0;
        position: relative;
        text-align: center;
        width: 100%;
    }

    @include element(description) {
        display: block;
        padding-top: 1rem;
        text-align: center;
        color: $main;
    }

    @include element(close-button) {
        background: rgba($bg, .0);
        border: none;
        color: $main;
        cursor: pointer;
        height: 2.5rem;
        position: absolute;
        right: 0;
        top: 0;
        transition: background-color 250ms ease-out;
        width: 2.5rem;
        &:hover,
        &:focus {
            background-color: rgba($bg, .5);
            outline: none;
        }

        .icon {
            color: $main;
            cursor: pointer;
            height: 1rem;
            left: .7rem;
            margin: 50% 50% 0 0;
            position: absolute;
            right: 0px;
            top: -.5rem;
            transition: 250ms ease;
            width: 1rem;
            &:before,
            &:after {
                background: $main;
                content: "";
                height: 2px;
                left: 5%;
                position: absolute;
                top: 50%;
                transition: 250ms ease;
                width: 100%;
            }
            &:before {
                transform: rotate(-45deg);
            }
            &:after {
                transform: rotate(45deg);
            }
            &:hover,
            &:focus {
                &:before,
                &:after {
                    background: $accent;
                    left: 25%;
                    width: 50%;
                }
            }
        }
    }

    @include element(arrow-buttons) {
        .arrow {
            border-left: 2px solid $main;
            border-top: 2px solid $main;
            cursor: pointer;
            height: 1.5rem;
            position: absolute;
            width: 1.5rem;
            &:hover,
            &:focus {
                outline: none;
                border-color: $accent;
            }
        }
        .arrow-previous {
            left: 2rem;
            top: 50%;
            transform: rotate(-45deg);
            &:hover,
            &:focus {
                animation-duration: 1s;
                animation-iteration-count: infinite;
                animation-name: pulsingPrevious;
            }
        }
        .arrow-next {
            right: 2rem;
            top: 50%;
            transform: rotate(135deg);
            &:hover,
            &:focus {
                animation-duration: 1s;
                animation-iteration-count: infinite;
                animation-name: pulsingNext;
            }
        }
    }
}

// Animations
@keyframes pulsingNext {
    0%   {
        animation-timing-function: ease-in;
        right: 2rem;
    }
    25%  {
        animation-timing-function: ease-in;
        right: 1.75rem;
    }
    75%  {
        animation-timing-function: ease-in;
        right: 2.25rem;
    }
    100% {
        animation-timing-function: ease-in;
        right: 2rem;
    }
}
@keyframes pulsingPrevious {
    0%   {
        animation-timing-function: ease-in;
        left: 2rem;
    }
    25%  {
        animation-timing-function: ease-in;
        left: 1.75rem;
    }
    75%  {
        animation-timing-function: ease-in;
        left: 2.25rem;
    }
    100% {
        animation-timing-function: ease-in;
        left: 2rem;
    }
}
</style>