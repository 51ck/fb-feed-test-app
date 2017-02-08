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
                if (recursive && typeof A === "object") {
                    A[key] = merge(A[key], B[key], true);
                } else {
                    A[key] = B[key];
                };
            };
        };1
        return A;
    };


    function FeedApp(options) {
        this.o = merge(this.options, options, true);
        var btnGetFeed = document.querySelector(this.o.btnGetFeedId);
        var self = this;
        btnGetFeed.addEventListener('click', function() { self.getFeed() });

    }
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
        feedTemplateId: null
    }

    FeedApp.prototype.user = {
        uid: null,
        name: null,
        picture: null,
        link: null
    }

    FeedApp.prototype._realGetFeed_ = function (authResponse) {
        this.user.uid = authResponse.userID;
        var self = this;
        FB.api('/me', { fields: "name,picture,link,quotes"}, function(response){
            self.user.name = response.name;
            self.user.picture = response.picture.data.url;
            self.user.link = response.link;

            var feedList = document.querySelector(self.o.feedListId)
                , template = _.template(document.querySelector(self.o.feedTemplateId).innerHTML)
                ;

            FB.api('/me/feed', {"fields": "id,story,name,link,full_picture,message,caption,created_time", "limit": "30"}, function(response) {
                feedList.innerHTML = template({postArray: response.data, user: self.user, options: self.o.dateOptions});
            });
        });
    };

    FeedApp.prototype.getFeed = function() {
        var self = this;
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                self._realGetFeed_(response.authResponse);
            } else {
                FB.login(function(response) {
                    if (response.authResponse) {
                        self._realGetFeed_(response.authResponse);
                    } else {
                        alert("You shall not pass!");
                    }
                }, { scope: 'user_posts' });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function(){
        new FeedApp({ 'btnGetFeedId': '#get-feed', 'feedListId': '#feed', 'feedTemplateId': '#list-template' });
    });

})(_);