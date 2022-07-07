import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2'

/* Declaring an input type to use it as an argument */
@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver()
export class UserResolver {
    /* Query that returns current user */
    @Query(() => User, { nullable: true })
    async me (
        @Ctx() { req, em } : MyContext
    ) {
        /* authenticated user does not exist */
        if(!req.session.userId) 
            return null
        
        const user = await em.findOne(User, { _id: req.session.userId })
        return user
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { req, em }: MyContext
    ): Promise<UserResponse> {
        if(options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "Username length must be greater than 2"
                    }
                ]
            }
        }

        if(options.password.length < 8) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "Password length must be greater than 7"
                    }
                ]
            }
        }

        const hashedPassword = await argon2.hash(options.password)
        const user = em.create(User, { username: options.username, password: hashedPassword })
        try {
            await em.persistAndFlush(user)
        }catch(err){
            if(err.code === "23505"){
                return {
                    errors: [
                        {
                            field: "username",
                            message: "Username has already taken."
                        }
                    ]
                }
            }
        }

        // auto login after register
        req.session.userId = user._id

        return { user }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username })
        if(!user) {
            return { 
                errors: [
                    {
                        field: "username",
                        message: "Username does not exist."
                    }
                ]
             }
        }
        const valid = await argon2.verify(user.password, options.password)
        if(!valid) {
            return { 
                errors: [
                    {
                        field: "password",
                        message: "Incorrect password."
                    }
                ]
             }
        }

        req.session.userId = user._id

        return {
            user
        }
    }
}