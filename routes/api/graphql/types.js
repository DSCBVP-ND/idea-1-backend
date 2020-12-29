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


module.exports = { PostType }