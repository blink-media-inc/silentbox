<template>
    <section id="silentbox-group">
        <slot></slot>
        <silentbox-overlay></silentbox-overlay>
    </section>
</template>

<script>
    import overlay from './overlay.vue';

    export default {
        name: 'SilentboxGroup',
        props: {
            'selection': {
                type: Array,
                default() {
                    return [];
                }
            },
            'total': {
                type: Number,
                default() {
                    return 0;
                }
            },
        },
        data() {
            return {
                overlayVisibility: false,
                embedUrl: ['','',''],
                img: ['left: -250%;','','left: 250%;'],
                loading: [true,true,true],
                curr: 1,
                items: {
                    total: 0,
                    position: 0,
                    list: []
                },
                interval: null,
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
            updateTotal(items) {
                this.items.total = this.items.list.length;
            },

            doNextItem() {
                if (this.items.position !== (this.items.total - 1)) {
                    this.items.position++;
                } else {
                    this.items.position = 0;
                }

                this.embedUrl[this.curr == 0 ? 2 : this.curr - 1] = this.items.list[(this.items.position == this.items.total - 1) ? 0 : this.items.position + 1].src;
                this.loading[this.curr == 0 ? 2 : this.curr - 1] = true;
                this.img[this.curr == 0 ? 2 : this.curr - 1] = 'left: 250%';
                this.embedUrl = [this.embedUrl[0],this.embedUrl[1],this.embedUrl[2]];
                this.loading = [this.loading[0],this.loading[1],this.loading[2]];
                this.img = [this.img[0],this.img[1],this.img[2]];

                this.curr = (this.curr == 2) ? 0 : this.curr + 1;

                this.autoplay = (this.items.list[this.items.position].autoplay !== undefined)
                    ? this.items.list[this.items.position].autoplay : false;

                this.description = (this.items.list[this.items.position].desc !== undefined)
                    ? this.items.list[this.items.position].desc : false;

                this.item = (this.items.list[this.items.position].item !== undefined)
                    ? this.items.list[this.items.position].item : null;
            },

            /**
             * Move to next item in a group.
             *
             * @return {void}
             */
            nextItem() {
            		if (this.interval) {
            		   return;
            		}
            		var self = this;
            		var pcntCurr = 0;
            		var pcntNext = 250;
            		this.interval = setInterval(function() {
            		   self.img[self.curr] = 'left: ' + pcntCurr + '%';
            		   self.img[self.curr == 2 ? 0 : self.curr + 1] = 'left: ' + pcntNext + '%';
            		   self.img = [self.img[0],self.img[1],self.img[2]];
            		   if (pcntNext == 0) {
            		   		clearInterval(self.interval);
            		   		self.doNextItem();
            		   		self.interval = null;
            		   }
            		   pcntNext -= 25;
            		   pcntCurr -= 25;
                }, 50);
            },

            doPrevItem() {
                if (this.items.position !== 0) {
                    this.items.position--;
                } else {
                    this.items.position = this.items.total - 1;
                }

                this.embedUrl[this.curr == 2 ? 0 : this.curr + 1] = this.items.list[(this.items.position==0) ? this.items.total - 1 : this.items.position - 1].src;
                this.loading[this.curr == 2 ? 0 : this.curr + 1] = true;
                this.img[this.curr == 2 ? 0 : this.curr + 1] = 'left: -250%';
                this.embedUrl = [this.embedUrl[0],this.embedUrl[1],this.embedUrl[2]];
                this.loading = [this.loading[0],this.loading[1],this.loading[2]];
                this.img = [this.img[0],this.img[1],this.img[2]];

                this.curr = (this.curr == 0) ? 2 : this.curr - 1;

                this.autoplay = (this.items.list[this.items.position].autoplay !== undefined)
                    ? this.items.list[this.items.position] : false;

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
            prevItem() {
            		if (this.interval) {
            		   return;
            		}
            		var self = this;
            		var pcntPrev = -250;
            		var pcntCurr = 0;
            		this.interval = setInterval(function() {
            		   self.img[self.curr==0 ? 2 : self.curr - 1]  = 'left: ' + pcntPrev + '%';
            		   self.img[self.curr] = 'left: ' + pcntCurr + '%';
            		   self.img = [self.img[0],self.img[1],self.img[2]];
            		   if (pcntPrev == 0) {
            		   		clearInterval(self.interval);
            		   		self.doPrevItem();
            		   		self.interval = null;
            		   }
            		   pcntPrev += 25;
            		   pcntCurr += 25;
                }, 50);
            },

            /**
             * Set item that shuld be displayed.
             *
             * @return {void}
             */
            setOpened(item) {
                this.curr = 1;
                this.items.position = item.position;
                this.embedUrl = [this.items.list[this.items.position==0 ? (this.items.total - 1) : (this.items.position - 1)].src, item.url, this.items.list[this.items.position==(this.items.total - 1) ? 0 : (this.items.position + 1)].src];
                this.img = ['left: -250%;','','left: 250%;'];
                this.loading = [true,true,true];
                this.overlayVisibility = true;
                this.autoplay = item.autoplay;
                this.description = item.description;
                this.item = item.item;
            },

            setLoadingAll() {
                this.loading = [true,true,true];
            },

            setLoading(ldng,pos) {
                this.loading[pos] = ldng;
                this.loading = [this.loading[0],this.loading[1],this.loading[2]];
            }
        },
        components: {
            'silentbox-overlay': overlay
        },
        mounted() {
            // Hide overlay when user click outside or on close button.
            this.$on('closeSilentboxOverlay', () => {
                this.overlayVisibility = false;
            });

            // Set first opened item when overlay opens.
            this.$on('openSilentboxOverlay', item => {
                this.setOpened(item);
            });

            // Update total number of available items in group.
            this.updateTotal(this.items);

            // Listen to key events.
            window.addEventListener('keyup', (event) => {
                // Escape: 27
                if (event.which === 27) {
                    this.overlayVisibility = false;
                }
                // Right arrow: 39
                if (event.which === 39) {
                    this.nextItem();
                }
                // Left arrow: 37
                if (event.which === 37) {
                    this.prevItem();
                }
            });
        }
    }
</script>