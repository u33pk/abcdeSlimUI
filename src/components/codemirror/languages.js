const importers = import.meta.glob('./lang-code/*/index.js')
const languages = {}
Object.keys(importers).forEach((fileName) => {
  const language = fileName.replace('./lang-code/', '').replace('/index.js', '')
  languages[language] = importers[fileName]
})

export default languages
