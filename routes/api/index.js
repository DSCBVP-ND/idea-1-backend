const express = require('express');
const router = express.Router();
const { graphqlHTTP } = require('express-graphql');

const schema = require('./graphql/schema')

router.use('/posts', require('./posts'));
router.use('/comments', require('./comments'));

router.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}))

module.exports = router;