const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
} = require('graphql')

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: {
        id: { type: GraphQLID },
        creator: { type: GraphQLString },
        postText: { type: GraphQLString },
        likes: { type: GraphQLList(GraphQLID) },
        dislikes: { type: GraphQLList(GraphQLID) },
        comments: { type: GraphQLList(GraphQLString) }
    }
})


const CommentType = new GraphQLObjectType({
    name: 'Comment',
    fields: {
        id: { type: GraphQLID },
        comment: { type: GraphQLString },
        postId: { type: GraphQLID },
        uid: { type: GraphQLID }
    }
})

module.exports = { PostType, CommentType }