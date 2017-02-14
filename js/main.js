(function(_) {
//-FACEBOOK-----------------------------------------------
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

    function changeButtonState(button) { // Изменение свойства disabled у кнопки на противоположное
        if (button.type === 'button' && (!button.disabled || button.disabled)) {
            button.disabled = !button.disabled;
        };
    };

    function FeedApp(options) { // Собственно класс приложения
        var self = this;
        self.o = merge(self.options, options, true);
        var btnGetFeed = document.querySelector(self.o.btnGetFeedId);
        var btnTopTags = document.querySelector(self.o.btnTopTagsId);
        btnGetFeed.addEventListener('click', function() { // Клик по кнопке get-feed
            self.getFeed(function(){
                if (btnTopTags.disabled) { // Делаем кнопку top-tags активной
                    self.login(function(){
                        changeButtonState(btnTopTags);
                    }); 
                };
            });
        });

        btnTopTags.addEventListener('click', function() { // Клик по кнопке top-tags
             self.getUserTags(function(tagSet){
                self.showTopTags(tagSet);
             });
        });

        var btnPopupClose = document.querySelector(self.o.btnPopupCloseId);
        btnPopupClose.addEventListener('click', function() {
            var popupBox = document.querySelector(self.o.popupBoxId);
            popupBox.style.display = 'none';
        });
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
        btnTopTagsId: null,
        btnPopupCloseId: null,
        feedListId: null,
        popupContentId: null,
        popupBoxId: null,
        tagCount: 1,
        feedTemplateId: null,
        tagContentTemplateId: null,
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

    FeedApp.prototype._getUserInfo_ = function(uid) { // Метод, забирающий uid, имя пользователя, ссылки на аватар и страницу 
        var self = this;
        if (typeof uid === 'undefined') { uid = '/me'; };
        FB.api('/me', { fields: self.o.meRequestFields }, function(response) {
            self.user.uid = response.id;
            self.user.name = response.name;
            self.user.picture = response.picture.data.url;
            self.user.link = response.link;
        });
    };

    FeedApp.prototype.login = function(callback) { // Метод, выполняющий коллбэк с проверкой авторизации на ФБ
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

    FeedApp.prototype._getMessageArray_ = function(callback) { // Вытаскиваем из фида только post.message
        var self = this;
        var messageArray = new Array();

        if (typeof callback === 'function') {
            FB.api('/me/feed', {'fields': 'message,created_time', 'limit': '9999997'}, function(response) {
                for (var p = 0, l = response.data.length; p < l; p++) {
                    if (response.data[p].message) {
                        messageArray.push(response.data[p].message);
                    };
                };
                callback(messageArray);
            });
        } else {
            console.log("_getMessageArray_: wrong callback");
        };
    };
    FeedApp.prototype.getFeed = function (callback) { // Получение постов из фида, размещение данных на странице 
        var self = this;
        self.login (function() {
            FB.api('/me/feed', { fields: self.o.feedRequestFields, limit: self.o.feedLimit }, function(response) {
                var feedList = document.querySelector(self.o.feedListId);
                var template = _.template(document.querySelector(self.o.feedTemplateId).innerHTML);
                feedList.innerHTML = template({postArray: response.data, user: self.user, options: self.o.dateOptions});
            });
        });

        if (typeof callback === 'function') { callback() };
    };
    FeedApp.prototype.getUserTags = function(callback) { // Метод получения тегов
        var self = this;
        self.login(function() {
            self._getMessageArray_(function(messageArray) {
                var tagSet = new Object();
                for (var m = 0, len = messageArray.length; m < len; m++) {
                    var tagArray = messageArray[m].match(/(\s|^)(\#\w+)/ig);
                    if (tagArray && typeof tagArray === 'object') {
                        for (var t = 0, n = tagArray.length; t < n; t++) {
                            var tag = tagArray[t].replace(/\s+/g, '').toLowerCase();
                            if (tagSet.hasOwnProperty(tag)) {
                                tagSet[tag]++;
                            } else {
                                tagSet[tag] = 1;
                            };
                        };
                    };
                };
                if (typeof callback === 'function') {
                    callback(tagSet);
                };
            });
        });
    };
    FeedApp.prototype.showTopTags = function(tagSet, callback) {
        var self = this;
        var popupBox = document.querySelector(self.o.popupBoxId);
        var tagContent = document.querySelector(self.o.popupContentId);
        var template = _.template(document.querySelector(self.o.tagContentTemplateId).innerHTML);

        var topTags = Object.keys(tagSet).sort(function(a, b) {return tagSet[b] - tagSet[a];});
        tagContent.innerHTML = template({'tagSet': tagSet, 'topTags': topTags, 'tagCount': self.o.tagCount});
        // console.log(template({'tagSet': tagSet, 'topTags': topTags, 'tagCount': self.o.tagCount}));
        popupBox.style.display = 'block';

        if (typeof callback === 'function') {
            callback();
        };
    };

    document.addEventListener('DOMContentLoaded', function() {
        new FeedApp({
            'btnGetFeedId': '#get-feed',
            'btnTopTagsId': '#top-tags',
            'btnPopupCloseId': '#popup-close',
            'feedListId': '#feed',
            'popupContentId': '#popup-content',
            'popupBoxId': '#popup-box',
            'tagCount': 5,
            'feedTemplateId': '#list-template',
            'tagContentTemplateId': '#tag-line-template',
            'meRequestFields': 'id,name,picture,link',
            'feedRequestFields': 'id,story,link,message,caption,name,description,created_time,permalink_url,full_picture',
            'feedLimit': 25,
            'scope': 'user_posts'
        });
    });

})(_);