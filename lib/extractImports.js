var parse            = require('css').parse;
var stringify        = require('css').stringify;

module.exports = extractImports;

var ABS_URL = /^url\(|:\/\//;
var QUOTED = /^['"]|['"]$/g;

function extractImports(css, filepath) {
  var ast = parse(css, { source: filepath })

  var imports = [];

  ast.stylesheet.rules = ast.stylesheet.rules.filter(function(rule) {
    if(rule.type !== 'import')    return true;
    var imp = rule.import;
    if(/^url\(|:\/\//.test(rule.import)) return true;
    imports.push(parseImport(rule.import));
    return false;
  })

  var result = stringify(ast, { sourcemap: true })
  return {
    code    : result.code,
    map     : result.map,
    imports : imports
  }
}


function parseImport(imp) {
  var re = /^['"]?([^\s'"]+)['"]?\s*(.*)$/;
  var result = re.exec(imp);
  return {
    path:  result[1],
    media: result[2].trim()
  }
}
