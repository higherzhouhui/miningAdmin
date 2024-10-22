export function getFileUrl(file: string) {
  const { NODE_ENV } = process.env;
  let url = NODE_ENV == 'development' ? 'http://localhost:2002' : 'https://apifacelive.jizaoji.top'
  if (file && file.includes('http') || !file) {
    url = ''
    return ''
  }
  return `${url}${file}`
}

export const removeHtmlTag = (content?: string) => {
  if (typeof content === 'string') {
    const reg = new RegExp('<[^>]*>', 'g');
    let tStr = content.replace(reg, '');
    tStr = tStr?.replace('&nbsp;', ''); // 过滤空格
    return tStr;
  }
  return '';
};