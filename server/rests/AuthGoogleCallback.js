const passport = require('passport'),
    CLIENT_ORIGIN = process.env.CLIENT_ORIGIN,
    logger = require('@finelets/hyper-rest/app/Logger');

const html = `<html>
    <body>
      <script>
        window.opener.postMessage('success', '${CLIENT_ORIGIN}')
        window.close()
      </script>
      Success!
    </body>
    </html>`;
const __cb = function (req, res) {
    res.send(html);
}

const auth = passport.authenticate('google', __cb);

module.exports = {
    url: '/api1/auth/google/callback',
    rests: [{
        type: 'get',
        handler: auth
    }]
};