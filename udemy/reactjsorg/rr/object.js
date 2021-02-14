define("Catalog/Views/Preview", ["Common/Abstract/View"], function (e) {
    return e.extend({
        defaults: { template: "Catalog/Preview" },
        initialize: function () {
            _.bindAll(this), (this.query = _.uri2obj(window.location.search)), (this.template = this.options.template);
            var e = this.model.get("idx");
            this.listenTo(App.Events, "change:currency", this.render), this.listenTo(App.Events, "remove:favorite" + e, this._checkFavorite);
        },
        events: { "click .favorite_btn": "addToFavorites" },
        getFavorites: function () {
            var e;
            Modernizr.localstorage && (e = localStorage.getItem("favorites")), (this.favorites = e ? $.parseJSON(e) : []);
        },
        postRender: function () {
            this._checkFavorite();
        },
        _checkFavorite: function () {
            this.getFavorites();
            var e = _.include(this.favorites, this.model.get("idx"));
            this.addToFavorites(e);
        },
        addToFavorites: function (e) {
            if (!_.isObject(e))
                return (
                    !0 === e ? (this.$(".favorite_btn").addClass("diactive"), this.$(".favorite_btn span").html("В избранном")) : (this.$(".favorite_btn").removeClass("diactive"), this.$(".favorite_btn span").html("Добавить в избранное")),
                    !1
                );
            this.getFavorites();
            var t = this.model.get("idx"),
                i = $(e.currentTarget),
                s = i.hasClass("diactive"),
                n = i.find("span");
            return (
                i.toggleClass("diactive"),
                s ? (n.html("Добавить в избранное"), (this.favorites = _.without(this.favorites, t))) : (n.html("В избранном"), this.favorites.unshift(t)),
                localStorage.setItem("favorites", $.toJSON(_.uniq(this.favorites))),
                App.ContainerView.checkFavorites(),
                !1
            );
        },
        getTemplateData: function () {
            if (!this.model) return {};
            var e = this.model.toJSON();
            (e.land_area = parseInt(e.land_area)), (e.house_area = parseInt(e.house_area));
            var rent = "",
                rentPer = "",
                isRent = !1;
            if ((this.query && "1" === this.query.rent && +e.rent) || (+e.rent && !+e.sale)) {
                rent = "Rent";
                rentPer = " в месяц";
                isRent = !0;
            }
            return (e.isRent = isRent), (e.Price = e["price" + rent + "In" + CURRENCY]), (e.Price = e.Price ? e.Price.split(/(?=(?:\d{3})+$)/).join(" ") + rentPer : null), e;
        },
    });
}),
    define("Catalog/Views/List", ["Common/Abstract/View", "Catalog/Views/Preview"], function (e, t) {
        return e.extend({
            defaults: { itemTagName: "div", itemClassName: "col-lg-4 col-sm-6", itemTemplate: "Catalog/Preview", shuffle: !1, first: null, pagination: !1 },
            className: "row items--line",
            initialize: function (e) {
                _.bindAll(this), (this.options = _.extend({}, this.defaults, e));
            },
            postRender: function () {
                this.collection &&
                    (this.closeSubviews(),
                    (this.models = _.isUndefined(this.collection.models) ? this.collection : this.collection.models),
                    this.options.shuffle && (this.models = _.shuffle(this.models)),
                    this.options.first && (this.models = _.first(this.models, this.options.first)),
                    _.each(this.models, this.renderItem));
            },
            renderItem: function (e) {
                this.appendSubview(new t({ tagName: this.options.itemTagName, className: this.options.itemClassName, template: this.options.itemTemplate, model: e }).renderOrAttach());
            },
        });
    }),
    (function (e) {
        e.fn.ajForm = function (t) {
            var i = {
                    mailerPath: "ajmailer/mail.php",
                    resultBoxId: "ajFormResults",
                    failMsg: "Не удалось отправить, попробуйте позже",
                    successMsg: "<h2>Спасибо!</h2><p>Сообщение успешно отправлено.</p>",
                    requiredMsg: "Пожалуйста, заполните обязательные поля",
                    wrongEmail: "Пожалуйста, укажите верный e-mail",
                    sendingMsg: "Отправка...",
                    failClass: "ajfail",
                    successClass: "ajsuccess",
                    requiredClass: "ajedit",
                    useAjax: 1,
                    debug: 0,
                    onFail: function () {},
                    onSuccess: function () {},
                    hideOnSuccess: 1,
                },
                s = e.extend({}, i, t);
            return this.each(function () {
                (form = e(this)),
                    (btnSend = form.find("input:submit")),
                    (btnName = btnSend.attr("value")),
                    s.useAjax
                        ? form.on("submit", function (t) {
                              (form = e(this)),
                                  (debugpre = "Form"),
                                  (debugpre += " with class " + form.attr("class")),
                                  (debugpre += ": "),
                                  s.debug && console.log(debugpre + "начало обработки"),
                                  s.debug && console.log("Данные формы: " + form.serialize()),
                                  btnSend.attr({ value: s.sendingMsg, disabled: "disabled" }).addClass("ajsending"),
                                  t.preventDefault();
                              var data = form.serialize();
                              var dataArray = form.serializeArray();
                              e
                                  .post(s.mailerPath, data)
                                  .done(function (t) {
                                      switch ((s.debug && console.log("Server respond: " + t), t)) {
                                          case "0":
                                              s.debug && console.log(debugpre + "ошибка php - " + t);
                                              break;
                                          case "1":
                                              e("#" + s.resultBoxId)
                                                  .removeClass()
                                                  .addClass(s.requiredClass)
                                                  .text(s.requiredMsg),
                                                  s.debug && console.log(debugpre + "возврат на редактирование, обязательные поля не заполнены");
                                              break;
                                          case "2":
                                              if (window.Comagic) {
                                                  var dataObj = {};
                                                  for (var i = 0; i < dataArray.length; i++) {
                                                      dataObj[dataArray[i]["name"]] = dataArray[i]["value"];
                                                  }
                                                  var comagicMessage = {
                                                      name: dataObj.fname ? dataObj.fname : "",
                                                      phone: dataObj.fphone ? dataObj.fphone : "",
                                                      email: dataObj.femail ? dataObj.femail : "",
                                                      message: dataObj.fmsg ? dataObj.fmsg : "",
                                                  };
                                                  window.Comagic.addOfflineRequest(comagicMessage);
                                              }
                                              s.onSuccess(),
                                                  e("#" + s.resultBoxId)
                                                      .removeClass()
                                                      .addClass(s.successClass)
                                                      .html(s.successMsg),
                                                  s.hideOnSuccess && form.hide(),
                                                  s.debug && console.log(debugpre + "письмо успешно отправлено");
                                              break;
                                          case "3":
                                              e("#" + s.resultBoxId)
                                                  .removeClass()
                                                  .addClass(s.requiredClass)
                                                  .text(s.wrongEmail),
                                                  s.debug && console.log(debugpre + "возврат на редактирование, e-mail указан не верно");
                                      }
                                  })
                                  .fail(function () {
                                      e("#" + s.resultBoxId)
                                          .removeClass()
                                          .addClass(s.failClass)
                                          .text(s.failMsg),
                                          s.debug && console.log(debugpre + "невозможно отправить форму");
                                  })
                                  .always(function () {
                                      e("#" + s.resultBoxId).fadeIn(), btnSend.attr({ value: btnName }).removeAttr("disabled").removeClass("ajsending");
                                  }),
                                  s.debug && console.log(debugpre + "обработка завершена");
                          })
                        : (-1 != location.href.indexOf("result=success")
                              ? (s.hideOnSuccess && form.hide(),
                                e("#" + s.resultBoxId)
                                    .removeClass()
                                    .addClass(s.successClass)
                                    .text(s.successMsg),
                                e("#" + s.resultBoxId).fadeIn())
                              : -1 != location.href.indexOf("result=fail") &&
                                (e("#" + s.resultBoxId)
                                    .removeClass()
                                    .addClass(s.failClass)
                                    .text(s.failMsg),
                                e("#" + s.resultBoxId).fadeIn()),
                          form.append('<input type="hidden" name="noajax" value="' + location.pathname + '">'),
                          form.attr("action", s.mailerPath));
            });
        };
    })(jQuery),
    define("Common/ajForms", function () {}),
    define("Form/Views/Main", ["Common/Abstract/View", "Common/ajForms"], function (e) {
        return e.extend({
            defaults: { data: "" },
            className: "form-container view__form",
            initialize: function () {
                _.bindAll(this), this.render();
            },
            postRender: function () {
                this.$("form").ajForm({ mailerPath: "js/libs/ajmailer/mail.php" });
            },
            template: function () {
                return (
                    '<div class="view__form-title">Обратный звонок</div><div class="view__form-desc">От представителя агентства элитной недвижимости, предоставившего наиболее полную информацию об этом объекте</div><div class="view__form-body"><div id="ajFormResults"></div><form action="" method="post"><input placeholder="Имя" type="text" name="fname" required="required"><input class="phone-mask" placeholder="Телефон" type="text" name="fphone" required="required"><input placeholder="E-mail" type="text" name="femail"><input type="hidden" value="' +
                    this.options.data +
                    '" name="fobjectID"><button>Отправить</button></form></div>'
                );
            },
        });
    }),
    (function (e) {
        var t = {},
            s = {
                mode: "horizontal",
                slideSelector: "",
                infiniteLoop: !0,
                hideControlOnEnd: !1,
                speed: 500,
                easing: null,
                slideMargin: 0,
                startSlide: 0,
                randomStart: !1,
                captions: !1,
                ticker: !1,
                tickerHover: !1,
                adaptiveHeight: !1,
                adaptiveHeightSpeed: 500,
                video: !1,
                useCSS: !0,
                preloadImages: "visible",
                responsive: !0,
                slideZIndex: 50,
                touchEnabled: !0,
                swipeThreshold: 50,
                oneToOneTouch: !0,
                preventDefaultSwipeX: !0,
                preventDefaultSwipeY: !1,
                pager: !0,
                pagerType: "full",
                pagerShortSeparator: " / ",
                pagerSelector: null,
                buildPager: null,
                pagerCustom: null,
                controls: !0,
                nextText: "Next",
                prevText: "Prev",
                nextSelector: null,
                prevSelector: null,
                autoControls: !1,
                startText: "Start",
                stopText: "Stop",
                autoControlsCombine: !1,
                autoControlsSelector: null,
                auto: !1,
                pause: 4e3,
                autoStart: !0,
                autoDirection: "next",
                autoHover: !1,
                autoDelay: 0,
                minSlides: 1,
                maxSlides: 1,
                moveSlides: 0,
                slideWidth: 0,
                onSliderLoad: function () {},
                onSlideBefore: function () {},
                onSlideAfter: function () {},
                onSlideNext: function () {},
                onSlidePrev: function () {},
                onSliderResize: function () {},
            };
        e.fn.bxSlider = function (n) {
            if (0 == this.length) return this;
            if (this.length > 1)
                return (
                    this.each(function () {
                        e(this).bxSlider(n);
                    }),
                    this
                );
            var a = {},
                o = this;
            t.el = this;
            var r = e(window).width(),
                l = e(window).height(),
                d = function () {
                    (a.settings = e.extend({}, s, n)),
                        (a.settings.slideWidth = parseInt(a.settings.slideWidth)),
                        (a.children = o.children(a.settings.slideSelector)),
                        a.children.length < a.settings.minSlides && (a.settings.minSlides = a.children.length),
                        a.children.length < a.settings.maxSlides && (a.settings.maxSlides = a.children.length),
                        a.settings.randomStart && (a.settings.startSlide = Math.floor(Math.random() * a.children.length)),
                        (a.active = { index: a.settings.startSlide }),
                        (a.carousel = a.settings.minSlides > 1 || a.settings.maxSlides > 1),
                        a.carousel && (a.settings.preloadImages = "all"),
                        (a.minThreshold = a.settings.minSlides * a.settings.slideWidth + (a.settings.minSlides - 1) * a.settings.slideMargin),
                        (a.maxThreshold = a.settings.maxSlides * a.settings.slideWidth + (a.settings.maxSlides - 1) * a.settings.slideMargin),
                        (a.working = !1),
                        (a.controls = {}),
                        (a.interval = null),
                        (a.animProp = "vertical" == a.settings.mode ? "top" : "left"),
                        (a.usingCSS =
                            a.settings.useCSS &&
                            "fade" != a.settings.mode &&
                            (function () {
                                var e = document.createElement("div"),
                                    t = ["WebkitPerspective", "MozPerspective", "OPerspective", "msPerspective"];
                                for (var i in t) if (void 0 !== e.style[t[i]]) return (a.cssPrefix = t[i].replace("Perspective", "").toLowerCase()), (a.animProp = "-" + a.cssPrefix + "-transform"), !0;
                                return !1;
                            })()),
                        "vertical" == a.settings.mode && (a.settings.maxSlides = a.settings.minSlides),
                        o.data("origStyle", o.attr("style")),
                        o.children(a.settings.slideSelector).each(function () {
                            e(this).data("origStyle", e(this).attr("style"));
                        }),
                        c();
                },
                c = function () {
                    o.wrap('<div class="bx-wrapper"><div class="bx-viewport"></div></div>'),
                        (a.viewport = o.parent()),
                        (a.loader = e('<div class="bx-loading" />')),
                        a.viewport.prepend(a.loader),
                        o.css({ width: "horizontal" == a.settings.mode ? 100 * a.children.length + 215 + "%" : "auto", position: "relative" }),
                        a.usingCSS && a.settings.easing ? o.css("-" + a.cssPrefix + "-transition-timing-function", a.settings.easing) : a.settings.easing || (a.settings.easing = "swing"),
                        f(),
                        a.viewport.css({ width: "100%", overflow: "hidden", position: "relative" }),
                        a.viewport.parent().css({ maxWidth: p() }),
                        a.settings.pager || a.viewport.parent().css({ margin: "0 auto 0px" }),
                        a.children.css({ float: "horizontal" == a.settings.mode ? "left" : "none", listStyle: "none", position: "relative" }),
                        a.children.css("width", v()),
                        "horizontal" == a.settings.mode && a.settings.slideMargin > 0 && a.children.css("marginRight", a.settings.slideMargin),
                        "vertical" == a.settings.mode && a.settings.slideMargin > 0 && a.children.css("marginBottom", a.settings.slideMargin),
                        "fade" == a.settings.mode && (a.children.css({ position: "absolute", zIndex: 0, display: "none" }), a.children.eq(a.settings.startSlide).css({ zIndex: a.settings.slideZIndex, display: "block" })),
                        (a.controls.el = e('<div class="bx-controls" />')),
                        a.settings.captions && _(),
                        (a.active.last = a.settings.startSlide == m() - 1),
                        a.settings.video && o.fitVids();
                    var t = a.children.eq(a.settings.startSlide);
                    "all" == a.settings.preloadImages && (t = a.children),
                        a.settings.ticker
                            ? (a.settings.pager = !1)
                            : (a.settings.pager && k(), a.settings.controls && C(), a.settings.auto && a.settings.autoControls && y(), (a.settings.controls || a.settings.autoControls || a.settings.pager) && a.viewport.after(a.controls.el)),
                        h(t, g);
                },
                h = function (t, i) {
                    var s = t.find("img, iframe").length;
                    if (0 != s) {
                        var n = 0;
                        t.find("img, iframe").each(function () {
                            e(this)
                                .one("load", function () {
                                    ++n == s && i();
                                })
                                .each(function () {
                                    this.complete && e(this).load();
                                });
                        });
                    } else i();
                },
                g = function () {
                    if (a.settings.infiniteLoop && "fade" != a.settings.mode && !a.settings.ticker) {
                        var t = "vertical" == a.settings.mode ? a.settings.minSlides : a.settings.maxSlides,
                            i = a.children.slice(0, t).clone().addClass("bx-clone"),
                            s = a.children.slice(-t).clone().addClass("bx-clone");
                        o.append(i).prepend(s);
                    }
                    a.loader.remove(),
                        b(),
                        "vertical" == a.settings.mode && (a.settings.adaptiveHeight = !0),
                        a.viewport.height(u()),
                        o.redrawSlider(),
                        a.settings.onSliderLoad(a.active.index),
                        (a.initialized = !0),
                        a.settings.responsive && e(window).bind("resize", B),
                        a.settings.auto && a.settings.autoStart && N(),
                        a.settings.ticker && R(),
                        a.settings.pager && P(a.settings.startSlide),
                        a.settings.controls && z(),
                        a.settings.touchEnabled && !a.settings.ticker && F();
                },
                u = function () {
                    var t = 0,
                        s = e();
                    if ("vertical" == a.settings.mode || a.settings.adaptiveHeight)
                        if (a.carousel) {
                            var n = 1 == a.settings.moveSlides ? a.active.index : a.active.index * x();
                            for (s = a.children.eq(n), i = 1; i <= a.settings.maxSlides - 1; i++) s = n + i >= a.children.length ? s.add(a.children.eq(i - 1)) : s.add(a.children.eq(n + i));
                        } else s = a.children.eq(a.active.index);
                    else s = a.children;
                    return (
                        "vertical" == a.settings.mode
                            ? (s.each(function () {
                                  t += e(this).outerHeight();
                              }),
                              a.settings.slideMargin > 0 && (t += a.settings.slideMargin * (a.settings.minSlides - 1)))
                            : (t = Math.max.apply(
                                  Math,
                                  s
                                      .map(function () {
                                          return e(this).outerHeight(!1);
                                      })
                                      .get()
                              )),
                        t
                    );
                },
                p = function () {
                    var e = "100%";
                    return a.settings.slideWidth > 0 && (e = "horizontal" == a.settings.mode ? a.settings.maxSlides * a.settings.slideWidth + (a.settings.maxSlides - 1) * a.settings.slideMargin : a.settings.slideWidth), e;
                },
                v = function () {
                    var e = a.settings.slideWidth,
                        t = a.viewport.width();
                    return (
                        0 == a.settings.slideWidth || (a.settings.slideWidth > t && !a.carousel) || "vertical" == a.settings.mode
                            ? (e = t)
                            : a.settings.maxSlides > 1 && "horizontal" == a.settings.mode && (t > a.maxThreshold || (t < a.minThreshold && (e = (t - a.settings.slideMargin * (a.settings.minSlides - 1)) / a.settings.minSlides))),
                        e
                    );
                },
                f = function () {
                    var e = 1;
                    if ("horizontal" == a.settings.mode && a.settings.slideWidth > 0)
                        if (a.viewport.width() < a.minThreshold) e = a.settings.minSlides;
                        else if (a.viewport.width() > a.maxThreshold) e = a.settings.maxSlides;
                        else {
                            var t = a.children.first().width();
                            e = Math.floor(a.viewport.width() / t);
                        }
                    else "vertical" == a.settings.mode && (e = a.settings.minSlides);
                    return e;
                },
                m = function () {
                    var e = 0;
                    if (a.settings.moveSlides > 0)
                        if (a.settings.infiniteLoop) e = a.children.length / x();
                        else for (var t = 0, i = 0; t < a.children.length; ) ++e, (t = i + f()), (i += a.settings.moveSlides <= f() ? a.settings.moveSlides : f());
                    else e = Math.ceil(a.children.length / f());
                    return e;
                },
                x = function () {
                    return a.settings.moveSlides > 0 && a.settings.moveSlides <= f() ? a.settings.moveSlides : f();
                },
                b = function () {
                    if (a.children.length > a.settings.maxSlides && a.active.last && !a.settings.infiniteLoop) {
                        if ("horizontal" == a.settings.mode) {
                            var e = a.children.last(),
                                t = e.position();
                            S(-(t.left - (a.viewport.width() - e.width())), "reset", 0);
                        } else if ("vertical" == a.settings.mode) {
                            var i = a.children.length - a.settings.minSlides,
                                t = a.children.eq(i).position();
                            S(-t.top, "reset", 0);
                        }
                    } else {
                        t = a.children.eq(a.active.index * x()).position();
                        a.active.index == m() - 1 && (a.active.last = !0), void 0 != t && ("horizontal" == a.settings.mode ? S(-t.left, "reset", 0) : "vertical" == a.settings.mode && S(-t.top, "reset", 0));
                    }
                },
                S = function (e, t, i, s) {
                    if (a.usingCSS) {
                        var n = "vertical" == a.settings.mode ? "translate3d(0, " + e + "px, 0)" : "translate3d(" + e + "px, 0, 0)";
                        o.css("-" + a.cssPrefix + "-transition-duration", i / 1e3 + "s"),
                            "slide" == t
                                ? (o.css(a.animProp, n),
                                  o.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function () {
                                      o.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"), j();
                                  }))
                                : "reset" == t
                                ? o.css(a.animProp, n)
                                : "ticker" == t &&
                                  (o.css("-" + a.cssPrefix + "-transition-timing-function", "linear"),
                                  o.css(a.animProp, n),
                                  o.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function () {
                                      o.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"), S(s.resetValue, "reset", 0), O();
                                  }));
                    } else {
                        var r = {};
                        (r[a.animProp] = e),
                            "slide" == t
                                ? o.animate(r, i, a.settings.easing, function () {
                                      j();
                                  })
                                : "reset" == t
                                ? o.css(a.animProp, e)
                                : "ticker" == t &&
                                  o.animate(r, speed, "linear", function () {
                                      S(s.resetValue, "reset", 0), O();
                                  });
                    }
                },
                w = function () {
                    for (var t = "", i = m(), s = 0; i > s; s++) {
                        var n = "";
                        a.settings.buildPager && e.isFunction(a.settings.buildPager) ? ((n = a.settings.buildPager(s)), a.pagerEl.addClass("bx-custom-pager")) : ((n = s + 1), a.pagerEl.addClass("bx-default-pager")),
                            (t += '<div class="bx-pager-item"><a href="" data-slide-index="' + s + '" class="bx-pager-link">' + n + "</a></div>");
                    }
                    a.pagerEl.html(t);
                },
                k = function () {
                    a.settings.pagerCustom
                        ? (a.pagerEl = e(a.settings.pagerCustom))
                        : ((a.pagerEl = e('<div class="bx-pager" />')), a.settings.pagerSelector ? e(a.settings.pagerSelector).html(a.pagerEl) : a.controls.el.addClass("bx-has-pager").append(a.pagerEl), w()),
                        a.pagerEl.on("click", "a", A);
                },
                C = function () {
                    (a.controls.next = e('<a class="bx-next" href="">' + a.settings.nextText + "</a>")),
                        (a.controls.prev = e('<a class="bx-prev" href="">' + a.settings.prevText + "</a>")),
                        a.controls.next.bind("click", M),
                        a.controls.prev.bind("click", T),
                        a.settings.nextSelector && e(a.settings.nextSelector).append(a.controls.next),
                        a.settings.prevSelector && e(a.settings.prevSelector).append(a.controls.prev),
                        a.settings.nextSelector ||
                            a.settings.prevSelector ||
                            ((a.controls.directionEl = e('<div class="bx-controls-direction" />')),
                            a.controls.directionEl.append(a.controls.prev).append(a.controls.next),
                            a.controls.el.addClass("bx-has-controls-direction").append(a.controls.directionEl));
                },
                y = function () {
                    (a.controls.start = e('<div class="bx-controls-auto-item"><a class="bx-start" href="">' + a.settings.startText + "</a></div>")),
                        (a.controls.stop = e('<div class="bx-controls-auto-item"><a class="bx-stop" href="">' + a.settings.stopText + "</a></div>")),
                        (a.controls.autoEl = e('<div class="bx-controls-auto" />')),
                        a.controls.autoEl.on("click", ".bx-start", I),
                        a.controls.autoEl.on("click", ".bx-stop", E),
                        a.settings.autoControlsCombine ? a.controls.autoEl.append(a.controls.start) : a.controls.autoEl.append(a.controls.start).append(a.controls.stop),
                        a.settings.autoControlsSelector ? e(a.settings.autoControlsSelector).html(a.controls.autoEl) : a.controls.el.addClass("bx-has-controls-auto").append(a.controls.autoEl),
                        q(a.settings.autoStart ? "stop" : "start");
                },
                _ = function () {
                    a.children.each(function () {
                        var t = e(this).find("img:first").attr("title");
                        void 0 != t && ("" + t).length && e(this).append('<div class="bx-caption"><span>' + t + "</span></div>");
                    });
                },
                M = function (e) {
                    a.settings.auto && o.stopAuto(), o.goToNextSlide(), e.preventDefault();
                },
                T = function (e) {
                    a.settings.auto && o.stopAuto(), o.goToPrevSlide(), e.preventDefault();
                },
                I = function (e) {
                    o.startAuto(), e.preventDefault();
                },
                E = function (e) {
                    o.stopAuto(), e.preventDefault();
                },
                A = function (t) {
                    a.settings.auto && o.stopAuto();
                    var i = e(t.currentTarget),
                        s = parseInt(i.attr("data-slide-index"));
                    s != a.active.index && o.goToSlide(s), t.preventDefault();
                },
                P = function (t) {
                    var i = a.children.length;
                    return "short" == a.settings.pagerType
                        ? (a.settings.maxSlides > 1 && (i = Math.ceil(a.children.length / a.settings.maxSlides)), void a.pagerEl.html(t + 1 + a.settings.pagerShortSeparator + i))
                        : (a.pagerEl.find("a").removeClass("active"),
                          void a.pagerEl.each(function (i, s) {
                              e(s).find("a").eq(t).addClass("active");
                          }));
                },
                j = function () {
                    if (a.settings.infiniteLoop) {
                        var e = "";
                        0 == a.active.index
                            ? (e = a.children.eq(0).position())
                            : a.active.index == m() - 1 && a.carousel
                            ? (e = a.children.eq((m() - 1) * x()).position())
                            : a.active.index == a.children.length - 1 && (e = a.children.eq(a.children.length - 1).position()),
                            e && ("horizontal" == a.settings.mode ? S(-e.left, "reset", 0) : "vertical" == a.settings.mode && S(-e.top, "reset", 0));
                    }
                    (a.working = !1), a.settings.onSlideAfter(a.children.eq(a.active.index), a.oldIndex, a.active.index);
                },
                q = function (e) {
                    a.settings.autoControlsCombine ? a.controls.autoEl.html(a.controls[e]) : (a.controls.autoEl.find("a").removeClass("active"), a.controls.autoEl.find("a:not(.bx-" + e + ")").addClass("active"));
                },
                z = function () {
                    1 == m()
                        ? (a.controls.prev.addClass("disabled"), a.controls.next.addClass("disabled"))
                        : !a.settings.infiniteLoop &&
                          a.settings.hideControlOnEnd &&
                          (0 == a.active.index
                              ? (a.controls.prev.addClass("disabled"), a.controls.next.removeClass("disabled"))
                              : a.active.index == m() - 1
                              ? (a.controls.next.addClass("disabled"), a.controls.prev.removeClass("disabled"))
                              : (a.controls.prev.removeClass("disabled"), a.controls.next.removeClass("disabled")));
                },
                N = function () {
                    a.settings.autoDelay > 0 ? setTimeout(o.startAuto, a.settings.autoDelay) : o.startAuto(),
                        a.settings.autoHover &&
                            o.hover(
                                function () {
                                    a.interval && (o.stopAuto(!0), (a.autoPaused = !0));
                                },
                                function () {
                                    a.autoPaused && (o.startAuto(!0), (a.autoPaused = null));
                                }
                            );
                },
                R = function () {
                    var t = 0;
                    if ("next" == a.settings.autoDirection) o.append(a.children.clone().addClass("bx-clone"));
                    else {
                        o.prepend(a.children.clone().addClass("bx-clone"));
                        var i = a.children.first().position();
                        t = "horizontal" == a.settings.mode ? -i.left : -i.top;
                    }
                    S(t, "reset", 0),
                        (a.settings.pager = !1),
                        (a.settings.controls = !1),
                        (a.settings.autoControls = !1),
                        a.settings.tickerHover &&
                            !a.usingCSS &&
                            a.viewport.hover(
                                function () {
                                    o.stop();
                                },
                                function () {
                                    var t = 0;
                                    a.children.each(function () {
                                        t += "horizontal" == a.settings.mode ? e(this).outerWidth(!0) : e(this).outerHeight(!0);
                                    });
                                    var i = a.settings.speed / t,
                                        s = "horizontal" == a.settings.mode ? "left" : "top",
                                        n = i * (t - Math.abs(parseInt(o.css(s))));
                                    O(n);
                                }
                            ),
                        O();
                },
                O = function (e) {
                    speed = e || a.settings.speed;
                    var t = { left: 0, top: 0 },
                        i = { left: 0, top: 0 };
                    "next" == a.settings.autoDirection ? (t = o.find(".bx-clone").first().position()) : (i = a.children.first().position());
                    var s = "horizontal" == a.settings.mode ? -t.left : -t.top,
                        n = { resetValue: "horizontal" == a.settings.mode ? -i.left : -i.top };
                    S(s, "ticker", speed, n);
                },
                F = function () {
                    (a.touch = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } }), a.viewport.bind("touchstart", $);
                },
                $ = function (e) {
                    if (a.working) e.preventDefault();
                    else {
                        a.touch.originalPos = o.position();
                        var t = e.originalEvent;
                        (a.touch.start.x = t.changedTouches[0].pageX), (a.touch.start.y = t.changedTouches[0].pageY), a.viewport.bind("touchmove", D), a.viewport.bind("touchend", V);
                    }
                },
                D = function (e) {
                    var t = e.originalEvent,
                        i = Math.abs(t.changedTouches[0].pageX - a.touch.start.x),
                        s = Math.abs(t.changedTouches[0].pageY - a.touch.start.y);
                    if ((3 * i > s && a.settings.preventDefaultSwipeX ? e.preventDefault() : 3 * s > i && a.settings.preventDefaultSwipeY && e.preventDefault(), "fade" != a.settings.mode && a.settings.oneToOneTouch)) {
                        var n = 0;
                        if ("horizontal" == a.settings.mode) {
                            o = t.changedTouches[0].pageX - a.touch.start.x;
                            n = a.touch.originalPos.left + o;
                        } else {
                            var o = t.changedTouches[0].pageY - a.touch.start.y;
                            n = a.touch.originalPos.top + o;
                        }
                        S(n, "reset", 0);
                    }
                },
                V = function (e) {
                    a.viewport.unbind("touchmove", D);
                    var t = e.originalEvent,
                        i = 0;
                    if (((a.touch.end.x = t.changedTouches[0].pageX), (a.touch.end.y = t.changedTouches[0].pageY), "fade" == a.settings.mode))
                        (s = Math.abs(a.touch.start.x - a.touch.end.x)) >= a.settings.swipeThreshold && (a.touch.start.x > a.touch.end.x ? o.goToNextSlide() : o.goToPrevSlide(), o.stopAuto());
                    else {
                        var s = 0;
                        "horizontal" == a.settings.mode ? ((s = a.touch.end.x - a.touch.start.x), (i = a.touch.originalPos.left)) : ((s = a.touch.end.y - a.touch.start.y), (i = a.touch.originalPos.top)),
                            !a.settings.infiniteLoop && ((0 == a.active.index && s > 0) || (a.active.last && 0 > s))
                                ? S(i, "reset", 200)
                                : Math.abs(s) >= a.settings.swipeThreshold
                                ? (0 > s ? o.goToNextSlide() : o.goToPrevSlide(), o.stopAuto())
                                : S(i, "reset", 200);
                    }
                    a.viewport.unbind("touchend", V);
                },
                B = function () {
                    var t = e(window).width(),
                        i = e(window).height();
                    (r != t || l != i) && ((r = t), (l = i), o.redrawSlider(), a.settings.onSliderResize.call(o, a.active.index));
                };
            return (
                (o.goToSlide = function (t, i) {
                    if (!a.working && a.active.index != t)
                        if (
                            ((a.working = !0),
                            (a.oldIndex = a.active.index),
                            (a.active.index = 0 > t ? m() - 1 : t >= m() ? 0 : t),
                            a.settings.onSlideBefore(a.children.eq(a.active.index), a.oldIndex, a.active.index),
                            "next" == i ? a.settings.onSlideNext(a.children.eq(a.active.index), a.oldIndex, a.active.index) : "prev" == i && a.settings.onSlidePrev(a.children.eq(a.active.index), a.oldIndex, a.active.index),
                            (a.active.last = a.active.index >= m() - 1),
                            a.settings.pager && P(a.active.index),
                            a.settings.controls && z(),
                            "fade" == a.settings.mode)
                        )
                            a.settings.adaptiveHeight && a.viewport.height() != u() && a.viewport.animate({ height: u() }, a.settings.adaptiveHeightSpeed),
                                a.children.filter(":visible").fadeOut(a.settings.speed).css({ zIndex: 0 }),
                                a.children
                                    .eq(a.active.index)
                                    .css("zIndex", a.settings.slideZIndex + 1)
                                    .fadeIn(a.settings.speed, function () {
                                        e(this).css("zIndex", a.settings.slideZIndex), j();
                                    });
                        else {
                            a.settings.adaptiveHeight && a.viewport.height() != u() && a.viewport.animate({ height: u() }, a.settings.adaptiveHeightSpeed);
                            var s = 0,
                                n = { left: 0, top: 0 };
                            if (!a.settings.infiniteLoop && a.carousel && a.active.last)
                                if ("horizontal" == a.settings.mode) (n = (d = a.children.eq(a.children.length - 1)).position()), (s = a.viewport.width() - d.outerWidth());
                                else {
                                    var r = a.children.length - a.settings.minSlides;
                                    n = a.children.eq(r).position();
                                }
                            else if (a.carousel && a.active.last && "prev" == i) {
                                var l = 1 == a.settings.moveSlides ? a.settings.maxSlides - x() : (m() - 1) * x() - (a.children.length - a.settings.maxSlides),
                                    d = o.children(".bx-clone").eq(l);
                                n = d.position();
                            } else if ("next" == i && 0 == a.active.index) (n = o.find(">.bx-clone").eq(a.settings.maxSlides).position()), (a.active.last = !1);
                            else if (t >= 0) {
                                var c = t * x();
                                n = a.children.eq(c).position();
                            }
                            if (void 0 !== n) {
                                var h = "horizontal" == a.settings.mode ? -(n.left - s) : -n.top;
                                S(h, "slide", a.settings.speed);
                            }
                        }
                }),
                (o.goToNextSlide = function () {
                    if (a.settings.infiniteLoop || !a.active.last) {
                        var e = parseInt(a.active.index) + 1;
                        o.goToSlide(e, "next");
                    }
                }),
                (o.goToPrevSlide = function () {
                    if (a.settings.infiniteLoop || 0 != a.active.index) {
                        var e = parseInt(a.active.index) - 1;
                        o.goToSlide(e, "prev");
                    }
                }),
                (o.startAuto = function (e) {
                    a.interval ||
                        ((a.interval = setInterval(function () {
                            "next" == a.settings.autoDirection ? o.goToNextSlide() : o.goToPrevSlide();
                        }, a.settings.pause)),
                        a.settings.autoControls && 1 != e && q("stop"));
                }),
                (o.stopAuto = function (e) {
                    a.interval && (clearInterval(a.interval), (a.interval = null), a.settings.autoControls && 1 != e && q("start"));
                }),
                (o.getCurrentSlide = function () {
                    return a.active.index;
                }),
                (o.getCurrentSlideElement = function () {
                    return a.children.eq(a.active.index);
                }),
                (o.getSlideCount = function () {
                    return a.children.length;
                }),
                (o.redrawSlider = function () {
                    a.children.add(o.find(".bx-clone")).outerWidth(v()),
                        a.viewport.css("height", u()),
                        a.settings.ticker || b(),
                        a.active.last && (a.active.index = m() - 1),
                        a.active.index >= m() && (a.active.last = !0),
                        a.settings.pager && !a.settings.pagerCustom && (w(), P(a.active.index));
                }),
                (o.destroySlider = function () {
                    a.initialized &&
                        ((a.initialized = !1),
                        e(".bx-clone", this).remove(),
                        a.children.each(function () {
                            void 0 != e(this).data("origStyle") ? e(this).attr("style", e(this).data("origStyle")) : e(this).removeAttr("style");
                        }),
                        void 0 != e(this).data("origStyle") ? this.attr("style", e(this).data("origStyle")) : e(this).removeAttr("style"),
                        e(this).unwrap().unwrap(),
                        a.controls.el && a.controls.el.remove(),
                        a.controls.next && a.controls.next.remove(),
                        a.controls.prev && a.controls.prev.remove(),
                        a.pagerEl && a.settings.controls && a.pagerEl.remove(),
                        e(".bx-caption", this).remove(),
                        a.controls.autoEl && a.controls.autoEl.remove(),
                        clearInterval(a.interval),
                        a.settings.responsive && e(window).unbind("resize", B));
                }),
                (o.reloadSlider = function (e) {
                    void 0 != e && (n = e), o.destroySlider(), d();
                }),
                d(),
                this
            );
        };
    })(jQuery),
    define("jquery.bxslider", ["jquery"], function () {}),
    (function (e) {
        "function" == typeof define && define.amd ? define("jquery.mask", ["jquery"], e) : "object" == typeof exports ? (module.exports = e(require("jquery"))) : e(jQuery || Zepto);
    })(function (e) {
        var t = function (t, i, s) {
            var n = {
                invalid: [],
                getCaret: function () {
                    try {
                        var e,
                            i = 0,
                            s = t.get(0),
                            a = document.selection,
                            o = s.selectionStart;
                        return a && -1 === navigator.appVersion.indexOf("MSIE 10") ? ((e = a.createRange()).moveStart("character", -n.val().length), (i = e.text.length)) : (o || "0" === o) && (i = o), i;
                    } catch (e) {}
                },
                setCaret: function (e) {
                    try {
                        if (t.is(":focus")) {
                            var i,
                                s = t.get(0);
                            s.setSelectionRange ? (s.focus(), s.setSelectionRange(e, e)) : ((i = s.createTextRange()).collapse(!0), i.moveEnd("character", e), i.moveStart("character", e), i.select());
                        }
                    } catch (e) {}
                },
                events: function () {
                    t.on("keydown.mask", function (e) {
                        t.data("mask-keycode", e.keyCode || e.which);
                    })
                        .on(e.jMaskGlobals.useInput ? "input.mask" : "keyup.mask", n.behaviour)
                        .on("paste.mask drop.mask", function () {
                            setTimeout(function () {
                                t.keydown().keyup();
                            }, 100);
                        })
                        .on("change.mask", function () {
                            t.data("changed", !0);
                        })
                        .on("blur.mask", function () {
                            r === n.val() || t.data("changed") || t.trigger("change"), t.data("changed", !1);
                        })
                        .on("blur.mask", function () {
                            r = n.val();
                        })
                        .on("focus.mask", function (t) {
                            !0 === s.selectOnFocus && e(t.target).select();
                        })
                        .on("focusout.mask", function () {
                            s.clearIfNotMatch && !a.test(n.val()) && n.val("");
                        });
                },
                getRegexMask: function () {
                    for (var e, t, s, n, a = [], r = 0; r < i.length; r++)
                        (e = o.translation[i.charAt(r)])
                            ? ((t = e.pattern.toString().replace(/.{1}$|^.{1}/g, "")), (s = e.optional), (e = e.recursive) ? (a.push(i.charAt(r)), (n = { digit: i.charAt(r), pattern: t })) : a.push(s || e ? t + "?" : t))
                            : a.push(i.charAt(r).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
                    return (a = a.join("")), n && (a = a.replace(new RegExp("(" + n.digit + "(.*" + n.digit + ")?)"), "($1)?").replace(new RegExp(n.digit, "g"), n.pattern)), new RegExp(a);
                },
                destroyEvents: function () {
                    t.off("input keydown keyup paste drop blur focusout ".split(" ").join(".mask "));
                },
                val: function (e) {
                    var i = t.is("input") ? "val" : "text";
                    return 0 < arguments.length ? (t[i]() !== e && t[i](e), (i = t)) : (i = t[i]()), i;
                },
                getMCharsBeforeCount: function (e, t) {
                    for (var s = 0, n = 0, a = i.length; n < a && n < e; n++) o.translation[i.charAt(n)] || ((e = t ? e + 1 : e), s++);
                    return s;
                },
                caretPos: function (e, t, s, a) {
                    return o.translation[i.charAt(Math.min(e - 1, i.length - 1))] ? Math.min(e + s - t - a, s) : n.caretPos(e + 1, t, s, a);
                },
                behaviour: function (i) {
                    (i = i || window.event), (n.invalid = []);
                    var s = t.data("mask-keycode");
                    if (-1 === e.inArray(s, o.byPassKeys)) {
                        var a = n.getCaret(),
                            r = n.val().length,
                            l = n.getMasked(),
                            d = l.length,
                            c = n.getMCharsBeforeCount(d - 1) - n.getMCharsBeforeCount(r - 1),
                            h = a < r;
                        return n.val(l), h && (8 !== s && 46 !== s && (a = n.caretPos(a, r, d, c)), n.setCaret(a)), n.callbacks(i);
                    }
                },
                getMasked: function (e, t) {
                    var a,
                        r,
                        l = [],
                        d = void 0 === t ? n.val() : t + "",
                        c = 0,
                        h = i.length,
                        g = 0,
                        u = d.length,
                        p = 1,
                        v = "push",
                        f = -1;
                    for (
                        s.reverse
                            ? ((v = "unshift"),
                              (p = -1),
                              (a = 0),
                              (c = h - 1),
                              (g = u - 1),
                              (r = function () {
                                  return -1 < c && -1 < g;
                              }))
                            : ((a = h - 1),
                              (r = function () {
                                  return c < h && g < u;
                              }));
                        r();

                    ) {
                        var m = i.charAt(c),
                            x = d.charAt(g),
                            b = o.translation[m];
                        b
                            ? (x.match(b.pattern)
                                  ? (l[v](x), b.recursive && (-1 === f ? (f = c) : c === a && (c = f - p), a === f && (c -= p)), (c += p))
                                  : b.optional
                                  ? ((c += p), (g -= p))
                                  : b.fallback
                                  ? (l[v](b.fallback), (c += p), (g -= p))
                                  : n.invalid.push({ p: g, v: x, e: b.pattern }),
                              (g += p))
                            : (e || l[v](m), x === m && (g += p), (c += p));
                    }
                    return (d = i.charAt(a)), h !== u + 1 || o.translation[d] || l.push(d), l.join("");
                },
                callbacks: function (e) {
                    var a = n.val(),
                        o = a !== r,
                        l = [a, e, t, s],
                        d = function (e, t, i) {
                            "function" == typeof s[e] && t && s[e].apply(this, i);
                        };
                    d("onChange", !0 === o, l), d("onKeyPress", !0 === o, l), d("onComplete", a.length === i.length, l), d("onInvalid", 0 < n.invalid.length, [a, e, t, n.invalid, s]);
                },
            };
            t = e(t);
            var a,
                o = this,
                r = n.val();
            (i = "function" == typeof i ? i(n.val(), void 0, t, s) : i),
                (o.mask = i),
                (o.options = s),
                (o.remove = function () {
                    var e = n.getCaret();
                    return n.destroyEvents(), n.val(o.getCleanVal()), n.setCaret(e - n.getMCharsBeforeCount(e)), t;
                }),
                (o.getCleanVal = function () {
                    return n.getMasked(!0);
                }),
                (o.getMaskedVal = function (e) {
                    return n.getMasked(!1, e);
                }),
                (o.init = function (i) {
                    (i = i || !1),
                        (s = s || {}),
                        (o.clearIfNotMatch = e.jMaskGlobals.clearIfNotMatch),
                        (o.byPassKeys = e.jMaskGlobals.byPassKeys),
                        (o.translation = e.extend({}, e.jMaskGlobals.translation, s.translation)),
                        (o = e.extend(!0, {}, o, s)),
                        (a = n.getRegexMask()),
                        !1 === i
                            ? (s.placeholder && t.attr("placeholder", s.placeholder),
                              t.data("mask") && t.attr("autocomplete", "off"),
                              n.destroyEvents(),
                              n.events(),
                              (i = n.getCaret()),
                              n.val(n.getMasked()),
                              n.setCaret(i + n.getMCharsBeforeCount(i, !0)))
                            : (n.events(), n.val(n.getMasked()));
                }),
                o.init(!t.is("input"));
        };
        e.maskWatchers = {};
        var i = function () {
                var i = e(this),
                    n = {},
                    a = i.attr("data-mask");
                if ((i.attr("data-mask-reverse") && (n.reverse = !0), i.attr("data-mask-clearifnotmatch") && (n.clearIfNotMatch = !0), "true" === i.attr("data-mask-selectonfocus") && (n.selectOnFocus = !0), s(i, a, n)))
                    return i.data("mask", new t(this, a, n));
            },
            s = function (t, i, s) {
                s = s || {};
                var n = e(t).data("mask"),
                    a = JSON.stringify;
                t = e(t).val() || e(t).text();
                try {
                    return "function" == typeof i && (i = i(t)), "object" != typeof n || a(n.options) !== a(s) || n.mask !== i;
                } catch (e) {}
            };
        (e.fn.mask = function (i, n) {
            n = n || {};
            var a = this.selector,
                o = (r = e.jMaskGlobals).watchInterval,
                r = n.watchInputs || r.watchInputs,
                l = function () {
                    if (s(this, i, n)) return e(this).data("mask", new t(this, i, n));
                };
            return (
                e(this).each(l),
                a &&
                    "" !== a &&
                    r &&
                    (clearInterval(e.maskWatchers[a]),
                    (e.maskWatchers[a] = setInterval(function () {
                        e(document).find(a).each(l);
                    }, o))),
                this
            );
        }),
            (e.fn.masked = function (e) {
                return this.data("mask").getMaskedVal(e);
            }),
            (e.fn.unmask = function () {
                return (
                    clearInterval(e.maskWatchers[this.selector]),
                    delete e.maskWatchers[this.selector],
                    this.each(function () {
                        var t = e(this).data("mask");
                        t && t.remove().removeData("mask");
                    })
                );
            }),
            (e.fn.cleanVal = function () {
                return this.data("mask").getCleanVal();
            }),
            (e.applyDataMask = function (t) {
                ((t = t || e.jMaskGlobals.maskElements) instanceof e ? t : e(t)).filter(e.jMaskGlobals.dataMaskAttr).each(i);
            });
        var n = {
            maskElements: "input,td,span,div",
            dataMaskAttr: "*[data-mask]",
            dataMask: !0,
            watchInterval: 300,
            watchInputs: !0,
            useInput: (function (e) {
                var t,
                    i = document.createElement("div");
                return (e = "on" + e), (t = e in i) || (i.setAttribute(e, "return;"), (t = "function" == typeof i[e])), t;
            })("input"),
            watchDataMask: !1,
            byPassKeys: [9, 16, 17, 18, 36, 37, 38, 39, 40, 91],
            translation: { 0: { pattern: /\d/ }, 9: { pattern: /\d/, optional: !0 }, "#": { pattern: /\d/, recursive: !0 }, A: { pattern: /[a-zA-Z0-9]/ }, S: { pattern: /[a-zA-Z]/ } },
        };
        (e.jMaskGlobals = e.jMaskGlobals || {}),
            (n = e.jMaskGlobals = e.extend(!0, {}, n, e.jMaskGlobals)).dataMask && e.applyDataMask(),
            setInterval(function () {
                e.jMaskGlobals.watchDataMask && e.applyDataMask();
            }, n.watchInterval);
    }),
    define("async", [], function () {
        function e(e) {
            var t, i;
            ((t = document.createElement("script")).type = "text/javascript"), (t.async = !0), (t.src = e), (i = document.getElementsByTagName("script")[0]).parentNode.insertBefore(t, i);
        }
        function t(e, t) {
            var i = /!(.+)/,
                n = e.replace(i, ""),
                a = i.test(e) ? e.replace(/.+!/, "") : s;
            return (n += n.indexOf("?") < 0 ? "?" : "&") + a + "=" + t;
        }
        function i() {
            return "__async_req_" + (n += 1) + "__";
        }
        var s = "callback",
            n = 0;
        return {
            load: function (s, n, a, o) {
                if (o.isBuild) a(null);
                else {
                    var r = i();
                    (window[r] = a), e(t(n.toUrl(s), r));
                }
            },
        };
    }),
    define("Object/Views/Main", [
        "Common/Abstract/View",
        "Catalog/Collection",
        "Catalog/Views/List",
        "Form/Views/Main",
        "bootstrap",
        "jquery.bxslider",
        "jquery.mask",
        "async!http://maps.google.com/maps/api/js?key=AIzaSyA3M1rIN8e8jm8YXg2gdueDYTcckjoiWNQ",
    ], function (e, t, i, s) {
        return e.extend({
            className: "object",
            template: "Object/Main",
            initialize: function () {
                this.query = _.uri2obj(window.location.search);
                if ((_.bindAll(this), (this.collection = App.Catalog.Collection.clone()), (this.model = this.collection.findWhere({ idx: this.options.id })), void 0 === this.model)) return App.Router.page404();
                var e;
                Modernizr.localstorage && (e = localStorage.getItem("last_seen")),
                    (this.lastSeen = e ? $.parseJSON(e) : []),
                    this.listenTo(App.Events, "change:currency", this._onChangeCurrency),
                    this.listenToOnce(this, "ready", this.hideLoader);
                var t = this.getTemplateData(); /**this.title = "Rublevka Riga | " + t.type_name[0]*/
            },
            events: { "click .favorite_btn": "addToFavorites" },
            _onChangeCurrency: function () {
                var e = this.getTemplateData();
                this.$(".view__big-price .currency").html(CURRENCY), this.$(".view__big-price .price").html(e.Price);
            },
            getFavorites: function () {
                var e;
                Modernizr.localstorage && (e = localStorage.getItem("favorites")), (this.favorites = e ? $.parseJSON(e) : []);
            },
            getTemplateData: function () {
                if (!this.model) return {};
                var e = this.model.toJSON();
                switch (((e.type = (+e.flag_forest ? "лесной " : "") + (+e.flag_water ? "у воды" : "")), (e.lastSeen = this.lastSeen.length), e.type_object)) {
                    case "house":
                        e.type_name = ["Дом", "Дома"];
                        break;
                    case "land":
                        e.type_name = ["Участок", "Участки"];
                        break;
                    case "townh":
                        e.type_name = ["Таунхаус", "Таунхаусы"];
                        break;
                    case "flat":
                        e.type_name = ["Квартира", "Квартиры"];
                        break;
                    default:
                        e.type_name = "";
                }
                e.poselok_idx = null;
                var t = App.Villages.Collection.find(function (t) {
                    return t.get("name") === e.poselok;
                });
                (e.queryName = _.translit(t.get("name")).replace(/ +/g, "_").toLowerCase()), t && (e.poselok_idx = t.get("idx"));
                e.queryName = e.queryName.replace(/-/g, "_");
                var rent = "",
                    rentPer = "";
                if ((this.query && "1" === this.query.rent && +e.rent) || (+e.rent && !+e.sale)) {
                    rent = "Rent";
                    rentPer = " в мес.";
                }
                return (e.Price = e["price" + rent + "In" + CURRENCY]), (e.Price = e.Price ? e.Price.split(/(?=(?:\d{3})+$)/).join(" ") + rentPer : null), e;
            },
            preRender: function () {
                this.village = this.model != undefined ? this.model.get("poselok") : null;
            },
            postRender: function () {
                if (this.model) {
                    var bxGall = App.ContainerView.initBigSlider();
                    this.village = this.model.get("poselok");
                    var e = this,
                        t = [];
                    _.each(this.lastSeen, function (i) {
                        t.push(e.collection.findWhere({ idx: i }));
                    });
                    var n = _.after(3, function () {
                            setTimeout(function () {
                                App.ContainerView.resize();
                            }, 500);
                        }),
                        a = new i({ tagName: "ul", className: "view__sliders-slider", itemClassName: "col-lg-12", collection: this.collection.where({ poselok: this.village }), shuffle: !0, first: 6 });
                    this.listenToOnce(a, "ready", n), this.appendSubview(a.renderOrAttach(), this.$(".view__sliders .row:eq(0)"));
                    var o = this.getDataLike();
                    if (o.length) {
                        var r = new i({ tagName: "ul", className: "view__sliders-slider", itemClassName: "col-lg-12", collection: o });
                        this.listenToOnce(r, "ready", n), this.appendSubview(r.renderOrAttach(), this.$(".view__sliders .row:eq(1)"));
                    } else this.$("section.like").hide(), n();
                    var l = new i({ tagName: "ul", className: "view__sliders-slider", itemClassName: "col-lg-12", collection: t, first: 6 });
                    this.listenToOnce(l, "ready", n),
                        this.appendSubview(l.renderOrAttach(), this.$(".view__sliders .row:eq(2)")),
                        this.$(".bx-viewport").prepend('<span id="slider__btn-prev" data-slider="up">'),
                        this.$(".bx-viewport").prepend('<span id="slider__btn-next" data-slider="down">');
                    var d = +this.model.get("lat"),
                        c = +this.model.get("lng"),
                        h = +this.model.get("zoom");
                    App.ContainerView.initMap("map", d, c, h), App.ContainerView.initMap("map2", d, c, h), Modernizr.localstorage && this._setLastSeen();
                    var g = new s({ data: "http://www.rublevkariga.ru/catalog/" + this.options.id });
                    this.appendSubview(g, this.$(".scroll-form")), this._reloadFormPos(), this._checkFavorite(), $(window).on("scroll.form", this._reloadFormPos), $(window).on("resize.form", this._onResize);
                }
            },
            getDataLike: function () {
                var e = this,
                    t = +this.model.get("house_area"),
                    i = +this.model.get("land_area"),
                    s = +this.model.get("km_rublevka"),
                    n = +this.model.get("km_riga"),
                    a = +this.model.get("priceInRUB"),
                    o = +this.model.get("priceRentInRUB"),
                    r = this.model.get("type_object"),
                    l = +this.model.get("rent");
                return _.chain(this.collection.models)
                    .shuffle()
                    .filter(function (d) {
                        var c,
                            h,
                            g = !0,
                            u = !0,
                            p = l === +d.get("rent");
                        if ("land" === r) {
                            var v = i + 0.3 * i,
                                f = i - 0.3 * i;
                            f < 0 && (f = 0), (g = +d.get("land_area") > f && +d.get("land_area") < v);
                        } else {
                            var m = t + 0.3 * t,
                                x = t - 0.3 * t;
                            x < 0 && (x = 0), (u = +d.get("house_area") > x && +d.get("house_area") < m);
                        }
                        if (((c = "land" === r ? "land" === d.get("type_object") : "flat" === r ? "flat" === d.get("type_object") : "flat" !== d.get("type_object") && "land" !== d.get("type_object")), s)) {
                            var b = parseInt(s + 3),
                                S = parseInt(s - 3);
                            S < 0 && (S = 0), d.get("km_rublevka") > S && d.get("km_rublevka") < b;
                        }
                        if (n) {
                            var w = parseInt(n + 3),
                                k = parseInt(n - 3);
                            k < 0 && (k = 0), d.get("km_riga") > k && d.get("km_riga") < w;
                        }
                        if (l && o) {
                            var C = parseInt(o + 0.2 * o),
                                y = parseInt(o - 0.2 * o);
                            y < 0 && (y = 0), (h = +d.get("priceRentInRUB") > y && +d.get("priceRentInRUB") < C);
                        } else if (a) {
                            var _ = parseInt(a + 0.2 * a),
                                M = parseInt(a - 0.2 * a);
                            M < 0 && (M = 0), (h = +d.get("priceInRUB") > M && +d.get("priceInRUB") < _);
                        }
                        return +e.model.get("idx") != +d.get("idx") && p && c && g && u && h;
                    })
                    .sortBy(function (t) {
                        return +t.get("flag_condition") * (+e.model.get("flag_condition") ? -1 : 1);
                    })
                    .value();
            },
            _checkFavorite: function () {
                this.getFavorites();
                var e = _.include(this.favorites, this.model.get("idx"));
                this.addToFavorites(e);
            },
            addToFavorites: function (e) {
                if (!_.isObject(e))
                    return (
                        !0 === e
                            ? (this.$(".favorite_btn").addClass("diactive"), this.$(".favorite_btn span").html("В избранном"))
                            : (this.$(".favorite_btn").removeClass("diactive"), this.$(".favorite_btn span").html("Добавить в избранное")),
                        !1
                    );
                this.getFavorites();
                var t = this.model.get("idx"),
                    i = $(e.currentTarget),
                    s = i.hasClass("diactive"),
                    n = i.find("span");
                return (
                    i.toggleClass("diactive"),
                    s ? (n.html("Добавить в избранное"), (this.favorites = _.without(this.favorites, t))) : (n.html("В избранном"), this.favorites.unshift(t)),
                    localStorage.setItem("favorites", $.toJSON(_.uniq(this.favorites))),
                    App.ContainerView.checkFavorites(),
                    !1
                );
            },
            _setLastSeen: function () {
                this.lastSeen.unshift(this.options.id), localStorage.setItem("last_seen", $.toJSON(_.uniq(this.lastSeen).slice(0, 5)));
            },
            hideLoader: function () {
                App.ContainerView.HideLoader();
            },
            _reloadFormPos: function () {
                App.ContainerView.reloadFormPos(this.$el);
            },
            _onResize: function () {
                this._reloadFormPos(), App.ContainerView.resize();
            },
            onClose: function () {
                $(window).off(".form");
            },
        });
    }),
    define("Object/App", ["Object/Views/Main"], function (e) {
        return function (t, i) {
            App.ContainerView.ShowLoader().ScrollUp();
            var s = new e({ id: i });
            if (s.query.rent != undefined && s.query.rent == 1) App.ContainerView.MainMenuItemClick("/catalog/?rent=1");
            else App.ContainerView.MainMenuItemClick("/catalog/?type_object=" + s.model.attributes.type_object);
            t.show(s);
        };
    });
