export function displayAddress(addresses: string): string {
  const emails = addresses.split(',');
  const match = emails[0].match(/<(.+)>/);
  const email = match ? match[1].trim() : emails[0];
  return emails.length > 1 ? `${email}, +${emails.length - 1}` : email;
}
