var express = require('../node_modules/sails/node_modules/express')
	, uc = require('../lib/helpers').uc
	, uuid = require('uuid');
module.exports.express = {
    // bodyParser: function() {
    //     return express.bodyParser({limit: '900mb'});
    // },
	customMiddleware: function(app) {
		//serve static files
		app.use('/uploads', express.static(__dirname + '/../uploads/'));
		//breadcrumb
		app.use(function (req, res, next) {

			var url = req.url.split('/'),
				breadcrumb = [{
					href: '/',
					name: 'Home'
				}];
			url = url.filter(Boolean);
			url.forEach(function (link) {
				var lastUrl = breadcrumb[breadcrumb.length-1].href
					, name = uc(link.replace(/-/g, ' '));
				breadcrumb.push({
					href: lastUrl + link + '/',
					name: name
				})
			});
			res.locals({ 
				breadcrumb: breadcrumb,
				uuid: uuid.v4
			});
			next();
		});

		// Custom Render
		/*
		app.use(function(req, res, next) {
			var _render = res.render;
			var urlSpl = req.url.toLowerCase().split("/");
			var viewPath = (urlSpl.length > 2 ? urlSpl[1] + "/" : "");
			res.render = function(view, options, callback) {
				console.log("[DEBUG] Rendering template '" + viewPath + view + ".jade'");
				_render.call(res, viewPath + view, options, callback);
			};
			next();
		});
		 */
	}
};



