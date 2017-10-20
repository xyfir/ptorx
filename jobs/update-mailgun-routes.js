const MailGun = require('mailgun-js');
const config = require('../config');

(async function() {

  const mailgun = MailGun({ apiKey: config.keys.mailgun });

  try {
    const {items: routes} = await mailgun.routes().list();

    for (let route of routes) {
      // 0 (Spam Allowed) -> 1000, 1 (Spam Stop) -> 2000,
      // 2 (No Spam) -> 3000, 0 (Reply) -> 900
      const priority = (() => {
        switch (route.priority) {
          case 0: return route.id == '59aef7ca1f4b8b4ba0e525cf' ? 900 : 1000;
          case 1: return 2000;
          case 2: return 3000;
          default: return route.priority;
        }
      })();

      await mailgun.routes(route.id).update({ priority });
    }

    console.log(routes.length, 'routes updated');
  }
  catch (err) {
    console.error(err);
  }

})()