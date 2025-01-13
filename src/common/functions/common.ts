export function removeHostAndQuery(url: string): string {
  if (!url) return url;
  const regex = /https:\/\/\w+\.blob\.core\.windows\.net/;
  url = url.replace(regex, '');

  const queryStringStart = url.indexOf('?');
  if (queryStringStart !== -1) {
    return url.slice(0, queryStringStart);
  }
  return url;
}
