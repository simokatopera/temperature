echo batch for debugging temperature functions
echo use web browser to run commands, for example
echo for example http://localhost:9999/.netlify/functions/temperatures?location=%22Salo%22&years=2024
echo ja .. Back in Chrome DevTools, click the Sources tab and see it open on the left, click the Node tab there and see your source file under the file:// hierarchy.

cmd /V /C "set NODE_OPTIONS=--inspect && netlify functions:serve"