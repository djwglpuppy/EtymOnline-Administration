var Etym = require("../model/etym");


exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

exports.terms = function(req, res){
	
	var term = req.params.term;
	if (term.length == 1){
		var searchfor = term;
	} else {
		var searchfor = RegExp("^" + req.params.term);
	}
	
	Etym.etym.find({term: searchfor }, function(err, docs){
		res.send(docs);	
	});	
};


exports.term = {
	create: function(req, res){	
		new Etym.etym(req.body).save(function(err, doc){
			res.send(doc);
		});
	},
	update: function(req, res){
		delete req.body._id;
		Etym.etym.update({_id: req.params.id}, req.body, {multi: true}, function(err, affected){
			return true;
		});
		res.send({success: "success"});
	},
	deletion: function(req, res){
		Etym.etym.findOne({ _id: req.params.id},function(err,doc){
		    doc.remove(); 
		});
		res.send({success: "success"});
	}
};

