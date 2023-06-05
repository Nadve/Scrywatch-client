# Scrywatch-server

>This is a front-end of Scrywatch. Web application for managing Magic: The Gathering card collection.
## Table of contents
* [General Info](#general-info)
* [Technologies Used](#technologies-used)
* [Features](#features)
* [Usage](#usage)
* [Contact](#contact)

## General Info
Magic: The Gathering is a collectible card game spread all over the world. If
you want to play at a professional level, you need to constantly expand your
collection with new cards. The price of the cards is not regulated, so there can be
huge fluctuations from day to day. The goal of this thesis is to save collector’s
money when buying new cards and to raise the profit when selling by creating
a web application. Public API [scryfall.com](https://scryfall.com/docs/api) is used to get information about the
cards. The application will periodicaly check the prices of the cards and plot their
history in to a chart. User of the application can adjust the price change of which
he’ll be informed via email. 

## Technologies Used
* SvelteKit

## Features
* Cards
  * Search for a Magic: The Gathering card
  * Show card's picture and draw price history in a graph
* Authentication
  * Register
  * Confirm email
  * Sign in
>user has to be signed in to have access to features below
* Interests
  * If the user is interested in buying/selling the card he can add the card to his collection
  * Cards can be removed from the collection
  * Every card in collection has a goal which user can modify

## Usage
`npm run dev`

## Contact
nadv.tom@gmail.com
