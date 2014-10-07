module.exports = {

    users: function(req, res) {
        var kw = req.body.q;
        var query = "SELECT u.`id`, u.`username`, ud.`full_name` " +
            "FROM `users` AS u " +
            "INNER JOIN `user_data` AS ud ON u.`id` = ud.`user_id` " +
            "WHERE (u.`username` LIKE '%" + kw + "%' AND ud.`public_user_name` = 1) " +
            "OR (ud.`full_name` LIKE '%" + kw + "%' AND ud.`public_full_name` = 1) ";
        GroupInvitations.query(query, function(err, data) {
            return res.json(data);
        });
    },

    archivesPost: function(req, res) {
        var kw = req.body.q;
        GroupService.getArchivedGroups({ query: kw }, function(err, data) {
            return res.render("partial/archive_table", { archives: data });
        });
    },

    groupsPost: function(req, res) {
        var kw = req.body.q,
            query = "SELECT * FROM event_consort.groups as g " +
                        "INNER JOIN users as u ON u.id = g.creator_id " +
                        "INNER JOIN user_data as ud ON ud.user_id = g.creator_id " +
                        "WHERE (g.name LIKE '%" + kw + "%' OR u.username LIKE '%" + kw + "%' or " +
                        "ud.full_name LIKE '%" + kw + "%') AND g.is_public = 1 AND g.is_active = 1 " +
                        "AND (g.`end_date` IS NULL OR g.`end_date` = '')";
        Groups.query(query, function(err, data) {
            return res.render("partial/groups_table", { groups: data });
        });
    },

  _config: {}

  
};
