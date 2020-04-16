const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { transport, makeANiceEmail } = require('../mail');
const {promisify} = require('util');

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
    signout(parent, args, ctx, info){
        ctx.response.clearCookie('token');
        return {message: 'Goodbye!'};
    },
    async requestReset(parent, args, ctx, info){
        // Check if this is a real user
        const user = await ctx.db.query.user({where: {email: args.email}});
        if(!user){
            throw new Error(`No such user for email ${args.email}`);
        }
        // Set a reset token and expiry on that user
        const randomBytesPromisified = promisify(randomBytes);
        const resetToken = (await randomBytesPromisified(20)).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000;
        const res = await ctx.db.mutation.updateUser({
            where:  {email: args.email},
            data: {resetToken, resetTokenExpiry}
        });
        // Email them that reset token
        const mailRes = await transport.sendMail({
            from: 'jv@jv.com',
            to: user.email,
            subject: 'Your password reset Token',
            html: makeANiceEmail(`Your password reset token is here! 
                    \n\n 
                    <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`)
        });
        // Return the message
        return {message: 'Please check your email'};
    },
    async resetPassword(parent, args, ctx, info){
        //check if the passwords match
        if(args.password !== args.confirmPassword){
            throw new Error('Passwords do not match');
        }
        //check if it's a legitimate reset token
        //check if it's expired
        const {user} = ctx.db.query.users({
            where: {
                resetToken: args.resetToken,
                resetTokenExpiry_gte: Date.now() - 3600000
            }
        });
        if(!user){
            throw new Error("This token is either invalid or expired!");
        }
        //hash their new password
        const password = await bcrypt.hash(args.password, 10);
        //save new password to the user and remove old reset token fields
        const updatedUser = await ctx.db.mutation.updateUser({
            where: {email: user.email},
            data: {
                password,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        //generate jwt
        const token = jwt.sign({userId: [udatedUser.id]}, process.env.APP_SECRET);
        //set jwt cookie
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 *24 *365,
        });
        //return the new User
        return updatedUser;
    }
};

module.exports = Mutations;
