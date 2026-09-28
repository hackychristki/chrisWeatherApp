# Weather App

A simple weather dashboard built while learning React. Search for a city to see its current weather and five-day forecast, with a minimal blue design that adapts to desktop and mobile screens.

## Features

- City search and quick city shortcuts
- Current temperature, feels-like temperature, humidity, wind, and precipitation
- Five-day forecast with daily high and low temperatures
- Default weather for Altstätten, Switzerland
- Loading and error messages

## Built with

- React and JavaScript
- Vite
- CSS and SVG illustrations
- [Open-Meteo](https://open-meteo.com/) for weather and city search

## Run locally

Install Node.js and npm, then open a terminal in the folder containing `package.json` (`my-react-app`).

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal. An internet connection is needed to load weather data and Google Fonts. No API key is required for the public Open-Meteo endpoints used here.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the site into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Check the code with Oxlint |

## Project files

```text
src/
  App.jsx      Weather dashboard and API requests
  main.jsx     React entry point
  index.css    Styles and responsive layout
index.html     HTML entry point
```

Weather data is provided by [Open-Meteo](https://open-meteo.com/). Temperatures are shown in Celsius, wind in km/h, and precipitation in millimetres.
