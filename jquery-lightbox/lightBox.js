;
(function($){
    var MyLightbox = function(dom) {
        console.log(dom.length)
    };

    MyLightbox.prototype = {

    };


    $.fn.MyLightbox = function() {
        MyLightbox($(this));
    };

})(jQuery);
