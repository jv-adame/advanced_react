const {forwardTo} = require('prisma-binding');
const {hasPermission} = require('../utils');
const Query = {
    item: forwardTo('db'),
    items: forwardTo('db'),
    itemsConnection: forwardTo('db'),
    me(parent, args, ctx, info){
            // check if there is current user ID
            if(!ctx.request.userId){
                return null;
            }
            return ctx.db.query.user({
                where: {id: ctx.request.userId},
            }, 
            info
        );
    },
    async users(parent, args, ctx, info){
        // 1. Check if the user is logged in
        if(!ctx.request.userId){
            throw new Error('You must be logged in!');
        }
        // 1. Check if the user has the permissions to query all the users
        console.log(ctx.request.userId);
        hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
        // 2. if they do, query all the users
        return ctx.db.query.users({}, info);
    }
};

module.exports = Query;
