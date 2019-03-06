# Terminology

- **Proxy Emails**
  - 'Proxy' emails (also known as redirect, alias, or forwarding emails) are email addresses created via Ptorx that typically act as a middleman for your primary emails by receiving mail and redirecting allowed mail to your primary email addresses.
- **Waterfall**
  - Every proxy email has a waterfall that allows you to link filters, modifiers, and primary emails to it in a specific order. Each linked item is acted on in order, allowing you to redirect different mail to different primary emails based on filters and modifiers.
- **Primary Emails**
  - 'Primary' emails (also known as main, normal, or real emails) are your actual email addresses where you normally receive mail. These emails are where mail sent to your 'proxy' email addresses can be redirected to.
- **Filters**
  - Filters allow you to filter out mail (with whitelists or blacklists) before it reaches any primary emails that come after it in a proxy email's waterfall.
- **Modifiers**
  - Modifiers allow you to modify components of an incoming email before it gets redirected to primary emails below it in a proxy email's waterfall.
- **Messages**
  - Messages (also known as mail) are any received by your proxy email addresses.

# Proxy Emails

## Deleting Proxy Emails

By deleting a proxy email, that specific email is completely removed from your account, however it remains on Ptorx's system simply as a placeholder to prevent that address from ever being claimed again in the future. This means that once you delete a proxy address there is no way for you or another user to claim that address. Deleted proxy emails will of course not redirect or save received mail.

## Replying to Redirected Mail

You can safely reply to mail that is sent to a proxy email if that proxy email has `Save Mail` enabled. You can reply to this mail either from within the Ptorx app or by replying to the message you received in your email client as you would reply to any other message.

There are some limitations with this feature:

- You will only be able to reply to mail up to 30 days after receiving the message.
- If you reply to mail from within your email client, that client must support the `Reply-To` email header. Most popular clients (like Gmail) should support this.

The replies will be sent to the original sender using the address of the proxy email that received the message.

# Modifiers

Modifiers give you expanded control over the content of the mail that gets sent to you. Modifiers are only applied to mail being redirected to a main email. If you have 'Save Mail' enabled on a proxy email, the saved mail will be unmodified.

## Functions

Special functions are available within templates allow you to access and manipulate email content. All functions are accessed via the `"""func()"""` syntax, where `func` is the name of the function.

### Get Variables

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

### Find & Replace

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

### Find & Replace with Regular Expressions

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

A domain on Ptorx is a normal domain name that can be used to create proxy emails. All Ptorx users get access to the `ptorx.com` domain. Optionally, you can add your own domain to Ptorx, or request access to a domain added by another Ptorx user.

Using your own domain, or those used by few other users, can help circumvent blacklists.

## Adding Your Domain to Ptorx

You can add your own domains to Ptorx, and use them to create proxy emails just like you would with a normal `@ptorx.com` proxy email. This is available at no extra cost and you can add as many domains as you like!

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

## Requesting Access to Domains

If another user has already added a domain to Ptorx, you can request access to it by using the 'request access key' that is generated for you when you attempt to add the domain. You must send that key to the user who originally added the domain to Ptorx, and they must then authorize that key to use their domain.

A request key is used to prevent your account's information from needing to be shared with the domain owner.

**Warning!** Using another user's domain can be risky! If they decide to remove their domain from Ptorx, or don't renew its registration before it expires, you will lose access to any proxy emails you have created with that domain. They could _also_ move their domain away from Ptorx which could potentially allow them to view your incoming mail!

## Deleting a Domain

Deleting a domain from your account if you are the domain's creator will result in all users of your domain, including you, losing any proxy emails they have created with your domain. Your domain will be completely removed from Ptorx. You will be able to add your domain back to Ptorx in the future should you wish.

Deleting a user from your domain if you are the domain's creator will result in all of the user's proxy emails linked to your domain being deleted. The user will not be able to access your domain again without you authorizing their new request key.

Users of a domain must contact the domain's owner and request their account be removed as a user of the domain.

# Credits

Credits are the currency with which actions on Ptorx are paid for. Sending, receiving, redirecting, and replying to mail all cost credits. Credits are awarded monthly based on your account tier.

Whenever your account runs out of credits, mail will no longer be received or redirected and you will not be able to send or reply to mail.

## Actions

| Action                          | Cost      |
| ------------------------------- | --------- |
| Send mail                       | 1 credit  |
| Receive mail                    | 1 credit  |
| Reply from app                  | 1 credit  |
| Reply from third-party inbox    | 2 credits |
| Redirect to _one_ primary email | 2 credits |

Note that the _Redirect_ action is really just a combination of the _Send_ and _Receive_ actions, as is the _Reply from third-party inbox_ action. To clarify further: if someone sends you an email that is then redirected to one of your primary emails, that will only cost 2 credits. If it's redirected to _two_ primary emails, it will cost 3 credits.

Everything else on Ptorx can be done without charge.
