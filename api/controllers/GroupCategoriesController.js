module.exports = {
    
  
  index: function(req, res) {
      if (!req.session.user) {
          return req.session.href = req.url, res.redirect('/')
      };
      var userId = req.session.user;
      var viewData = {};
      GroupService.getGroupCategoriesForUser(userId, function(catErr, catRes) {
          viewData.userCategories = catRes || [];
          GroupService.getUserGroupsForCategories(userId, true, function(groupErr, groupRes) {
              for ( var i in catRes ) {
                  catRes[i].groups = [];
                  for ( var j in groupRes ) {
                      if ( catRes[i].id == groupRes[j].catId ) {
                          catRes[i].groups.push(groupRes[j]);
                      }
                  }
              }
              GroupService.getUserGroupsForCategories(userId, false, function(groupErr, groupRes) {
                  viewData.userGroups = groupRes || [];
                  return res.render("group_categories/index", viewData);
              });
          });
      });
  },

  createPost: function(req, res) {
      if (!req.session.user) {
          return req.session.href = req.url, res.redirect('/')
      };
      var __ = res.i18n;
      req.body.user_id = req.session.user;
      GroupCategories.create(req.body).exec(function(groupCatErr, groupCatRes) {
          return res.json({
              status: groupCatErr ? false : true,
              catId: groupCatRes.id,
              message: __(groupCatErr ? "create_category_error" : "create_category_success")
          });
      });
  },

  reorderPost: function(req, res) {
      if (!req.session.user) {
          return req.session.href = req.url, res.redirect('/')
      };
      var __ = res.i18n;
      var userId = req.session.user;
      var groupId = req.body.group_id;
      var fromCatId = req.body.from_cat;
      var toCatId = req.body.to_cat;
      var insertGroupIntoCat = function(userGroupCatErr) {
          if ( userGroupCatErr ) console.log(userGroupCatErr);
          var ugcHandler = function(userGroupCatErr) {
              return res.json({
                  status: userGroupCatErr ? false : true,
                  message: __(userGroupCatErr ? "category_group_reorder_error" : "category_group_reorder_success")
              });
          };
          if ( toCatId ) {
              UserGroupCategories.create({
                  user_id: userId,
                  group_id: groupId,
                  category_id: toCatId
              }).exec(ugcHandler);
          } else {
              ugcHandler(null);
          }
      };
      if ( fromCatId != "none" ) {
          UserGroupCategories.destroy({
              user_id: userId,
              group_id: groupId,
              category_id: fromCatId
          }).exec(insertGroupIntoCat);
      } else {
          insertGroupIntoCat(null);
      }
  },

  _config: {}

  
};
