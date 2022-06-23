### [Standalone Kinky Dungeon](https://loon8128.github.io/KinkyDungeonStandalone/)

A platform which runs Kinky Dungeon, developed by [Ada18980](https://github.com/Ada18980), without distributing any unlicensed code or assets, or requiring a account or server connection.

Dev Env Setup:

- Checkout [Bondage Club](https://gitgud.io/BondageProjects/Bondage-College) in a separate directory and navigate to it.
- Run `npm install http-server --save-dev` (or you can use any CORS enabled server of your choosing)
- Run `npx http-server -p 3000 --cors`
- Navigate to KD with the url parameter `localhost?=3000` (the port from the earlier step). [Example](https://loon8128.github.io/KinkyDungeonStandalone/?localhost?=300)