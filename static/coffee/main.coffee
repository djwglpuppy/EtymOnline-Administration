Term = Backbone.Model.extend
	parent: null
	idAttribute: "_id"
	url: -> "/term/" + @id?= ""
	monkey: true
	selected: false

	createItem: (append = true) ->
		@link = $(document.createElement("li"))
		@link.html("<a href='#'>#{@get("term")}</a>")
		if append
			$("ul").append(@link)
		else
			$("ul").prepend(@link)

		@link.click => @select() 		
		@select() if @ is @collection.at(0)
		@link.popover
			title: => @get("term")
			content: => @get("etym").upTo(400)
			delay:
				show: 400
				hide: 50	

	select: ->
		@collection.deselect()
		@link.addClass("active")
		@selected = true
		@collection.selectedItem = this
		@detailDisplay()

	deselect: ->
		@link.removeClass("active")
		@selected = false
	
	detailDisplay: ->
		$("#termdetail h1").html(@get("term"))
		$("#termdetail .updated").html("Last Updated at " + dateFormat(@get("last_updated"))).show()
		$("#termdetail .detailedinfo").html("<b>" + (@get("term_suffix") or "") + "</b> " + @get("etym"))
		$("#navarea, #buttonarea").show()
		
		$("#editbtn").unbind("click").click => @formDisplay()
		
		$("#deletebtn").unbind("click").click =>
			if window.confirm("Are you sure you want to Delete this Term?... This cannot be undone")
				collection = @collection
				@destroy
					success: (model) ->
						model.link.remove()
						model.deselect()
						collection.at(0).select() if collection.at(0)?
						Notifier.msg("Deletion", "your term <b>#{model.get("term")}</b> as been deleted")		
						initializeDetail() if collection.length is 0

	formDisplay: -> ModalEditor.editor(@)


Terms = Backbone.Collection.extend
	searchTerm: ""
	url: -> "/terms/#{@searchTerm}"
	model: Term	
	selectedItem: null
	search: (term) ->
		@searchTerm = term
		@fetch()

	deselect: ->
		@selectedItem.deselect() if @selectedItem?


$ ->
	terms = new Terms
	search = new Input {el:".searchinput"}
	
	termSearch = ->
		Notifier.hide()
		if search.length() is 0
			initializeDetail()
			$("ul").empty()
		else
			terms.search(search.thisVal())
	
	search.on("enter", termSearch)
	$("#searchbtn").click(termSearch)
	
	terms.on "reset", -> 
		$("ul").empty()
		if @length is 0
			Notifier.msg("Search", "your search returned no results.  try again.")
			initializeDetail()
		else
			@each (model) -> model.createItem()

	
	nav = (dir) ->
		if terms.selectedItem?
			selindex = terms.indexOf(terms.selectedItem) 
			terms.at(selindex + 1).select() if dir is "next" and selindex < terms.length - 1
			terms.at(selindex - 1).select() if dir is "prev" and selindex > 0
	
	search.on "keyup", (args) ->
		if terms.selectedItem?
			selindex = terms.indexOf(terms.selectedItem) 
			nav("next") if args.keyCode is 40
			nav("prev") if args.keyCode is 38
	
	$("#modalform").modal({show: false})
	
	$("#prevbtn").tooltip
		title: "Click here to view the previous term"
	
	$("#prevbtn").click ->
		$(this).tooltip('hide')
		nav("prev")
	
	$("#nextbtn").tooltip
		title: "Click here to view the next term"
	
	$("#nextbtn").click ->
		$(this).tooltip('hide')
		nav("next")
		
	
	#initilizers
	$("#notifier .hideme").click -> Notifier.hide()
	$("#cancelbtn").click(ModalEditor.hide)
	$("#savebtn").click -> ModalEditor.save()
	$("#createbtn").click -> ModalEditor.create(terms)
	initializeDetail()
	

Notifier =
	timer: null
	show: -> $("#notifier").slideDown(500) 
	hide: -> 
		clearTimeout(Notifier.timer)
		$("#notifier").slideUp(300) 
	msg: (type, msg) ->
		$("#notifier .type").html(type)
		$("#notifier .msg").html(msg)
		@show()
		Notifier.timer = setTimeout(@hide, 4500)

initializeDetail = ->
	$("#termdetail h1").html("etymonline.com administration panel")
	$("#termdetail .updated").hide()
	$("#termdetail .detailedinfo").html("Search for a term on the left or create a new term by clicking on the bottom above.")
	$("#navarea, #buttonarea").hide()


ModalEditor = 
	model: null
	terms: null
	show: -> $('#modalform').modal('show')
	hide: -> $('#modalform').modal('hide')
	title: (new_title) -> $("#modalform h3").html(new_title)
	
	editor: (model) ->
		@model = model
		@title("edit term | #{@model.get("term")}")
		$("#modalform [name='term']").val(@model.get("term")).focus()
		$("#modalform [name='term_suffix']").val(@model.get("term_suffix"))
		$("#modalform [name='etym']").val(@model.get("etym"))
		@show()
	
	create: (terms) -> 
		@terms = terms
		@model = new Term()
		@title("new term")
		$("#modalform [name='term']").val("").focus()
		$("#modalform [name='term_suffix']").val("")
		$("#modalform [name='etym']").val("")
		@show()
	
	save: ->
		newdata = 
			term: $.trim($("#modalform [name='term']").val())
			term_suffix: $.trim($("#modalform [name='term_suffix']").val())
			etym: $.trim($("#modalform [name='etym']").val())
			last_updated: new Date()
		
		if @model.isNew()
			@model.save newdata,
				success: (model, data) ->
					ModalEditor.terms.add(model, {at: 0})
					model.set(data)
					model.createItem(false)
					model.select()
					ModalEditor.hide()
					Notifier.msg("Creation", "your new term <b>#{model.get("term")}</b> as been created")
					
		else
			@model.save(newdata)
			@model.detailDisplay()
			@model.link.find("a").html(newdata.term)
			@hide()
			Notifier.msg("Edit", "your term <b>#{@model.get("term")}</b> as been edited")