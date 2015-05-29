var cssIndex = require('./index.css')
var cssFoo = require('foobar/common.css')

var div = document.getElementsByTagName('div')[0]

// cssIndex should be inserted only once per parent/media

cssIndex.insert()
cssIndex.insert()

cssIndex.insert(null, 'print')
cssIndex.insert(null, 'print')

cssIndex.insert(div)
cssIndex.insert(div)

cssIndex.insert(div, 'screen')
cssIndex.insert(div, 'screen')

cssFoo.insert(div)       // Should be inserted
cssFoo.insert(div, 'tv') // Should not be inserted (allready inserted as dependency line #14)
