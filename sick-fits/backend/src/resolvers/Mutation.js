const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Mutations = {
    async createItem(parent, args, ctx, info){
        //Todo: Check if logged in

        const item = await ctx.db.mutation.createItem({
            data: {
                ...args
            }
        }, info);

        //console.log(item);

        return item;
    },
    updateItem(parent, args, ctx, info){
        
        //first take copy of the updates
        const updates = {...args};
        //remove the id from the updates
        delete updates.id;
        //run the update method
            return ctx.db.mutation.updateItem({
                data: updates,
                where: {
                    id: args.id,
                },
            }, 
            info);
    },
    async deleteItem(parent, args, ctx, info){
        const where = {id: args.id};
        //1. find the item
        const item = await ctx.db.query.item({where}, `{id title}`);
        //2. check if they own that item, or have the permissions
        //ToDo
        //3. delete it
        return ctx.db.mutation.deleteItem({where}, info);
    },
    async signup(parent, args, ctx, info){
        //lowercase their email
        args.email = args.email.toLowerCase();
        //hash their password
        const password = await bcrypt.hash(args.password, 10);
        //create the user in the database
        const user = await ctx.db.mutation.createUser({
            data: {
                ...args,
                password,
                permissions: {set: ['USER']},
            },
        }, 
        info);
        //create JWT token for them
        const token = jwt.sign({userId: user.id}, process.env.APP_SECRET);
        //Set jwt as cookie on the response
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, //1 year cookie
        });
        //return user to browser
        return user;
    },
    async signin(parent, {email, password}, ctx, info){
        //check if user with email
        const user = await ctx.db.query.user({where: {email} });
        if (!user) {
            throw new Error(`No such user found for email ${email}`);
        }
        //check if password is correct
        const valid = await bcrypt.compare(password, user.password);
        if(!valid){
            throw new Error('Invalid Password!');
        }
        //generate jwt token
        const token = jwt.sign({userId: user.id}, process.env.APP_SECRET);
        //set cookie with the token
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365,
        });
        //return the user
        return user;
    },
};

module.exports = Mutations;
