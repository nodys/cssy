var cssIndex = require('./index.css')
var cssFoo = require('foobar/common.css')

var div = document.getElementsByTagName('div')[0]

// cssIndex should be inserted only once per parent/media

cssIndex.insert() // A1
var A2 = cssIndex.insert()

var B1 = cssIndex.insert(null, 'print')
var B2 = cssIndex.insert(null, 'print')

var C1 = cssIndex.insert(div)

cssFoo.insert(div, 'tv') // D2 Should not be inserted (allready inserted as dependency line #14)

// Should not remove anything (remain A1)
A2.remove()

// Removing B1 and B2 should remove all style and related dependencies
B1.remove()
B2.remove()

// Removing C1 should remove only index.css but not is dependency
// as D2 is still there
C1.remove()
