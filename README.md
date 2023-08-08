# Kobold+ Fight Club
=================
Kobold+ Fight Club is a complete rewrite of Kobold Fight Club by Fantasy Computerworks that seeks to address a number of concerns with the original: 
- [x] The project needs new maintainers (Oh hey that's us)
- [x] Need to stop using Google Sheets API as a database+backend
- [x] Update old/outdated versions of various packages
- [ ] Migration method for existing custom content from Google Sheets to another data source (Needs to be as easy to setup and maintain as we can get it)
- [ ] Good way to accept and moderate submissions for new source book creatures
- [ ] Login/sync between devices
- [ ] Any improvements we can think of!

## Adding custom content to Kobold Fight Club
Click "Import Custom Monsters", and you're off to the races! Each import method has an example for reference.

## Contributing content to Kobold Fight Club
Coming Soon™

## Technical stuff
In case you're interested in contributing code, we're building this iteration of KFC+ with Vue.js, Using Pinia for state and TailwindCSS for styling.

The build process uses Vite, which you can start with `npm run dev`, before accessing the local development environment on port 3000.

## Node Commands
- npm ci - Install necessary dependencies
- npm run dev - Start a local dev server on port 3000
