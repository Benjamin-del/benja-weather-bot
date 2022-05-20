module.exports = {
	fix: function (data) {
		return data.replace(/Ã´/gi,"ô").replace(/Ã¨/gi,"è").replace(/Ã©/gi,"é").replace(/ÃŽ/gi,"Î").replace(/Ã/gi,"à")
	}
}