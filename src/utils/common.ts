export function getFileUrl(file: string) {
  const { NODE_ENV } = process.env;
  let url = NODE_ENV == 'development' ? 'http://localhost:2002' : 'https://apifacelive.jizaoji.top'
  if (file && file.includes('http') || !file) {
    url = ''
    return ''
  }
  return `${url}${file}`
}