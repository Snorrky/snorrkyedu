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
                o = i.find("span");
            return (
                i.toggleClass("diactive"),
                s ? (o.html("Добавить в избранное"), (this.favorites = _.without(this.favorites, t))) : (o.html("В избранном"), this.favorites.unshift(t)),
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
                    '<div class="view__form-title">Обратный звонок</div><div class="view__form-desc"></div><div class="view__form-body">\t<div id="ajFormResults"></div><form action="" method="post"><input placeholder="Имя" type="text" name="fname" required="required"><input class="phone-mask" placeholder="Телефон" type="text" name="fphone" required="required"><input placeholder="E-mail" type="text" name="femail"><input type="hidden" value="' +
                    this.options.data +
                    '" name="fobjectID"><button>Отправить</button></form></div>'
                );
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
    define("Pagination/Views/Main", ["Common/Abstract/View"], function (e) {
        return e.extend({
            defaults: { currentPage: 1, perPage: 10, direction: "scrollDown", reverse: !1, hidden: !1 },
            className: "pagination",
            events: { "click #showMore": "showMore" },
            initialize: function () {
                _.bindAll(this),
                    (this.currentPage = parseInt(this.options.currentPage) || 1),
                    "infinity" == this.options.type && this.listenTo(App.ContainerView, this.options.direction || "scrollDown", this.showMore),
                    this.$el.removeClass("standard showMore infinity").addClass(this.options.type);
            },
            fetchCollection: function () {
                this.collection.hasMore = !0;
                var e = this.getCurrentPage() - 1,
                    t = this.options.collection,
                    i = _.isUndefined(t.models) ? t : t.models;
                return (i = _.rest(i, this.options.perPage * e)), (i = _.first(i, this.options.perPage)), this.options.perPage > i.length && (this.collection.hasMore = !1), this.render(), i;
            },
            postRender: function () {
                return this.$el.empty(), "showMore" === this.options.type && this.renderShowMore(), !0 === this.options.hidden && this.$el.css("opacity", 0), this;
            },
            showMore: function (e) {
                (this.currentPage += !0 === this.options.reverse ? -1 : 1), this.trigger(this.options.type, { page: this.currentPage });
            },
            getCurrentPage: function () {
                return this.currentPage;
            },
            renderShowMore: function () {
                this.collection.hasMore ? (this.$el.append(this.showMoreButtonTemplate()), this.$el.show()) : this.$el.hide();
            },
            showMoreButtonTemplate: function () {
                return '<a id="showMore" class="show-more">Показать еще</a>';
            },
        });
    }),
    define("jquery.bxslider", ["jquery"], function () {}),
    define("async", [], function () {
        function t(t) {
            var e, i;
            (e = document.createElement("script")), (e.type = "text/javascript"), (e.async = !0), (e.src = t), (i = document.getElementsByTagName("script")[0]), i.parentNode.insertBefore(e, i);
        }
        function e(t, e) {
            var i = /!(.+)/,
                n = t.replace(i, ""),
                r = i.test(t) ? t.replace(/.+!/, "") : s;
            return (n += n.indexOf("?") < 0 ? "?" : "&"), n + r + "=" + e;
        }
        function i() {
            return (n += 1), "__async_req_" + n + "__";
        }
        var s = "callback",
            n = 0;
        return {
            load: function (s, n, r, o) {
                if (o.isBuild) r(null);
                else {
                    var a = i();
                    (window[a] = r), t(e(n.toUrl(s), a));
                }
            },
        };
    }),
    define("Master/Views/Main", ["Common/Abstract/View", "Catalog/Collection", "Catalog/Views/List", "Pagination/Views/Main", "Form/Views/Main", "jquery.bxslider"], function (e, t, i, s, p) {
        return e.extend({
            title: "Элитная недвижимость на Рублево-Успенском и Новорижском шоссе",
            description: "Элитные коттеджные поселки, продажа и аренда домов, таунхаусов и квартир на Рублево-Успенском и Новорижском шоссе",
            className: "master",
            template: "Master",
            events: { "click .mobile-btn-sort": "_showSort" },
            initialize: function () {},
            postRender: function () {
                var e = _.shuffle(App.Villages.Collection.where({ spec: "1" }));
                e && e[0] && e[0].set("queryName", _.translit(e[0].get("name")).replace(/ +/g, "_").toLowerCase()),
                    e && e[0] && this.$("#cont-md-dev .items").append(_.template(this.specialVillageTemplate(), e[0].toJSON())),
                    this._makePagination(),
                    this.listenTo(this.pagination, "showMore pagination infinity", this._addModels);
                var t = this.pagination.fetchCollection();
                var g = new p({ data: "http://www.rublevkariga.ru/" });
                /*var bxGall = App.ContainerView.initBigSlider();*/ return t.length
                    ? ((this.catalog = new i({ collection: t })),
                      this.listenToOnce(this.catalog, "ready", this.hideLoader),
                      this.appendSubview(this.catalog.render(), this.$("#cont-md-dev .items")),
                      void this.appendSubview(g, this.$(".scroll-form-main")),
                      void this.appendSubview(this.pagination.render(), this.$("#cont-md-dev .items")))
                    : void this.hideLoader();
            },
            specialVillageTemplate: function () {
                return '<div class="row"><div class="items__big-item-pdng-none col-xs-12"><div class="items__big-item with_bg"><a href="poselki/<%= queryName %>"><div class="items__big-item-text-wrap"><div class="items__big-item__title"><%= spec_title %></div><p class="items__big-item__desc"><%= spec_text %></p></div><img class="hidden-xs img-responsive" src="images/poselki/specials/<%= idx %>/1.jpg" alt=""></a></div></div></div>';
            },
            _addModels: function () {
                var e = this.pagination.fetchCollection();
                _.each(e, this.catalog.renderItem);
            },
            _makePagination: function () {
                var e = App.Catalog.Collection.where({ spec: "1" });
                this.pagination = new s({ collection: e, perPage: 9, type: "showMore", hidden: !0 });
            },
            _showSort: function (e) {
                return this.$(".mobile-sort").fadeToggle(), !1;
            },
            hideLoader: function () {
                var e = this;
                $(window).on("scroll.pagination", function () {
                    var t = e.$("#showMore");
                    if (t.length) {
                        var i = t.offset().top - $(window).height();
                        $(this).scrollTop() > i - 1200 && e.pagination.showMore();
                    }
                }),
                    App.ContainerView.HideLoader();
            },
            onClose: function () {
                $(window).off(".form");
                $(window).off("scroll.pagination");
            },
        });
    }),
    define("Master/App", ["Master/Views/Main"], function (e) {
        return function (t) {
            App.ContainerView.ShowLoader().ScrollUp();
            var i = new e();
            t.show(i);
        };
    });
