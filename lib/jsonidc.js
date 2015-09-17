var Transform = require('stream').Transform;
var util = require('util');
var fs = require('fs');

var JSON_START = 0;
var JSON_END = 1;
var BLOCK_START = 2;
var BLOCK_END = 3;
var LINE_START = 4;
var LINE_END = 5;

function JsonIDC(options) {
  if (!(this instanceof JsonIDC)) return new JsonIDC(options);
  Transform.call(this, options);
  this.rawJson = '';
  this.status = [];
  this.result = {
    indent: {
    },
    depth: {},
    charCount: null,
    lineCount: null,
    lineBreakCode: null,
    propertyCount:null
  };
  return this;
};

util.inherits(JsonIDC, Transform);

JsonIDC.prototype.parse = function(data) {
  var indentCount = 0;
  var before = null;
  var st = this.status;
  st.push(JSON_START);
  for (var i = 0; i < data.length; i++) {
    var ch = data[i];
    if (i === 0 || st[st.length - 1] === LINE_END) {
      st.push(LINE_START);
    }
    switch (ch) {
      case '{':
        st.push(BLOCK_START);
        break;
      case '}':
        st.push(BLOCK_END);
        break;
      case ',':
        break;
      case ' ':
        if (st[st.length - 1] === LINE_START) {
          indentCount++;
        }
        break;
      case '\t':
        if (st[st.length - 1] === LINE_START) {
          indentCount++;
        }
        break;
      case '\n':
        st.push(LINE_END);
        break;
      case '\r':
        if (data[i + 1] === '\n') {
          i++;
        }
        st.push(LINE_END);
        break;
      default:
        break;
    }
    before = ch;
  }
  st.push(JSON_END);
  console.log(this.status);
};

JsonIDC.prototype._transform = function(chunk, encoding, done) {
  // console.log('JsonIDC#_transform');
  this.rawJson += chunk;
  done();
};

JsonIDC.prototype._flush = function(done) {
  // console.log('JsonIDC#_flush');
  this.push(this.rawJson);
  this.parse(this.rawJson);
  done();
};

module.exports = JsonIDC;