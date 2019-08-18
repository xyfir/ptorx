import { addMessage } from 'lib/messages/add';
import { addAlias } from 'lib/aliases/add';
import { Ptorx } from 'types/ptorx';

// source: https://github.com/nodemailer/mailparser/blob/master/test/fixtures/base64encodedroot.eml
const raw = `From: test@example.com
To: test@${process.enve.DOMAIN}
Subject: subject
Content-Type: image/png;
 name="screenshot.png"
Content-Transfer-Encoding: base64
Content-Disposition: attachment;
 filename="screenshot.png"

iVBORw0KGgoAAAANSUhEUgAAABcAAAAfCAYAAAAMeVbNAAAABHNCSVQICAgIfAhkiAAAABl0
RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAE7SURBVEiJY/T3dfvPQCPARCuD
Rw0fNXwoGM5rmckwoa+dId2ABau8kGUuw4S+doZkHezyeA2nBqCp4bj9RC7gkGOw8nFjsNdR
prLhHMoMofkpDNZC3xkeXDlOyHBWBnGrYIZQlT8YMpxSghhi8u7BDNbinxlOzexjWHbzB2GX
C6mYMlir4JL9jcSWYzDSFWNgeHec4dQzVgZeXlZChv9muL6olmHmBUyXC1nmMtSFSiEEOIQY
xHgZGBhYLRlyGi0ZGBioGaEw+1+eZli24QLDJ+oa/o7h3WcGBgZOBoZPd28y3PhD1XT+jOH8
jXcMDHwGDB52UgwsDFQ1/A/DnS1rGU69Y2VQ8MllqMtLoHIO/XGTYVlPH8OyY3cZPgspMzAO
2dofa2qZ0NdDskEFRSUYYjR1+dAN81HDsQIA4N1NJ84wfR8AAAAASUVORK5CYII=
`;

test('addMessage()', async () => {
  const alias = await addAlias({ domainId: process.enve.DOMAIN_ID }, 1234);
  const message = await addMessage(
    {
      aliasId: alias.id,
      subject: 'subject',
      from: 'test@example.com',
      raw,
      to: `test@${process.enve.DOMAIN}`
    },
    1234
  );
  expect(Object.keys(message).length).toBe(11);
  expect(message.id).toBeNumber();
  expect(message.created).toBeNumber();
  const _message: Ptorx.Message = {
    ...message,
    userId: 1234,
    aliasId: alias.id,
    subject: 'subject',
    from: 'test@example.com',
    raw,
    to: `test@${process.enve.DOMAIN}`,
    replyTo: null,
    ptorxReplyTo: `${message.id}--${message.key}--reply-x@${
      process.enve.DOMAIN
    }`
  };
  expect(message).toMatchObject(_message);
});
