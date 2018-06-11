const googleapis = require('googleapis'),
    oauth2Client = new googleapis.google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALLBACK_URL
    )
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

const auth = function (req, res) {
    var code = req.query.code;
    logger.info('code:' + code);
    return oauth2Client.getToken(code)
        .then(function (data) {
            logger.info('It\'s ok !!!!');
            oauth2Client.setCredentials(data.tokens);
            return res.send(html);
        })
        .catch(function (e) {
            logger.error(e);
            res.send(html);
        })
}

module.exports = {
    url: '/api/auth/callback',
    rests: [{
        type: 'get',
        handler: auth
    }]
};