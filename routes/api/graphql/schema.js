const db = require("../../../firebase/firebase-db");
const auth = require('../../../middleware/graphql/auth')

const { PostType, CommentType } = require('./types')

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLInt,
    GraphQLString,
    GraphQLBoolean,
    GraphQLList,
    GraphQLSchema,
    GraphQLNonNull,
} = require('graphql')



const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        post: {
            type: PostType,
            args: {
                id: { type: GraphQLID }
            },
            resolve(parent, args) {
                return db.collection("posts")
                    .doc(args.id)
                    .get()
                    .then(res => res.data())
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve(parent, args) {
                return db.collection("posts")
                    .get()
                    .then(querySnapshot => {
                        allPosts = []
                        querySnapshot.forEach((doc) => {
                            allPosts.push({
                                id: doc.id,
                                ...doc.data()
                            })
                        })
                        return allPosts
                    })
            }
        },
        commentById: {
            type: CommentType,
            args: {
                commentId: { type: GraphQLID }
            },
            resolve(parent, args) {
                return db.collection("comments")
                    .doc(args.commentId)
                    .get()
                    .then(res => res.data())
            }
        },
        commentByPostId: {
            type: new GraphQLList(CommentType),
            args: {
                postId: { type: GraphQLID }
            },
            resolve(parent, args) {
                return db.collection("comments")
                    .where('postId', '==', args.postId)
                    .get()
                    .then(querySnapshot => {
                        postComments = []
                        querySnapshot.forEach(doc => {
                            postComments.push({
                                id: doc.id,
                                ...doc.data()
                            })
                        })
                        return postComments
                    })
            }
        },
        commentByUserId: {
            type: new GraphQLList(CommentType),
            args: {
                userId: { type: GraphQLID }
            },
            resolve(parent, args) {
                return db.collection("comments")
                    .where('uid', '==', args.userId)
                    .get()
                    .then(querySnapshot => {
                        userComments = []
                        querySnapshot.forEach(doc => {
                            userComments.push({
                                id: doc.id,
                                ...doc.data()
                            })
                        })
                        return userComments
                    })
            }
        },
        comments: {
            type: new GraphQLList(CommentType),
            resolve(parent, args) {
                return db.collection("comments")
                    .get()
                    .then(querySnapshot => {
                        allComments = []
                        querySnapshot.forEach((doc) => {
                            allComments.push({
                                id: doc.id,
                                ...doc.data()
                            })
                        })
                        return allComments
                    })
            }
        }
    }
})

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createPost: {
            type: PostType,
            args: {
                postText: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args, request) {
                await auth(request)

                let userId
                try {
                    userId = request.headers.authorization.split('Bearer ')[1]
                } catch (err) {
                    console.log(`User not set Error: ${err}`)
                }

                const postData = {
                    likes: [],
                    dislikes: [],
                    comments: [],
                    creator: userId,
                    postText: args.postText,
                }

                const newPostRef = db.collection("posts").doc();
                await newPostRef.set(postData);

                const newPost = await newPostRef.get();

                const userRef = db.collection("users").doc(userId);
                userRef.set({
                    posts: [`/posts/${newPost.id}`]
                }, { merge: true })

                return { id: newPost.id, ...newPost.data() }
            }
        },
        updatePost: {
            type: PostType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
                postText: { type: GraphQLString }
            },
            async resolve(parent, args, request) {
                await auth(request)

                let postId = args.id;
                let postText = args.postText;
                let postRef = await db.collection("posts").doc(postId);
                let post = await postRef.get();

                let userId
                try {
                    userId = request.headers.authorization.split('Bearer ')[1]
                } catch (err) {
                    console.log(`User not set Error: ${err}`)
                }

                //check if post exists
                if (post.exists) {
                    //check if current user is the creator
                    if (post.data().creator == userId) {
                        await postRef.update({ postText });
                        post = await postRef.get();
                        return { id: post.id, ...post.data() }
                    }
                } else {
                    //can't update
                    throw new Error("can't update post");
                }
            }
        },
        deletePost: {
            type: PostType,
            args: {
                id: { type: GraphQLID }
            },
            async resolve(parent, args, request) {
                await auth(request)

                let postId = args.id
                let postRef = await db.collection("posts").doc(postId);
                let post = await postRef.get();

                let userId
                try {
                    userId = request.headers.authorization.split('Bearer ')[1]
                } catch (err) {
                    console.log(`User not set Error: ${err}`)
                }

                //check if post exists
                if (post.exists) {
                    //check if current user is the creator
                    if (post.data().creator == userId) {
                        await postRef.delete();
                        post = await postRef.get();
                        return post.data()
                    }
                } else {
                    //can't update
                    throw new Error("can't update post");
                }
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});