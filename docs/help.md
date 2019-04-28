# Terminology

- **Email Aliases**, alias emails, or forwarding emails
  - Email addresses created via Ptorx that typically act as a middleman for your primary emails by receiving mail and forwarding allowed mail to your primary email addresses.
- **Waterfall**
  - Every alias has a waterfall that allows you to link filters, modifiers, and primary emails to it in a specific order. Each linked item is acted on in order, cascading downward like a waterfall, allowing you to redirect different mail to different primary emails based on filters and modifiers.
- **Primary Emails**, real, or main emails
  - Your actual email addresses where you normally receive mail. These emails are where mail sent to your alias addresses will be redirected to. Enable _Autolink_ to automatically link them to any new aliases you create.
- **Filters**
  - Filters allow you to filter out mail (with whitelists or blacklists) before it reaches any primary emails that come after it in an alias's waterfall.
- **Modifiers**
  - Modifiers allow you to modify components of an incoming email before it gets redirected to primary emails below it in an alias's waterfall.
- **Messages**, or mail
  - Messages are any incoming pieces of mail received by your alias addresses.
- **Keys**, or PGP keys
  - Your optional private and public keys which will be used to encrypt the text and HTML body contents of mail stored on Ptorx servers. Mail is encrypted by Ptorx servers with your public key and decrypted later in the app using the private key.
- **Mailbox Password**
  - Separate from your account password, this is used to encrypt your private key if you have one. It's important this is a strong password because your encrypted private key will be stored on Ptorx for convenience. Only you, with your access to this password, will be able to read your encrypted mail.

# Aliases

## Deleting aliases

By deleting an email alias, that specific email is completely removed from your account, however it remains on Ptorx's system simply as a placeholder to prevent that address from ever being claimed again in the future. This means that once you delete an alias address there is no way for you or another user to claim that address. Deleted aliases will not forward or save received mail.

## Replying to forwarded mail

You can safely reply to mail that is sent to an alias if that alias has `Allow Anonymous Reply` enabled. You can reply to this mail either from within the Ptorx app or by replying to the message you received in your email client as you would reply to any other message.

There are some limitations with this feature:

- You will only be able to reply to mail so long as a copy of it is still stored on Ptorx.
- If you reply to mail from within your email client, that client must support the `Reply-To` email header. Most popular clients (like Gmail) should support this.

The replies will be sent to the original sender using the address of the alias that received the message.

## Forwarded mail marked as spam

Due to the nature of the service and for very technical reasons we won't bother with here, sometimes forwarded mail will end up in your spam folder even though it's perfectly legitimate mail. The solution to this is to whitelist `ptorx.com` or whichever alias email domains or addresses you use. This process will differ based on your mailbox provider.

For Gmail, the most popular option, you'd create a filter for the domain (`@ptorx.com`) or a specific address (`example@ptorx.com`) and set the `Never send it to Spam` action. Alternatively, you can also add individual addresses to your contacts whenever you receive a message by viewing the mail and selecting the `Add example@example.com to Contacts list` option. A good tutorial can be found [here](https://www.jotform.com/help/404-How-to-Prevent-Emails-from-Landing-in-Gmail-s-Spam-Folder).

## Send mail from alias using another app

Each alias has unique SMTP authentication credentials that can be used to send mail from that alias using a third-party, non-Ptorx email client like Gmail or Outlook.

- **Host**: `smtp.ptorx.com`
- **Port**: `587`
- **User**: `your-alias@ptorx-or-your-domain.com`
- **Pass**: SMTP passkey provided when viewing alias in-app.

_Note: Sending mail programmatically using your credentials is forbidden._

# Modifiers

Modifiers give you expanded control over the content of the mail that gets sent to you. Modifiers are only applied to mail being redirected to a main email. If you have 'Save Mail' enabled on an alias, the saved mail will be unmodified.

## Functions

Special functions are available within templates allow you to access and manipulate email content. All functions are accessed via the `"""func()"""` syntax, where `func` is the name of the function.

### Get variables

`var("var")`

Allows you to access variables from the message. Note that if a previous modifier has modified this variable then you will receive that modified value. If the variable does not exist then `"""var("...")"""` will be removed and replaced with just an empty string.

**Variables you can choose from**:

- `from`
- `to`
- `subject`
- `html` - the message body as HTML
- `text` - the message body as text

**Example:**

```
Email from: """var("from")"""
```

becomes

```
Email from: user@example.com
```

### Get Header Values

`header("header")`

Allows you to access headers from the message. Note that if a previous modifier has modified this header then you will receive that modified header. If the header does not exist then `"""header("...")"""` will be removed and replaced with just an empty string.

**Example:**

```
Send replies to: """header("reply-to")"""
```

becomes

```
Send replies to: replies@example.com
```

### Find and replace

`replace("var", "substr", "replacement")`

Allows you to find and replace text within the specified variable. If the variable does not exist then `"""replace(...)"""` will be removed and replaced with just an empty string.

**Example:**

```
Email from: """replace("from", "example", "domain")"""
```

becomes

```
Email from: user@domain.com
```

### Find and replace with regular expressions

`replace("var", regex(/pattern/flags), "replacement")`

Allows you to find and replace text within the specified variable using JavaScript's regular expression engine. If the variable does not exist then `"""replace(...)"""` will be removed and replaced with just an empty string.

Flags are optional. `gimsuy` may be used. See the `Parameters: flags` section on [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#Parameters) for more information.

Special capabilities are enabled in the `replacement` value via the `$` character:

- `$$`: If you just want to insert a '\$' character, you'll have to use `$$`.
- `$&`: Inserts the matched substring.
- `` $` ``: Inserts the portion of the string that precedes the matched substring.
- `$'`: Inserts the portion of the string that follows the matched substring.
- `$n`: Where _n_ is a non-negative integer lesser than 100, inserts the nth parenthesized submatch string.

**Example:**

```
Email from: """replace("from", regex(/(EXAMPLE|TEST)/gi), "domain")"""
```

becomes

```
Email from: user@domain.com
```

# Domains

A domain on Ptorx is a normal domain name that can be used to create alias emails. All Ptorx users get access to the `ptorx.com` domain. Optionally, you can add your own domain to Ptorx, or request access to a domain added by another Ptorx user.

Using your own domain, or those used by few other users, can help circumvent blacklists.

## Adding your domain to Ptorx

You can add your own domains to Ptorx, and use them to create aliases just like you would with a normal `@ptorx.com` alias. This is available at no extra cost and you can add as many domains as you like!

After initiating the process of adding your domain to Ptorx, you must verify that you own the domain, so don't bother trying to add a domain you don't own. You will verify ownership by setting a few DNS records:

| Type | Hostname                             | Value                         |
| ---- | ------------------------------------ | ----------------------------- |
| TXT  | `example.com`                        | v=spf1 include:ptorx.com ~all |
| TXT  | `selector`.\_domainkey.`example.com` | `v=DKIM1; k=rsa; p=...`       |
| MX   | `example.com`                        | ptorx.com                     |

`example.com` should be whatever domain you entered into Ptorx. If you already have MX records set on your domain for another service, you should use a subdomain for mail that Ptorx will handle. Information for the second `TXT` record will be provided to you within the app.

For your `MX` record, you can set the priority to any number you like. `10` is typically the convention.

In certain cases it may take up to a day or two for these records to propagate. Use the 'verify' button when viewing your domain on Ptorx to check the values again. Mail will not be able to be received or sent until your domain is verified.

Removing or altering these records after verification will likely prevent your domain from working with Ptorx properly.

## Requesting access to domains

If another user has already added a domain to Ptorx, you can request access to it by using the 'request access key' that is generated for you when you attempt to add the domain. You must send that key to the user who originally added the domain to Ptorx, and they must then authorize that key to use their domain.

A request key is used to prevent your account's information from needing to be shared with the domain owner.

**Warning!** Using another user's domain can be risky! If they decide to remove their domain from Ptorx, or don't renew its registration before it expires, you will lose access to any aliases you have created with that domain. They could _also_ move their domain away from Ptorx which could potentially allow them to view your incoming mail!

## Deleting a domain

Deleting a domain from your account if you are the domain's creator will result in all users of your domain, including you, losing any alias emails they have created with your domain. Your domain will be completely removed from Ptorx. You will be able to add your domain back to Ptorx in the future should you wish.

Deleting a user from your domain if you are the domain's creator will result in all of the user's aliases linked to your domain being deleted. The user will not be able to access your domain again without you authorizing their new request key.

Users of a domain must contact the domain's owner and request their account be removed as a user of the domain.

# Credits

Credits are the currency with which actions on Ptorx are paid for. Sending, receiving, redirecting, and replying to mail all cost credits. Credits are awarded monthly based on your account tier.

Whenever your account runs out of credits, mail will no longer be received or redirected and you will not be able to send or reply to mail.

## Actions

| Action                         | Cost      |
| ------------------------------ | --------- |
| Send mail                      | 1 credit  |
| Receive mail                   | 1 credit  |
| Reply from app                 | 1 credit  |
| Reply from third-party inbox   | 2 credits |
| Forward to _one_ primary email | 2 credits |

Note that the _Forward_ action is really just a combination of the _Send_ and _Receive_ actions, as is the _Reply from third-party inbox_ action. To clarify further: if someone sends you an email that is then redirected to one of your primary emails, that will only cost 2 credits. If it's forwarded to _two_ primary emails, it will cost 3 credits.

Everything else on Ptorx can be done without charge.

# Subscriptions

Ptorx subscriptions allow full access to all of Ptorx's features while also increasing the amount of credits your account will be topped up to every month.

**Premium** and **Ultimate** users are able to do things that Basic users (free, non-paying) cannot:

- Send mail from an alias on Ptorx
- Have more than one primary email
- Reply to mail using and alias on Ptorx
- Save incoming mail to Ptorx for later viewing within the app
- Reply to mail anonymously using an alias from your non-Ptorx mailbox
- Send mail from an alias using its SMTP credentials in non-Ptorx email clients
