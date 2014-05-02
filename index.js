
/**
 * Set opus as the preferred audio codec.
 * 
 * Examples:
 *
 *   peer.codec(opus);
 *
 * @return {Function} codec
 * @api public
 */

module.exports = function(sdp) {
  var lines = sdp.split('\r\n');
  var index;
  for(var i = 0, l = lines.length; i < l; i++) {
    var line = lines[i];
    if(line.indexOf('opus/48000') > -1) {
      // m-audio comes before opus
      var payload = extract(line, /:(\d+) opus\/48000/i);
      if(payload) {
        lines[index] = update(lines[index], payload);
      }
    }
    if(line.indexOf('m=audio') > -1) index = i;
  }
  lines = remove(lines, index);
  sdp = lines.join('\r\n');
  return sdp;
};


/**
 * Extract pattern from line.
 * 
 * @param  {String} line 
 * @param  {Regex} pattern 
 * @return {String}
 * @api private 
 */

function extract(line, pattern){
  var result = line.match(pattern);
  return (result && result.length === 2) ? result[1] : null;
}


/**
 * Set the selected codec to the first 
 * in the m-audio line.
 * 
 * @param  {String} line 
 * @param  {String} payload 
 * @return {String}
 * @api private
 */

function update(line, payload) {
  var elements = line.split(' ');
  var result = [];
  var index = 0;
  for(var i = 0, l = elements.length; i < l; i++) {
    var element = elements[i];
    // Format of media starts from the fourth.
    if(index === 3) result[index++] = payload;
    // Put target payload to the first.
    if(element !== payload) result[index++] = element;
  }
  return result.join(' ');
}


/**
 * Strip CN from the session description
 * before CN constraints is ready.
 * 
 * @param  {Array} lines
 * @param  {Number} index 
 * @return {Array}
 * @api private
 */

function remove(lines, index) {
  var elements = lines[index].split(' ');
    // Scan from end for the convenience of removing an item.
  for(var i = lines.length; i--;) {
    var payload = extract(lines[i], /a=rtpmap:(\d+) CN\/\d+/i);
    if(payload) {
      var cnPos = elements.indexOf(payload);
      if(cnPos !== -1) {
        // Remove CN payload from m line.
        elements.splice(cnPos, 1);
      }
      // Remove CN line in sdp
      lines.splice(i, 1);
    }
  }
  lines[index] = elements.join(' ');
  return lines;
}

