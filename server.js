const Sequelize = require('sequelize');
const { STRING } = Sequelize;
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_express_spa');

const User = conn.define('user', {
    name: {
        type: STRING,
        unique: true,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
});

const Recipe = conn.define('recipe', {
    name: {
        type: STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
});

const syncAndSeed = async() => {
    await conn.sync({ force: true });

    let users = await Promise.all([ 'Leslie', 'Ann', 'April', 'R', 'Ben' ].map( name => User.create({ name } )));
    users = users.reduce( (acc, user) => {
        acc[user.name] = user;
        return acc;
    }, {});

    const recipes = await Promise.all([
        Recipe.create({ userId: users.Leslie.id, name: 'Waffles'}),
        Recipe.create({ userId: users.Leslie.id, name: 'Whipped Cream'}),
        Recipe.create({ userId: users.Leslie.id, name: 'Brownies'}),
        Recipe.create({ userId: users.Leslie.id, name: 'Lasagna'}),
        Recipe.create({ userId: users.Ann.id, name: 'Greek Salad'}),
        Recipe.create({ userId: users.Ann.id, name: 'Hot Chocolate'}),
        Recipe.create({ userId: users.R.id, name: 'Eggs'}),
        Recipe.create({ userId: users.R.id, name: 'Porterhouse'}),
        Recipe.create({ userId: users.Ben.id, name: 'Calzone'}),
        Recipe.create({ userId: users.Ben.id, name: 'Pepperoni Calzone'}),
        Recipe.create({ userId: users.Ben.id, name: 'Spinach Calzone'})
    ]);

    return {
        users,
        recipes
    };
};

Recipe.belongsTo(User);

const express = require('express');
const app = express();
const path = require('path');
const { user } = require('pg/lib/defaults');

app.use(express.json());

app.use('/assets', express.static('assets'));
app.use('/dist', express.static('dist'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/users', async(req, res, next) => {
    try {
        res.send(await User.findAll());
    }
    catch(ex){
        next(ex)
    }
});

app.get('/api/users/:userId/recipes', async(req, res, next) => {
    try {
        res.send(await Recipe.findAll({ 
            where: { userId: req.params.userId }
        }));
    }
    catch(ex){
        next(ex)
    }
});

app.delete('/api/recipes/:id', async(req, res, next) => {
    try {
        const recipe = await Recipe.findByPk(req.params.id);
        await recipe.destroy();
        res.sendStatus(204);
    }
    catch(ex) {
        next(ex);
    }
})

app.post('/api/users/:userId/recipes', async(req, res, next) => {
    try {
        res.status(201).send( await Recipe.create({ userId: req.params.userId, name: req.body.recipeName }));
    }
    catch(ex) {
        next(ex);
    }
})

const init = async() => {
    await syncAndSeed();
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${ port }`));
}

init();