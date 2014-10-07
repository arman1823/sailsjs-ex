module.exports = {

    index: function(req, res) {
        if ( ! req.session.user ) { return req.session.href = req.url, res.redirect('/') };
        GroupService.getArchivedGroups(function(asyncErr, archiveStack) {
            return res.render('archives/index', { archives: archiveStack });
        });
    },

    single: function(req, res) {
        if ( ! req.session.user ) { return req.session.href = req.url, res.redirect('/') };
        var groupId = req.param("id");
        GroupService.getGroupsWithMessages({ groupId: groupId }, function(asyncErr, archiveStack) {
            if ( archiveStack ) {
                return res.render('archives/single', { groupObj: archiveStack[groupId] });
            } else {
                return res.notFound();
            }
        });
    },

	_config: {}

};
