# Pubky Arcade: Decentralized Turn-Based Games

**Description**

Pubky Arcade is a collection of fun, turn-based games that leverage the Pubky Core protocol to manage game state in a decentralized manner. The game states, scores, and moves are stored and updated in real-time on each player's homeserver, ensuring a censorship-resistant, collaborative gaming experience without reliance on centralized servers.

**Project Summary**

- **Name**: Pubky Arcade
- **Short Description**: Turn-based games implementing Pubky protocol for data creation, update, read, and deletion.

**How Pubky Core Was Used**

Pubky Arcade utilizes the homeserver component of Pubky Core to store and update game state in real-time. As players make their moves, these updates are reflected across all homeservers of active players and passive observers. The integration makes use of the Pubky SDK to handle data routing, cryptographic key generation, and homeserver synchronization, ensuring a fully decentralized gameplay experience.

**Why Is This Useful?**

In a world dominated by centralized gaming servers, Pubky Arcade represents a decentralized alternative that allows users to play games without concerns over censorship or control by a single entity. It exemplifies intellectual freedom in gaming, providing a collaborative space where creativity and diverse perspectives can thrive.

**Builder Potential**

The Pubky Arcade demonstrates how a simple, familiar game format can serve as an ideal testbed for the Pubky Core protocol. Developers can see the potential of decentralized game state management and experiment with creating interactive applications that highlight Pubky's functionality.

**Technical Overview**

- **Game State Management**: Game states are stored on the Pubky homeserver and updated in real-time as players take their turns.
- **Local Score Calculation**: Scores are calculated locally by each player, and synchronized across homeservers for consistent gameplay.
- **Homeserver Integration**: By using Pubky homeservers, the game state is decentralized, providing a resilient and censorship-resistant environment for gameplay.

# Development

## Prerequisites

- **Node.js**: Version 14.x or above is required.
- **npm**: Version 6.x or above.
- **Pubky SDK**: Required for integration with Pubky Core.

Ensure that all dependencies are installed and the system requirements are met before proceeding.

## Environment Configuration

Before running the project, make sure to configure the following environment variables in the `.env` file:

- `PUBKY_API_KEY`: The API key for Pubky Core integration.
- `HOMESERVER_URL`: URL for the homeserver that will store and synchronize game states.
- `REACT_APP_OPENAI_API_KEY`: API key for accessing OpenAI APIs for AI features (if applicable).
- `LIGHTNING_NODE_URL`: The URL for the Lightning Network node used for payments.

Project is using default configuration, so everything that normally works for a React + Vite project should work out of the box.

First, copy the env file:

```sh
$ cp example.env .env
```

Install dependencies and start the development server:

```sh
$ npm install
$ npm run dev
```

# Deploy
Copy the env file:

```sh
$ cp example.env .env
```

Then build and run the project:

```sh
$ npm install
$ npm run build
$ npm run preview
```

**Potential Use Cases**

- **Decentralized Multiplayer Games**: Create games where game state is stored independently by all players, avoiding the need for central servers.
- **Collaborative Decision-Making Tools**: Adapt the turn-based mechanics for use in decision-making applications where users make choices and share results in real-time.
- **Censorship-Resistant Games**: Provide gaming experiences that can't be disrupted or controlled by central authorities.

**Get Involved**

Pubky Arcade showcases the versatility of the Pubky Core protocol. Whether you’re interested in decentralized data management, real-time collaboration, or creating engaging social applications, this project is an excellent starting point.

Join the Pubky community and begin exploring the future of decentralized gaming today!

**Links**

- [Medium Article](https://medium.com/@synonym_to/pubky-arcade-d127ec23a83c)
- [Twitter X Updates](https://x.com/getpubky)
