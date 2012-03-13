var ModalEditor, Notifier, Template, Term, Terms, initializeDetail;

Template = {
  termline: ""
};

Term = Backbone.Model.extend({
  parent: null,
  idAttribute: "_id",
  url: function() {
    var _ref;
    return "/term/" + ((_ref = this.id) != null ? _ref : this.id = "");
  },
  monkey: true,
  selected: false,
  createItem: function(append) {
    var _this = this;
    if (append == null) append = true;
    this.link = $(Template.termline({
      term: this.get("term")
    }));
    if (append) {
      $("#searchlines").append(this.link);
    } else {
      $("#searchlines").prepend(this.link);
    }
    this.link.click(function() {
      return _this.select();
    });
    if (this === this.collection.at(0)) this.select();
    return this.link.popover({
      title: function() {
        return _this.get("term");
      },
      content: function() {
        return _this.get("etym").upTo(400);
      },
      delay: {
        show: 400,
        hide: 50
      }
    });
  },
  select: function() {
    this.collection.deselect();
    this.link.addClass("sel");
    this.selected = true;
    this.collection.selectedItem = this;
    return this.detailDisplay();
  },
  deselect: function() {
    this.link.removeClass("sel");
    return this.selected = false;
  },
  detailDisplay: function() {
    var _this = this;
    $("#termdetail h1").html(this.get("term"));
    $("#termdetail .updated").html("Last Updated at " + dateFormat(this.get("last_updated"))).show();
    $("#termdetail .detailedinfo").html("<b>" + (this.get("term_suffix") || "") + "</b> " + this.get("etym"));
    $("#navarea, #buttonarea").show();
    $("#editbtn").unbind("click").click(function() {
      return _this.formDisplay();
    });
    return $("#deletebtn").unbind("click").click(function() {
      var collection;
      if (window.confirm("Are you sure you want to Delete this Term?... This cannot be undone")) {
        collection = _this.collection;
        return _this.destroy({
          success: function(model) {
            model.link.remove();
            model.deselect();
            if (collection.at(0) != null) collection.at(0).select();
            Notifier.msg("Deletion", "your term <b>" + (model.get("term")) + "</b> as been deleted");
            if (collection.length === 0) return initializeDetail();
          }
        });
      }
    });
  },
  formDisplay: function() {
    return ModalEditor.editor(this);
  }
});

Terms = Backbone.Collection.extend({
  searchTerm: "",
  url: function() {
    return "/terms/" + this.searchTerm;
  },
  model: Term,
  selectedItem: null,
  search: function(term) {
    this.searchTerm = term;
    return this.fetch();
  },
  deselect: function() {
    if (this.selectedItem != null) return this.selectedItem.deselect();
  }
});

$(function() {
  var nav, search, termSearch, terms;
  Template.termline = Handlebars.compile($("#termline").html());
  terms = new Terms;
  search = new Input({
    el: ".searchinput"
  });
  termSearch = function() {
    Notifier.hide();
    if (search.length() === 0) {
      initializeDetail();
      return $("#searchlines").empty();
    } else {
      return terms.search(search.thisVal());
    }
  };
  search.on("enter", termSearch);
  $("#searchbtn").click(termSearch);
  terms.on("reset", function() {
    $("#searchlines").empty();
    if (this.length === 0) {
      Notifier.msg("Search", "your search returned no results.  try again.");
      return initializeDetail();
    } else {
      return this.each(function(model) {
        return model.createItem();
      });
    }
  });
  nav = function(dir) {
    var selindex;
    if (terms.selectedItem != null) {
      selindex = terms.indexOf(terms.selectedItem);
      if (dir === "next" && selindex < terms.length - 1) {
        terms.at(selindex + 1).select();
      }
      if (dir === "prev" && selindex > 0) return terms.at(selindex - 1).select();
    }
  };
  search.on("keyup", function(args) {
    var selindex;
    if (terms.selectedItem != null) {
      selindex = terms.indexOf(terms.selectedItem);
      if (args.keyCode === 40) nav("next");
      if (args.keyCode === 38) return nav("prev");
    }
  });
  $("#modalform").modal({
    show: false
  });
  $("#prevbtn").tooltip({
    title: "Click here to view the previous term"
  });
  $("#prevbtn").click(function() {
    $(this).tooltip('hide');
    return nav("prev");
  });
  $("#nextbtn").tooltip({
    title: "Click here to view the next term"
  });
  $("#nextbtn").click(function() {
    $(this).tooltip('hide');
    return nav("next");
  });
  $("#notifier .hideme").click(function() {
    return Notifier.hide();
  });
  $("#cancelbtn").click(ModalEditor.hide);
  $("#savebtn").click(function() {
    return ModalEditor.save();
  });
  $("#createbtn").click(function() {
    return ModalEditor.create(terms);
  });
  return initializeDetail();
});

Notifier = {
  timer: null,
  show: function() {
    return $("#notifier").slideDown(500);
  },
  hide: function() {
    clearTimeout(Notifier.timer);
    return $("#notifier").slideUp(300);
  },
  msg: function(type, msg) {
    $("#notifier .type").html(type);
    $("#notifier .msg").html(msg);
    this.show();
    return Notifier.timer = setTimeout(this.hide, 4500);
  }
};

initializeDetail = function() {
  $("#termdetail h1").html("etymonline.com administration panel");
  $("#termdetail .updated").hide();
  $("#termdetail .detailedinfo").html("Search for a term on the left or create a new term by clicking on the bottom above.");
  return $("#navarea, #buttonarea").hide();
};

ModalEditor = {
  model: null,
  terms: null,
  show: function() {
    return $('#modalform').modal('show');
  },
  hide: function() {
    return $('#modalform').modal('hide');
  },
  title: function(new_title) {
    return $("#modalform h3").html(new_title);
  },
  editor: function(model) {
    this.model = model;
    this.title("edit term | " + (this.model.get("term")));
    $("#modalform [name='term']").val(this.model.get("term")).focus();
    $("#modalform [name='term_suffix']").val(this.model.get("term_suffix"));
    $("#modalform [name='etym']").val(this.model.get("etym"));
    return this.show();
  },
  create: function(terms) {
    this.terms = terms;
    this.model = new Term();
    this.title("new term");
    $("#modalform [name='term']").val("").focus();
    $("#modalform [name='term_suffix']").val("");
    $("#modalform [name='etym']").val("");
    return this.show();
  },
  save: function() {
    var newdata;
    newdata = {
      term: $.trim($("#modalform [name='term']").val()),
      term_suffix: $.trim($("#modalform [name='term_suffix']").val()),
      etym: $.trim($("#modalform [name='etym']").val()),
      last_updated: new Date()
    };
    if (this.model.isNew()) {
      return this.model.save(newdata, {
        success: function(model, data) {
          ModalEditor.terms.add(model, {
            at: 0
          });
          model.set(data);
          model.createItem(false);
          model.select();
          ModalEditor.hide();
          return Notifier.msg("Creation", "your new term <b>" + (model.get("term")) + "</b> as been created");
        }
      });
    } else {
      this.model.save(newdata);
      this.model.detailDisplay();
      this.model.link.find("a").html(newdata.term);
      this.hide();
      return Notifier.msg("Edit", "your term <b>" + (this.model.get("term")) + "</b> as been edited");
    }
  }
};
