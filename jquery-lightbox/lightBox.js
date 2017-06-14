;
(function($){
    var MyLightbox = function(dom) {
        var self = this;

        // dom needed
        this.bodyNode = $(document.body);
        this.masker = $('<div id="jq-lightbox-masker"></div>');
        this.popup = $('<div id="jq-lightbox-popup"></div>');

        this.renderDom();

        this.picView = $('.lightbox-pic-view');
        this.pic = $('.current-pic');
        this.prevBtn = $('.lightbox-prev-btn');
        this.nextBtn = $('.lightbox-next-btn');
        this.picCaptionArea = $('.lightbox-pic-caption');
        this.desc = $('.lightbox-pic-desc');
        this.indexText = $('.lightbox-index');
        this.closeBtn = $('.lightbox-close');

        // data
        this.groupName = null;
        this.groupData = [];
        this.index = null;
        this.ok = false;

        this.bodyNode.on('click', function(e) {
            e.stopPropagation();
            var target = $(e.target);
            if(target.hasClass('jq-lightbox')) {
                var currentGroup = target.attr("data-group");
                
                if(currentGroup !== self.groupName) {
                    self.groupName = currentGroup;
                    // get group data
                    self.getGroupData();
                }

                // init popup
                self.initPopup(target);
            }
        });

        this.masker.on('click', function(e) {
            $(this).fadeOut();
            self.popup.fadeOut();
            self.ok = false;
        });

        this.closeBtn.click(function() {
            self.masker.fadeOut();
            self.popup.fadeOut();
            self.ok = false;
        });

        this.prevBtn.on('click', function(e) {
            e.stopPropagation();
            self.stepTo('prev');
        });

        this.nextBtn.on('click', function(e) {
            e.stopPropagation();
            self.stepTo('next');
        });
    };

    MyLightbox.prototype = {
        stepTo: function(dir) {
            var self = this;
            if(dir === 'prev') {
                this.index--;
                if(this.index <= 1) {
                    this.index = 1;                    
                    this.prevBtn.removeClass('lightbox-prev-btn-show');
                }
                if(this.index != this.groupData.length) {
                    this.nextBtn.addClass('lightbox-next-btn-show');
                }
                if(this.index >= 1) {
                    this.setImgInfo(this.groupData[this.index - 1], this);
                }
            } else {
                this.index++;
                if(this.index >= this.groupData.length) {
                    this.index = this.groupData.length;
                    this.nextBtn.removeClass('lightbox-next-btn-show');
                }
                if(this.index != 1) {
                    this.prevBtn.addClass('lightbox-prev-btn-show');
                }
                if(this.index <= this.groupData.length) {
                    this.setImgInfo(this.groupData[this.index - 1], this);
                }
            }
        },
        changeSize: function(width, height) {
            var self = this;
            var windowWidth = $(window).width();
            var windowHeight = $(window).height();

            var scale = Math.min(1, windowWidth / (width + 60), windowHeight / (height + 60));
            width = width * scale;
            height = height * scale;

            var topNew = (windowHeight - height) / 2;

            self.picView.animate({
                width: width,
                height: height
            });
            self.popup.animate({
                width: width,
                height: height,
                top: topNew
            }, 300, function() {
                self.pic.css({
                    width: width,
                    height: height
                }).fadeIn();
                self.picCaptionArea.fadeIn();
                self.ok = true;
            });
        },
        loadPic: function(obj, callback) {
            var img = new Image();
            var self = this;
            if(!!window.ActiveXObject) {
                img.onreadystatechange = function() {
                    if(this.readyState == "complete") {
                        callback(obj, self);
                    }
                }
            } else {
                img.onload = function() {
                    callback(obj, self);
                }
            }
            img.src = obj.src;
        },
        setImgInfo: function(obj, self) {
             // clear the last pic's width and height
            self.pic.css({ width: 'auto', height: 'auto' });
            self.pic.attr('src', obj.src);
            var picWidth = self.pic.width();
            var picHeight = self.pic.height();
            self.changeSize(picWidth, picHeight);

            self.desc.text(obj.caption);
            self.indexText.text('current index: '+ self.index + ' of ' + self.groupData.length);
        },
        showMaskerAndPopup: function(obj) {
            var self = this;

            this.pic.hide();
            this.picCaptionArea.hide();

            // visible area size
            var windowWidth = $(window).width();
            var windowHeight = $(window).height();
            var viewHeight = windowHeight / 2 + 10;
            var animateHeight = (windowHeight - viewHeight) / 2;

            this.picView.css({
                width: windowWidth / 2,
                height: windowHeight / 2
            });
            this.popup.fadeIn();
            this.masker.fadeIn();
            this.popup.css({
                width: windowWidth / 2 + 10, //有5像素的边框
                height: viewHeight,
                top: -viewHeight
            }).animate({
                top: animateHeight
            }, 300, function() {
                self.loadPic(obj, self.setImgInfo);
            });

            this.index = this.getIndex(obj);
            var groupLength = this.groupData.length;

            // control btn visibility
            if(groupLength > 1) {
                if(this.index === 1) {
                    this.prevBtn.removeClass('lightbox-prev-btn-show');
                    this.nextBtn.addClass('lightbox-next-btn-show');
                } else if (this.index === groupLength) {
                    this.prevBtn.addClass('lightbox-prev-btn-show');
                    this.nextBtn.removeClass('lightbox-next-btn-show');
                } else {
                    this.prevBtn.addClass('lightbox-prev-btn-show');
                    this.nextBtn.addClass('lightbox-next-btn-show');
                }
            } else {
                this.prevBtn.removeClass('lightbox-prev-btn-show');
                this.nextBtn.removeClass('lightbox-next-btn-show');
            }
        },
        getIndex: function(obj) {
            var index = 0;
            var self = this;
            if(self.groupData) {
                $(self.groupData).each(function(i, e) {
                    if(e.id === obj.id) {
                        index = i + 1;
                    }
                });
            }
            return index;
        },
        initPopup: function(dom) {
            var domData = {
                src: dom.attr('data-source'),
                caption: dom.attr('data-caption'),
                id: dom.attr('data-id')
            }
            this.showMaskerAndPopup(domData);
        },
        getGroupData: function() {
            var self = this;
            // clear data before
            self.groupData = [];
            var imagesInGroup = this.bodyNode.find('*[data-group='+self.groupName+']');
            imagesInGroup.each(function(index, ele) {
                self.groupData.push({
                    src: $(ele).attr('data-source'),
                    caption: $(ele).attr('data-caption'),
                    id: $(ele).attr('data-id')
                })
            })
        },
        renderDom: function() {
            var HTMLStr = `<div class="lightbox-pic-view">
                                <span class="lightbox-btn lightbox-prev-btn"></span>
                                <img class="current-pic" src="./images/1-1.jpg">
                                <span class="lightbox-btn lightbox-next-btn"></span>
                            </div>
                            <div class="lightbox-pic-caption">
                                <div class="lightbox-caption-area">
                                    <p class="lightbox-pic-desc"></p>
                                    <p class="lightbox-index">current index: 0 of 0</p>
                                </div>
                                <span class="lightbox-close"></span>
                            </div>`;
            this.popup.html(HTMLStr);
            this.bodyNode.append(this.masker, this.popup);
        }
    };

    // window["MyLightbox"] = MyLightbox;
    $.fn.MyLightbox = function(dom) {
        new MyLightbox($(this))
    };

})(jQuery);
