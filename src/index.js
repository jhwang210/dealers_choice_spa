const axios = require('axios');

const userDiv = document.querySelector('#user-div');
const recipeList = document.querySelector('#recipeList');
const recipeForm = document.querySelector('form');
const input = document.querySelector('input');

window.addEventListener('hashchange', async() => {
    await fetchRecipes();
    renderUsers();
    renderRecipes();
})

recipeList.addEventListener('click', async(ev) => {
    if (ev.target.tagName === 'BUTTON') {
        const id = ev.target.getAttribute('data-id');
        await axios.delete(`/api/recipes/${id}`);
        await fetchRecipes();
        renderRecipes();
    }
})

recipeForm.addEventListener('submit', async(ev) => {
    ev.preventDefault();
    const recipeName = input.value;
    console.log(typeof recipeName);
    const id = window.location.hash.slice(1);
    if(!id) {
        return;
    }
    try {
        await axios.post(`/api/users/${id}/recipes`, { recipeName });
        await fetchRecipes();
        renderRecipes();
    }
    catch(ex) {
        console.log(ex.response.data);
    }
});

const state = {};

const fetchUsers = async() => {
    const response = await axios.get('/api/users');
    state.users = response.data;
}

const fetchRecipes = async() => {
    const id = window.location.hash.slice(1);
    if(id){
        const response = await axios.get(`/api/users/${ id }/recipes`);
        state.recipes = response.data;
    }
    else {
        state.recipes = [];
    }
};

const renderUsers = () => {
    const id = window.location.hash.slice(1)*1
    const html = state.users.map( user => {
        return `
            <div class='${ user.id === id ? 'selected' : ''}' >
                <a href='#${ user.id }'>
                    ${ user.name }
                </a>
            </div>
        `;
    }).join('');
    userDiv.innerHTML = html;
};

const renderRecipes = () => {
    //fetchRecipes();
    const html = state.recipes.map( recipe => {
        return `
            <li>${ recipe.name } <button data-id='${ recipe.id }'>x</button></li>

        `;
    }).join('');
    recipeList.innerHTML = html;
};

const start = async() => {
    await fetchUsers();
    await fetchRecipes();
    renderUsers();
    renderRecipes();
};

start();


/*
const faker = require('@faker-js/faker');

const users = new Array(50).fill('').map( _ => faker.name.findName());

console.log(faker.name.findName());

const userrecipe = users.reduce((acc, user) => {
    acc[user] = new Array(1).fill('-').map( _ => faker.commerce.produceName());
    return acc;
}, {});

*/

