(function(_) {
//--------------------------------------------------------
    window.fbAsyncInit = function() {
        FB.init({
            appId: '619064858288669',
            xfbml: true,
            version: 'v2.8'
        });
        FB.AppEvents.logPageView();
    };

    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "http://connect.facebook.net/ru/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
//--------------------------------------------------------
    function merge(A, B, recursive) { // Слить значения  объекта B в объект A
        if (!A) { return B };
        if (!B) { return A };

        for (var key in B) {
            if (B.hasOwnProperty(key)) {
                if (recursive && typeof A[key] === "object") {
                    A[key] = merge(A[key], B[key], true);
                } else {
                    A[key] = B[key];
                };
            };
        };
        return A;
    };


    function FeedApp(options) {
        this.o = merge(this.options, options, true);
        var btnGetFeed = document.querySelector(this.o.btnGetFeedId);
        var self = this;
        btnGetFeed.addEventListener('click', function() { self.getFeed() });

    };

    FeedApp.prototype.options = {
        dateOptions: {
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            month: "long"
        },
        btnGetFeedId: null,
        feedListId: null,
        feedTemplateId: null,
        feedRequstFields: 'message',
        feedLimit: 10,
        meRequestFields: 'name,picture,link',
        scope: null
    };

    FeedApp.prototype.user = {
        uid: null,
        name: null,
        picture: null,
        link: null
    };

    FeedApp.prototype._getUserInfo_ = function(uid) {
        var self = this;
        if (typeof uid === 'undefined') { uid = '/me'; };
        FB.api('/me', { fields: self.o.meRequestFields }, function(response) {
            self.user.uid = response.id;
            self.user.name = response.name;
            self.user.picture = response.picture.data.url;
            self.user.link = response.link;
        });
    };

    FeedApp.prototype.login = function(callback) {
        var self = this;
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                self._getUserInfo_();
                if (typeof callback === 'function') {
                    callback();
                };
            } else {
                FB.login(function(response) {
                    if (response.authResponse) {
                        self._getUserInfo_();
                        if (typeof callback === 'function') {
                            callback();
                        };
                    } else {
                        alert("You shall not pass!");
                    };
                }, { scope: self.o.scope });
            };
        });
        
    };

    FeedApp.prototype.getFeed = function () {
        var self = this;
        self.login (function() {
            FB.api('/me/feed', { fields: self.o.feedRequestFields, limit: self.o.feedLimit }, function(response) {

                var feedList = document.querySelector(self.o.feedListId)
                    , template = _.template(document.querySelector(self.o.feedTemplateId).innerHTML)
                    ;
                feedList.innerHTML = template({postArray: response.data, user: self.user, options: self.o.dateOptions});
            });
        });
    };

    document.addEventListener('DOMContentLoaded', function(){
        new FeedApp({
            'btnGetFeedId': '#get-feed',
            'feedListId': '#feed',
            'feedTemplateId': '#list-template',
            'meRequestFields': 'id,name,picture,link',
            'feedRequestFields': 'id,story,link,message,caption,name,description,created_time,permalink_url,full_picture',
            'feedLimit': 25,
            'scope': 'user_posts'
        });
    });

})(_);