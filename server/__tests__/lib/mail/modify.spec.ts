import { SendMailOptions } from 'nodemailer';
import { editModifier } from 'lib/modifiers/edit';
import { addModifier } from 'lib/modifiers/add';
import { modifyMail } from 'lib/mail/modify';

test('modifyMail()', async () => {
  const mail: SendMailOptions = {
    attachments: [],
    headers: [{ key: 'Header', value: 'Value' }],
    subject: 'Hi there',
    sender: 'user@example.com',
    html: '<div>Hello <b>world</b>!</div>',
    from: 'user@example.com',
    text: 'Hello world!',
    to: `user@${process.enve.DOMAIN}`
  };

  let modifier = await addModifier(
    { target: 'text', template: `"""replace("text", "world", "universe")"""` },
    1234
  );
  await modifyMail(mail, modifier.id, 1234);
  expect(mail.text).toBe('Hello universe!');

  modifier = await editModifier(
    { ...modifier, target: 'subject', template: `Hello """var("subject")"""` },
    1234
  );
  await modifyMail(mail, modifier.id, 1234);
  expect(mail.subject).toBe('Hello Hi there');

  modifier = await editModifier(
    {
      ...modifier,
      target: 'html',
      template: `"""replace("html", regex(/w(o|0)?RLD/i), "universe")"""`
    },
    1234
  );
  await modifyMail(mail, modifier.id, 1234);
  expect(mail.html).toBe('<div>Hello <b>universe</b>!</div>');

  modifier = await editModifier(
    {
      ...modifier,
      target: 'text',
      template: `"""var("from")""" -> """var("to")""" ("""header("Header")""")`
    },
    1234
  );
  await modifyMail(mail, modifier.id, 1234);
  expect(mail.text).toBe(
    `user@example.com -> user@${process.enve.DOMAIN} (Value)`
  );
});
