const express = require('express');
const axios = require('axios');

const app = express();
const SERVER_PORT = 3000;
const BASE_URL = `http://localhost:${SERVER_PORT}`; // Base URL for endpoints
const API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon/';

// Middleware to parse JSON request bodies
app.use(express.json());

// Temporary storage for custom Pokémon collection
let userPokemonCollection = [];

/**
 * GET /pokemons
 * Fetch a list of Pokémon from the external PokéAPI.
 * Query Parameters (optional):
 * - offset (default: 0): Start position of the list.
 * - limit (default: 20): Number of Pokémon to fetch.
 */
app.get('/pokemons', async (req, res) => {
	const { offset = 0, limit = 20 } = req.query;

	try {
		const response = await axios.get(API_BASE_URL, {
			params: { offset, limit },
		});
		return res.status(200).json(response.data); // Return Pokémon list
	} catch (err) {
		return res.status(500).json({ message: 'Unable to retrieve Pokémon data.' });
	}
});

/**
 * POST /pokemons
 * Add a new Pokémon to the custom in-memory collection.
 * Request Body:
 * - name: Name of the Pokémon (required)
 * - category: Category of the Pokémon (required)
 */
app.post('/pokemons', (req, res) => {
	const { name, category } = req.body;

	// Validate required fields
	if (!name || !category) {
		return res.status(400).json({
			message: 'Both "name" and "category" fields are required.',
		});
	}

	// Create a new Pokémon object
	const newPokemon = {
		id: userPokemonCollection.length + 1,
		name,
		category,
	};

	userPokemonCollection.push(newPokemon); // Add to collection

	return res.status(201).json(newPokemon); // Return the added Pokémon
});

/**
 * PATCH /pokemons/:id
 * Update an existing Pokémon in the custom collection by its ID.
 * Request Body:
 * - name: Updated name (optional)
 * - category: Updated category (optional)
 */
app.patch('/pokemons/:id', (req, res) => {
	const { id } = req.params; // Pokémon ID from the URL
	const { name, category } = req.body;

	// Find the Pokémon by ID
	const pokemonToUpdate = userPokemonCollection.find(
		(pokemon) => pokemon.id === parseInt(id, 10)
	);

	// If Pokémon not found, return an error
	if (!pokemonToUpdate) {
		return res.status(404).json({ message: 'Pokémon not found.' });
	}

	// Update the Pokémon fields if provided
	if (name) pokemonToUpdate.name = name;
	if (category) pokemonToUpdate.category = category;

	return res.status(200).json(pokemonToUpdate); // Return the updated Pokémon
});

/**
 * DELETE /pokemons/:id
 * Remove an existing Pokémon from the custom collection by its ID.
 */
app.delete('/pokemons/:id', (req, res) => {
	const { id } = req.params;

	// Find the Pokémon index in the collection
	const index = userPokemonCollection.findIndex(
		(pokemon) => pokemon.id === parseInt(id, 10)
	);

	// If Pokémon not found, return an error
	if (index === -1) {
		return res.status(404).json({ message: 'Pokémon not found.' });
	}

	// Remove the Pokémon from the collection
	userPokemonCollection.splice(index, 1);

	return res.status(204).send(); // Return no content
});

// Start the server
app.listen(SERVER_PORT, () => {
	console.log(`Server is running at ${BASE_URL}`);
	console.log(`
Available Endpoints:
1. GET    ${BASE_URL}/pokemons       - Fetch a list of Pokémon (query params: offset, limit)
2. POST   ${BASE_URL}/pokemons       - Add a new Pokémon (body: { name, category })
3. PATCH  ${BASE_URL}/pokemons/:id   - Update a Pokémon by ID (body: { name, category })
4. DELETE ${BASE_URL}/pokemons/:id   - Delete a Pokémon by ID
`);
});
